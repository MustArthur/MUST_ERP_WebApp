import { supabase } from '@/lib/supabase'
import { Supplier, CreateSupplierInput, UpdateSupplierInput } from '@/types/supplier'

/**
 * Get all suppliers
 */
export async function getAllSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('code')

    if (error) {
        console.error('Error fetching suppliers:', error)
        return []
    }

    return (data || []).map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        contactName: s.contact_name,
        phone: s.phone,
        email: s.email,
        address: s.address,
        taxId: s.tax_id,
        paymentTerms: s.payment_terms || 30,
        isActive: s.is_active ?? true,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
    }))
}

/**
 * Get supplier by ID
 */
export async function getSupplierById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching supplier:', error)
        return null
    }

    return {
        id: data.id,
        code: data.code,
        name: data.name,
        contactName: data.contact_name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        taxId: data.tax_id,
        paymentTerms: data.payment_terms || 30,
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    }
}

/**
 * Create a new supplier
 */
export async function createSupplier(input: CreateSupplierInput): Promise<Supplier | null> {
    const { data, error } = await supabase
        .from('suppliers')
        .insert({
            code: input.code,
            name: input.name,
            contact_name: input.contactName,
            phone: input.phone,
            email: input.email,
            address: input.address,
            tax_id: input.taxId,
            payment_terms: input.paymentTerms || 30,
            is_active: true,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating supplier:', error)
        throw new Error(error.message)
    }

    return getSupplierById(data.id)
}

/**
 * Update a supplier
 */
export async function updateSupplier(id: string, input: UpdateSupplierInput): Promise<Supplier | null> {
    const updateData: Record<string, any> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.contactName !== undefined) updateData.contact_name = input.contactName
    if (input.phone !== undefined) updateData.phone = input.phone
    if (input.email !== undefined) updateData.email = input.email
    if (input.address !== undefined) updateData.address = input.address
    if (input.taxId !== undefined) updateData.tax_id = input.taxId
    if (input.paymentTerms !== undefined) updateData.payment_terms = input.paymentTerms
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating supplier:', error)
        throw new Error(error.message)
    }

    return getSupplierById(id)
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting supplier:', error)
        throw new Error(error.message)
    }

    return true
}

/**
 * Get items sold by a supplier
 */
export interface SupplierItem {
    id: string
    itemId: string
    itemCode: string
    itemName: string
    categoryName: string
    supplierPartNumber: string | null
    purchasePrice: number
    purchaseUomCode: string | null
    isPreferred: boolean
}

export async function getSupplierItems(supplierId: string): Promise<SupplierItem[]> {
    const { data, error } = await supabase
        .from('item_suppliers')
        .select(`
            id,
            item_id,
            supplier_part_number,
            purchase_price,
            is_preferred,
            items:item_id (id, code, name, categories:category_id (name)),
            units_of_measure:purchase_uom_id (code)
        `)
        .eq('supplier_id', supplierId)
        .eq('is_active', true)
        .order('is_preferred', { ascending: false })

    if (error) {
        console.error('Error fetching supplier items:', error)
        return []
    }

    return (data || []).map(d => ({
        id: d.id,
        itemId: d.item_id,
        itemCode: (d.items as any)?.code || '',
        itemName: (d.items as any)?.name || '',
        categoryName: (d.items as any)?.categories?.name || '',
        supplierPartNumber: d.supplier_part_number,
        purchasePrice: d.purchase_price || 0,
        purchaseUomCode: (d.units_of_measure as any)?.code || null,
        isPreferred: d.is_preferred || false,
    }))
}

/**
 * Get all suppliers with their items
 */
export interface SupplierWithItems extends Supplier {
    items: SupplierItem[]
}

export async function getAllSuppliersWithItems(): Promise<SupplierWithItems[]> {
    // Get all suppliers
    const suppliers = await getAllSuppliers()

    // Get all item_suppliers in one query
    const { data: itemSuppliers, error } = await supabase
        .from('item_suppliers')
        .select(`
            id,
            supplier_id,
            item_id,
            supplier_part_number,
            purchase_price,
            is_preferred,
            items:item_id (id, code, name, categories:category_id (name)),
            units_of_measure:purchase_uom_id (code)
        `)
        .eq('is_active', true)
        .order('is_preferred', { ascending: false })

    if (error) {
        console.error('Error fetching item suppliers:', error)
        return suppliers.map(s => ({ ...s, items: [] }))
    }

    // Group items by supplier_id
    const itemsBySupplier = new Map<string, SupplierItem[]>()
    for (const d of itemSuppliers || []) {
        const supplierId = d.supplier_id
        if (!itemsBySupplier.has(supplierId)) {
            itemsBySupplier.set(supplierId, [])
        }
        itemsBySupplier.get(supplierId)!.push({
            id: d.id,
            itemId: d.item_id,
            itemCode: (d.items as any)?.code || '',
            itemName: (d.items as any)?.name || '',
            categoryName: (d.items as any)?.categories?.name || '',
            supplierPartNumber: d.supplier_part_number,
            purchasePrice: d.purchase_price || 0,
            purchaseUomCode: (d.units_of_measure as any)?.code || null,
            isPreferred: d.is_preferred || false,
        })
    }

    // Attach items to suppliers
    return suppliers.map(s => ({
        ...s,
        items: itemsBySupplier.get(s.id) || []
    }))
}
