-- Create Stock Entries Table
CREATE TABLE IF NOT EXISTS stock_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- RECEIVE, ISSUE, TRANSFER, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    posting_date DATE NOT NULL,
    posting_time TIME NOT NULL,
    source_doc_type VARCHAR(50),
    source_doc_id VARCHAR(50),
    remarks TEXT,
    is_qc_required BOOLEAN DEFAULT false,
    is_qc_passed BOOLEAN,
    qc_inspection_id UUID,
    created_by VARCHAR(100), -- User name or ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Stock Entry Items Table
CREATE TABLE IF NOT EXISTS stock_entry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_entry_id UUID NOT NULL REFERENCES stock_entries(id) ON DELETE CASCADE,
    line_no INTEGER NOT NULL,
    item_id UUID NOT NULL REFERENCES items(id),
    qty NUMERIC(15,4) NOT NULL,
    uom_id UUID REFERENCES units_of_measure(id), -- Optional: store UOM ID instead of string if strictly enforcing
    uom VARCHAR(20), -- Store string for display speed/independence or if UOM table changes
    batch_no VARCHAR(100),
    from_warehouse_id UUID REFERENCES warehouses(id),
    to_warehouse_id UUID REFERENCES warehouses(id),
    mfg_date DATE,
    exp_date DATE,
    unit_cost NUMERIC(15,4),
    total_cost NUMERIC(15,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_entry_id, line_no)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_entries_code ON stock_entries(code);
CREATE INDEX IF NOT EXISTS idx_stock_entries_type ON stock_entries(type);
CREATE INDEX IF NOT EXISTS idx_stock_entries_date ON stock_entries(posting_date);
CREATE INDEX IF NOT EXISTS idx_stock_entry_items_entry ON stock_entry_items(stock_entry_id);
CREATE INDEX IF NOT EXISTS idx_stock_entry_items_item ON stock_entry_items(item_id);

-- Enable RLS
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_entry_items ENABLE ROW LEVEL SECURITY;

-- Allow all for now (dev mode)
CREATE POLICY "Allow all" ON stock_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON stock_entry_items FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_stock_entries_updated_at
    BEFORE UPDATE ON stock_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
