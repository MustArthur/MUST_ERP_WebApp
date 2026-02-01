import { supabase } from '@/lib/supabase'
import {
    Item as ItemType,
    Category,
    UnitOfMeasure as UOM,
    CreateItemInput,
    UpdateItemInput
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
 * Get all items with full details
 */
export async function getAllItems(): Promise<ItemType[]> {
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
          category_id,
          categories:category_id (id, code, name),
          units_of_measure:base_uom_id (id, code, name)
        `)
        .order('code')

    if (error) {
        console.error('Error fetching items:', error)
        return []
    }

    return (items || []).map(i => ({
        id: i.id,
        code: i.code,
        name: i.name,
        categoryId: i.category_id || '',
        categoryCode: (i.categories as any)?.code || '',
        categoryName: (i.categories as any)?.name || '',
        baseUomId: i.base_uom_id || '',
        baseUomCode: (i.units_of_measure as any)?.code || '',
        baseUomName: (i.units_of_measure as any)?.name || '',
        lastPurchaseCost: i.last_purchase_cost || 0,
        isActive: i.is_active ?? true,
        createdAt: i.created_at,
        updatedAt: i.updated_at,
    }))
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
            last_purchase_cost: input.lastPurchaseCost || 0,
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
    if (input.lastPurchaseCost !== undefined) updateData.last_purchase_cost = input.lastPurchaseCost
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

