-- Import Item-Supplier relationships from Item.csv
-- Run this in Supabase SQL Editor

-- This script links items to their suppliers based on the CSV data
-- It uses item name to match with items table and supplier name to match with suppliers table

DO $$
DECLARE
    v_item_id UUID;
    v_supplier_id UUID;
BEGIN
    -- Passionfruit Squash -> เซ็นทรัล ฟู้ด รีเทล
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Passionfruit Squash%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%เซ็นทรัล ฟู้ด รีเทล%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Lychee Squash -> เซ็นทรัล ฟู้ด รีเทล
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Lychee Squash%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%เซ็นทรัล ฟู้ด รีเทล%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Blueberry Squash -> เซ็นทรัล ฟู้ด รีเทล
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Blueberry Squash%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%เซ็นทรัล ฟู้ด รีเทล%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Strawberry Flavor -> KH ROBERTS
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Strawberry Flavor%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%KH ROBERTS%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Lychee Flavor -> KH ROBERTS
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Lychee Flavor%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%KH ROBERTS%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Mix berry Flavor -> KH ROBERTS
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Mix berry Flavor%' OR name ILIKE '%Mixberry Flavor%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%KH ROBERTS%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- White Peach Flavor -> KH ROBERTS
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%White Peach Flavor%' OR name ILIKE '%Peach Flavor%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%KH ROBERTS%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Yoghurt Flavor -> KH ROBERTS
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Yoghurt Flavor%' OR name ILIKE '%Yogurt Flavor%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%KH ROBERTS%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Coconut Oil -> เยียระกานต์
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Coconut Oil%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%เยียระกานต์%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Fiber Creamer -> พรีโม เทรดดิ้ง
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Fiber Creamer%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%พรีโม เทรดดิ้ง%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Lychee Fruit -> ซีพี แอ๊กซ์ตร้า
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Lychee Fruit%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%ซีพี แอ๊กซ์ตร้า%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Passionfruit Fruit -> ซีพี แอ๊กซ์ตร้า
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Passionfruit Fruit%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%ซีพี แอ๊กซ์ตร้า%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Blueberry Fruit -> ซีพี แอ๊กซ์ตร้า
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Blueberry Fruit%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%ซีพี แอ๊กซ์ตร้า%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Strawberry Fruit -> ซีพี แอ๊กซ์ตร้า
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Strawberry Fruit%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%ซีพี แอ๊กซ์ตร้า%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Thai Tea Powder (Triva) -> ที.เอ.ซี. คอนซูเมอร์
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Thai Tea Powder%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%ที.เอ.ซี. คอนซูเมอร์%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Black Tea Powder -> เค ซี อินเตอร์ฟูดส์
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Black Tea Powder%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%เค ซี อินเตอร์ฟูดส์%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Coffee Powder -> เซ็นทรัล ฟู้ด รีเทล
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Coffee Powder%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%เซ็นทรัล ฟู้ด รีเทล%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Matcha Powder -> โพลาร์ แบร์ มิชชั่น
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Matcha Powder%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%โพลาร์ แบร์ มิชชั่น%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Cacao Powder -> บีเจซี สเปเชียลตี้ส์
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Cacao Powder%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%บีเจซี สเปเชียลตี้ส์%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- วินเนอร์กลิ่นวนิลลา -> ณายลอย เบเกอรี่
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%วินเนอร์กลิ่นวนิลลา%' OR name ILIKE '%Winner Vanilla%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%ณายลอย เบเกอรี่%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- แอลมอนด์เม็ดเต็ม -> ณายลอย เบเกอรี่
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%แอลมอนด์เม็ดเต็ม%' OR name ILIKE '%Almond%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%ณายลอย เบเกอรี่%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Malic -> เพชร เฟลเวอร์ โปรดักส์
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Malic%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%เพชร เฟลเวอร์ โปรดักส์%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Glycine -> กรุงเทพเคมี
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Glycine%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%กรุงเทพเคมี%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Xanthan -> กรุงเทพเคมี
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Xanthan%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%กรุงเทพเคมี%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- CMC -> กรุงเทพเคมี
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%CMC%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%กรุงเทพเคมี%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Guar Gum -> กรุงเทพเคมี
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Guar Gum%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%กรุงเทพเคมี%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Lactic Acid -> กรุงเทพเคมี
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Lactic Acid%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%กรุงเทพเคมี%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Passionfruit Flavor -> กรุงเทพเคมี
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Passionfruit Flavor%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%กรุงเทพเคมี%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Citric Acid -> กรุงเทพเคมี
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Citric Acid%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%กรุงเทพเคมี%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Sucralose -> ทริปเปิ้ลไนน์ โซลูชั่น
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Sucralose%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%ทริปเปิ้ลไนน์ โซลูชั่น%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    -- Chicken -> เบทาโกรเกษตรอุตสาหกรรม
    SELECT id INTO v_item_id FROM items WHERE name ILIKE '%Chicken%' AND name NOT ILIKE '%Boiled%' LIMIT 1;
    SELECT id INTO v_supplier_id FROM suppliers WHERE name ILIKE '%เบทาโกรเกษตรอุตสาหกรรม%' OR name ILIKE '%Betagro%' LIMIT 1;
    IF v_item_id IS NOT NULL AND v_supplier_id IS NOT NULL THEN
        INSERT INTO item_suppliers (item_id, supplier_id, is_preferred) VALUES (v_item_id, v_supplier_id, true)
        ON CONFLICT (item_id, supplier_id) DO NOTHING;
    END IF;

    RAISE NOTICE 'Item-Supplier relationships imported successfully!';
END $$;

-- Check results
SELECT 
    i.code as item_code,
    i.name as item_name,
    s.code as supplier_code,
    s.name as supplier_name,
    isp.is_preferred
FROM item_suppliers isp
JOIN items i ON i.id = isp.item_id
JOIN suppliers s ON s.id = isp.supplier_id
ORDER BY i.code;
