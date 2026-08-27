-- ==========================================
-- Factory Expenses: user-typed "Project" types
-- Project: ประเภทที่ผู้ใช้พิมพ์เพิ่มเอง (creatable combobox)
-- ==========================================

ALTER TYPE factory_expense_subcategory ADD VALUE IF NOT EXISTS 'PROJECT_CUSTOM';

ALTER TABLE factory_expenses ADD COLUMN IF NOT EXISTS project_type_name VARCHAR(200);

CREATE TABLE IF NOT EXISTS factory_expense_project_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_factory_expense_project_types_name ON factory_expense_project_types(name);

ALTER TABLE factory_expense_project_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users only" ON factory_expense_project_types
    FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
