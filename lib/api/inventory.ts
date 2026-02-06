import { supabase } from '@/lib/supabase'
import {
    Warehouse,
    StockItem,
    StockBalance,
    StockEntry,
    StockEntryItem,
    CreateWarehouseInput,
    CreateStockItemInput,
    CreateStockEntryInput,
    StockEntryStatus
} from '@/types/inventory'

// ==========================================
// Warehouse API
// ==========================================

export async function getWarehouses(): Promise<Warehouse[]> {
    const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching warehouses:', error)
        throw error
    }

    return data.map((w: any) => ({
        id: w.id,
        code: w.code,
        name: w.name,
        type: w.type,
        status: w.is_active ? 'ACTIVE' : 'INACTIVE',
        isQuarantine: false, // Schema doesn't have this yet, defaulting
        isDefault: w.type === 'RAW_MATERIAL', // Logic to determine default?
        temperatureControlled: w.temperature_min !== null,
        minTemp: w.temperature_min,
        maxTemp: w.temperature_max,
        location: w.address,
        createdAt: w.created_at,
        updatedAt: w.updated_at
    }))
}

export async function createWarehouse(input: CreateWarehouseInput): Promise<Warehouse> {
    const { data, error } = await supabase
        .from('warehouses')
        .insert({
            code: input.code,
            name: input.name,
            type: input.type,
            address: input.location,
            temperature_min: input.minTemp,
            temperature_max: input.maxTemp,
            is_active: true
        })
        .select()
        .single()

    if (error) throw error

    return {
        id: data.id,
        code: data.code,
        name: data.name,
        type: data.type,
        status: data.is_active ? 'ACTIVE' : 'INACTIVE',
        isQuarantine: input.isQuarantine || false,
        isDefault: input.isDefault || false,
        temperatureControlled: data.temperature_min !== null,
        minTemp: data.temperature_min,
        maxTemp: data.temperature_max,
        location: data.address,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    }
}

export async function updateWarehouse(id: string, input: Partial<CreateWarehouseInput>): Promise<Warehouse> {
    const updateData: any = {}
    if (input.code) updateData.code = input.code
    if (input.name) updateData.name = input.name
    if (input.type) updateData.type = input.type
    if (input.location) updateData.address = input.location
    if (input.minTemp !== undefined) updateData.temperature_min = input.minTemp
    if (input.maxTemp !== undefined) updateData.temperature_max = input.maxTemp

    const { data, error } = await supabase
        .from('warehouses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error

    return {
        id: data.id,
        code: data.code,
        name: data.name,
        type: data.type,
        status: data.is_active ? 'ACTIVE' : 'INACTIVE',
        isQuarantine: input.isQuarantine || false,
        isDefault: input.isDefault || false,
        temperatureControlled: data.temperature_min !== null,
        minTemp: data.temperature_min,
        maxTemp: data.temperature_max,
        location: data.address,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    }
}

// ==========================================
// Stock Item API (Items)
// ==========================================

export async function getStockItems(): Promise<StockItem[]> {
    const { data, error } = await supabase
        .from('items')
        .select(`
            *,
            category:categories(id, name, type),
            uom:units_of_measure(id, code)
        `)
        .eq('is_active', true)
        .order('name')

    if (error) {
        console.error('Error fetching items:', error)
        throw error
    }

    return data.map((item: any) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        type: item.category?.type || 'RAW_MATERIAL',
        uom: item.uom?.code || 'PC',
        defaultWarehouseId: '', // Need to find logic for this
        hasBatch: item.track_lot,
        hasExpiry: item.track_expiry,
        shelfLifeDays: item.shelf_life_days,
        minStock: item.min_stock_qty,
        maxStock: item.max_stock_qty,
        reorderPoint: item.reorder_point,
        requiresQC: false, // Default for now
        costPerUnit: item.standard_cost || 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at
    }))
}

export async function createStockItem(input: CreateStockItemInput): Promise<StockItem> {
    // 1. Get or Create Category
    // For simplicity, we assume categories exist or use a default.
    // Real implementation should probably select category ID from UI.
    // Here we'll just try to find a category by type or use first one.
    const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('type', input.type)
        .limit(1)

    let categoryId = categories?.[0]?.id

    // Gets or Creates UOM
    const { data: uoms } = await supabase
        .from('units_of_measure')
        .select('id')
        .eq('code', input.uom)
        .limit(1)

    let uomId = uoms?.[0]?.id

    const { data, error } = await supabase
        .from('items')
        .insert({
            code: input.code,
            name: input.name,
            category_id: categoryId,
            base_uom_id: uomId,
            track_lot: input.hasBatch,
            track_expiry: input.hasExpiry,
            shelf_life_days: input.shelfLifeDays,
            min_stock_qty: input.minStock,
            max_stock_qty: input.maxStock,
            reorder_point: input.reorderPoint,
            standard_cost: input.costPerUnit
        })
        .select(`*, category:categories(type), uom:units_of_measure(code)`)
        .single()

    if (error) throw error

    return {
        id: data.id,
        code: data.code,
        name: data.name,
        type: data.category?.type || input.type,
        uom: data.uom?.code || input.uom,
        defaultWarehouseId: input.defaultWarehouseId,
        hasBatch: data.track_lot,
        hasExpiry: data.track_expiry,
        shelfLifeDays: data.shelf_life_days,
        minStock: data.min_stock_qty,
        maxStock: data.max_stock_qty,
        reorderPoint: data.reorder_point,
        requiresQC: input.requiresQC || false,
        costPerUnit: data.standard_cost,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    }
}

export async function updateStockItem(id: string, input: Partial<CreateStockItemInput>): Promise<StockItem> {
    const updateData: any = {}
    if (input.code) updateData.code = input.code
    if (input.name) updateData.name = input.name
    if (input.hasBatch !== undefined) updateData.track_lot = input.hasBatch
    if (input.hasExpiry !== undefined) updateData.track_expiry = input.hasExpiry
    if (input.minStock !== undefined) updateData.min_stock_qty = input.minStock
    if (input.maxStock !== undefined) updateData.max_stock_qty = input.maxStock
    if (input.costPerUnit !== undefined) updateData.standard_cost = input.costPerUnit

    const { data, error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id)
        .select(`*, category:categories(type), uom:units_of_measure(code)`)
        .single()

    if (error) throw error

    return {
        id: data.id,
        code: data.code,
        name: data.name,
        type: data.category?.type,
        uom: data.uom?.code,
        defaultWarehouseId: input.defaultWarehouseId || '', // Persist previous logic?
        hasBatch: data.track_lot,
        hasExpiry: data.track_expiry,
        shelfLifeDays: data.shelf_life_days,
        minStock: data.min_stock_qty,
        maxStock: data.max_stock_qty,
        reorderPoint: data.reorder_point,
        requiresQC: input.requiresQC || false,
        costPerUnit: data.standard_cost,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    }
}

// ==========================================
// Stock Balance API
// ==========================================

export async function getStockBalances(): Promise<StockBalance[]> {
    const { data, error } = await supabase
        .from('stock_on_hand')
        .select(`
            *,
            item:items(code, name, base_uom_id),
            warehouse:warehouses(id, name),
            lot:lots(lot_number, expiry_date, manufactured_date),
            uom:units_of_measure(code)
        `)

    if (error) {
        console.error('Error fetching stock balances:', error)
        throw error
    }

    return data.map((b: any) => ({
        id: b.id,
        itemId: b.item_id,
        warehouseId: b.warehouse_id,
        batchNo: b.lot?.lot_number,
        qty: b.qty_on_hand,
        uom: b.uom?.code || 'PC', // fallback
        mfgDate: b.lot?.manufactured_date,
        expDate: b.lot?.expiry_date,
        status: 'AVAILABLE', // Default to available as per schema structure
        lastUpdated: b.updated_at
    }))
}

// ==========================================
// Stock Entry API
// ==========================================

export async function getStockEntries(): Promise<StockEntry[]> {
    const { data, error } = await supabase
        .from('stock_entries')
        .select(`
            *,
            items:stock_entry_items(*)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching stock entries:', error)
        throw error
    }

    return data.map((e: any) => ({
        id: e.id,
        code: e.code,
        type: e.type,
        status: e.status,
        postingDate: e.posting_date,
        postingTime: e.posting_time,
        sourceDocType: e.source_doc_type,
        sourceDocId: e.source_doc_id,
        remarks: e.remarks,
        isQCRequired: e.is_qc_required,
        isQCPassed: e.is_qc_passed,
        createdBy: e.created_by,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
        items: e.items.map((i: any) => ({
            id: i.id,
            lineNo: i.line_no,
            itemId: i.item_id,
            qty: i.qty,
            uom: i.uom,
            batchNo: i.batch_no,
            fromWarehouseId: i.from_warehouse_id,
            toWarehouseId: i.to_warehouse_id,
            unitCost: i.unit_cost,
            totalCost: i.total_cost
        }))
    }))
}

export async function createStockEntry(input: CreateStockEntryInput): Promise<StockEntry> {
    // 1. Create Entry Header
    const { data: entry, error: entryError } = await supabase
        .from('stock_entries')
        .insert({
            code: `SE-${Date.now()}`, // Temporary code generation
            type: input.type,
            status: 'DRAFT',
            posting_date: input.postingDate,
            posting_time: new Date().toTimeString().split(' ')[0], // HH:MM:SS
            source_doc_type: input.sourceDocType,
            source_doc_id: input.sourceDocId,
            remarks: input.remarks,
            created_by: 'System' // Replace with auth user later
        })
        .select()
        .single()

    if (entryError) throw entryError

    // 2. Create Entry Items
    const itemsToInsert = input.items.map((item, index) => ({
        stock_entry_id: entry.id,
        line_no: index + 1,
        item_id: item.itemId,
        qty: item.qty,
        uom: item.uom, // Storing string for now
        batch_no: item.batchNo,
        from_warehouse_id: item.fromWarehouseId,
        to_warehouse_id: item.toWarehouseId,
        mfg_date: item.mfgDate,
        exp_date: item.expDate,
        unit_cost: item.unitCost
    }))

    const { data: items, error: itemsError } = await supabase
        .from('stock_entry_items')
        .insert(itemsToInsert)
        .select()

    if (itemsError) throw itemsError

    return {
        id: entry.id,
        code: entry.code,
        type: entry.type as any,
        status: entry.status,
        postingDate: entry.posting_date,
        postingTime: entry.posting_time,
        items: items.map((i: any) => ({
            id: i.id,
            lineNo: i.line_no,
            itemId: i.item_id,
            qty: i.qty,
            uom: i.uom,
            batchNo: i.batch_no,
            fromWarehouseId: i.from_warehouse_id,
            toWarehouseId: i.to_warehouse_id,
            unitCost: i.unit_cost
        })),
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        isQCRequired: false,
        createdBy: entry.created_by
    }
}

export async function updateStockEntryStatus(id: string, status: StockEntryStatus): Promise<void> {
    const { error } = await supabase
        .from('stock_entries')
        .update({ status })
        .eq('id', id)

    if (error) throw error
}

export async function adjustStock(input: {
    itemId: string
    warehouseId: string
    lotId?: string | null
    quantityChange: number
    uomId?: string // Required for new records
}): Promise<void> {
    // 1. Find existing record
    let query = supabase
        .from('stock_on_hand')
        .select('*')
        .eq('item_id', input.itemId)
        .eq('warehouse_id', input.warehouseId)

    if (input.lotId) {
        query = query.eq('lot_id', input.lotId)
    } else {
        query = query.is('lot_id', null)
    }

    const { data: existing, error: fetchError } = await query.maybeSingle()

    if (fetchError) {
        throw fetchError
    }

    if (existing) {
        // Update
        const newQty = existing.qty_on_hand + input.quantityChange
        const { error: updateError } = await supabase
            .from('stock_on_hand')
            .update({ qty_on_hand: newQty })
            .eq('id', existing.id)

        if (updateError) throw updateError
    } else {
        // Insert
        // Ensure we have UOM (if not provided, default to piece or check item)
        // Ignoring UOM check for now if missing, assuming not-null constraint will catch it

        const { error: insertError } = await supabase
            .from('stock_on_hand')
            .insert({
                item_id: input.itemId,
                warehouse_id: input.warehouseId,
                lot_id: input.lotId,
                qty_on_hand: input.quantityChange,
                qty_reserved: 0,
                uom_id: input.uomId
            })

        if (insertError) throw insertError
    }
}
