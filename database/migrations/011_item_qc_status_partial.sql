-- 011: allow PARTIAL on receipt items
-- The app writes qc_status = 'PARTIAL' on purchase_receipt_items when QC accepts part of a
-- lot and rejects the rest, but item_qc_status never had that value, so the update failed
-- and the receipt stayed "รอตรวจ QC" forever (e.g. PR-2026-0293 / QI-2026-0095).
--
-- Run this file on its own, BEFORE 012 — Postgres can't use a new enum value in the
-- same transaction that adds it.

ALTER TYPE item_qc_status ADD VALUE IF NOT EXISTS 'PARTIAL';
