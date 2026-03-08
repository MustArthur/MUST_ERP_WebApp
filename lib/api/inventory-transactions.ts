import { supabase } from '@/lib/supabase'
import { InventoryTransaction, CreateTransactionInput, TransactionType } from '@/types/inventory-transaction'

/**
 * Generate transaction number
 */
function generateTransactionNo(type: TransactionType): string {
    const prefix = {
        RECEIVE: 'RCV',
        ISSUE: 'ISS',
        TRANSFER: 'TRF',
        ADJUST_IN: 'ADI',
        ADJUST_OUT: 'ADO',
        PRODUCTION_IN: 'PIN',
        PRODUCTION_OUT: 'POT',
        SCRAP: 'SCP',
        RETURN: 'RTN',
    }[type]

    const date = new Date()
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

    return `${prefix}-${dateStr}-${random}`
}

/**
 * Get all inventory transactions
 */
export async function getAllTransactions(): Promise<InventoryTransaction[]> {
    const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
            id,
            transaction_no,
            transaction_type,
            transaction_date,
            item_id,
            lot_id,
            from_warehouse_id,
            from_location_id,
            to_warehouse_id,
            to_location_id,
            qty,
            uom_id,
            unit_cost,
            total_cost,
            reference_type,
            reference_id,
            notes,
            created_by,
            created_at,
            is_posted,
            items:item_id (id, code, name),
            lots:lot_id (id, lot_number),
            from_warehouse:from_warehouse_id (id, name),
            from_location:from_location_id (id, name),
            to_warehouse:to_warehouse_id (id, name),
            to_location:to_location_id (id, name),
            units_of_measure:uom_id (id, code)
        `)
        .order('transaction_date', { ascending: false })
        .limit(500)

    if (error) {
        console.error('Error fetching transactions:', error)
        return []
    }

    return (data || []).map(t => ({
        id: t.id,
        transactionNo: t.transaction_no,
        transactionType: t.transaction_type as TransactionType,
        transactionDate: t.transaction_date,
        itemId: t.item_id,
        itemCode: (t.items as any)?.code || '',
        itemName: (t.items as any)?.name || '',
        lotId: t.lot_id,
        lotNumber: (t.lots as any)?.lot_number || null,
        fromWarehouseId: t.from_warehouse_id,
        fromWarehouseName: (t.from_warehouse as any)?.name || null,
        fromLocationId: t.from_location_id,
        fromLocationName: (t.from_location as any)?.name || null,
        toWarehouseId: t.to_warehouse_id,
        toWarehouseName: (t.to_warehouse as any)?.name || null,
        toLocationId: t.to_location_id,
        toLocationName: (t.to_location as any)?.name || null,
        qty: t.qty,
        uomId: t.uom_id,
        uomCode: (t.units_of_measure as any)?.code || '',
        unitCost: t.unit_cost || 0,
        totalCost: t.total_cost || 0,
        referenceType: t.reference_type,
        referenceId: t.reference_id,
        notes: t.notes,
        createdBy: t.created_by,
        createdAt: t.created_at,
        isPosted: t.is_posted !== false, // default true if null
    }))
}

/**
 * Create a new inventory transaction
 */
export async function createTransaction(input: CreateTransactionInput): Promise<InventoryTransaction | null> {
    const transactionNo = generateTransactionNo(input.transactionType)
    const totalCost = (input.qty || 0) * (input.unitCost || 0)

    const { data, error } = await supabase
        .from('inventory_transactions')
        .insert({
            transaction_no: transactionNo,
            transaction_type: input.transactionType,
            transaction_date: new Date().toISOString(),
            item_id: input.itemId,
            lot_id: input.lotId || null,
            from_warehouse_id: input.fromWarehouseId || null,
            from_location_id: input.fromLocationId || null,
            to_warehouse_id: input.toWarehouseId || null,
            to_location_id: input.toLocationId || null,
            qty: input.qty,
            uom_id: input.uomId || null,
            unit_cost: input.unitCost || 0,
            total_cost: totalCost,
            reference_type: input.referenceType || null,
            reference_id: input.referenceId || null,
            notes: input.notes || null,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating transaction:', error)
        throw new Error(error.message)
    }

    // Update stock_on_hand based on transaction type
    await updateStockOnHand(input)

    // Fetch the full transaction with relations
    const transactions = await getAllTransactions()
    return transactions.find(t => t.id === data.id) || null
}

/**
 * Update stock on hand based on transaction
 */
async function updateStockOnHand(input: CreateTransactionInput): Promise<void> {
    const { transactionType, itemId, lotId, fromWarehouseId, fromLocationId, toWarehouseId, toLocationId, qty, uomId } = input

    // Handle stock reduction (from)
    if (['ISSUE', 'TRANSFER', 'ADJUST_OUT', 'PRODUCTION_OUT', 'SCRAP'].includes(transactionType)) {
        if (fromWarehouseId) {
            let query = supabase
                .from('stock_on_hand')
                .select('id, qty_on_hand')
                .eq('item_id', itemId)
                .eq('warehouse_id', fromWarehouseId)

            if (fromLocationId) {
                query = query.eq('location_id', fromLocationId)
            } else {
                query = query.is('location_id', null)
            }

            const { data: existing } = await query.maybeSingle()

            if (existing) {
                await supabase
                    .from('stock_on_hand')
                    .update({
                        qty_on_hand: (existing.qty_on_hand || 0) - qty
                    })
                    .eq('id', existing.id)
            }
        }
    }

    // Handle stock increase (to)
    if (['RECEIVE', 'TRANSFER', 'ADJUST_IN', 'PRODUCTION_IN', 'RETURN'].includes(transactionType)) {
        if (toWarehouseId) {
            // Build query based on whether locationId is provided
            let query = supabase
                .from('stock_on_hand')
                .select('id, qty_on_hand')
                .eq('item_id', itemId)
                .eq('warehouse_id', toWarehouseId)

            if (toLocationId) {
                query = query.eq('location_id', toLocationId)
            } else {
                query = query.is('location_id', null)
            }

            const { data: existing } = await query.maybeSingle()

            if (existing) {
                const { error: updateError } = await supabase
                    .from('stock_on_hand')
                    .update({
                        qty_on_hand: (existing.qty_on_hand || 0) + qty
                    })
                    .eq('id', existing.id)

                if (updateError) {
                    console.error('Error updating stock_on_hand:', updateError)
                }
            } else {
                // Create new stock record (qty_reserved and qty_available are generated columns)
                const insertData = {
                    item_id: itemId,
                    warehouse_id: toWarehouseId,
                    location_id: toLocationId || null,
                    lot_id: lotId || null,
                    qty_on_hand: qty,
                    uom_id: uomId || null
                }
                console.log('Inserting stock_on_hand:', insertData)

                const { error: insertError } = await supabase
                    .from('stock_on_hand')
                    .insert(insertData)

                if (insertError) {
                    console.error('Error inserting stock_on_hand:', insertError)
                }
            }
        }
    }
}

/**
 * Get warehouses for dropdown
 */
export async function getWarehouses(): Promise<{ id: string; code: string; name: string }[]> {
    const { data, error } = await supabase
        .from('warehouses')
        .select('id, code, name')
        .eq('is_active', true)
        .order('code')

    if (error) {
        console.error('Error fetching warehouses:', error)
        return []
    }

    return data || []
}

/**
 * Get locations by warehouse
 */
export async function getLocationsByWarehouse(warehouseId: string): Promise<{ id: string; code: string; name: string }[]> {
    const { data, error } = await supabase
        .from('locations')
        .select('id, code, name')
        .eq('warehouse_id', warehouseId)
        .eq('is_active', true)
        .order('code')

    if (error) {
        console.error('Error fetching locations:', error)
        return []
    }

    return data || []
}

/**
 * Get items for dropdown
 */
export async function getItemsForTransaction(): Promise<{ id: string; code: string; name: string; baseUomId: string; baseUomCode: string }[]> {
    const { data, error } = await supabase
        .from('items')
        .select(`
            id, code, name, base_uom_id,
            units_of_measure:base_uom_id (code)
        `)
        .eq('is_active', true)
        .order('code')

    if (error) {
        console.error('Error fetching items:', error)
        return []
    }

    return (data || []).map(i => ({
        id: i.id,
        code: i.code,
        name: i.name,
        baseUomId: i.base_uom_id,
        baseUomCode: (i.units_of_measure as any)?.code || ''
    }))
}

/**
 * Get lots by item
 */
export async function getLotsByItem(itemId: string): Promise<{ id: string; lotNumber: string; expiryDate?: string; qty: number }[]> {
    const { data, error } = await supabase
        .from('lots')
        .select('id, lot_number, expiry_date, initial_qty')
        .eq('item_id', itemId)
        .in('status', ['AVAILABLE', 'QUARANTINE'])
        .order('expiry_date')

    if (error) {
        console.error('Error fetching lots:', error)
        return []
    }

    return (data || []).map(l => ({
        id: l.id,
        lotNumber: l.lot_number,
        expiryDate: l.expiry_date,
        qty: l.initial_qty || 0
    }))
}

/**
 * Get transaction stats
 */
export async function getTransactionStats(): Promise<{
    todayIn: number
    todayOut: number
    weekIn: number
    weekOut: number
}> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)

    const { data: transactions } = await supabase
        .from('inventory_transactions')
        .select('transaction_type, qty, transaction_date')
        .gte('transaction_date', weekAgo.toISOString())

    const inTypes = ['RECEIVE', 'ADJUST_IN', 'PRODUCTION_IN', 'RETURN', 'TRANSFER']
    const outTypes = ['ISSUE', 'ADJUST_OUT', 'PRODUCTION_OUT', 'SCRAP']

    let todayIn = 0, todayOut = 0, weekIn = 0, weekOut = 0

    for (const t of transactions || []) {
        const isToday = new Date(t.transaction_date) >= today
        const isIn = inTypes.includes(t.transaction_type)
        const isOut = outTypes.includes(t.transaction_type)

        if (isIn) {
            weekIn++
            if (isToday) todayIn++
        }
        if (isOut) {
            weekOut++
            if (isToday) todayOut++
        }
    }

    return { todayIn, todayOut, weekIn, weekOut }
}

/**
 * Get stock balance for an item in a specific warehouse/location
 */
export async function getStockBalance(itemId: string, warehouseId: string, locationId?: string | null): Promise<number> {
    if (!warehouseId) return 0

    let query = supabase
        .from('stock_on_hand')
        .select('qty_on_hand')
        .eq('item_id', itemId)
        .eq('warehouse_id', warehouseId)

    if (locationId) {
        query = query.eq('location_id', locationId)
    } else {
        query = query.is('location_id', null)
    }

    const { data } = await query.maybeSingle()
    return data?.qty_on_hand || 0
}

/**
 * Void a transaction and create reverse transaction to revert stock
 */
export async function voidTransaction(transactionId: string): Promise<InventoryTransaction | null> {
    // 1. Fetch original transaction
    const { data: original, error } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

    if (error || !original) {
        throw new Error('ไม่พบรายการ')
    }

    if (original.is_posted === false) {
        throw new Error('รายการนี้ถูกยกเลิกไปแล้ว')
    }

    // 2. Determine reverse transaction type
    const reverseTypeMap: Record<string, TransactionType> = {
        'RECEIVE': 'ISSUE',
        'ISSUE': 'RECEIVE',
        'TRANSFER': 'TRANSFER',
        'ADJUST_IN': 'ADJUST_OUT',
        'ADJUST_OUT': 'ADJUST_IN',
        'PRODUCTION_IN': 'PRODUCTION_OUT',
        'PRODUCTION_OUT': 'PRODUCTION_IN',
        'SCRAP': 'ADJUST_IN',
        'RETURN': 'ISSUE',
    }

    const reverseType = reverseTypeMap[original.transaction_type]
    if (!reverseType) {
        throw new Error('ไม่สามารถยกเลิกรายการประเภทนี้ได้')
    }

    // 3. Create reverse transaction input
    // For reversal: swap from/to warehouses
    const reverseInput: CreateTransactionInput = {
        transactionType: reverseType,
        itemId: original.item_id,
        lotId: original.lot_id || undefined,
        // Swap from/to for proper reversal
        fromWarehouseId: original.to_warehouse_id || undefined,
        fromLocationId: original.to_location_id || undefined,
        toWarehouseId: original.from_warehouse_id || undefined,
        toLocationId: original.from_location_id || undefined,
        qty: original.qty,
        uomId: original.uom_id || undefined,
        unitCost: original.unit_cost || 0,
        referenceType: 'VOID',
        referenceId: original.id,
        notes: `ยกเลิกรายการ ${original.transaction_no}`,
    }

    // For non-TRANSFER types, use the correct warehouse direction
    if (original.transaction_type !== 'TRANSFER') {
        // IN types (RECEIVE, ADJUST_IN, etc.) - reverse should be OUT from the same warehouse
        if (['RECEIVE', 'ADJUST_IN', 'PRODUCTION_IN', 'RETURN'].includes(original.transaction_type)) {
            reverseInput.fromWarehouseId = original.to_warehouse_id || undefined
            reverseInput.fromLocationId = original.to_location_id || undefined
            reverseInput.toWarehouseId = undefined
            reverseInput.toLocationId = undefined
        }
        // OUT types (ISSUE, ADJUST_OUT, etc.) - reverse should be IN to the same warehouse
        else if (['ISSUE', 'ADJUST_OUT', 'PRODUCTION_OUT', 'SCRAP'].includes(original.transaction_type)) {
            reverseInput.toWarehouseId = original.from_warehouse_id || undefined
            reverseInput.toLocationId = original.from_location_id || undefined
            reverseInput.fromWarehouseId = undefined
            reverseInput.fromLocationId = undefined
        }
    }

    // Generate void transaction number
    const voidTransactionNo = `VOID-${original.transaction_no}`
    const totalCost = (reverseInput.qty || 0) * (reverseInput.unitCost || 0)

    // 4. Insert reverse transaction
    const { data: reverseData, error: insertError } = await supabase
        .from('inventory_transactions')
        .insert({
            transaction_no: voidTransactionNo,
            transaction_type: reverseInput.transactionType,
            transaction_date: new Date().toISOString(),
            item_id: reverseInput.itemId,
            lot_id: reverseInput.lotId || null,
            from_warehouse_id: reverseInput.fromWarehouseId || null,
            from_location_id: reverseInput.fromLocationId || null,
            to_warehouse_id: reverseInput.toWarehouseId || null,
            to_location_id: reverseInput.toLocationId || null,
            qty: reverseInput.qty,
            uom_id: reverseInput.uomId || null,
            unit_cost: reverseInput.unitCost || 0,
            total_cost: totalCost,
            reference_type: 'VOID',
            reference_id: original.id,
            notes: reverseInput.notes,
            is_posted: true,
        })
        .select()
        .single()

    if (insertError) {
        console.error('Error creating void transaction:', insertError)
        throw new Error('ไม่สามารถสร้างรายการยกเลิกได้')
    }

    // 5. Update stock via updateStockOnHand
    await updateStockOnHand(reverseInput)

    // 6. Mark original transaction as voided
    const originalNotes = original.notes || ''
    const { error: updateError } = await supabase
        .from('inventory_transactions')
        .update({
            is_posted: false,
            notes: originalNotes ? `${originalNotes} [VOIDED]` : '[VOIDED]'
        })
        .eq('id', transactionId)

    if (updateError) {
        console.error('Error marking transaction as voided:', updateError)
    }

    // 7. Return the void transaction
    const transactions = await getAllTransactions()
    return transactions.find(t => t.id === reverseData.id) || null
}
