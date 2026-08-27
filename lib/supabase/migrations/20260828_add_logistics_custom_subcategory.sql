-- ==========================================
-- Factory Expenses: user-typed "Logistics" types
-- Logistics: ประเภทที่ผู้ใช้พิมพ์เพิ่มเอง (creatable combobox)
-- Kept as its own file so the new enum value is committed before
-- 20260829 (and the app) uses it.
-- ==========================================

ALTER TYPE factory_expense_subcategory ADD VALUE IF NOT EXISTS 'LOGISTICS_CUSTOM';
