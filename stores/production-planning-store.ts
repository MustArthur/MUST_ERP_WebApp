import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Recipe } from '@/types/recipe'
import { Item } from '@/types/item'
import { BatchPlanItem, AggregatedMaterial, PlanningPeriod } from '@/types/production-planning'

interface ProductionPlanningState {
  batchPlan: BatchPlanItem[]
  aggregated: AggregatedMaterial[]
  period: PlanningPeriod

  initPlan: (recipes: Recipe[]) => void
  setBatchCount: (recipeId: string, period: PlanningPeriod, count: number) => void
  calculate: (recipes: Recipe[], items: Item[]) => void
  setPeriod: (period: PlanningPeriod) => void
  reset: () => void
}

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

function periodMultiplier(period: PlanningPeriod): number {
  if (period === 'daily') return 1 / 7
  if (period === 'monthly') return 4
  return 1
}

const EMPTY_BATCH_COUNTS: Record<PlanningPeriod, number> = { daily: 0, weekly: 0, monthly: 0 }

export const useProductionPlanningStore = create<ProductionPlanningState>()(
  persist(
    (set, get) => ({
      batchPlan: [],
      aggregated: [],
      period: 'weekly' as PlanningPeriod,

      initPlan: (recipes: Recipe[]) => {
        const { batchPlan } = get()
        const activeRecipes = recipes.filter(r => r.status === 'ACTIVE')
        const updated: BatchPlanItem[] = activeRecipes.map(r => {
          const existing = batchPlan.find(p => p.recipeId === r.id)
          return {
            recipeId: r.id,
            recipeCode: r.code,
            recipeName: r.name,
            outputItem: r.outputItem,
            outputUom: r.outputUom,
            outputQtyPerBatch: r.outputQty,
            batchCounts: existing?.batchCounts ?? { ...EMPTY_BATCH_COUNTS },
          }
        })
        set({ batchPlan: updated })
      },

      setBatchCount: (recipeId: string, period: PlanningPeriod, count: number) => {
        set(state => ({
          batchPlan: state.batchPlan.map(p =>
            p.recipeId === recipeId
              ? { ...p, batchCounts: { ...p.batchCounts, [period]: Math.max(0, count) } }
              : p
          ),
        }))
      },

      calculate: (recipes: Recipe[], items: Item[]) => {
        const { batchPlan, period } = get()
        const mult = periodMultiplier(period)
        const map = new Map<string, MapEntry>()

        for (const planItem of batchPlan) {
          const batchCount = planItem.batchCounts[period] ?? 0
          if (batchCount === 0) continue
          const recipe = recipes.find(r => r.id === planItem.recipeId)
          if (!recipe) continue

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

        set({ aggregated })
      },

      setPeriod: (period: PlanningPeriod) => set({ period }),

      reset: () => set(state => ({
        batchPlan: state.batchPlan.map(p => ({
          ...p,
          batchCounts: { ...EMPTY_BATCH_COUNTS },
        })),
        aggregated: [],
      })),
    }),
    {
      name: 'production-planning',
      partialize: (state) => ({
        batchPlan: state.batchPlan,
        period: state.period,
      }),
    }
  )
)
