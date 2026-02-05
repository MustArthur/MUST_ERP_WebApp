
import { supabase } from '@/lib/supabase'

async function checkStock() {
    // 1. Get Item ID
    const { data: items } = await supabase
        .from('items')
        .select('id, code, name')
        .ilike('name', '%CK_Blueberry%')

    if (!items || items.length === 0) {
        console.log('Item not found')
        return
    }

    const item = items[0]
    console.log(`Found Item: ${item.name} (${item.code}) ID: ${item.id}`)

    // 2. Get Stock Records
    const { data: stocks } = await supabase
        .from('stock_on_hand')
        .select(`
            id, 
            qty_on_hand,
            warehouse_id,
            location_id,
            warehouses:warehouse_id(name),
            locations:location_id(name)
        `)
        .eq('item_id', item.id)

    console.log('--- Stock On Hand Records ---')
    if (!stocks || stocks.length === 0) {
        console.log('No stock records found for this item.')
    } else {
        stocks.forEach(s => {
            const wh = (s.warehouses as any)?.name || 'Unknown WH'
            const loc = (s.locations as any)?.name || 'NULL (Default)'
            console.log(`[${s.id}] Qty: ${s.qty_on_hand} | WH: ${wh} (${s.warehouse_id}) | Loc: ${loc} (${s.location_id})`)
        })
    }
    // 3. Get Recent Transactions
    const { data: transactions } = await supabase
        .from('inventory_transactions')
        .select(`
            id,
            transaction_no,
            transaction_type,
            qty,
            from_warehouse_id,
            from_location_id,
            to_warehouse_id,
            to_location_id,
            created_at,
            warehouses:from_warehouse_id(name)
        `)
        .eq('item_id', item.id)
        .order('created_at', { ascending: false })
        .limit(5)

    console.log('--- Recent Transactions ---')
    if (!transactions || transactions.length === 0) {
        console.log('No transactions found.')
    } else {
        transactions.forEach(t => {
            const wh = (t.warehouses as any)?.name || t.from_warehouse_id || 'NULL'
            console.log(`[${t.transaction_no}] Type: ${t.transaction_type} | Qty: ${t.qty} | FromWH: ${wh} | FromLoc: ${t.from_location_id} | Time: ${t.created_at}`)
        })
    }
}

checkStock()
