export type PlanningPeriod = 'daily' | 'weekly' | 'monthly'

export interface BatchPlanItem {
  recipeId: string
  recipeCode: string
  recipeName: string
  outputItem: string
  outputUom: string
  outputQtyPerBatch: number
  batchCounts: Record<PlanningPeriod, number>
}

export interface AggregatedMaterial {
  itemId: string
  itemCode: string
  itemName: string
  totalQty: number
  uom: string
  currentStock: number
  leadTimeWeeks: number
  safetyStockNeeded: number
  coverageBatches: number
  status: 'OK' | 'LOW' | 'CRITICAL'
}
