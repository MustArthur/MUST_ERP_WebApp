import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Recipe } from '@/types/recipe'
import { Item } from '@/types/item'
import {
  AggregatedMaterial,
  BatchCountMap,
  BatchCounts,
  CalculationSnapshot,
  PlanningPeriod,
} from '@/types/production-planning'
import {
  EMPTY_BATCH_COUNTS,
  buildCalcSignature,
  isPlanningPeriod,
  periodMultiplier,
  selectActiveRecipes,
} from '@/lib/production-planning'

interface ProductionPlanningState {
  batchCounts: BatchCountMap
  aggregated: AggregatedMaterial[]
  period: PlanningPeriod
  lastCalc: CalculationSnapshot | null
  hasHydrated: boolean

  setBatchCount: (recipeCode: string, period: PlanningPeriod, count: number) => void
  calculate: (recipes: Recipe[], items: Item[]) => void
  setPeriod: (period: PlanningPeriod) => void
  reset: () => void
  setHasHydrated: (value: boolean) => void
}

/** The slice that goes to localStorage. `hasHydrated` must stay out of it. */
type PersistedPlanning = Pick<
  ProductionPlanningState,
  'batchCounts' | 'period' | 'aggregated' | 'lastCalc'
>

// Intermediate accumulation entry (base units)
interface MapEntry {
  itemId: string
  itemCode: string
  itemName: string
  totalQtyBase: number
  totalBatchCount: number   // batches from recipes that actually use this item
  convFactor: number
  stockUom: string
  currentStock: number
  leadTimeWeeks: number
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

/**
 * v0: batchPlan[].batchCount (single number)   — pre d5a98a7
 * v1: batchPlan[].batchCounts (per period)     — post d5a98a7
 * Neither wrote a `version` key, so zustand reports version 0 for both and the
 * shape has to be sniffed. Both were keyed by recipeId; we re-key by recipeCode.
 */
function migrate(persisted: unknown, version: number): PersistedPlanning {
  const empty: PersistedPlanning = {
    batchCounts: {},
    period: 'weekly',
    aggregated: [],
    lastCalc: null,
  }

  if (!persisted || typeof persisted !== 'object') return empty

  const old = persisted as Record<string, unknown>
  const period: PlanningPeriod = isPlanningPeriod(old.period) ? old.period : 'weekly'

  if (version >= 2) return persisted as PersistedPlanning

  const batchCounts: BatchCountMap = {}

  if (Array.isArray(old.batchPlan)) {
    for (const entry of old.batchPlan) {
      if (!entry || typeof entry !== 'object') continue
      const row = entry as Record<string, unknown>
      const code = typeof row.recipeCode === 'string' ? row.recipeCode : ''
      if (!code) continue

      let counts: BatchCounts
      if (row.batchCounts && typeof row.batchCounts === 'object') {
        const raw = row.batchCounts as Record<string, unknown>
        counts = { daily: num(raw.daily), weekly: num(raw.weekly), monthly: num(raw.monthly) }
      } else if (typeof row.batchCount === 'number') {
        // v0 stored a single count with no period; the persisted period is the
        // best available guess at which cycle it belonged to.
        counts = { ...EMPTY_BATCH_COUNTS, [period]: num(row.batchCount) }
      } else {
        continue
      }

      if (counts.daily === 0 && counts.weekly === 0 && counts.monthly === 0) continue
      batchCounts[code] = counts
    }
  }

  // Results were never persisted before v2, so there is nothing to recover.
  return { batchCounts, period, aggregated: [], lastCalc: null }
}

export const useProductionPlanningStore = create<ProductionPlanningState>()(
  persist<ProductionPlanningState, [], [], PersistedPlanning>(
    (set, get) => ({
      batchCounts: {},
      aggregated: [],
      period: 'weekly' as PlanningPeriod,
      lastCalc: null,
      hasHydrated: false,

      setBatchCount: (recipeCode: string, period: PlanningPeriod, count: number) => {
        set(state => ({
          batchCounts: {
            ...state.batchCounts,
            [recipeCode]: {
              ...(state.batchCounts[recipeCode] ?? EMPTY_BATCH_COUNTS),
              [period]: num(count),
            },
          },
        }))
      },

      calculate: (recipes: Recipe[], items: Item[]) => {
        const { batchCounts, period } = get()
        const mult = periodMultiplier(period)
        const map = new Map<string, MapEntry>()
        let totalBatches = 0

        for (const recipe of selectActiveRecipes(recipes)) {
          const batchCount = batchCounts[recipe.code]?.[period] ?? 0
          if (batchCount === 0) continue
          totalBatches += batchCount

          for (const ing of recipe.ingredients) {
            if (!ing.itemId) continue

            const qtyWithScrap = ing.qty * (1 + ing.scrap / 100)
            const totalForPeriodBase = qtyWithScrap * batchCount

            if (!map.has(ing.itemId)) {
              const itemData = items.find(i => i.id === ing.itemId)
              const convFactor = Math.max(0.000001, itemData?.stockConversionFactor ?? 1)
              const stockUom = (itemData?.stockUomCode && itemData.stockUomCode !== itemData.baseUomCode)
                ? itemData.stockUomCode
                : (itemData?.stockUomCode ?? ing.uom)
              map.set(ing.itemId, {
                itemId: ing.itemId,
                itemCode: ing.code,
                itemName: ing.item,
                totalQtyBase: 0,
                totalBatchCount: 0,
                convFactor,
                stockUom,
                currentStock: itemData?.stockQty ?? 0,
                leadTimeWeeks: itemData?.leadTimeWeeks ?? 1,
              })
            }

            const entry = map.get(ing.itemId)!
            entry.totalQtyBase += totalForPeriodBase
            entry.totalBatchCount += batchCount
          }
        }

        const aggregated: AggregatedMaterial[] = Array.from(map.values()).map(entry => {
          const totalQtyStock = entry.totalQtyBase / entry.convFactor
          const weeklyUsageStock = totalQtyStock / mult
          const safetyStockNeeded = Math.ceil(weeklyUsageStock * entry.leadTimeWeeks)
          // Use only batches from recipes that actually use this item (not all planned batches)
          const usagePerBatch = entry.totalBatchCount > 0 ? totalQtyStock / entry.totalBatchCount : 0
          const coverageBatches = usagePerBatch > 0 ? Math.floor(entry.currentStock / usagePerBatch) : 999999

          let status: 'OK' | 'LOW' | 'CRITICAL' = 'OK'
          if (entry.currentStock < safetyStockNeeded) status = 'CRITICAL'
          else if (entry.currentStock < weeklyUsageStock) status = 'LOW'

          return {
            itemId: entry.itemId,
            itemCode: entry.itemCode,
            itemName: entry.itemName,
            totalQty: totalQtyStock,
            uom: entry.stockUom,
            currentStock: entry.currentStock,
            leadTimeWeeks: entry.leadTimeWeeks,
            safetyStockNeeded,
            coverageBatches,
            status,
          }
        })

        aggregated.sort((a, b) => {
          const order = { CRITICAL: 0, LOW: 1, OK: 2 }
          return order[a.status] - order[b.status] || a.itemCode.localeCompare(b.itemCode)
        })

        set({
          aggregated,
          lastCalc: {
            at: new Date().toISOString(),
            period,
            signature: buildCalcSignature(period, batchCounts),
            totalBatches,
          },
        })
      },

      setPeriod: (period: PlanningPeriod) => set({ period }),

      reset: () => set({ batchCounts: {}, aggregated: [], lastCalc: null }),

      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
    }),
    {
      name: 'production-planning',
      version: 2,
      // Keep the first client render identical to the server HTML; the page
      // triggers rehydration from an effect instead.
      skipHydration: true,
      partialize: (state) => ({
        batchCounts: state.batchCounts,
        period: state.period,
        aggregated: state.aggregated,
        lastCalc: state.lastCalc,
      }),
      migrate,
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('production-planning rehydrate failed:', error)
        state?.setHasHydrated(true)
      },
    }
  )
)
