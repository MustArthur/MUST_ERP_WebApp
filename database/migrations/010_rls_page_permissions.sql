-- ==========================================
-- ERP RLS: switch from "any approved user" to the page permissions from migration 009
-- Before: "Active users only" = is_active_user(auth.uid())  (profiles / allowed_emails, shared with another app)
-- After:  read  = any active ERP member (reference data is shared across pages),
--                 except expense data, which needs factory_expenses or dashboard
--         write = edit permission on at least one page whose UI writes that table
-- Apply AFTER the app with /access + /admin/members is deployed, otherwise people
-- who are not in erp_members get empty pages instead of the "request access" screen.
-- ==========================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT * FROM (VALUES
            -- table                                  read pages (NULL = any member)          write pages
            ('categories',                           NULL::TEXT[],                            ARRAY['items','inventory']),
            ('units_of_measure',                     NULL,                                    ARRAY['items','inventory']),
            ('items',                                NULL,                                    ARRAY['items','inventory']),
            ('item_suppliers',                       NULL,                                    ARRAY['items','suppliers']),
            ('suppliers',                            NULL,                                    ARRAY['suppliers']),
            ('recipes',                              NULL,                                    ARRAY['recipes']),
            ('recipe_lines',                         NULL,                                    ARRAY['recipes']),
            ('purchase_receipts',                    NULL,                                    ARRAY['receiving','quality']),
            ('purchase_receipt_items',               NULL,                                    ARRAY['receiving','quality']),
            ('qc_templates',                         NULL,                                    ARRAY['quality','receiving']),
            ('qc_template_parameters',               NULL,                                    ARRAY['quality','receiving']),
            ('item_qc_templates',                    NULL,                                    ARRAY['quality','receiving','items']),
            ('qc_inspections',                       NULL,                                    ARRAY['quality','receiving']),
            ('qc_inspection_readings',               NULL,                                    ARRAY['quality','receiving']),
            ('quarantine_records',                   NULL,                                    ARRAY['quality','receiving']),
            ('warehouses',                           NULL,                                    ARRAY['inventory','transactions','receiving','quality','items']),
            ('locations',                            NULL,                                    ARRAY['inventory','transactions','receiving','quality','items']),
            ('lots',                                 NULL,                                    ARRAY['inventory','transactions','receiving','quality','items']),
            ('stock_on_hand',                        NULL,                                    ARRAY['inventory','transactions','receiving','quality','items']),
            ('stock_entries',                        NULL,                                    ARRAY['inventory','transactions','receiving','quality','items']),
            ('stock_entry_items',                    NULL,                                    ARRAY['inventory','transactions','receiving','quality','items']),
            ('inventory_transactions',               NULL,                                    ARRAY['inventory','transactions','receiving','quality','items']),
            ('factory_expenses',                     ARRAY['factory_expenses','dashboard'],   ARRAY['factory_expenses']),
            ('factory_expense_custom_subcategories', ARRAY['factory_expenses'],               ARRAY['factory_expenses']),
            ('machines',                             NULL,                                    ARRAY['machines']),
            ('vehicles',                             NULL,                                    ARRAY['vehicles'])
        ) AS t(tbl, read_pages, write_pages)
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Active users only" ON public.%I', r.tbl);
        EXECUTE format('DROP POLICY IF EXISTS "ERP read" ON public.%I', r.tbl);
        EXECUTE format('DROP POLICY IF EXISTS "ERP insert" ON public.%I', r.tbl);
        EXECUTE format('DROP POLICY IF EXISTS "ERP update" ON public.%I', r.tbl);
        EXECUTE format('DROP POLICY IF EXISTS "ERP delete" ON public.%I', r.tbl);

        -- (select ...) wrapper lets Postgres evaluate the check once per query, not per row
        EXECUTE format(
            'CREATE POLICY "ERP read" ON public.%I FOR SELECT TO authenticated USING (%s)',
            r.tbl,
            CASE WHEN r.read_pages IS NULL
                THEN '(SELECT public.erp_is_member())'
                ELSE format('(SELECT public.erp_can_view(%L::TEXT[]))', r.read_pages)
            END
        );
        EXECUTE format(
            'CREATE POLICY "ERP insert" ON public.%I FOR INSERT TO authenticated
                WITH CHECK ((SELECT public.erp_can_edit(%L::TEXT[])))',
            r.tbl, r.write_pages
        );
        EXECUTE format(
            'CREATE POLICY "ERP update" ON public.%1$I FOR UPDATE TO authenticated
                USING ((SELECT public.erp_can_edit(%2$L::TEXT[])))
                WITH CHECK ((SELECT public.erp_can_edit(%2$L::TEXT[])))',
            r.tbl, r.write_pages
        );
        EXECUTE format(
            'CREATE POLICY "ERP delete" ON public.%I FOR DELETE TO authenticated
                USING ((SELECT public.erp_can_edit(%L::TEXT[])))',
            r.tbl, r.write_pages
        );
    END LOOP;
END $$;
