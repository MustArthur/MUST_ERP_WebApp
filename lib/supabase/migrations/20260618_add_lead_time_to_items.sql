-- ==========================================
-- Add lead_time_weeks column to items
-- ==========================================
-- Used by Production Planning module to calculate Safety Stock:
--   safetyStockNeeded = weeklyUsage × leadTimeWeeks
--
-- Default = 1 (one week) so existing rows stay valid immediately.
-- Safe to re-run: ADD COLUMN IF NOT EXISTS is idempotent.
-- ==========================================

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS lead_time_weeks integer NOT NULL DEFAULT 1;

-- Verification (run manually after applying):
-- SELECT id, code, name, lead_time_weeks FROM public.items ORDER BY code LIMIT 10;
