import { supabase } from '@/lib/supabase'

export interface Item {
    id: string
    code: string
    name: string
    last_purchase_cost: number
    base_uom_code?: string
    category_code?: string
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
