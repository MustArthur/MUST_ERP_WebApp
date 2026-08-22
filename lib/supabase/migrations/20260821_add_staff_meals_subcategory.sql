-- ==========================================
-- Factory Expenses: add "Staff Meals" subcategory
-- Project: ค่าอาหารพนักงาน
-- Backfilled to match production, applied on 2026-08-21 via Supabase MCP
-- but never committed as a migration file until now.
-- ==========================================

ALTER TYPE factory_expense_subcategory ADD VALUE IF NOT EXISTS 'STAFF_MEALS';
