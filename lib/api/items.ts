import { supabase } from '@/lib/supabase'
import {
    Item as ItemType,
    Category,
    UnitOfMeasure as UOM,
    CreateItemInput,
    UpdateItemInput,
    ItemSupplier,
    CreateItemSupplierInput,
    UpdateItemSupplierInput
} from '@/types/item'

export interface Item {
    id: string
    code: string
    name: string
    last_purchase_cost: number
    base_uom_code?: string
    category_code?: string
}

/**
 * Get all items with full details including stock quantities
 */
export async function getAllItems(): Promise<ItemType[]> {
    // First, get all items with basic info
    const { data: items, error } = await supabase
        .from('items')
        .select(`
          id,
          code,
          name,
          last_purchase_cost,
          is_active,
          created_at,
          updated_at,
          base_uom_id,
          stock_uom_id,
          category_id,
          min_stock_qty,
          categories:category_id (id, code, name),
          units_of_measure:base_uom_id (id, code, name),
          stock_uom:stock_uom_id (id, code, name)
        `)
        .order('code')

    if (error) {
        console.error('Error fetching items:', error)
        return []
    }

    // Get stock on hand summary per item
    const { data: stockData } = await supabase
        .from('stock_on_hand')
        .select('item_id, qty_on_hand')

    // Calculate total stock per item
    const stockByItem = new Map<string, number>()
    for (const s of stockData || []) {
        const current = stockByItem.get(s.item_id) || 0
        stockByItem.set(s.item_id, current + (s.qty_on_hand || 0))
    }

    return (items || []).map(i => {
        const stockQty = stockByItem.get(i.id) || 0
        const safetyStock = (i as any).min_stock_qty || 0
        return {
            id: i.id,
            code: i.code,
            name: i.name,
            categoryId: i.category_id || '',
            categoryCode: (i.categories as any)?.code || '',
            categoryName: (i.categories as any)?.name || '',
            baseUomId: i.base_uom_id || '',
            baseUomCode: (i.units_of_measure as any)?.code || '',
            baseUomName: (i.units_of_measure as any)?.name || '',
            stockUomId: i.stock_uom_id || i.base_uom_id || '',
            stockUomCode: (i.stock_uom as any)?.code || (i.units_of_measure as any)?.code || '',
            stockUomName: (i.stock_uom as any)?.name || (i.units_of_measure as any)?.name || '',
            lastPurchaseCost: i.last_purchase_cost || 0,
            isActive: i.is_active ?? true,
            createdAt: i.created_at,
            updatedAt: i.updated_at,
            stockQty,
            safetyStock,
            isLowStock: safetyStock > 0 && stockQty < safetyStock,
        }
    })
}


/**
 * Create a new item
 */
export async function createItem(input: CreateItemInput): Promise<ItemType | null> {
    const { data, error } = await supabase
        .from('items')
        .insert({
            code: input.code,
            name: input.name,
            category_id: input.categoryId,
            base_uom_id: input.baseUomId,
            stock_uom_id: input.stockUomId || input.baseUomId,
            last_purchase_cost: input.lastPurchaseCost || 0,
            min_stock_qty: input.safetyStock || 0,
            is_active: true,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating item:', error)
        throw new Error(error.message)
    }

    // Fetch the full item with relations
    const items = await getAllItems()
    return items.find(i => i.id === data.id) || null
}

/**
 * Update an item
 */
export async function updateItem(id: string, input: UpdateItemInput): Promise<ItemType | null> {
    const updateData: Record<string, any> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId
    if (input.baseUomId !== undefined) updateData.base_uom_id = input.baseUomId
    if (input.stockUomId !== undefined) updateData.stock_uom_id = input.stockUomId
    if (input.lastPurchaseCost !== undefined) updateData.last_purchase_cost = input.lastPurchaseCost
    if (input.safetyStock !== undefined) updateData.min_stock_qty = input.safetyStock
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating item:', error)
        throw new Error(error.message)
    }

    // Fetch the updated item
    const items = await getAllItems()
    return items.find(i => i.id === id) || null
}

/**
 * Delete an item
 */
export async function deleteItem(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting item:', error)
        throw new Error(error.message)
    }

    return true
}

/**
 * Create a new unit of measure
 */
export async function createUOM(code: string, name: string): Promise<UOM | null> {
    const { data, error } = await supabase
        .from('units_of_measure')
        .insert({
            code,
            name,
            type: 'PIECE', // Default type must be valid enum valaue
            is_active: true
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating UOM:', error)
        throw new Error(error.message)
    }

    return {
        id: data.id,
        code: data.code,
        name: data.name
    }
}

/**
 * Delete a unit of measure
 */
export async function deleteUOM(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('units_of_measure')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting UOM:', error)
        throw new Error(error.message)
    }

    return true
}


/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('id, code, name')
        .order('name')

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return data || []
}

/**
 * Get all units of measure
 */
export async function getUnitsOfMeasure(): Promise<UOM[]> {
    const { data, error } = await supabase
        .from('units_of_measure')
        .select('id, code, name')
        .order('name')

    if (error) {
        console.error('Error fetching units of measure:', error)
        return []
    }

    return data || []
}

/**
 * Get all raw materials for dropdown (items with code starting with RM-)
 */
export async function getRawMaterials(): Promise<Item[]> {
    const { data: items, error } = await supabase
        .from('items')
        .select(`
      id,
      code,
      name,
      last_purchase_cost,
      base_uom_id,
      category_id
    `)
        .like('code', 'RM-%')
        .order('name')

    if (error) {
        console.error('Error fetching raw materials:', error)
        return []
    }

    // Get UOMs
    const uomIds = Array.from(new Set((items || []).map(i => i.base_uom_id).filter(Boolean)))
    const { data: uoms } = await supabase
        .from('units_of_measure')
        .select('id, code')
        .in('id', uomIds)

    const uomMap = new Map((uoms || []).map(u => [u.id, u.code]))

    return (items || []).map(i => ({
        id: i.id,
        code: i.code,
        name: i.name,
        last_purchase_cost: i.last_purchase_cost || 0,
        base_uom_code: uomMap.get(i.base_uom_id) || 'G',
    }))
}

/**
 * Get all finished goods for dropdown
 */
export async function getFinishedGoods(): Promise<Item[]> {
    const { data: items, error } = await supabase
        .from('items')
        .select(`
      id,
      code,
      name,
      last_purchase_cost
    `)
        .like('code', 'FG-%')
        .order('name')

    if (error) {
        console.error('Error fetching finished goods:', error)
        return []
    }

    return items || []
}

// ============================================
// ITEM SUPPLIERS
// ============================================

/**
 * Get all suppliers for an item
 */
export async function getItemSuppliers(itemId: string): Promise<ItemSupplier[]> {
    const { data, error } = await supabase
        .from('item_suppliers')
        .select(`
            id,
            item_id,
            supplier_id,
            supplier_part_number,
            purchase_price,
            packaging_size,
            purchase_uom_id,
            lead_time_days,
            min_order_qty,
            is_preferred,
            is_active,
            suppliers:supplier_id (id, code, name),
            units_of_measure:purchase_uom_id (id, code, name)
        `)
        .eq('item_id', itemId)
        .order('is_preferred', { ascending: false })

    if (error) {
        console.error('Error fetching item suppliers:', error)
        return []
    }

    return (data || []).map(d => ({
        id: d.id,
        itemId: d.item_id,
        supplierId: d.supplier_id,
        supplierCode: (d.suppliers as any)?.code || '',
        supplierName: (d.suppliers as any)?.name || '',
        supplierPartNumber: d.supplier_part_number,
        purchasePrice: d.purchase_price || 0,
        packagingSize: d.packaging_size || 1,
        purchaseUomId: d.purchase_uom_id,
        purchaseUomCode: (d.units_of_measure as any)?.code || null,
        purchaseUomName: (d.units_of_measure as any)?.name || null,
        leadTimeDays: d.lead_time_days || 7,
        minOrderQty: d.min_order_qty || 1,
        isPreferred: d.is_preferred || false,
        isActive: d.is_active ?? true,
    }))
}

/**
 * Add a supplier to an item
 */
export async function addItemSupplier(input: CreateItemSupplierInput): Promise<ItemSupplier | null> {
    const { data, error } = await supabase
        .from('item_suppliers')
        .insert({
            item_id: input.itemId,
            supplier_id: input.supplierId,
            supplier_part_number: input.supplierPartNumber,
            purchase_price: input.purchasePrice || 0,
            packaging_size: input.packagingSize || 1,
            purchase_uom_id: input.purchaseUomId,
            lead_time_days: input.leadTimeDays || 7,
            min_order_qty: input.minOrderQty || 1,
            is_preferred: input.isPreferred || false,
        })
        .select()
        .single()

    if (error) {
        console.error('Error adding item supplier:', error)
        throw new Error(error.message)
    }

    // Fetch the full data
    const suppliers = await getItemSuppliers(input.itemId)
    return suppliers.find(s => s.id === data.id) || null
}

/**
 * Update an item supplier
 */
export async function updateItemSupplier(id: string, itemId: string, input: UpdateItemSupplierInput): Promise<ItemSupplier | null> {
    const updateData: Record<string, any> = {}
    if (input.supplierPartNumber !== undefined) updateData.supplier_part_number = input.supplierPartNumber
    if (input.purchasePrice !== undefined) updateData.purchase_price = input.purchasePrice
    if (input.packagingSize !== undefined) updateData.packaging_size = input.packagingSize
    if (input.purchaseUomId !== undefined) updateData.purchase_uom_id = input.purchaseUomId
    if (input.leadTimeDays !== undefined) updateData.lead_time_days = input.leadTimeDays
    if (input.minOrderQty !== undefined) updateData.min_order_qty = input.minOrderQty
    if (input.isPreferred !== undefined) updateData.is_preferred = input.isPreferred
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { error } = await supabase
        .from('item_suppliers')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating item supplier:', error)
        throw new Error(error.message)
    }

    const suppliers = await getItemSuppliers(itemId)
    return suppliers.find(s => s.id === id) || null
}

/**
 * Delete an item supplier
 */
export async function deleteItemSupplier(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('item_suppliers')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting item supplier:', error)
        throw new Error(error.message)
    }

    return true
}

/**
 * Get all suppliers (for dropdown)
 */
export async function getSuppliers(): Promise<{ id: string; code: string; name: string }[]> {
    const { data, error } = await supabase
        .from('suppliers')
        .select('id, code, name')
        .eq('is_active', true)
        .order('name')

    if (error) {
        console.error('Error fetching suppliers:', error)
        return []
    }

    return data || []
}
