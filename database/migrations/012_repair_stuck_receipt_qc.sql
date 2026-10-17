-- 012: repair receipts stuck at QC PENDING after a partial pass (run AFTER 011)
-- Syncs receipt items whose linked inspection already has a final result, then
-- recalculates the receipt header qc_status (same rules as QCService.recalculateReceiptHeaderQCStatus).

BEGIN;

-- 1. Receipt items: derive status from the inspection's accepted / rejected qty
UPDATE purchase_receipt_items pri
SET qc_status = (CASE
        WHEN qi.rejected_qty = 0 THEN 'PASSED'
        WHEN qi.accepted_qty > 0 THEN 'PARTIAL'
        ELSE 'FAILED'
    END)::item_qc_status,
    qty_accepted = qi.accepted_qty,
    qty_rejected = qi.rejected_qty
FROM qc_inspections qi
WHERE pri.qc_inspection_id = qi.id
  AND pri.qc_status = 'PENDING'
  AND qi.status IN ('PASSED', 'FAILED');

-- 2. Receipt headers still marked PENDING: recalculate from their items
--    (separate statement so it sees the item updates above)
UPDATE purchase_receipts pr
SET qc_status = (CASE
        WHEN s.pending > 0 THEN 'PENDING'
        WHEN s.failed = 0 AND s.partial = 0 THEN 'PASSED'
        WHEN s.passed = 0 AND s.partial = 0 THEN 'FAILED'
        ELSE 'PARTIAL'
    END)::qc_status_summary,
    updated_at = now()
FROM (
    SELECT receipt_id,
           count(*) FILTER (WHERE qc_status = 'PENDING')                    AS pending,
           count(*) FILTER (WHERE qc_status IN ('PASSED', 'NOT_REQUIRED'))  AS passed,
           count(*) FILTER (WHERE qc_status = 'PARTIAL')                    AS partial,
           count(*) FILTER (WHERE qc_status = 'FAILED')                     AS failed
    FROM purchase_receipt_items
    GROUP BY receipt_id
) s
WHERE pr.id = s.receipt_id
  AND pr.qc_status = 'PENDING'
  AND s.pending = 0;

-- Check: should list PR-2026-0293 as PARTIAL with Fresh Chicken 975 / 25
SELECT pr.code, pr.status, pr.qc_status, pri.qc_status AS item_qc, pri.qty_accepted, pri.qty_rejected
FROM purchase_receipts pr
JOIN purchase_receipt_items pri ON pri.receipt_id = pr.id
WHERE pr.code = 'PR-2026-0293';

COMMIT;
