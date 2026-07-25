import { supabase } from '@/lib/supabase'

export interface DailyPricePoint {
    date: string       // ISO date (YYYY-MM-DD)
    label: string       // formatted display label e.g. "23/07"
    quantity: number    // total qty received that day
    avgPrice: number     // quantity-weighted average price per unit that day
}

export interface DailyFuelCost {
    date: string
    label: string
    totalAmount: number
}

function formatLabel(isoDate: string): string {
    const [, month, day] = isoDate.split('-')
    return `${day}/${month}`
}

function cutoffDate(days: number): string {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().slice(0, 10)
}

async function getDailyReceivingTrend(itemCode: string, days: number): Promise<DailyPricePoint[]> {
    const { data, error } = await supabase
        .from('purchase_receipt_items')
        .select(`
            qty_received,
            unit_price,
            purchase_receipts!inner (
                receipt_date,
                status
            ),
            items!inner (
                code
            )
        `)
        .eq('items.code', itemCode)
        .neq('purchase_receipts.status', 'CANCELLED')
        .gte('purchase_receipts.receipt_date', cutoffDate(days))

    if (error) {
        console.error(`Error fetching daily receiving trend for ${itemCode}:`, error)
        return []
    }

    const byDate = new Map<string, { qty: number; weightedSum: number }>()
    for (const row of data || []) {
        const receipt = row.purchase_receipts as any
        const date = receipt?.receipt_date
        const qty = row.qty_received || 0
        const price = row.unit_price || 0
        if (!date) continue

        const existing = byDate.get(date) || { qty: 0, weightedSum: 0 }
        existing.qty += qty
        existing.weightedSum += qty * price
        byDate.set(date, existing)
    }

    return Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { qty, weightedSum }]) => ({
            date,
            label: formatLabel(date),
            quantity: qty,
            avgPrice: qty > 0 ? weightedSum / qty : 0,
        }))
}

/**
 * Daily received quantity (kg) and quantity-weighted average price (baht/kg) for Fresh Chicken.
 */
export async function getFreshChickenDailyTrend(days = 30): Promise<DailyPricePoint[]> {
    return getDailyReceivingTrend('RM-CHICKEN', days)
}

/**
 * Daily received quantity (bags) and quantity-weighted average price (baht/bag) for ice bags.
 */
export async function getIceBagsDailyTrend(days = 30): Promise<DailyPricePoint[]> {
    return getDailyReceivingTrend('SUP-FACTORYICE', days)
}

/**
 * Daily total fuel spend (baht) for Logistics vehicles.
 */
export async function getLogisticsFuelDailyTrend(days = 30): Promise<DailyFuelCost[]> {
    const { data, error } = await supabase
        .from('factory_expenses')
        .select('expense_date, amount')
        .eq('category', 'LOGISTICS')
        .eq('subcategory', 'FUEL')
        .gte('expense_date', cutoffDate(days))

    if (error) {
        console.error('Error fetching logistics fuel daily trend:', error)
        return []
    }

    const byDate = new Map<string, number>()
    for (const row of data || []) {
        const date = row.expense_date
        if (!date) continue
        byDate.set(date, (byDate.get(date) || 0) + (row.amount || 0))
    }

    return Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, totalAmount]) => ({
            date,
            label: formatLabel(date),
            totalAmount,
        }))
}
