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

export interface SupplierSeriesMeta {
    supplierId: string
    supplierName: string
    key: string
}

export interface SupplierPriceTrend {
    data: Array<Record<string, string | number | undefined>>
    series: SupplierSeriesMeta[]
}

export interface SupplierQuantityTrend {
    data: Array<Record<string, string | number | undefined>>
    series: SupplierSeriesMeta[]
}

const SERIES_COLORS = ['#f97316', '#0ea5e9', '#22c55e', '#a855f7', '#ec4899']

interface SupplierRawTotals {
    byDateSupplier: Map<string, Map<string, { qty: number; weightedSum: number }>>
    supplierNames: Map<string, string>
}

/**
 * Raw per-(date, supplier) qty + weighted price sum for Fresh Chicken receipts, shared by the
 * price-comparison and quantity-comparison trend functions below so the join only happens once.
 */
async function getFreshChickenRawBySupplier(days: number): Promise<SupplierRawTotals> {
    const { data, error } = await supabase
        .from('purchase_receipt_items')
        .select(`
            qty_received,
            unit_price,
            purchase_receipts!inner (
                receipt_date,
                status,
                supplier_id,
                suppliers:supplier_id (id, name)
            ),
            items!inner (
                code
            )
        `)
        .eq('items.code', 'RM-CHICKEN')
        .neq('purchase_receipts.status', 'CANCELLED')
        .gte('purchase_receipts.receipt_date', cutoffDate(days))

    const byDateSupplier = new Map<string, Map<string, { qty: number; weightedSum: number }>>()
    const supplierNames = new Map<string, string>()

    if (error) {
        console.error('Error fetching Fresh Chicken raw data by supplier:', error)
        return { byDateSupplier, supplierNames }
    }

    for (const row of data || []) {
        const receipt = row.purchase_receipts as any
        const date = receipt?.receipt_date
        const supplierId = receipt?.supplier_id
        const supplierName = receipt?.suppliers?.name
        if (!date || !supplierId) continue

        supplierNames.set(supplierId, supplierName || supplierId)

        const qty = row.qty_received || 0
        const price = row.unit_price || 0

        const supplierMap = byDateSupplier.get(date) || new Map()
        const existing = supplierMap.get(supplierId) || { qty: 0, weightedSum: 0 }
        existing.qty += qty
        existing.weightedSum += qty * price
        supplierMap.set(supplierId, existing)
        byDateSupplier.set(date, supplierMap)
    }

    return { byDateSupplier, supplierNames }
}

/**
 * Daily quantity-weighted average price (baht/kg) for Fresh Chicken, broken down per supplier
 * so prices can be compared side by side (a day with no delivery from a supplier is left as a
 * gap, not interpolated).
 */
export async function getFreshChickenDailyTrendBySupplier(days = 30): Promise<SupplierPriceTrend> {
    const { byDateSupplier, supplierNames } = await getFreshChickenRawBySupplier(days)

    const series: SupplierSeriesMeta[] = Array.from(supplierNames.entries())
        .sort(([, a], [, b]) => a.localeCompare(b))
        .map(([supplierId, supplierName], index) => ({
            supplierId,
            supplierName,
            key: `price_${index}`,
        }))

    const dates = Array.from(byDateSupplier.keys()).sort()
    const chartData = dates.map(date => {
        const row: Record<string, string | number | undefined> = { date, name: formatLabel(date) }
        const supplierMap = byDateSupplier.get(date)!
        for (const s of series) {
            const point = supplierMap.get(s.supplierId)
            row[s.key] = point && point.qty > 0 ? Math.round((point.weightedSum / point.qty) * 100) / 100 : undefined
        }
        return row
    })

    return { data: chartData, series }
}

/**
 * Daily received quantity (kg) for Fresh Chicken, broken down per supplier for a stacked bar
 * chart. Series are ordered by total quantity over the period, descending, so the supplier that
 * supplies the most volume is stacked as the base (bottom) of each bar.
 */
export async function getFreshChickenDailyQuantityBySupplier(days = 30): Promise<SupplierQuantityTrend> {
    const { byDateSupplier, supplierNames } = await getFreshChickenRawBySupplier(days)

    const totalQtyBySupplier = new Map<string, number>()
    for (const supplierMap of Array.from(byDateSupplier.values())) {
        for (const [supplierId, { qty }] of Array.from(supplierMap.entries())) {
            totalQtyBySupplier.set(supplierId, (totalQtyBySupplier.get(supplierId) || 0) + qty)
        }
    }

    const series: SupplierSeriesMeta[] = Array.from(supplierNames.entries())
        .sort(([a], [b]) => (totalQtyBySupplier.get(b) || 0) - (totalQtyBySupplier.get(a) || 0))
        .map(([supplierId, supplierName], index) => ({
            supplierId,
            supplierName,
            key: `qty_${index}`,
        }))

    const dates = Array.from(byDateSupplier.keys()).sort()
    const chartData = dates.map(date => {
        const row: Record<string, string | number | undefined> = { date, name: formatLabel(date) }
        const supplierMap = byDateSupplier.get(date)!
        for (const s of series) {
            const point = supplierMap.get(s.supplierId)
            row[s.key] = point?.qty || 0
        }
        return row
    })

    return { data: chartData, series }
}

export function getSupplierSeriesColor(index: number): string {
    return SERIES_COLORS[index % SERIES_COLORS.length]
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
