import { create } from 'zustand'
import { Recipe } from '@/types/recipe'
import { Item } from '@/types/item'
import { BatchPlanItem, AggregatedMaterial, PlanningPeriod } from '@/types/production-planning'

interface ProductionPlanningState {
  batchPlan: BatchPlanItem[]
  aggregated: AggregatedMaterial[]
  period: PlanningPeriod

  initPlan: (recipes: Recipe[]) => void
  setBatchCount: (recipeId: string, count: number) => void
  calculate: (recipes: Recipe[], items: Item[]) => void
  setPeriod: (period: PlanningPeriod) => void
  reset: () => void
}

function periodMultiplier(period: PlanningPeriod): number {
  if (period === 'daily') return 1 / 7
  if (period === 'monthly') return 4
  return 1 // weekly
}

export const useProductionPlanningStore = create<ProductionPlanningState>((set, get) => ({
  batchPlan: [],
  aggregated: [],
  period: 'weekly',

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
        batchCount: existing?.batchCount ?? 0,
      }
    })
    set({ batchPlan: updated })
  },

  setBatchCount: (recipeId: string, count: number) => {
    set(state => ({
      batchPlan: state.batchPlan.map(p =>
        p.recipeId === recipeId ? { ...p, batchCount: Math.max(0, count) } : p
      ),
    }))
  },

  calculate: (recipes: Recipe[], items: Item[]) => {
    const { batchPlan, period } = get()
    const mult = periodMultiplier(period)
    const map = new Map<string, AggregatedMaterial>()

    for (const planItem of batchPlan) {
      if (planItem.batchCount === 0) continue
      const recipe = recipes.find(r => r.id === planItem.recipeId)
      if (!recipe) continue

      for (const ing of recipe.ingredients) {
        if (!ing.itemId) continue
        const qtyWithScrap = ing.qty * (1 + ing.scrap / 100)
        const totalForPeriod = qtyWithScrap * planItem.batchCount * mult

        if (!map.has(ing.itemId)) {
          const itemData = items.find(i => i.id === ing.itemId)
          map.set(ing.itemId, {
            itemId: ing.itemId,
            itemCode: ing.code,
            itemName: ing.item,
            totalQty: 0,
            uom: ing.uom,
            currentStock: itemData?.stockQty ?? 0,
            leadTimeWeeks: itemData?.leadTimeWeeks ?? 1,
            safetyStockNeeded: 0,
            coverageBatches: 0,
            status: 'OK',
          })
        }

        const entry = map.get(ing.itemId)!
        entry.totalQty += totalForPeriod
      }
    }

    const totalBatchesAll = batchPlan.reduce((sum, p) => sum + p.batchCount, 0)

    const aggregated: AggregatedMaterial[] = Array.from(map.values()).map(m => {
      const weeklyUsage = m.totalQty / mult
      const safetyStockNeeded = weeklyUsage * m.leadTimeWeeks
      const usagePerBatch = totalBatchesAll > 0 ? weeklyUsage / totalBatchesAll : 0
      const coverageBatches = usagePerBatch > 0 ? Math.floor(m.currentStock / usagePerBatch) : 999

      let status: 'OK' | 'LOW' | 'CRITICAL' = 'OK'
      if (m.currentStock < safetyStockNeeded) status = 'CRITICAL'
      else if (m.currentStock < weeklyUsage) status = 'LOW'

      return {
        ...m,
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
    batchPlan: state.batchPlan.map(p => ({ ...p, batchCount: 0 })),
    aggregated: [],
  })),
}))
