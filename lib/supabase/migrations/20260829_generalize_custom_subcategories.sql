-- ==========================================
-- Factory Expenses: generalize the "user-typed subcategory" mechanism
-- so any category (Project, Logistics, future) can reuse it.
--   factory_expense_project_types      -> factory_expense_custom_subcategories (+ category)
--   factory_expenses.project_type_name -> factory_expenses.custom_subcategory_name
-- ==========================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_name = 'factory_expense_project_types') THEN
        ALTER TABLE factory_expense_project_types RENAME TO factory_expense_custom_subcategories;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'factory_expenses' AND column_name = 'project_type_name') THEN
        ALTER TABLE factory_expenses RENAME COLUMN project_type_name TO custom_subcategory_name;
    END IF;
END $$;

-- Discriminator column. Every existing custom type was a Project type,
-- so backfill 'PROJECT' then drop the default (app always sets it explicitly).
ALTER TABLE factory_expense_custom_subcategories
    ADD COLUMN IF NOT EXISTS category factory_expense_category NOT NULL DEFAULT 'PROJECT';
ALTER TABLE factory_expense_custom_subcategories ALTER COLUMN category DROP DEFAULT;

-- Name is now unique per-category rather than globally.
ALTER TABLE factory_expense_custom_subcategories
    DROP CONSTRAINT IF EXISTS factory_expense_project_types_name_key;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'factory_expense_custom_subcategories_category_name_key') THEN
        ALTER TABLE factory_expense_custom_subcategories
            ADD CONSTRAINT factory_expense_custom_subcategories_category_name_key UNIQUE (category, name);
    END IF;
END $$;

ALTER INDEX IF EXISTS idx_factory_expense_project_types_name
    RENAME TO idx_factory_expense_custom_subcategories_name;

-- RLS policy "Authenticated users only" follows the table through RENAME TO automatically.
