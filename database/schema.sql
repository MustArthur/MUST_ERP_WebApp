-- ================================================================
-- MUST ERP - Manufacturing Module
-- Database Schema for PostgreSQL
-- Version: 1.0
-- Target: Process Manufacturing (Food & Beverage)
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- ENUMS
-- ================================================================

CREATE TYPE item_category_type AS ENUM (
    'RAW_MATERIAL',
    'PACKAGING',
    'SEMI_FINISHED',
    'FINISHED_GOOD'
);

CREATE TYPE uom_type AS ENUM (
    'WEIGHT',
    'VOLUME',
    'PIECE',
    'LENGTH',
    'TIME'
);

CREATE TYPE warehouse_type AS ENUM (
    'NORMAL',
    'COLD_STORAGE',
    'QUARANTINE',
    'PRODUCTION',
    'SHIPPING'
);

CREATE TYPE lot_status AS ENUM (
    'AVAILABLE',
    'QUARANTINE',
    'HOLD',
    'EXPIRED',
    'CONSUMED'
);

CREATE TYPE quality_status AS ENUM (
    'PENDING',
    'PASSED',
    'FAILED'
);

CREATE TYPE transaction_type AS ENUM (
    'RECEIVE',
    'ISSUE',
    'TRANSFER',
    'ADJUST_IN',
    'ADJUST_OUT',
    'PRODUCTION_IN',
    'PRODUCTION_OUT',
    'SCRAP',
    'RETURN'
);

CREATE TYPE recipe_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'OBSOLETE'
);

CREATE TYPE production_order_status AS ENUM (
    'DRAFT',
    'PLANNED',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE priority_level AS ENUM (
    'LOW',
    'NORMAL',
    'HIGH',
    'URGENT'
);

CREATE TYPE scrap_reason AS ENUM (
    'DEFECT',
    'EXPIRED',
    'CONTAMINATION',
    'MACHINE_ERROR',
    'HUMAN_ERROR',
    'OTHER'
);

CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'MANAGER',
    'OPERATOR',
    'VIEWER'
);

CREATE TYPE audit_action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE'
);

-- ================================================================
-- 1. MASTER DATA TABLES
-- ================================================================

-- 1.1 Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type item_category_type NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Units of Measure
CREATE TABLE units_of_measure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    type uom_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 UOM Conversions
CREATE TABLE uom_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    to_uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    conversion_factor DECIMAL(18,6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_uom_id, to_uom_id)
);

-- 1.4 Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    tax_id VARCHAR(20),
    payment_terms INTEGER DEFAULT 30, -- days
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.5 Items (Products / Materials)
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id),
    base_uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    purchase_uom_id UUID REFERENCES units_of_measure(id),

    -- Tracking settings
    track_lot BOOLEAN DEFAULT TRUE,
    track_expiry BOOLEAN DEFAULT TRUE,
    shelf_life_days INTEGER,

    -- Stock settings
    min_stock_qty DECIMAL(18,4) DEFAULT 0,
    max_stock_qty DECIMAL(18,4),
    reorder_qty DECIMAL(18,4),
    reorder_point DECIMAL(18,4),

    -- Costing
    cost_method VARCHAR(20) DEFAULT 'AVERAGE', -- AVERAGE, FIFO, STANDARD
    standard_cost DECIMAL(18,4),
    last_purchase_cost DECIMAL(18,4),

    -- Additional info
    barcode VARCHAR(50),
    sku VARCHAR(50),
    brand VARCHAR(100),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 2. WAREHOUSE & LOCATION TABLES
-- ================================================================

-- 2.1 Warehouses
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type warehouse_type NOT NULL DEFAULT 'NORMAL',
    address TEXT,
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Locations (Bins/Racks)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    zone VARCHAR(20),
    rack VARCHAR(10),
    level VARCHAR(10),
    position VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, code)
);

-- ================================================================
-- 3. RECIPE / BOM TABLES
-- ================================================================

-- 3.1 Recipes (Bill of Materials)
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Output
    output_item_id UUID NOT NULL REFERENCES items(id),
    output_qty DECIMAL(18,4) NOT NULL,
    output_uom_id UUID NOT NULL REFERENCES units_of_measure(id),

    -- Batch settings
    standard_batch_size DECIMAL(18,4),
    min_batch_size DECIMAL(18,4),
    max_batch_size DECIMAL(18,4),
    expected_yield_percent DECIMAL(5,2) DEFAULT 100.00,

    -- Versioning
    version INTEGER DEFAULT 1,
    status recipe_status DEFAULT 'DRAFT',
    valid_from DATE,
    valid_to DATE,

    -- Process info
    estimated_duration_minutes INTEGER,
    instructions TEXT,
    notes TEXT,

    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Recipe Lines (Ingredients)
CREATE TABLE recipe_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    line_no INTEGER NOT NULL,

    item_id UUID NOT NULL REFERENCES items(id),
    qty_per_batch DECIMAL(18,6) NOT NULL,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),

    -- Yield/Scrap
    scrap_percent DECIMAL(5,2) DEFAULT 0.00,

    -- Flexibility
    is_critical BOOLEAN DEFAULT TRUE,
    is_optional BOOLEAN DEFAULT FALSE,
    substitute_item_id UUID REFERENCES items(id),

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(recipe_id, line_no)
);

-- ================================================================
-- 4. INVENTORY TABLES
-- ================================================================

-- 4.1 Lots (Batches)
CREATE TABLE lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_number VARCHAR(50) NOT NULL UNIQUE,
    item_id UUID NOT NULL REFERENCES items(id),

    -- Source
    supplier_id UUID REFERENCES suppliers(id),
    production_order_id UUID, -- Will reference production_orders (added later)
    purchase_order_id UUID,

    -- Dates
    manufactured_date DATE,
    expiry_date DATE,
    received_date DATE DEFAULT CURRENT_DATE,

    -- Quantity & Cost
    initial_qty DECIMAL(18,4) NOT NULL,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    cost_per_unit DECIMAL(18,4),

    -- Status
    status lot_status DEFAULT 'AVAILABLE',
    quality_status quality_status DEFAULT 'PENDING',

    -- Additional
    supplier_lot_number VARCHAR(50), -- Lot number from supplier
    certificate_of_analysis TEXT,
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.2 Stock on Hand
CREATE TABLE stock_on_hand (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    location_id UUID REFERENCES locations(id),
    lot_id UUID REFERENCES lots(id),

    qty_on_hand DECIMAL(18,4) NOT NULL DEFAULT 0,
    qty_reserved DECIMAL(18,4) NOT NULL DEFAULT 0,
    qty_available DECIMAL(18,4) GENERATED ALWAYS AS (qty_on_hand - qty_reserved) STORED,

    uom_id UUID NOT NULL REFERENCES units_of_measure(id),

    last_count_date DATE,
    last_movement_date TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(item_id, warehouse_id, location_id, lot_id)
);

-- 4.3 Inventory Transactions
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_no VARCHAR(50) NOT NULL UNIQUE,
    transaction_type transaction_type NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    item_id UUID NOT NULL REFERENCES items(id),
    lot_id UUID REFERENCES lots(id),

    -- Source
    from_warehouse_id UUID REFERENCES warehouses(id),
    from_location_id UUID REFERENCES locations(id),

    -- Destination
    to_warehouse_id UUID REFERENCES warehouses(id),
    to_location_id UUID REFERENCES locations(id),

    -- Quantity & Cost
    qty DECIMAL(18,4) NOT NULL,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    unit_cost DECIMAL(18,4),
    total_cost DECIMAL(18,4),

    -- Reference
    reference_type VARCHAR(50), -- 'PRODUCTION_ORDER', 'PURCHASE_ORDER', 'ADJUSTMENT'
    reference_id UUID,
    reference_no VARCHAR(50),

    notes TEXT,

    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Validation
    is_posted BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 5. PRODUCTION TABLES
-- ================================================================

-- 5.1 Production Orders
CREATE TABLE production_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(50) NOT NULL UNIQUE,

    recipe_id UUID NOT NULL REFERENCES recipes(id),
    output_item_id UUID NOT NULL REFERENCES items(id),

    -- Quantities
    planned_qty DECIMAL(18,4) NOT NULL,
    actual_qty DECIMAL(18,4) DEFAULT 0,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    batch_count INTEGER DEFAULT 1,

    -- Schedule
    planned_start TIMESTAMP WITH TIME ZONE,
    planned_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,

    -- Status
    status production_order_status DEFAULT 'DRAFT',
    priority priority_level DEFAULT 'NORMAL',

    -- Warehouses
    production_warehouse_id UUID REFERENCES warehouses(id),
    output_warehouse_id UUID REFERENCES warehouses(id),
    output_location_id UUID REFERENCES locations(id),

    -- Yield tracking
    expected_yield_percent DECIMAL(5,2),
    actual_yield_percent DECIMAL(5,2),

    -- Additional
    customer_order_ref VARCHAR(50),
    notes TEXT,

    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key to lots table
ALTER TABLE lots ADD CONSTRAINT fk_lots_production_order
    FOREIGN KEY (production_order_id) REFERENCES production_orders(id);

-- 5.2 Production Material Consumptions
CREATE TABLE production_consumptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
    recipe_line_id UUID REFERENCES recipe_lines(id),

    item_id UUID NOT NULL REFERENCES items(id),
    lot_id UUID REFERENCES lots(id),

    -- Quantities
    planned_qty DECIMAL(18,4) NOT NULL,
    actual_qty DECIMAL(18,4),
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),

    -- Source
    warehouse_id UUID REFERENCES warehouses(id),
    location_id UUID REFERENCES locations(id),

    -- Status
    is_issued BOOLEAN DEFAULT FALSE,
    issued_at TIMESTAMP WITH TIME ZONE,
    issued_by UUID,

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5.3 Production Outputs
CREATE TABLE production_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,

    item_id UUID NOT NULL REFERENCES items(id),
    lot_id UUID REFERENCES lots(id),

    qty DECIMAL(18,4) NOT NULL,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),

    quality_status quality_status DEFAULT 'PENDING',

    warehouse_id UUID REFERENCES warehouses(id),
    location_id UUID REFERENCES locations(id),

    produced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    produced_by UUID,

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5.4 Production Scrap
CREATE TABLE production_scrap (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,

    item_id UUID NOT NULL REFERENCES items(id),
    lot_id UUID REFERENCES lots(id),

    qty DECIMAL(18,4) NOT NULL,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),

    scrap_reason scrap_reason NOT NULL,
    description TEXT,

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 6. SYSTEM TABLES
-- ================================================================

-- 6.1 Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'VIEWER',
    department VARCHAR(50),
    phone VARCHAR(20),

    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6.2 Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES users(id),
    ip_address VARCHAR(50),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6.3 System Settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'STRING', -- STRING, NUMBER, BOOLEAN, JSON
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- 6.4 Number Sequences (for auto-generating document numbers)
CREATE TABLE number_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_name VARCHAR(50) NOT NULL UNIQUE,
    prefix VARCHAR(10),
    suffix VARCHAR(10),
    current_value INTEGER DEFAULT 0,
    padding_length INTEGER DEFAULT 5,
    reset_period VARCHAR(20), -- DAILY, MONTHLY, YEARLY, NEVER
    last_reset_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- INDEXES
-- ================================================================

-- Items
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_code ON items(code);
CREATE INDEX idx_items_active ON items(is_active);

-- Lots
CREATE INDEX idx_lots_item ON lots(item_id);
CREATE INDEX idx_lots_expiry ON lots(expiry_date);
CREATE INDEX idx_lots_number ON lots(lot_number);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_production_order ON lots(production_order_id);

-- Stock
CREATE INDEX idx_stock_item_warehouse ON stock_on_hand(item_id, warehouse_id);
CREATE INDEX idx_stock_lot ON stock_on_hand(lot_id);
CREATE INDEX idx_stock_warehouse ON stock_on_hand(warehouse_id);

-- Transactions
CREATE INDEX idx_inv_trans_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_inv_trans_item ON inventory_transactions(item_id);
CREATE INDEX idx_inv_trans_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inv_trans_reference ON inventory_transactions(reference_type, reference_id);

-- Production
CREATE INDEX idx_prod_order_status ON production_orders(status);
CREATE INDEX idx_prod_order_date ON production_orders(planned_start);
CREATE INDEX idx_prod_order_recipe ON production_orders(recipe_id);
CREATE INDEX idx_prod_consumption_order ON production_consumptions(production_order_id);
CREATE INDEX idx_prod_output_order ON production_outputs(production_order_id);

-- Audit
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- ================================================================
-- FUNCTIONS
-- ================================================================

-- Function to generate next sequence number
CREATE OR REPLACE FUNCTION get_next_sequence(seq_name VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    seq_record number_sequences%ROWTYPE;
    next_number VARCHAR;
    today DATE := CURRENT_DATE;
BEGIN
    SELECT * INTO seq_record FROM number_sequences WHERE sequence_name = seq_name FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sequence % not found', seq_name;
    END IF;

    -- Check if reset is needed
    IF seq_record.reset_period = 'DAILY' AND seq_record.last_reset_date < today THEN
        seq_record.current_value := 0;
        seq_record.last_reset_date := today;
    ELSIF seq_record.reset_period = 'MONTHLY' AND
          DATE_TRUNC('month', seq_record.last_reset_date) < DATE_TRUNC('month', today) THEN
        seq_record.current_value := 0;
        seq_record.last_reset_date := today;
    ELSIF seq_record.reset_period = 'YEARLY' AND
          DATE_TRUNC('year', seq_record.last_reset_date) < DATE_TRUNC('year', today) THEN
        seq_record.current_value := 0;
        seq_record.last_reset_date := today;
    END IF;

    -- Increment
    seq_record.current_value := seq_record.current_value + 1;

    -- Update sequence
    UPDATE number_sequences
    SET current_value = seq_record.current_value,
        last_reset_date = seq_record.last_reset_date
    WHERE sequence_name = seq_name;

    -- Generate number
    next_number := COALESCE(seq_record.prefix, '') ||
                   LPAD(seq_record.current_value::TEXT, seq_record.padding_length, '0') ||
                   COALESCE(seq_record.suffix, '');

    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate expiry date from manufactured date
CREATE OR REPLACE FUNCTION calculate_expiry_date(
    p_item_id UUID,
    p_manufactured_date DATE
)
RETURNS DATE AS $$
DECLARE
    v_shelf_life_days INTEGER;
BEGIN
    SELECT shelf_life_days INTO v_shelf_life_days
    FROM items WHERE id = p_item_id;

    IF v_shelf_life_days IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN p_manufactured_date + v_shelf_life_days;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_orders_updated_at BEFORE UPDATE ON production_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lots_updated_at BEFORE UPDATE ON lots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_on_hand_updated_at BEFORE UPDATE ON stock_on_hand
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- INITIAL DATA (Sequences)
-- ================================================================

INSERT INTO number_sequences (sequence_name, prefix, padding_length, reset_period, last_reset_date) VALUES
('LOT_SUPPLIER', 'SUP-', 6, 'DAILY', CURRENT_DATE),
('LOT_PRODUCTION', 'PRD-', 6, 'DAILY', CURRENT_DATE),
('PRODUCTION_ORDER', 'PO-', 6, 'MONTHLY', CURRENT_DATE),
('INVENTORY_TRANSACTION', 'INV-', 8, 'NEVER', CURRENT_DATE);

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE items IS 'Master data for all materials, products, and packaging';
COMMENT ON TABLE lots IS 'Lot/Batch tracking for traceability';
COMMENT ON TABLE stock_on_hand IS 'Current stock levels by item, warehouse, location, and lot';
COMMENT ON TABLE inventory_transactions IS 'All inventory movements (receives, issues, transfers, adjustments)';
COMMENT ON TABLE production_orders IS 'Production work orders';
COMMENT ON TABLE production_consumptions IS 'Materials consumed during production - links to source lots for traceability';
COMMENT ON TABLE production_outputs IS 'Finished goods produced - creates new lots';
COMMENT ON TABLE recipes IS 'Bill of Materials / Formulas for manufacturing';
