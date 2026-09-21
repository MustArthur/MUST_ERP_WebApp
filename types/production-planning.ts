export type PlanningPeriod = 'daily' | 'weekly' | 'monthly'

export type BatchCounts = Record<PlanningPeriod, number>

/**
 * Planned batch counts keyed by recipe family `code`, not by row id.
 * A new recipe version is a new row with a new UUID but the same code, so
 * keying by code is what makes a plan survive re-versioning.
 */
export type BatchCountMap = Record<string, BatchCounts>

/** One rendered row. Derived from recipes + BatchCountMap; never persisted. */
export interface BatchPlanRow {
  recipeId: string
  recipeCode: string
  recipeName: string
  outputItem: string
  outputUom: string
  outputQtyPerBatch: number
  batchCount: number
}

/** Describes the run that produced the current `aggregated` results. */
export interface CalculationSnapshot {
  at: string
  period: PlanningPeriod
  signature: string
  totalBatches: number
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
