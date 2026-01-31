import { supabase } from '@/lib/supabase'

// ==========================================
// Inventory API Functions
// ==========================================

/**
 * Get all warehouses with stock summary
 */
export async function getWarehouses() {
    const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true)
        .order('name')

    if (error) {
        console.error('Error fetching warehouses:', error)
        throw error
    }

    return data || []
}

/**
 * Get stock items with optional warehouse filter
 */
export async function getStockItems(warehouseId?: string) {
    let query = supabase
        .from('stock_on_hand')
        .select(`
      *,
      item:items (id, code, name, category_id),
      warehouse:warehouses (id, code, name, type),
      lot:lots (id, lot_number, expiry_date, status)
    `)

    if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching stock items:', error)
        throw error
    }

    return data || []
}

/**
 * Get stock summary statistics
 */
export async function getStockSummary() {
    // Get total items count
    const { count: totalItems } = await supabase
        .from('stock_on_hand')
        .select('*', { count: 'exact', head: true })

    // Get low stock items (qty < min_stock from items table)
    const { data: lowStockData } = await supabase
        .from('stock_on_hand')
        .select('qty_on_hand, item:items(min_stock_qty)')

    const lowStockCount = (lowStockData || []).filter(
        (s: any) => s.qty_on_hand < (s.item?.min_stock_qty || 0)
    ).length

    // Get items near expiry (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { count: nearExpiryCount } = await supabase
        .from('lots')
        .select('*', { count: 'exact', head: true })
        .lte('expiry_date', thirtyDaysFromNow.toISOString())
        .gte('expiry_date', new Date().toISOString())
        .neq('status', 'EXPIRED')

    return {
        totalItems: totalItems || 0,
        lowStockCount: lowStockCount || 0,
        nearExpiryCount: nearExpiryCount || 0,
        totalValue: 0, // Would need to calculate from cost data
    }
}

/**
 * Create new stock entry
 */
export async function createStockEntry(input: {
    itemId: string
    warehouseId: string
    locationId?: string
    lotId?: string
    quantity: number
    uomId: string
}) {
    const { data, error } = await supabase
        .from('stock_on_hand')
        .insert({
            item_id: input.itemId,
            warehouse_id: input.warehouseId,
            location_id: input.locationId,
            lot_id: input.lotId,
            qty_on_hand: input.quantity,
            qty_reserved: 0,
            uom_id: input.uomId,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating stock entry:', error)
        throw error
    }

    return data
}

/**
 * Update stock quantity
 */
export async function updateStockQuantity(
    id: string,
    quantity: number,
    reserved?: number
) {
    const updateData: Record<string, number> = {
        qty_on_hand: quantity,
    }
    if (reserved !== undefined) {
        updateData.qty_reserved = reserved
    }

    const { data, error } = await supabase
        .from('stock_on_hand')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating stock:', error)
        throw error
    }

    return data
}

/**
 * Get items master data
 */
export async function getItems(categoryType?: string) {
    let query = supabase
        .from('items')
        .select(`
      *,
      category:categories (id, code, name, type)
    `)
        .eq('is_active', true)
        .order('name')

    const { data, error } = await query

    if (error) {
        console.error('Error fetching items:', error)
        throw error
    }

    if (categoryType && categoryType !== 'all') {
        return (data || []).filter(
            (item: any) => item.category?.type === categoryType.toUpperCase()
        )
    }

    return data || []
}

/**
 * Create new item
 */
export async function createItem(input: {
    code: string
    name: string
    description?: string
    categoryId: string
    baseUomId: string
    trackLot?: boolean
    trackExpiry?: boolean
    shelfLifeDays?: number
    minStockQty?: number
}) {
    const { data, error } = await supabase
        .from('items')
        .insert({
            code: input.code,
            name: input.name,
            description: input.description,
            category_id: input.categoryId,
            base_uom_id: input.baseUomId,
            track_lot: input.trackLot ?? true,
            track_expiry: input.trackExpiry ?? true,
            shelf_life_days: input.shelfLifeDays,
            min_stock_qty: input.minStockQty ?? 0,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating item:', error)
        throw error
    }

    return data
}
