-- Update Part Numbers for item_suppliers from Item_part number.csv
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    v_item_id UUID;
BEGIN
    -- Lychee Flavor -> FLYC86909S25K
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Lychee Flavor%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'FLYC86909S25K' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Mix berry Flavor -> ECMB00277S05K
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Mix berry Flavor%' OR i.name ILIKE '%Mixberry Flavor%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'ECMB00277S05K' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Coconut Oil -> 4010400001
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Coconut Oil%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = '4010400001' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Fiber Creamer -> FP072CN00.25
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Fiber Creamer%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'FP072CN00.25' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Black Tea Powder -> KC030
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Black Tea Powder%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'KC030' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Coffee Powder -> 8850124080271
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Coffee Powder%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = '8850124080271' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Matcha Powder -> 34393
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Matcha Powder%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = '34393' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Cacao Powder -> CSFSL12YF118
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Cacao Powder%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'CSFSL12YF118' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- แอลมอนด์เม็ดเต็ม -> แอลมอนด์เม็ดเต็ม(บรรจุ11.34:กล่อง)สินค้าusa
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%แอลมอนด์เม็ดเต็ม%' OR i.name ILIKE '%Almond%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'แอลมอนด์เม็ดเต็ม(บรรจุ11.34:กล่อง)สินค้าusa' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Malic -> 56-65MA03 (first supplier)
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Malic%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = '56-65MA03' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Glycine -> F024GC-B-25KG
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Glycine%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'F024GC-B-25KG' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- CMC -> F010CMC-C-25KG
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%CMC%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'F010CMC-C-25KG' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Guar Gum -> F011GG-D-25KG
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Guar Gum%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'F011GG-D-25KG' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Lactic Acid -> F036LA-B-25KG
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Lactic Acid%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'F036LA-B-25KG' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Passionfruit Flavor -> W036PS-D-1KG
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Passionfruit Flavor%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'W036PS-D-1KG' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Citric Acid -> F003CM-C-25KG
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Citric Acid%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'F003CM-C-25KG' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    -- Chicken -> H000005596
    SELECT i.id INTO v_item_id FROM items i WHERE i.name ILIKE '%Chicken%' AND i.name NOT ILIKE '%Boiled%' LIMIT 1;
    IF v_item_id IS NOT NULL THEN
        UPDATE item_suppliers SET supplier_part_number = 'H000005596' WHERE item_id = v_item_id AND supplier_part_number IS NULL;
    END IF;

    RAISE NOTICE 'Part Numbers updated successfully!';
END $$;

-- Verify the updates
SELECT 
    i.code as item_code,
    i.name as item_name,
    s.name as supplier_name,
    isp.supplier_part_number
FROM item_suppliers isp
JOIN items i ON i.id = isp.item_id
JOIN suppliers s ON s.id = isp.supplier_id
WHERE isp.supplier_part_number IS NOT NULL
ORDER BY i.code;
