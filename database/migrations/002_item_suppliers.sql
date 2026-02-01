-- Item Suppliers Relationship Table
-- This links items to suppliers with supplier-specific details
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS item_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    
    -- Supplier-specific info
    supplier_part_number VARCHAR(100),  -- รหัสสินค้าของ Supplier
    purchase_price DECIMAL(18,4),       -- ราคาที่ซื้อ
    purchase_uom_id UUID REFERENCES units_of_measure(id), -- หน่วยที่ซื้อ
    
    -- Lead time and MOQ
    lead_time_days INTEGER DEFAULT 7,
    min_order_qty DECIMAL(18,4) DEFAULT 1,
    
    -- Status
    is_preferred BOOLEAN DEFAULT FALSE, -- Preferred supplier
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(item_id, supplier_id)
);

-- Index for faster lookups
CREATE INDEX idx_item_suppliers_item ON item_suppliers(item_id);
CREATE INDEX idx_item_suppliers_supplier ON item_suppliers(supplier_id);

-- Updated_at trigger
CREATE TRIGGER update_item_suppliers_updated_at BEFORE UPDATE ON item_suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE item_suppliers IS 'Links items to suppliers with supplier-specific purchasing details';
