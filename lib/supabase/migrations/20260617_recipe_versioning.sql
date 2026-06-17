-- ==========================================
-- Recipe Versioning — relax recipes.code uniqueness
-- ==========================================
-- Problem: recipes.code currently has a single-column UNIQUE
-- constraint, which prevents two version-rows from sharing the
-- same code (the "recipe family" key).
--
-- Fix: drop the single-column UNIQUE(code) and replace it with
-- a composite UNIQUE(code, version), so v1 and v2 of the same
-- recipe can coexist as separate rows while remaining uniquely
-- identified by (code, version).
--
-- No data backfill required — every existing row already has
-- version = 1 and a unique code, so the new constraint is
-- satisfied immediately.
--
-- RLS: the existing "Authenticated users only" policy on recipes
-- already covers this; no new table is created, no RLS change
-- needed.
--
-- Safe to re-run: constraint drop is discovered dynamically (no
-- hardcoded name), and the composite add is guarded by an
-- existence check — same robustness style as
-- 20260616_rls_authenticated_only.sql.
-- ==========================================

DO $$
DECLARE
    v_constraint_name text;
BEGIN
    -- Find the auto-generated UNIQUE constraint on recipes.code
    -- (exactly one column = 'code', single-column constraint)
    SELECT tc.constraint_name INTO v_constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema   = kcu.table_schema
    WHERE tc.table_schema   = 'public'
      AND tc.table_name     = 'recipes'
      AND tc.constraint_type = 'UNIQUE'
    GROUP BY tc.constraint_name
    HAVING COUNT(*) = 1
       AND MAX(kcu.column_name) = 'code'
    LIMIT 1;

    IF v_constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.recipes DROP CONSTRAINT %I', v_constraint_name);
        RAISE NOTICE 'Dropped single-column UNIQUE constraint: %', v_constraint_name;
    ELSE
        RAISE NOTICE 'No single-column UNIQUE(code) constraint found on recipes — may already be composite, skipping drop';
    END IF;

    -- Add composite UNIQUE(code, version) if it does not already exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
           AND tc.table_schema    = kcu.table_schema
        WHERE tc.table_schema    = 'public'
          AND tc.table_name      = 'recipes'
          AND tc.constraint_type = 'UNIQUE'
        GROUP BY tc.constraint_name
        HAVING COUNT(*) = 2
           AND array_agg(kcu.column_name::text ORDER BY kcu.column_name)
               = ARRAY['code', 'version']
    ) THEN
        ALTER TABLE public.recipes
            ADD CONSTRAINT recipes_code_version_key UNIQUE (code, version);
        RAISE NOTICE 'Added composite UNIQUE(code, version) constraint';
    ELSE
        RAISE NOTICE 'Composite UNIQUE(code, version) already exists — skipping';
    END IF;
END $$;

-- ==========================================
-- Verification query (run manually after applying):
-- ==========================================
-- SELECT tc.constraint_name, tc.constraint_type,
--        array_agg(kcu.column_name ORDER BY kcu.ordinal_position) AS columns
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu
--     ON tc.constraint_name = kcu.constraint_name
--    AND tc.table_schema    = kcu.table_schema
-- WHERE tc.table_schema = 'public'
--   AND tc.table_name   = 'recipes'
--   AND tc.constraint_type = 'UNIQUE'
-- GROUP BY tc.constraint_name, tc.constraint_type
-- ORDER BY tc.constraint_name;
