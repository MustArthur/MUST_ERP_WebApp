-- ==========================================
-- RLS Hardening — Phase 1: Authenticated-only access
-- ==========================================
-- Problem: every table currently has a leftover "Allow all"
-- policy (USING (true) WITH CHECK (true)) from early development,
-- before login existed. The app calls Supabase with the public
-- anon key from the browser, so RLS is the only real security
-- boundary — anyone with that key (visible in any browser's
-- Network tab) can currently read and write every table without
-- ever logging in.
--
-- Fix: replace every policy with one that requires a valid
-- Supabase Auth session (auth.uid() IS NOT NULL). This does NOT
-- differentiate by role (QC inspector vs supervisor, etc.) — there
-- is no roles/profiles system in the app yet. That is Phase 2,
-- deferred until a User Management feature exists.
--
-- Safe to re-run: drops whatever policies currently exist (by
-- name, dynamically) before creating the new one, and skips any
-- table that doesn't exist in this project.
-- ==========================================

DO $$
DECLARE
    target_tables text[] := ARRAY[
        -- tables with a known "Allow all" policy from schema.sql
        'categories', 'units_of_measure', 'suppliers', 'warehouses',
        'items', 'item_suppliers', 'lots', 'stock_on_hand',
        'recipes', 'recipe_lines',
        -- tables with a known "Allow all" policy from the receipts migration
        'purchase_receipts', 'purchase_receipt_items',
        -- tables created directly in the Supabase dashboard; no committed
        -- migration, so existing policy names are unknown and are dropped
        -- dynamically below instead of being guessed
        'inventory_transactions', 'item_qc_templates', 'locations',
        'qc_inspection_readings', 'qc_inspections', 'qc_template_parameters',
        'qc_templates', 'quarantine_records', 'stock_entries', 'stock_entry_items'
    ];
    tbl text;
    pol record;
BEGIN
    FOREACH tbl IN ARRAY target_tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN
            RAISE NOTICE 'Skipping % - table not found in this project', tbl;
            CONTINUE;
        END IF;

        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

        FOR pol IN
            SELECT policyname FROM pg_policies
            WHERE schemaname = 'public' AND tablename = tbl
        LOOP
            EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, tbl);
        END LOOP;

        EXECUTE format(
            'CREATE POLICY "Authenticated users only" ON public.%I FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)',
            tbl
        );

        RAISE NOTICE 'Secured table: %', tbl;
    END LOOP;
END $$;

-- ==========================================
-- Verification query — run after the block above to confirm
-- every target table now has exactly one policy named
-- "Authenticated users only".
-- ==========================================
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
