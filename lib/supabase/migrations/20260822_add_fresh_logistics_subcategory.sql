-- ==========================================
-- Factory Expenses: add "Fresh Logistics" subcategory
-- Logistics: ค่าขนส่ง Fresh Logistics (ระบุจำนวนเงินอย่างเดียว)
-- ==========================================

ALTER TYPE factory_expense_subcategory ADD VALUE IF NOT EXISTS 'FRESH_LOGISTICS';
