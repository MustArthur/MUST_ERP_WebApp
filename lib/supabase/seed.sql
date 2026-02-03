-- ==========================================
-- MUST ERP - Seed Data
-- Version: 1.0
-- Last Updated: 2026-02-03
-- ==========================================

-- ==========================================
-- UNITS OF MEASURE
-- ==========================================

INSERT INTO units_of_measure (code, name, type) VALUES
('KG', 'กิโลกรัม', 'WEIGHT'),
('G', 'กรัม', 'WEIGHT'),
('L', 'ลิตร', 'VOLUME'),
('ML', 'มิลลิลิตร', 'VOLUME'),
('PC', 'ชิ้น', 'PIECE'),
('BTL', 'ขวด', 'PIECE'),
('BOX', 'กล่อง', 'PIECE'),
('BAG', 'ถุง', 'PIECE'),
('PACK', 'แพ็ค', 'PIECE'),
('DRUM', 'ถัง', 'PIECE'),
('ROLL', 'ม้วน', 'PIECE'),
('SET', 'ชุด', 'PIECE'),
('MIN', 'นาที', 'TIME'),
('HR', 'ชั่วโมง', 'TIME')
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- CATEGORIES
-- ==========================================

INSERT INTO categories (code, name, type, description) VALUES
('CAT-RM-MEAT', 'เนื้อสัตว์', 'RAW_MATERIAL', 'วัตถุดิบเนื้อสัตว์'),
('CAT-RM-VEG', 'ผัก/ผลไม้', 'RAW_MATERIAL', 'วัตถุดิบผักและผลไม้'),
('CAT-RM-DAIRY', 'นมและผลิตภัณฑ์นม', 'RAW_MATERIAL', 'นม ครีม โยเกิร์ต'),
('CAT-RM-SPICE', 'เครื่องปรุง', 'RAW_MATERIAL', 'เครื่องเทศและเครื่องปรุงรส'),
('CAT-RM-PROTEIN', 'โปรตีน', 'RAW_MATERIAL', 'โปรตีนผง เวย์'),
('CAT-RM-SWEET', 'สารให้ความหวาน', 'RAW_MATERIAL', 'น้ำตาล สารให้ความหวาน'),
('CAT-RM-OTHER', 'วัตถุดิบอื่นๆ', 'RAW_MATERIAL', 'วัตถุดิบอื่นๆ'),
('CAT-PKG-BTL', 'บรรจุภัณฑ์ขวด', 'PACKAGING', 'ขวดพลาสติก ขวดแก้ว'),
('CAT-PKG-CAP', 'ฝาปิด', 'PACKAGING', 'ฝาขวด ซีล'),
('CAT-PKG-LABEL', 'ฉลาก', 'PACKAGING', 'ฉลากสินค้า'),
('CAT-PKG-BOX', 'กล่อง/ลัง', 'PACKAGING', 'กล่องบรรจุ ลังขนส่ง'),
('CAT-FG', 'สินค้าสำเร็จรูป', 'FINISHED_GOOD', 'โปรตีนสมูทตี้ พร้อมดื่ม')
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- WAREHOUSES
-- ==========================================

INSERT INTO warehouses (code, name, type, temperature_min, temperature_max) VALUES
('WH-RM-COLD', 'คลังวัตถุดิบ - ห้องเย็น', 'COLD_STORAGE', 0, 4),
('WH-RM-DRY', 'คลังวัตถุดิบ - แห้ง', 'RAW_MATERIAL', NULL, NULL),
('WH-RM-PKG', 'คลังบรรจุภัณฑ์', 'RAW_MATERIAL', NULL, NULL),
('WH-RM-QRTN', 'คลังกักกัน - วัตถุดิบ', 'QUARANTINE', NULL, NULL),
('WH-WIP', 'คลังระหว่างผลิต', 'WIP', NULL, NULL),
('WH-FG-COLD', 'คลังสินค้าสำเร็จรูป - เย็น', 'COLD_STORAGE', 2, 8),
('WH-FG-HOLD', 'คลังรอ QC', 'QUARANTINE', 2, 8),
('WH-FG-QRTN', 'คลังกักกัน - FG', 'QUARANTINE', 2, 8)
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- SUPPLIERS
-- ==========================================

INSERT INTO suppliers (code, name, contact_name, phone, email, address, tax_id, payment_terms) VALUES
('SUP-001', 'บริษัท ไก่สดดี จำกัด', 'คุณสมชาย', '02-123-4567', 'somchai@kaidee.co.th', '123 ถ.เพชรบุรี กรุงเทพฯ 10400', '0105550012345', 30),
('SUP-002', 'บริษัท นมสด จำกัด', 'คุณสมหญิง', '02-234-5678', 'somying@nomsod.co.th', '456 ถ.รัชดา กรุงเทพฯ 10310', '0105550023456', 15),
('SUP-003', 'บริษัท โปรตีนพลัส จำกัด', 'คุณมานะ', '02-345-6789', 'mana@proteinplus.co.th', '789 ถ.บางนา-ตราด กรุงเทพฯ 10260', '0105550034567', 30),
('SUP-004', 'บริษัท บรรจุภัณฑ์ไทย จำกัด', 'คุณมานี', '02-456-7890', 'manee@thaipkg.co.th', '321 ถ.พระราม 9 กรุงเทพฯ 10320', '0105550045678', 45),
('SUP-005', 'บริษัท ผลไม้สด จำกัด', 'คุณวิชัย', '02-567-8901', 'wichai@freshfruit.co.th', '654 ถ.ลาดพร้าว กรุงเทพฯ 10230', '0105550056789', 7)
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- ITEMS - Raw Materials
-- ==========================================

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'RM-CHICKEN-001',
    'อกไก่สด',
    (SELECT id FROM categories WHERE code = 'CAT-RM-MEAT'),
    (SELECT id FROM units_of_measure WHERE code = 'KG'),
    true, true, 5, 50, 89.00
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'RM-CHICKEN-001');

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'RM-MILK-001',
    'นมสดพาสเจอร์ไรซ์',
    (SELECT id FROM categories WHERE code = 'CAT-RM-DAIRY'),
    (SELECT id FROM units_of_measure WHERE code = 'L'),
    true, true, 7, 100, 28.00
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'RM-MILK-001');

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'RM-WHEY-001',
    'เวย์โปรตีน Isolate',
    (SELECT id FROM categories WHERE code = 'CAT-RM-PROTEIN'),
    (SELECT id FROM units_of_measure WHERE code = 'KG'),
    true, true, 365, 20, 450.00
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'RM-WHEY-001');

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'RM-BANANA-001',
    'กล้วยหอม',
    (SELECT id FROM categories WHERE code = 'CAT-RM-VEG'),
    (SELECT id FROM units_of_measure WHERE code = 'KG'),
    true, true, 5, 30, 25.00
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'RM-BANANA-001');

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'RM-HONEY-001',
    'น้ำผึ้งแท้',
    (SELECT id FROM categories WHERE code = 'CAT-RM-SWEET'),
    (SELECT id FROM units_of_measure WHERE code = 'KG'),
    true, true, 730, 10, 180.00
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'RM-HONEY-001');

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'RM-COCOA-001',
    'ผงโกโก้',
    (SELECT id FROM categories WHERE code = 'CAT-RM-SPICE'),
    (SELECT id FROM units_of_measure WHERE code = 'KG'),
    true, true, 365, 5, 220.00
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'RM-COCOA-001');

-- ==========================================
-- ITEMS - Packaging
-- ==========================================

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'PKG-BTL-350',
    'ขวด PET 350ml',
    (SELECT id FROM categories WHERE code = 'CAT-PKG-BTL'),
    (SELECT id FROM units_of_measure WHERE code = 'PC'),
    true, false, NULL, 1000, 2.50
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'PKG-BTL-350');

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'PKG-CAP-001',
    'ฝาขวดสีน้ำเงิน',
    (SELECT id FROM categories WHERE code = 'CAT-PKG-CAP'),
    (SELECT id FROM units_of_measure WHERE code = 'PC'),
    true, false, NULL, 1000, 0.80
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'PKG-CAP-001');

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'PKG-LABEL-001',
    'ฉลาก Protein Smoothie',
    (SELECT id FROM categories WHERE code = 'CAT-PKG-LABEL'),
    (SELECT id FROM units_of_measure WHERE code = 'PC'),
    true, false, NULL, 2000, 0.30
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'PKG-LABEL-001');

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'PKG-BOX-12',
    'กล่องลัง 12 ขวด',
    (SELECT id FROM categories WHERE code = 'CAT-PKG-BOX'),
    (SELECT id FROM units_of_measure WHERE code = 'PC'),
    false, false, NULL, 200, 15.00
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'PKG-BOX-12');

-- ==========================================
-- ITEMS - Finished Goods
-- ==========================================

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'FG-CK-001',
    'Chicken Protein Smoothie - Original',
    (SELECT id FROM categories WHERE code = 'CAT-FG'),
    (SELECT id FROM units_of_measure WHERE code = 'BTL'),
    true, true, 14, 100, 0
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-001');

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'FG-CK-002',
    'Chicken Protein Smoothie - Chocolate',
    (SELECT id FROM categories WHERE code = 'CAT-FG'),
    (SELECT id FROM units_of_measure WHERE code = 'BTL'),
    true, true, 14, 100, 0
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-002');

INSERT INTO items (code, name, category_id, base_uom_id, track_lot, track_expiry, shelf_life_days, min_stock_qty, last_purchase_cost)
SELECT
    'FG-PB-001',
    'Plant-Based Protein Smoothie - Banana',
    (SELECT id FROM categories WHERE code = 'CAT-FG'),
    (SELECT id FROM units_of_measure WHERE code = 'BTL'),
    true, true, 10, 100, 0
WHERE NOT EXISTS (SELECT 1 FROM items WHERE code = 'FG-PB-001');

-- ==========================================
-- ITEM-SUPPLIERS RELATIONSHIPS
-- ==========================================

INSERT INTO item_suppliers (item_id, supplier_id, supplier_part_number, purchase_price, packaging_size, purchase_uom_id, lead_time_days, min_order_qty, is_preferred)
SELECT
    (SELECT id FROM items WHERE code = 'RM-CHICKEN-001'),
    (SELECT id FROM suppliers WHERE code = 'SUP-001'),
    'CK-BREAST-001',
    89.00, 1, (SELECT id FROM units_of_measure WHERE code = 'KG'),
    1, 10, true
WHERE NOT EXISTS (
    SELECT 1 FROM item_suppliers
    WHERE item_id = (SELECT id FROM items WHERE code = 'RM-CHICKEN-001')
    AND supplier_id = (SELECT id FROM suppliers WHERE code = 'SUP-001')
);

INSERT INTO item_suppliers (item_id, supplier_id, supplier_part_number, purchase_price, packaging_size, purchase_uom_id, lead_time_days, min_order_qty, is_preferred)
SELECT
    (SELECT id FROM items WHERE code = 'RM-MILK-001'),
    (SELECT id FROM suppliers WHERE code = 'SUP-002'),
    'MILK-PAST-1L',
    28.00, 1, (SELECT id FROM units_of_measure WHERE code = 'L'),
    1, 50, true
WHERE NOT EXISTS (
    SELECT 1 FROM item_suppliers
    WHERE item_id = (SELECT id FROM items WHERE code = 'RM-MILK-001')
    AND supplier_id = (SELECT id FROM suppliers WHERE code = 'SUP-002')
);

INSERT INTO item_suppliers (item_id, supplier_id, supplier_part_number, purchase_price, packaging_size, purchase_uom_id, lead_time_days, min_order_qty, is_preferred)
SELECT
    (SELECT id FROM items WHERE code = 'RM-WHEY-001'),
    (SELECT id FROM suppliers WHERE code = 'SUP-003'),
    'WHEY-ISO-25KG',
    450.00, 25, (SELECT id FROM units_of_measure WHERE code = 'KG'),
    7, 1, true
WHERE NOT EXISTS (
    SELECT 1 FROM item_suppliers
    WHERE item_id = (SELECT id FROM items WHERE code = 'RM-WHEY-001')
    AND supplier_id = (SELECT id FROM suppliers WHERE code = 'SUP-003')
);

INSERT INTO item_suppliers (item_id, supplier_id, supplier_part_number, purchase_price, packaging_size, purchase_uom_id, lead_time_days, min_order_qty, is_preferred)
SELECT
    (SELECT id FROM items WHERE code = 'PKG-BTL-350'),
    (SELECT id FROM suppliers WHERE code = 'SUP-004'),
    'PET-350-CLR',
    2.50, 1, (SELECT id FROM units_of_measure WHERE code = 'PC'),
    14, 1000, true
WHERE NOT EXISTS (
    SELECT 1 FROM item_suppliers
    WHERE item_id = (SELECT id FROM items WHERE code = 'PKG-BTL-350')
    AND supplier_id = (SELECT id FROM suppliers WHERE code = 'SUP-004')
);

INSERT INTO item_suppliers (item_id, supplier_id, supplier_part_number, purchase_price, packaging_size, purchase_uom_id, lead_time_days, min_order_qty, is_preferred)
SELECT
    (SELECT id FROM items WHERE code = 'RM-BANANA-001'),
    (SELECT id FROM suppliers WHERE code = 'SUP-005'),
    'BANANA-CAVENDISH',
    25.00, 1, (SELECT id FROM units_of_measure WHERE code = 'KG'),
    1, 20, true
WHERE NOT EXISTS (
    SELECT 1 FROM item_suppliers
    WHERE item_id = (SELECT id FROM items WHERE code = 'RM-BANANA-001')
    AND supplier_id = (SELECT id FROM suppliers WHERE code = 'SUP-005')
);

-- ==========================================
-- SAMPLE RECIPES
-- ==========================================

INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, estimated_duration_minutes, status, instructions)
SELECT
    'RCP-CK-001',
    'Chicken Protein Smoothie - Original',
    (SELECT id FROM items WHERE code = 'FG-CK-001'),
    100,
    (SELECT id FROM units_of_measure WHERE code = 'BTL'),
    100, 95, 120, 'ACTIVE',
    '1. นึ่งอกไก่ที่อุณหภูมิ 85°C เป็นเวลา 45 นาที
2. ปั่นอกไก่กับนมจนละเอียด
3. เติมเวย์โปรตีนและส่วนผสมอื่นๆ
4. พาสเจอร์ไรซ์ที่ 72°C เป็นเวลา 15 วินาที
5. บรรจุขวดและปิดฝา
6. ตรวจ QC และติดฉลาก'
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-CK-001');

INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, estimated_duration_minutes, status, instructions)
SELECT
    'RCP-PB-001',
    'Plant-Based Protein Smoothie - Banana',
    (SELECT id FROM items WHERE code = 'FG-PB-001'),
    100,
    (SELECT id FROM units_of_measure WHERE code = 'BTL'),
    100, 97, 90, 'ACTIVE',
    '1. ปั่นกล้วยหอมกับนมจนละเอียด
2. เติมเวย์โปรตีนและน้ำผึ้ง
3. พาสเจอร์ไรซ์ที่ 72°C เป็นเวลา 15 วินาที
4. บรรจุขวดและปิดฝา
5. ตรวจ QC และติดฉลาก'
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-PB-001');

-- ==========================================
-- RECIPE LINES (Ingredients)
-- ==========================================

-- Recipe CK-001 Ingredients
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT
    (SELECT id FROM recipes WHERE code = 'RCP-CK-001'),
    1,
    (SELECT id FROM items WHERE code = 'RM-CHICKEN-001'),
    15,
    (SELECT id FROM units_of_measure WHERE code = 'KG'),
    5, true
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-CK-001')
AND NOT EXISTS (
    SELECT 1 FROM recipe_lines
    WHERE recipe_id = (SELECT id FROM recipes WHERE code = 'RCP-CK-001') AND line_no = 1
);

INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT
    (SELECT id FROM recipes WHERE code = 'RCP-CK-001'),
    2,
    (SELECT id FROM items WHERE code = 'RM-MILK-001'),
    25,
    (SELECT id FROM units_of_measure WHERE code = 'L'),
    2, true
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-CK-001')
AND NOT EXISTS (
    SELECT 1 FROM recipe_lines
    WHERE recipe_id = (SELECT id FROM recipes WHERE code = 'RCP-CK-001') AND line_no = 2
);

INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT
    (SELECT id FROM recipes WHERE code = 'RCP-CK-001'),
    3,
    (SELECT id FROM items WHERE code = 'RM-WHEY-001'),
    3,
    (SELECT id FROM units_of_measure WHERE code = 'KG'),
    1, false
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-CK-001')
AND NOT EXISTS (
    SELECT 1 FROM recipe_lines
    WHERE recipe_id = (SELECT id FROM recipes WHERE code = 'RCP-CK-001') AND line_no = 3
);

INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT
    (SELECT id FROM recipes WHERE code = 'RCP-CK-001'),
    4,
    (SELECT id FROM items WHERE code = 'PKG-BTL-350'),
    105,
    (SELECT id FROM units_of_measure WHERE code = 'PC'),
    5, false
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-CK-001')
AND NOT EXISTS (
    SELECT 1 FROM recipe_lines
    WHERE recipe_id = (SELECT id FROM recipes WHERE code = 'RCP-CK-001') AND line_no = 4
);

INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT
    (SELECT id FROM recipes WHERE code = 'RCP-CK-001'),
    5,
    (SELECT id FROM items WHERE code = 'PKG-CAP-001'),
    105,
    (SELECT id FROM units_of_measure WHERE code = 'PC'),
    5, false
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-CK-001')
AND NOT EXISTS (
    SELECT 1 FROM recipe_lines
    WHERE recipe_id = (SELECT id FROM recipes WHERE code = 'RCP-CK-001') AND line_no = 5
);

-- Recipe PB-001 Ingredients
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT
    (SELECT id FROM recipes WHERE code = 'RCP-PB-001'),
    1,
    (SELECT id FROM items WHERE code = 'RM-BANANA-001'),
    20,
    (SELECT id FROM units_of_measure WHERE code = 'KG'),
    10, true
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-PB-001')
AND NOT EXISTS (
    SELECT 1 FROM recipe_lines
    WHERE recipe_id = (SELECT id FROM recipes WHERE code = 'RCP-PB-001') AND line_no = 1
);

INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT
    (SELECT id FROM recipes WHERE code = 'RCP-PB-001'),
    2,
    (SELECT id FROM items WHERE code = 'RM-MILK-001'),
    20,
    (SELECT id FROM units_of_measure WHERE code = 'L'),
    2, true
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-PB-001')
AND NOT EXISTS (
    SELECT 1 FROM recipe_lines
    WHERE recipe_id = (SELECT id FROM recipes WHERE code = 'RCP-PB-001') AND line_no = 2
);

INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT
    (SELECT id FROM recipes WHERE code = 'RCP-PB-001'),
    3,
    (SELECT id FROM items WHERE code = 'RM-WHEY-001'),
    2.5,
    (SELECT id FROM units_of_measure WHERE code = 'KG'),
    1, false
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-PB-001')
AND NOT EXISTS (
    SELECT 1 FROM recipe_lines
    WHERE recipe_id = (SELECT id FROM recipes WHERE code = 'RCP-PB-001') AND line_no = 3
);

INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT
    (SELECT id FROM recipes WHERE code = 'RCP-PB-001'),
    4,
    (SELECT id FROM items WHERE code = 'RM-HONEY-001'),
    1.5,
    (SELECT id FROM units_of_measure WHERE code = 'KG'),
    0, false
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'RCP-PB-001')
AND NOT EXISTS (
    SELECT 1 FROM recipe_lines
    WHERE recipe_id = (SELECT id FROM recipes WHERE code = 'RCP-PB-001') AND line_no = 4
);
