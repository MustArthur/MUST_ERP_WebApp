-- ================================================================
-- MUST ERP - Seed Data
-- Generated from BOM.csv and Item.csv
-- Run this AFTER schema.sql
-- ================================================================

-- ================================================================
-- 1. UNITS OF MEASURE
-- ================================================================
INSERT INTO units_of_measure (code, name, type) VALUES
('KG', 'Kilogram', 'WEIGHT'),
('G', 'Gram', 'WEIGHT'),
('L', 'Litre', 'VOLUME'),
('ML', 'Millilitre', 'VOLUME'),
('PC', 'Piece', 'PIECE'),
('BTL', 'ขวด', 'PIECE'),
('PKG', 'Package', 'PIECE')
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- 2. CATEGORIES
-- ================================================================
INSERT INTO categories (code, name, type) VALUES
('CAT-RM', 'Raw Material', 'RAW_MATERIAL'),
('CAT-SP', 'Semi-Products', 'SEMI_FINISHED'),
('CAT-FG', 'Products', 'FINISHED_GOOD'),
('CAT-PKG', 'Packaging', 'PACKAGING')
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- 3. SUPPLIERS
-- ================================================================
INSERT INTO suppliers (code, name, is_active) VALUES
('SUP-001', 'เซ็นทรัล ฟู้ด รีเทล', true),
('SUP-002', 'KH ROBERTS', true),
('SUP-003', 'เยียระกานต์', true),
('SUP-004', 'พรีโม เทรดดิ้ง', true),
('SUP-005', 'ซีพี แอ๊กซ์ตร้า', true),
('SUP-006', 'ที.เอ.ซี. คอนซูเมอร์', true),
('SUP-007', 'เค ซี อินเตอร์ฟูดส์', true),
('SUP-008', 'โพลาร์ แบร์ มิชชั่น', true),
('SUP-009', 'บีเจซี สเปเชียลตี้ส์', true),
('SUP-010', 'ณายลอย เบเกอรี่', true),
('SUP-011', 'เพชร เฟลเวอร์ โปรดักส์', true),
('SUP-012', 'กรุงเทพเคมี', true),
('SUP-013', 'เพชรคู่ เคมีคอล', true),
('SUP-014', 'ทริปเปิ้ลไนน์ โซลูชั่น', true),
('SUP-015', 'เบทาโกรเกษตรอุตสาหกรรม', true),
('SUP-016', 'เอ็มพี 9564', true)
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- 4. ITEMS - Raw Materials
-- ================================================================
INSERT INTO items (code, name, category_id, base_uom_id, last_purchase_cost, is_active)
SELECT 
  v.code,
  v.name,
  (SELECT id FROM categories WHERE code = v.cat_code),
  (SELECT id FROM units_of_measure WHERE code = v.uom_code),
  v.cost,
  true
FROM (VALUES
  -- Raw Materials (from CSV)
  ('RM-CHICKEN', 'Boiled Chicken', 'CAT-SP', 'G', 0.15),
  ('RM-GLYCINE', 'Glycine', 'CAT-RM', 'G', 0.08),
  ('RM-CMC', 'CMC', 'CAT-RM', 'G', 0.17),
  ('RM-XANTHAN', 'Xanthan', 'CAT-RM', 'G', 0.14),
  ('RM-GUARGUM', 'Guar Gum', 'CAT-RM', 'G', 0.18),
  ('RM-MALIC', 'Malic', 'CAT-RM', 'G', 0.22),
  ('RM-CITRICACID', 'Citric Acid', 'CAT-RM', 'G', 0.08),
  ('RM-LACTICACID', 'Lactic Acid', 'CAT-RM', 'G', 0.15),
  ('RM-SUCRALOSE', 'Sucralose', 'CAT-RM', 'G', 0.95),
  ('RM-WATER', 'Water', 'CAT-RM', 'L', 8.00),
  
  -- Squash
  ('RM-BLUBERRYSQSH', 'Blueberry Squash', 'CAT-RM', 'ML', 0.09),
  ('RM-PASSIONFRUITSQSH', 'Passionfruit Squash', 'CAT-RM', 'ML', 0.09),
  ('RM-LYCHEESQSH', 'Lychee Squash', 'CAT-RM', 'ML', 0.09),
  
  -- Flavors
  ('RM-MIXBERRYFLAVOR', 'Mix berry Flavor', 'CAT-RM', 'G', 1.72),
  ('RM-YOGHURTFLAVOR', 'Yoghurt Flavor', 'CAT-RM', 'G', 0.90),
  ('RM-PASSIONFRUITFLAVOR', 'Passionfruit Flavor', 'CAT-RM', 'G', 0.84),
  ('RM-LYCHEEFLAVOR', 'Lychee Flavor', 'CAT-RM', 'G', 0.75),
  ('RM-WHITEPEACHFLAVOR', 'White Peach Flavor', 'CAT-RM', 'G', 0.85),
  ('RM-STRAWBERRYFLAVOR', 'Strawberry Flavor', 'CAT-RM', 'G', 0.88),
  ('RM-VANILLAFLAVOR', 'Vanilla Flavor', 'CAT-RM', 'G', 0.81),
  ('RM-THAITEFLAVOR', 'Thai Tea Flavor', 'CAT-RM', 'G', 1.60),
  ('RM-CHOCOLATEFLAVOR', 'Chocolate Flavor', 'CAT-RM', 'G', 1.02),
  
  -- Colors
  ('RM-PURPLECOLOR', 'Purple Color', 'CAT-RM', 'ML', 0.22),
  ('RM-PINKCOLOR', 'Pink Color', 'CAT-RM', 'ML', 0.22),
  ('RM-YELLOWCOLOR', 'Yellow Color', 'CAT-RM', 'ML', 0.22),
  ('RM-REDCOLOR', 'Red Color', 'CAT-RM', 'ML', 0.22),
  
  -- Fruits
  ('RM-STRAWBERRYFRUIT', 'Strawberry Fruit', 'CAT-RM', 'G', 0.08),
  
  -- Powders
  ('RM-THAITEA', 'Thai Tea Powder (Triva)', 'CAT-RM', 'G', 2.00),
  ('RM-BLACKTEA', 'Black Tea Powder', 'CAT-RM', 'G', 1.80),
  ('RM-COFFEE', 'Coffee Powder', 'CAT-RM', 'G', 0.68),
  ('RM-MATCHA', 'Matcha Powder', 'CAT-RM', 'G', 1.37),
  ('RM-CACAO', 'Cacao Powder', 'CAT-RM', 'G', 0.30),
  
  -- Plant Based
  ('RM-PLANTPROTEIN', 'Plant Protien', 'CAT-RM', 'G', 0.33),
  ('RM-FIBERCREAMER', 'Fiber Creamer', 'CAT-RM', 'G', 0.16),
  ('RM-COCONUTOIL', 'Coconut Oil', 'CAT-RM', 'G', 0.07),
  
  -- Semi-Products
  ('SP-ALMONDMILK', 'Almond Milk', 'CAT-SP', 'ML', 0.03),
  ('RM-MAL', 'Mal', 'CAT-RM', 'G', 0.04)
) AS v(code, name, cat_code, uom_code, cost)
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- 5. ITEMS - Finished Goods (Products)
-- ================================================================
INSERT INTO items (code, name, category_id, base_uom_id, barcode, is_active)
SELECT 
  v.code,
  v.name,
  (SELECT id FROM categories WHERE code = 'CAT-FG'),
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  v.barcode,
  true
FROM (VALUES
  -- Chicken Products
  ('FG-CK-BLUEBERRY', 'CK_Blueberry', '8857128009161'),
  ('FG-CK-MANGO', 'CK_Mango', '8857128009154'),
  ('FG-CK-LYCHEE', 'CK_Lychee', '8857128009185'),
  ('FG-CK-PEACH', 'CK_Peach', '8857128009024'),
  ('FG-CK-STRAWBERRY', 'CK_Strawberry', '8857128009017'),
  ('FG-CK-THAITEA', 'CK_ThaiTea', '8857128009062'),
  ('FG-CK-LATTE', 'CK_Latte', '8857128009055'),
  ('FG-CK-MATCHA', 'CK_Matcha', '8857128009048'),
  ('FG-CK-CACAO', 'CK_Cacao', '8857128009031'),
  -- Plant-Based Products
  ('FG-PB-THAITEA', 'PB_ThaiTea', '8857128009239'),
  ('FG-PB-ACAI', 'PB_Acai', '8857128009222'),
  ('FG-PB-CACAO', 'PB_Cacao', '8857128009215'),
  ('FG-PB-NATURAL', 'PB_Natural', '8857128009208')
) AS v(code, name, barcode)
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- 6. RECIPES (BOM)
-- ================================================================

-- CK_Blueberry
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-CK-BLUEBERRY-001',
  'โปรตีนไก่ รสบลูเบอร์รี่',
  (SELECT id FROM items WHERE code = 'FG-CK-BLUEBERRY'),
  30,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  30,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-BLUEBERRY');

-- CK_Mango
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-CK-MANGO-001',
  'โปรตีนไก่ รสมะม่วง',
  (SELECT id FROM items WHERE code = 'FG-CK-MANGO'),
  30,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  30,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-MANGO');

-- CK_Lychee
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-CK-LYCHEE-001',
  'โปรตีนไก่ รสลิ้นจี่',
  (SELECT id FROM items WHERE code = 'FG-CK-LYCHEE'),
  30,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  30,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-LYCHEE');

-- CK_Peach
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-CK-PEACH-001',
  'โปรตีนไก่ รสพีช',
  (SELECT id FROM items WHERE code = 'FG-CK-PEACH'),
  30,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  30,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-PEACH');

-- CK_Strawberry
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-CK-STRAWBERRY-001',
  'โปรตีนไก่ รสสตรอว์เบอร์รี่',
  (SELECT id FROM items WHERE code = 'FG-CK-STRAWBERRY'),
  30,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  30,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-STRAWBERRY');

-- CK_ThaiTea
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-CK-THAITEA-001',
  'โปรตีนไก่ รสชาไทย',
  (SELECT id FROM items WHERE code = 'FG-CK-THAITEA'),
  30,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  30,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-THAITEA');

-- CK_Latte
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-CK-LATTE-001',
  'โปรตีนไก่ รสลาเต้',
  (SELECT id FROM items WHERE code = 'FG-CK-LATTE'),
  30,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  30,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-LATTE');

-- CK_Matcha
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-CK-MATCHA-001',
  'โปรตีนไก่ รสมัทฉะ',
  (SELECT id FROM items WHERE code = 'FG-CK-MATCHA'),
  30,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  30,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-MATCHA');

-- CK_Cacao
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-CK-CACAO-001',
  'โปรตีนไก่ รสโกโก้',
  (SELECT id FROM items WHERE code = 'FG-CK-CACAO'),
  30,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  30,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-CK-CACAO');

-- PB_ThaiTea
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-PB-THAITEA-001',
  'โปรตีนพืช รสชาไทย',
  (SELECT id FROM items WHERE code = 'FG-PB-THAITEA'),
  42,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  42,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-PB-THAITEA');

-- PB_Acai
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-PB-ACAI-001',
  'โปรตีนพืช รส Acai',
  (SELECT id FROM items WHERE code = 'FG-PB-ACAI'),
  42,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  42,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-PB-ACAI');

-- PB_Cacao
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-PB-CACAO-001',
  'โปรตีนพืช รสโกโก้',
  (SELECT id FROM items WHERE code = 'FG-PB-CACAO'),
  42,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  42,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-PB-CACAO');

-- PB_Natural
INSERT INTO recipes (code, name, output_item_id, output_qty, output_uom_id, standard_batch_size, expected_yield_percent, status, version)
SELECT 
  'BOM-PB-NATURAL-001',
  'โปรตีนพืช รส Natural',
  (SELECT id FROM items WHERE code = 'FG-PB-NATURAL'),
  42,
  (SELECT id FROM units_of_measure WHERE code = 'BTL'),
  42,
  95.00,
  'ACTIVE',
  1
WHERE EXISTS (SELECT 1 FROM items WHERE code = 'FG-PB-NATURAL');

-- ================================================================
-- 7. RECIPE LINES (BOM Ingredients)
-- ================================================================

-- CK_Blueberry ingredients
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-CK-BLUEBERRY-001'),
  v.line_no,
  (SELECT id FROM items WHERE code = v.item_code),
  v.qty,
  (SELECT id FROM units_of_measure WHERE code = v.uom),
  0,
  true
FROM (VALUES
  (1, 'RM-CHICKEN', 4500.0, 'G'),
  (2, 'RM-GLYCINE', 750.0, 'G'),
  (3, 'RM-CMC', 15.0, 'G'),
  (4, 'RM-XANTHAN', 18.0, 'G'),
  (5, 'RM-GUARGUM', 15.0, 'G'),
  (6, 'RM-MIXBERRYFLAVOR', 20.0, 'G'),
  (7, 'RM-MALIC', 10.0, 'G'),
  (8, 'RM-BLUBERRYSQSH', 300.0, 'ML'),
  (9, 'RM-YOGHURTFLAVOR', 20.0, 'G'),
  (10, 'RM-LACTICACID', 15.0, 'G'),
  (11, 'RM-CITRICACID', 7.0, 'G'),
  (12, 'RM-SUCRALOSE', 2.8, 'G'),
  (13, 'RM-PURPLECOLOR', 1.25, 'ML'),
  (14, 'RM-WATER', 10.5, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-CK-BLUEBERRY-001');

-- CK_Mango ingredients
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-CK-MANGO-001'),
  v.line_no,
  (SELECT id FROM items WHERE code = v.item_code),
  v.qty,
  (SELECT id FROM units_of_measure WHERE code = v.uom),
  0,
  true
FROM (VALUES
  (1, 'RM-CHICKEN', 4500.0, 'G'),
  (2, 'RM-GLYCINE', 750.0, 'G'),
  (3, 'RM-CMC', 15.0, 'G'),
  (4, 'RM-XANTHAN', 18.0, 'G'),
  (5, 'RM-GUARGUM', 15.0, 'G'),
  (6, 'RM-MALIC', 10.0, 'G'),
  (7, 'RM-YELLOWCOLOR', 3.75, 'ML'),
  (8, 'RM-PASSIONFRUITFLAVOR', 10.0, 'G'),
  (9, 'RM-PASSIONFRUITSQSH', 300.0, 'ML'),
  (10, 'RM-YOGHURTFLAVOR', 20.0, 'G'),
  (11, 'RM-LACTICACID', 15.0, 'G'),
  (12, 'RM-CITRICACID', 7.0, 'G'),
  (13, 'RM-SUCRALOSE', 2.5, 'G'),
  (14, 'RM-WATER', 10.5, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-CK-MANGO-001');

-- CK_Lychee ingredients
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-CK-LYCHEE-001'),
  v.line_no,
  (SELECT id FROM items WHERE code = v.item_code),
  v.qty,
  (SELECT id FROM units_of_measure WHERE code = v.uom),
  0,
  true
FROM (VALUES
  (1, 'RM-CHICKEN', 4500.0, 'G'),
  (2, 'RM-GLYCINE', 750.0, 'G'),
  (3, 'RM-CMC', 15.0, 'G'),
  (4, 'RM-XANTHAN', 18.0, 'G'),
  (5, 'RM-GUARGUM', 15.0, 'G'),
  (6, 'RM-LYCHEEFLAVOR', 60.0, 'G'),
  (7, 'RM-MALIC', 10.0, 'G'),
  (8, 'RM-LYCHEESQSH', 300.0, 'ML'),
  (9, 'RM-PINKCOLOR', 1.25, 'ML'),
  (10, 'RM-YOGHURTFLAVOR', 20.0, 'G'),
  (11, 'RM-LACTICACID', 15.0, 'G'),
  (12, 'RM-CITRICACID', 7.0, 'G'),
  (13, 'RM-SUCRALOSE', 2.5, 'G'),
  (14, 'RM-WATER', 10.5, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-CK-LYCHEE-001');

-- CK_Strawberry ingredients
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-CK-STRAWBERRY-001'),
  v.line_no,
  (SELECT id FROM items WHERE code = v.item_code),
  v.qty,
  (SELECT id FROM units_of_measure WHERE code = v.uom),
  0,
  true
FROM (VALUES
  (1, 'RM-CHICKEN', 4500.0, 'G'),
  (2, 'RM-GLYCINE', 750.0, 'G'),
  (3, 'RM-CMC', 10.0, 'G'),
  (4, 'RM-XANTHAN', 18.0, 'G'),
  (5, 'RM-GUARGUM', 10.0, 'G'),
  (6, 'RM-STRAWBERRYFLAVOR', 45.0, 'G'),
  (7, 'RM-STRAWBERRYFRUIT', 300.0, 'G'),
  (8, 'RM-REDCOLOR', 1.25, 'ML'),
  (9, 'RM-YOGHURTFLAVOR', 20.0, 'G'),
  (10, 'RM-LACTICACID', 15.0, 'G'),
  (11, 'RM-CITRICACID', 7.0, 'G'),
  (12, 'RM-SUCRALOSE', 3.0, 'G'),
  (13, 'RM-WATER', 10.0, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-CK-STRAWBERRY-001');

-- PB_ThaiTea ingredients
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-PB-THAITEA-001'),
  v.line_no,
  (SELECT id FROM items WHERE code = v.item_code),
  v.qty,
  (SELECT id FROM units_of_measure WHERE code = v.uom),
  0,
  true
FROM (VALUES
  (1, 'RM-PLANTPROTEIN', 1300.0, 'G'),
  (2, 'RM-GLYCINE', 500.0, 'G'),
  (3, 'RM-FIBERCREAMER', 100.0, 'G'),
  (4, 'RM-COCONUTOIL', 200.0, 'G'),
  (5, 'RM-CMC', 5.0, 'G'),
  (6, 'RM-XANTHAN', 12.0, 'G'),
  (7, 'RM-VANILLAFLAVOR', 15.0, 'G'),
  (8, 'RM-SUCRALOSE', 0.8, 'G'),
  (9, 'RM-THAITEA', 100.0, 'G'),
  (10, 'RM-BLACKTEA', 40.0, 'G'),
  (11, 'RM-THAITEFLAVOR', 30.0, 'G'),
  (12, 'RM-WATER', 13.5, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-PB-THAITEA-001');

-- PB_Cacao ingredients
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-PB-CACAO-001'),
  v.line_no,
  (SELECT id FROM items WHERE code = v.item_code),
  v.qty,
  (SELECT id FROM units_of_measure WHERE code = v.uom),
  0,
  true
FROM (VALUES
  (1, 'RM-PLANTPROTEIN', 1300.0, 'G'),
  (2, 'RM-GLYCINE', 500.0, 'G'),
  (3, 'RM-FIBERCREAMER', 100.0, 'G'),
  (4, 'RM-COCONUTOIL', 200.0, 'G'),
  (5, 'RM-CMC', 5.0, 'G'),
  (6, 'RM-XANTHAN', 12.0, 'G'),
  (7, 'RM-VANILLAFLAVOR', 15.0, 'G'),
  (8, 'RM-SUCRALOSE', 0.8, 'G'),
  (9, 'RM-CACAO', 400.0, 'G'),
  (10, 'RM-CHOCOLATEFLAVOR', 30.0, 'G'),
  (11, 'RM-WATER', 13.5, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-PB-CACAO-001');

-- ================================================================
-- 8. WAREHOUSES
-- ================================================================
INSERT INTO warehouses (code, name, type, is_active) VALUES
('WH-RM-COLD', 'Raw Material Cold Room', 'COLD_STORAGE', true),
('WH-DRY', 'Dry Store', 'NORMAL', true),
('WH-PKG', 'Packaging Store', 'NORMAL', true),
('WH-QUARANTINE', 'Quarantine Zone', 'QUARANTINE', true),
('WH-WIP', 'Work in Progress', 'PRODUCTION', true),
('WH-FG-COLD', 'Finished Goods Cold Room', 'COLD_STORAGE', true)
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- DONE!
-- ================================================================
SELECT 'Seed data loaded successfully!' as status;
SELECT COUNT(*) as items_count FROM items;
SELECT COUNT(*) as recipes_count FROM recipes;
SELECT COUNT(*) as recipe_lines_count FROM recipe_lines;
