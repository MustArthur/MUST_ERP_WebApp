-- ==========================================
-- QC System Tables
-- Version: 1.0
-- ==========================================

-- QC Templates - Templates for quality inspection criteria
CREATE TABLE IF NOT EXISTS qc_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL, -- RAW_MATERIAL, SEMI_FINISHED, FINISHED_GOOD, PROCESS
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, DRAFT
    version INTEGER DEFAULT 1,
    description TEXT,
    applies_to VARCHAR(20) DEFAULT 'BOTH', -- PURCHASE, PRODUCTION, BOTH
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QC Template Parameters - Parameters within each template
CREATE TABLE IF NOT EXISTS qc_template_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES qc_templates(id) ON DELETE CASCADE,
    line_no INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    type VARCHAR(20) NOT NULL, -- NUMERIC, ACCEPTANCE, FORMULA
    min_value NUMERIC(15,4),
    max_value NUMERIC(15,4),
    uom VARCHAR(20),
    acceptable_values TEXT[], -- For ACCEPTANCE type
    is_critical BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QC Inspections - Actual inspection records
CREATE TABLE IF NOT EXISTS qc_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- INCOMING, IN_PROCESS, FINAL, PATROL
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, IN_PROGRESS, PASSED, FAILED, ON_HOLD
    template_id UUID REFERENCES qc_templates(id),
    source_doc_type VARCHAR(50) NOT NULL, -- PURCHASE_RECEIPT, WORK_ORDER, etc.
    source_doc_id UUID NOT NULL,
    source_doc_code VARCHAR(50),
    item_id UUID NOT NULL REFERENCES items(id),
    batch_no VARCHAR(100),
    lot_no VARCHAR(100),
    sample_qty NUMERIC(15,4) DEFAULT 1,
    inspected_qty NUMERIC(15,4) DEFAULT 0,
    accepted_qty NUMERIC(15,4) DEFAULT 0,
    rejected_qty NUMERIC(15,4) DEFAULT 0,
    result VARCHAR(20), -- ACCEPTED, REJECTED, CONDITIONAL
    result_remarks TEXT,
    inspection_date DATE DEFAULT CURRENT_DATE,
    inspection_time TIME DEFAULT CURRENT_TIME,
    inspected_by VARCHAR(200),
    approved_by VARCHAR(200),
    approved_at TIMESTAMPTZ,
    is_ccp BOOLEAN DEFAULT FALSE,
    ccp_deviation_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QC Inspection Readings - Parameter values recorded during inspection
CREATE TABLE IF NOT EXISTS qc_inspection_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES qc_inspections(id) ON DELETE CASCADE,
    parameter_id UUID REFERENCES qc_template_parameters(id),
    parameter_name VARCHAR(200), -- Store name if no template
    numeric_value NUMERIC(15,4),
    acceptance_value VARCHAR(200),
    status VARCHAR(20) DEFAULT 'PENDING', -- PASS, FAIL, PENDING
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quarantine Records - Items held for quality issues
CREATE TABLE IF NOT EXISTS quarantine_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, RESOLVED, DISPOSED
    item_id UUID NOT NULL REFERENCES items(id),
    batch_no VARCHAR(100),
    qty NUMERIC(15,4) NOT NULL,
    uom VARCHAR(20) NOT NULL,
    reason VARCHAR(50) NOT NULL, -- QC_FAILED, PENDING_QC, EXPIRED, DAMAGED, etc.
    reason_detail TEXT,
    qc_inspection_id UUID REFERENCES qc_inspections(id),
    action VARCHAR(50), -- RETURN_TO_SUPPLIER, DISPOSE, REWORK, RELEASE, DOWNGRADE
    action_detail TEXT,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    quarantined_at TIMESTAMPTZ DEFAULT NOW(),
    quarantined_by VARCHAR(200),
    resolved_by VARCHAR(200),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item-Template linking table (which templates apply to which items)
CREATE TABLE IF NOT EXISTS item_qc_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES qc_templates(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, template_id)
);

-- ==========================================
-- Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_qc_templates_type ON qc_templates(type);
CREATE INDEX IF NOT EXISTS idx_qc_templates_status ON qc_templates(status);
CREATE INDEX IF NOT EXISTS idx_qc_template_params_template ON qc_template_parameters(template_id);

CREATE INDEX IF NOT EXISTS idx_qc_inspections_status ON qc_inspections(status);
CREATE INDEX IF NOT EXISTS idx_qc_inspections_source ON qc_inspections(source_doc_type, source_doc_id);
CREATE INDEX IF NOT EXISTS idx_qc_inspections_item ON qc_inspections(item_id);
CREATE INDEX IF NOT EXISTS idx_qc_inspections_date ON qc_inspections(inspection_date);

CREATE INDEX IF NOT EXISTS idx_qc_readings_inspection ON qc_inspection_readings(inspection_id);
CREATE INDEX IF NOT EXISTS idx_quarantine_status ON quarantine_records(status);
CREATE INDEX IF NOT EXISTS idx_quarantine_item ON quarantine_records(item_id);

CREATE INDEX IF NOT EXISTS idx_item_qc_templates_item ON item_qc_templates(item_id);
CREATE INDEX IF NOT EXISTS idx_item_qc_templates_template ON item_qc_templates(template_id);

-- ==========================================
-- RLS Policies
-- ==========================================
ALTER TABLE qc_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_template_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_inspection_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarantine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_qc_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all qc_templates" ON qc_templates;
DROP POLICY IF EXISTS "Allow all qc_template_parameters" ON qc_template_parameters;
DROP POLICY IF EXISTS "Allow all qc_inspections" ON qc_inspections;
DROP POLICY IF EXISTS "Allow all qc_inspection_readings" ON qc_inspection_readings;
DROP POLICY IF EXISTS "Allow all quarantine_records" ON quarantine_records;
DROP POLICY IF EXISTS "Allow all item_qc_templates" ON item_qc_templates;

-- Create policies (allow all for now)
CREATE POLICY "Allow all qc_templates" ON qc_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all qc_template_parameters" ON qc_template_parameters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all qc_inspections" ON qc_inspections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all qc_inspection_readings" ON qc_inspection_readings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all quarantine_records" ON quarantine_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all item_qc_templates" ON item_qc_templates FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- Triggers for updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_qc_templates_updated_at ON qc_templates;
CREATE TRIGGER update_qc_templates_updated_at
    BEFORE UPDATE ON qc_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_qc_inspections_updated_at ON qc_inspections;
CREATE TRIGGER update_qc_inspections_updated_at
    BEFORE UPDATE ON qc_inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quarantine_records_updated_at ON quarantine_records;
CREATE TRIGGER update_quarantine_records_updated_at
    BEFORE UPDATE ON quarantine_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Number Sequence for QC codes
-- ==========================================
INSERT INTO number_sequences (sequence_name, prefix, padding_length, reset_period, last_reset_date)
VALUES ('QC_INSPECTION', 'QI-2026-', 4, 'YEARLY', CURRENT_DATE)
ON CONFLICT (sequence_name) DO NOTHING;

INSERT INTO number_sequences (sequence_name, prefix, padding_length, reset_period, last_reset_date)
VALUES ('QUARANTINE', 'QR-2026-', 4, 'YEARLY', CURRENT_DATE)
ON CONFLICT (sequence_name) DO NOTHING;

-- ==========================================
-- Sample QC Template for Raw Materials
-- ==========================================
INSERT INTO qc_templates (id, code, name, type, status, description, applies_to)
VALUES (
    gen_random_uuid(),
    'QIT-RAW-DEFAULT',
    'Default Raw Material Inspection',
    'RAW_MATERIAL',
    'ACTIVE',
    'Default template for incoming raw material inspection',
    'PURCHASE'
) ON CONFLICT (code) DO NOTHING;

-- Add default parameters to the template
WITH template AS (
    SELECT id FROM qc_templates WHERE code = 'QIT-RAW-DEFAULT'
)
INSERT INTO qc_template_parameters (template_id, line_no, name, name_en, type, acceptable_values, is_critical, description)
SELECT
    template.id,
    1,
    'สภาพภายนอก',
    'Visual Appearance',
    'ACCEPTANCE',
    ARRAY['ปกติ', 'ผิดปกติ'],
    false,
    'ตรวจสอบสภาพภายนอกของวัตถุดิบ'
FROM template
WHERE NOT EXISTS (
    SELECT 1 FROM qc_template_parameters p
    JOIN qc_templates t ON p.template_id = t.id
    WHERE t.code = 'QIT-RAW-DEFAULT' AND p.line_no = 1
);

WITH template AS (
    SELECT id FROM qc_templates WHERE code = 'QIT-RAW-DEFAULT'
)
INSERT INTO qc_template_parameters (template_id, line_no, name, name_en, type, acceptable_values, is_critical, description)
SELECT
    template.id,
    2,
    'กลิ่น',
    'Odor',
    'ACCEPTANCE',
    ARRAY['ปกติ', 'ผิดปกติ'],
    false,
    'ตรวจสอบกลิ่นของวัตถุดิบ'
FROM template
WHERE NOT EXISTS (
    SELECT 1 FROM qc_template_parameters p
    JOIN qc_templates t ON p.template_id = t.id
    WHERE t.code = 'QIT-RAW-DEFAULT' AND p.line_no = 2
);

WITH template AS (
    SELECT id FROM qc_templates WHERE code = 'QIT-RAW-DEFAULT'
)
INSERT INTO qc_template_parameters (template_id, line_no, name, name_en, type, acceptable_values, is_critical, description)
SELECT
    template.id,
    3,
    'บรรจุภัณฑ์',
    'Packaging Condition',
    'ACCEPTANCE',
    ARRAY['สมบูรณ์', 'เสียหาย'],
    false,
    'ตรวจสอบสภาพบรรจุภัณฑ์'
FROM template
WHERE NOT EXISTS (
    SELECT 1 FROM qc_template_parameters p
    JOIN qc_templates t ON p.template_id = t.id
    WHERE t.code = 'QIT-RAW-DEFAULT' AND p.line_no = 3
);

-- ==========================================
-- Add requires_qc column to items table if not exists
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'items' AND column_name = 'requires_qc'
    ) THEN
        ALTER TABLE items ADD COLUMN requires_qc BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

COMMENT ON TABLE qc_templates IS 'QC inspection templates with parameter definitions';
COMMENT ON TABLE qc_inspections IS 'Actual QC inspection records linked to source documents';
COMMENT ON TABLE qc_inspection_readings IS 'Parameter readings recorded during inspection';
COMMENT ON TABLE quarantine_records IS 'Items held for quality issues pending resolution';
