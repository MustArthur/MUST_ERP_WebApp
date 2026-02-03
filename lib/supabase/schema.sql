-- ==========================================
-- MUST ERP - Supabase Database Schema
-- Version: 1.0
-- Last Updated: 2026-02-03
-- ==========================================

-- ==========================================
-- ENUMS
-- ==========================================

-- Category types
CREATE TYPE item_category_type AS ENUM ('RAW_MATERIAL', 'PACKAGING', 'SEMI_FINISHED', 'FINISHED_GOOD');

-- Unit of measure types
CREATE TYPE uom_type AS ENUM ('WEIGHT', 'VOLUME', 'PIECE', 'LENGTH', 'TIME');

-- Warehouse types
CREATE TYPE warehouse_type AS ENUM ('NORMAL', 'COLD_STORAGE', 'QUARANTINE', 'PRODUCTION', 'SHIPPING', 'RAW_MATERIAL', 'WIP', 'FINISHED_GOODS');

-- Recipe status
CREATE TYPE recipe_status AS ENUM ('DRAFT', 'ACTIVE', 'OBSOLETE');

-- Lot status
CREATE TYPE lot_status AS ENUM ('AVAILABLE', 'QUARANTINE', 'HOLD', 'EXPIRED', 'CONSUMED');

-- Quality status
CREATE TYPE quality_status AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- ==========================================
-- FOUNDATION TABLES (Module 1)
-- ==========================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    type item_category_type NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units of Measure
CREATE TABLE IF NOT EXISTS units_of_measure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type uom_type NOT NULL DEFAULT 'PIECE',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200),
    phone VARCHAR(50),
    email VARCHAR(200),
    address TEXT,
    tax_id VARCHAR(50),
    payment_terms INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    type warehouse_type NOT NULL DEFAULT 'NORMAL',
    address TEXT,
    temperature_min NUMERIC(5,2),
    temperature_max NUMERIC(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items (Master Data)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    base_uom_id UUID REFERENCES units_of_measure(id),
    stock_uom_id UUID REFERENCES units_of_measure(id),
    purchase_uom_id UUID REFERENCES units_of_measure(id),
    track_lot BOOLEAN DEFAULT true,
    track_expiry BOOLEAN DEFAULT true,
    shelf_life_days INTEGER,
    min_stock_qty NUMERIC(15,4) DEFAULT 0,
    max_stock_qty NUMERIC(15,4),
    reorder_qty NUMERIC(15,4),
    reorder_point NUMERIC(15,4),
    cost_method VARCHAR(20) DEFAULT 'FIFO',
    standard_cost NUMERIC(15,4),
    last_purchase_cost NUMERIC(15,4),
    barcode VARCHAR(100),
    sku VARCHAR(100),
    brand VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item-Supplier Junction Table
CREATE TABLE IF NOT EXISTS item_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_part_number VARCHAR(100),
    purchase_price NUMERIC(15,4) DEFAULT 0,
    packaging_size NUMERIC(15,4) DEFAULT 1,
    purchase_uom_id UUID REFERENCES units_of_measure(id),
    lead_time_days INTEGER DEFAULT 7,
    min_order_qty NUMERIC(15,4) DEFAULT 1,
    is_preferred BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, supplier_id)
);

-- ==========================================
-- INVENTORY TABLES (Module 3)
-- ==========================================

-- Lots / Batches
CREATE TABLE IF NOT EXISTS lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_number VARCHAR(100) UNIQUE NOT NULL,
    item_id UUID NOT NULL REFERENCES items(id),
    supplier_id UUID REFERENCES suppliers(id),
    production_order_id UUID,
    purchase_order_id UUID,
    manufactured_date DATE,
    expiry_date DATE,
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    initial_qty NUMERIC(15,4) NOT NULL,
    uom_id UUID REFERENCES units_of_measure(id),
    cost_per_unit NUMERIC(15,4),
    status lot_status DEFAULT 'AVAILABLE',
    quality_status quality_status DEFAULT 'PENDING',
    supplier_lot_number VARCHAR(100),
    certificate_of_analysis TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock on Hand
CREATE TABLE IF NOT EXISTS stock_on_hand (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    location_id UUID,
    lot_id UUID REFERENCES lots(id),
    qty_on_hand NUMERIC(15,4) NOT NULL DEFAULT 0,
    qty_reserved NUMERIC(15,4) NOT NULL DEFAULT 0,
    qty_available NUMERIC(15,4) GENERATED ALWAYS AS (qty_on_hand - qty_reserved) STORED,
    uom_id UUID REFERENCES units_of_measure(id),
    last_count_date DATE,
    last_movement_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, warehouse_id, lot_id)
);

-- ==========================================
-- RECIPE TABLES (Module 2)
-- ==========================================

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    output_item_id UUID REFERENCES items(id),
    output_qty NUMERIC(15,4) NOT NULL,
    output_uom_id UUID REFERENCES units_of_measure(id),
    standard_batch_size NUMERIC(15,4),
    min_batch_size NUMERIC(15,4),
    max_batch_size NUMERIC(15,4),
    expected_yield_percent NUMERIC(5,2) DEFAULT 100,
    version INTEGER DEFAULT 1,
    status recipe_status DEFAULT 'DRAFT',
    valid_from DATE,
    valid_to DATE,
    estimated_duration_minutes INTEGER,
    instructions TEXT,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe Lines (Ingredients)
CREATE TABLE IF NOT EXISTS recipe_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    line_no INTEGER NOT NULL,
    item_id UUID NOT NULL REFERENCES items(id),
    qty_per_batch NUMERIC(15,4) NOT NULL,
    uom_id UUID REFERENCES units_of_measure(id),
    scrap_percent NUMERIC(5,2) DEFAULT 0,
    is_critical BOOLEAN DEFAULT false,
    is_optional BOOLEAN DEFAULT false,
    substitute_item_id UUID REFERENCES items(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recipe_id, line_no)
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_items_code ON items(code);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_active ON items(is_active);

CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);

CREATE INDEX IF NOT EXISTS idx_stock_on_hand_item ON stock_on_hand(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_on_hand_warehouse ON stock_on_hand(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_on_hand_lot ON stock_on_hand(lot_id);

CREATE INDEX IF NOT EXISTS idx_lots_item ON lots(item_id);
CREATE INDEX IF NOT EXISTS idx_lots_expiry ON lots(expiry_date);
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);

CREATE INDEX IF NOT EXISTS idx_recipes_code ON recipes(code);
CREATE INDEX IF NOT EXISTS idx_recipes_status ON recipes(status);

CREATE INDEX IF NOT EXISTS idx_recipe_lines_recipe ON recipe_lines(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_lines_item ON recipe_lines(item_id);

CREATE INDEX IF NOT EXISTS idx_item_suppliers_item ON item_suppliers(item_id);
CREATE INDEX IF NOT EXISTS idx_item_suppliers_supplier ON item_suppliers(supplier_id);

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('items', 'suppliers', 'warehouses', 'categories', 'recipes', 'lots', 'stock_on_hand', 'item_suppliers')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', t, t);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$;

-- ==========================================
-- RLS POLICIES (Optional - for later)
-- ==========================================

-- Disable RLS for development (enable later when Auth is added)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_on_hand ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_lines ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (replace with proper policies later)
CREATE POLICY "Allow all" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON units_of_measure FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON warehouses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON item_suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON lots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON stock_on_hand FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON recipe_lines FOR ALL USING (true) WITH CHECK (true);
