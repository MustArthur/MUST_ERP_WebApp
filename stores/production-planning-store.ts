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

// Intermediate accumulation entry (base units)
interface MapEntry {
  itemId: string
  itemCode: string
  itemName: string
  totalQtyBase: number   // accumulated in base/production units (ML, G, etc.)
  convFactor: number     // 1 stock unit = N base units (from item.stockConversionFactor)
  stockUom: string       // display unit (Bag, KG, Bottle, etc.)
  currentStock: number   // already in stock units (from items.stockQty)
  leadTimeWeeks: number
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
    const map = new Map<string, MapEntry>()

    for (const planItem of batchPlan) {
      if (planItem.batchCount === 0) continue
      const recipe = recipes.find(r => r.id === planItem.recipeId)
      if (!recipe) continue

      for (const ing of recipe.ingredients) {
        if (!ing.itemId) continue

        const qtyWithScrap = ing.qty * (1 + ing.scrap / 100)
        const totalForPeriodBase = qtyWithScrap * planItem.batchCount * mult

        if (!map.has(ing.itemId)) {
          const itemData = items.find(i => i.id === ing.itemId)
          const convFactor = Math.max(0.000001, itemData?.stockConversionFactor ?? 1)
          // Use stock UOM code for display; fall back to recipe ingredient UOM if not set
          const stockUom = (itemData?.stockUomCode && itemData.stockUomCode !== itemData.baseUomCode)
            ? itemData.stockUomCode
            : (itemData?.stockUomCode ?? ing.uom)
          map.set(ing.itemId, {
            itemId: ing.itemId,
            itemCode: ing.code,
            itemName: ing.item,
            totalQtyBase: 0,
            convFactor,
            stockUom,
            currentStock: itemData?.stockQty ?? 0,
            leadTimeWeeks: itemData?.leadTimeWeeks ?? 1,
          })
        }

        map.get(ing.itemId)!.totalQtyBase += totalForPeriodBase
      }
    }

    const totalBatchesAll = batchPlan.reduce((sum, p) => sum + p.batchCount, 0)

    const aggregated: AggregatedMaterial[] = Array.from(map.values()).map(entry => {
      // Convert from base units → stock units for all comparisons
      const totalQtyStock = entry.totalQtyBase / entry.convFactor
      const weeklyUsageStock = totalQtyStock / mult
      const safetyStockNeeded = weeklyUsageStock * entry.leadTimeWeeks
      const usagePerBatch = totalBatchesAll > 0 ? weeklyUsageStock / totalBatchesAll : 0
      const coverageBatches = usagePerBatch > 0 ? Math.floor(entry.currentStock / usagePerBatch) : 999

      let status: 'OK' | 'LOW' | 'CRITICAL' = 'OK'
      if (entry.currentStock < safetyStockNeeded) status = 'CRITICAL'
      else if (entry.currentStock < weeklyUsageStock) status = 'LOW'

      return {
        itemId: entry.itemId,
        itemCode: entry.itemCode,
        itemName: entry.itemName,
        totalQty: totalQtyStock,           // in stock units
        uom: entry.stockUom,               // stock unit label
        currentStock: entry.currentStock,  // already in stock units
        leadTimeWeeks: entry.leadTimeWeeks,
        safetyStockNeeded,                 // in stock units
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
