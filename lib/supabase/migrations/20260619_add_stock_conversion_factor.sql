-- ==========================================
-- Add stock_conversion_factor column to items
-- ==========================================
-- Defines: 1 stock unit = N base/production units
-- Example: item stored as "Bag", 1 Bag = 5000 ML → factor = 5000
--
-- Used by Production Planning module to convert recipe quantities
-- (in base units: ML, G) → stock units (Bag, KG, Bottle) for display
-- and Safety Stock comparison.
--
-- Default = 1 means no conversion (base unit == stock unit).
-- Safe to re-run: ADD COLUMN IF NOT EXISTS is idempotent.
-- ==========================================

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS stock_conversion_factor decimal(18,6) NOT NULL DEFAULT 1;

-- Verification:
-- SELECT id, code, name, stock_conversion_factor FROM public.items ORDER BY code LIMIT 10;
