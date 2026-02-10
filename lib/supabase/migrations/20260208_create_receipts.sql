-- ==========================================
-- Receiving Module - Purchase Receipts
-- ==========================================

-- ENUMS
CREATE TYPE receipt_status AS ENUM ('DRAFT', 'PENDING_QC', 'COMPLETED', 'CANCELLED');
CREATE TYPE qc_status_summary AS ENUM ('NOT_REQUIRED', 'PENDING', 'PASSED', 'FAILED', 'PARTIAL');
CREATE TYPE item_qc_status AS ENUM ('NOT_REQUIRED', 'PENDING', 'PASSED', 'FAILED');

-- Purchase Receipts
CREATE TABLE IF NOT EXISTS purchase_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    status receipt_status DEFAULT 'DRAFT',
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    po_number VARCHAR(100),
    invoice_number VARCHAR(100),
    qc_status qc_status_summary DEFAULT 'NOT_REQUIRED',
    total_amount NUMERIC(15,4) DEFAULT 0,
    remarks TEXT,
    received_by VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Receipt Items
CREATE TABLE IF NOT EXISTS purchase_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL REFERENCES purchase_receipts(id) ON DELETE CASCADE,
    line_no INTEGER NOT NULL,
    item_id UUID NOT NULL REFERENCES items(id),
    qty_ordered NUMERIC(15,4),
    qty_received NUMERIC(15,4) NOT NULL,
    qty_accepted NUMERIC(15,4) DEFAULT 0,
    qty_rejected NUMERIC(15,4) DEFAULT 0,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    batch_no VARCHAR(100),
    mfg_date DATE,
    exp_date DATE,
    unit_price NUMERIC(15,4) DEFAULT 0,
    total_price NUMERIC(15,4) DEFAULT 0,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    qc_inspection_id UUID, -- Optional link to QC inspection
    qc_status item_qc_status DEFAULT 'NOT_REQUIRED',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_code ON purchase_receipts(code);
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_supplier ON purchase_receipts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_status ON purchase_receipts(status);
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_date ON purchase_receipts(receipt_date);

CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt ON purchase_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_item ON purchase_receipt_items(item_id);

-- Triggers for updated_at
CREATE TRIGGER update_purchase_receipts_updated_at
    BEFORE UPDATE ON purchase_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_receipt_items_updated_at
    BEFORE UPDATE ON purchase_receipt_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE purchase_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_receipt_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON purchase_receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON purchase_receipt_items FOR ALL USING (true) WITH CHECK (true);
