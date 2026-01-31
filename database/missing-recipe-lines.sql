-- ================================================================
-- MUST ERP - Missing Recipe Lines Seed Data
-- สำหรับเพิ่ม recipe_lines ที่หายไป
-- Run this AFTER seed-data.sql
-- ================================================================

-- CK_Peach ingredients (Line 44-56 in BOM.csv)
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-CK-PEACH-001'),
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
  (6, 'RM-MALIC', 5.0, 'G'),
  (7, 'RM-WHITEPEACHFLAVOR', 40.0, 'G'),
  (8, 'RM-YOGHURTFLAVOR', 20.0, 'G'),
  (9, 'RM-LACTICACID', 15.0, 'G'),
  (10, 'RM-CITRICACID', 7.0, 'G'),
  (11, 'RM-SUCRALOSE', 2.0, 'G'),
  (12, 'RM-YELLOWCOLOR', 2.5, 'ML'),
  (13, 'RM-WATER', 10.7, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-CK-PEACH-001');

-- CK_ThaiTea ingredients (Line 113-124 in BOM.csv)
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-CK-THAITEA-001'),
  v.line_no,
  (SELECT id FROM items WHERE code = v.item_code),
  v.qty,
  (SELECT id FROM units_of_measure WHERE code = v.uom),
  0,
  true
FROM (VALUES
  (1, 'RM-CHICKEN', 4500.0, 'G'),
  (2, 'RM-GLYCINE', 800.0, 'G'),
  (3, 'RM-CMC', 20.0, 'G'),
  (4, 'RM-XANTHAN', 20.0, 'G'),
  (5, 'RM-MAL', 8.0, 'G'),
  (6, 'RM-THAITEA', 70.0, 'G'),
  (7, 'RM-BLACKTEA', 100.0, 'G'),
  (8, 'RM-VANILLAFLAVOR', 20.0, 'G'),
  (9, 'RM-THAITEFLAVOR', 30.0, 'G'),
  (10, 'RM-SUCRALOSE', 1.9, 'G'),
  (11, 'SP-ALMONDMILK', 1000.0, 'ML'),
  (12, 'RM-WATER', 10.5, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-CK-THAITEA-001');

-- CK_Latte ingredients (Line 125-133 in BOM.csv)
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-CK-LATTE-001'),
  v.line_no,
  (SELECT id FROM items WHERE code = v.item_code),
  v.qty,
  (SELECT id FROM units_of_measure WHERE code = v.uom),
  0,
  true
FROM (VALUES
  (1, 'RM-CHICKEN', 4500.0, 'G'),
  (2, 'RM-GLYCINE', 800.0, 'G'),
  (3, 'RM-CMC', 20.0, 'G'),
  (4, 'RM-XANTHAN', 20.0, 'G'),
  (5, 'RM-MAL', 8.0, 'G'),
  (6, 'RM-COFFEE', 130.0, 'G'),
  (7, 'RM-SUCRALOSE', 1.3, 'G'),
  (8, 'SP-ALMONDMILK', 1250.0, 'ML'),
  (9, 'RM-WATER', 10.5, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-CK-LATTE-001');

-- CK_Matcha ingredients (Line 134-142 in BOM.csv)
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-CK-MATCHA-001'),
  v.line_no,
  (SELECT id FROM items WHERE code = v.item_code),
  v.qty,
  (SELECT id FROM units_of_measure WHERE code = v.uom),
  0,
  true
FROM (VALUES
  (1, 'RM-CHICKEN', 4500.0, 'G'),
  (2, 'RM-GLYCINE', 800.0, 'G'),
  (3, 'RM-CMC', 20.0, 'G'),
  (4, 'RM-XANTHAN', 20.0, 'G'),
  (5, 'RM-MAL', 8.0, 'G'),
  (6, 'RM-MATCHA', 190.0, 'G'),
  (7, 'RM-SUCRALOSE', 1.3, 'G'),
  (8, 'SP-ALMONDMILK', 1000.0, 'ML'),
  (9, 'RM-WATER', 10.5, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-CK-MATCHA-001');

-- CK_Cacao ingredients (Line 143-152 in BOM.csv)
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-CK-CACAO-001'),
  v.line_no,
  (SELECT id FROM items WHERE code = v.item_code),
  v.qty,
  (SELECT id FROM units_of_measure WHERE code = v.uom),
  0,
  true
FROM (VALUES
  (1, 'RM-CHICKEN', 4500.0, 'G'),
  (2, 'RM-GLYCINE', 800.0, 'G'),
  (3, 'RM-CMC', 20.0, 'G'),
  (4, 'RM-XANTHAN', 20.0, 'G'),
  (5, 'RM-CACAO', 300.0, 'G'),
  (6, 'RM-CHOCOLATEFLAVOR', 30.0, 'G'),
  (7, 'RM-VANILLAFLAVOR', 10.0, 'G'),
  (8, 'RM-SUCRALOSE', 1.2, 'G'),
  (9, 'SP-ALMONDMILK', 1000.0, 'ML'),
  (10, 'RM-WATER', 10.5, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-CK-CACAO-001');

-- PB_Acai ingredients (Line 82-93 in BOM.csv)
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-PB-ACAI-001'),
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
  (5, 'RM-CMC', 15.0, 'G'),
  (6, 'RM-XANTHAN', 15.0, 'G'),
  (7, 'RM-STRAWBERRYFLAVOR', 50.0, 'G'),
  (8, 'RM-PINKCOLOR', 5.0, 'ML'),
  (9, 'RM-BLUBERRYSQSH', 760.0, 'ML'),
  (10, 'RM-WATER', 13.5, 'L'),
  (11, 'RM-MALIC', 10.0, 'G'),
  (12, 'RM-CITRICACID', 10.0, 'G')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-PB-ACAI-001');

-- PB_Natural ingredients (Line 105-112 in BOM.csv)
INSERT INTO recipe_lines (recipe_id, line_no, item_id, qty_per_batch, uom_id, scrap_percent, is_critical)
SELECT 
  (SELECT id FROM recipes WHERE code = 'BOM-PB-NATURAL-001'),
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
  (8, 'RM-WATER', 13.5, 'L')
) AS v(line_no, item_code, qty, uom)
WHERE EXISTS (SELECT 1 FROM recipes WHERE code = 'BOM-PB-NATURAL-001');

-- ================================================================
-- VERIFICATION
-- ================================================================
SELECT 'Missing recipe lines added!' as status;
SELECT r.code, COUNT(rl.id) as ingredient_count 
FROM recipes r 
LEFT JOIN recipe_lines rl ON r.id = rl.recipe_id 
GROUP BY r.id, r.code 
ORDER BY r.code;
