-- ==========================================
-- Factory Expenses: add "Project" category
-- Project: ค่าติดตั้งเครื่องจักร (machine installation)
-- Backfilled to match production, applied on 2026-08-08 via Supabase MCP
-- but never committed as a migration file until now.
-- ==========================================

ALTER TYPE factory_expense_category ADD VALUE IF NOT EXISTS 'PROJECT';
ALTER TYPE factory_expense_subcategory ADD VALUE IF NOT EXISTS 'MACHINE_INSTALLATION';
