-- ==========================================
-- Factory Expenses Module
-- Logistics (fuel + general vehicle costs), Maintenance
-- (machine parts/repair/PM costs), Factory Supplies
-- ==========================================

-- ENUMS
CREATE TYPE factory_expense_category AS ENUM ('LOGISTICS', 'MAINTENANCE', 'FACTORY_SUPPLIES');
CREATE TYPE factory_expense_subcategory AS ENUM (
    'FUEL',                    -- Logistics: ค่าน้ำมันรถขนส่ง
    'VEHICLE_GENERAL',         -- Logistics: ค่าใช้จ่ายทั่วไป (ทางด่วน/บำรุงรักษารถ/ภาษี)
    'SPARE_PARTS',             -- Maintenance: ค่าอะไหล่
    'CORRECTIVE_MAINTENANCE',  -- Maintenance: ค่าซ่อมเครื่องจักร
    'PREVENTIVE_MAINTENANCE',  -- Maintenance: ค่าบำรุงรักษาเครื่องจักรตามรอบ
    'FACTORY_SUPPLIES'         -- Factory Supplies: วัสดุของใช้สิ้นเปลืองในโรงงาน
);

-- Vehicles (master data)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    plate_number VARCHAR(50),
    name VARCHAR(200) NOT NULL,
    vehicle_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machines (master data)
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Factory Expenses (main log — single table across all categories/subcategories,
-- with nullable columns for fields only some subcategories use)
CREATE TABLE IF NOT EXISTS factory_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    category factory_expense_category NOT NULL,
    subcategory factory_expense_subcategory NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    description TEXT,
    -- Logistics
    vehicle_id UUID REFERENCES vehicles(id),
    fuel_type VARCHAR(100),
    fuel_quantity_liters NUMERIC(10,2),
    fuel_price_per_liter NUMERIC(10,2),
    -- Maintenance
    machine_id UUID REFERENCES machines(id),
    -- common
    recorded_by VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_code ON vehicles(code);
CREATE INDEX IF NOT EXISTS idx_machines_code ON machines(code);

CREATE INDEX IF NOT EXISTS idx_factory_expenses_code ON factory_expenses(code);
CREATE INDEX IF NOT EXISTS idx_factory_expenses_category ON factory_expenses(category);
CREATE INDEX IF NOT EXISTS idx_factory_expenses_subcategory ON factory_expenses(subcategory);
CREATE INDEX IF NOT EXISTS idx_factory_expenses_date ON factory_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_factory_expenses_vehicle ON factory_expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_factory_expenses_machine ON factory_expenses(machine_id);

-- Triggers for updated_at
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machines_updated_at
    BEFORE UPDATE ON machines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_factory_expenses_updated_at
    BEFORE UPDATE ON factory_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (hardened convention — authenticated sessions only, per
-- 20260616_rls_authenticated_only.sql)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users only" ON vehicles FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users only" ON machines FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users only" ON factory_expenses FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
