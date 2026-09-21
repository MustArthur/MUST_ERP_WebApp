import { Recipe } from '@/types/recipe'
import { BatchCountMap, BatchCounts, PlanningPeriod } from '@/types/production-planning'

export const EMPTY_BATCH_COUNTS: BatchCounts = { daily: 0, weekly: 0, monthly: 0 }

export const PLANNING_PERIODS: PlanningPeriod[] = ['daily', 'weekly', 'monthly']

export function isPlanningPeriod(value: unknown): value is PlanningPeriod {
  return value === 'daily' || value === 'weekly' || value === 'monthly'
}

export function periodMultiplier(period: PlanningPeriod): number {
  if (period === 'daily') return 1 / 7
  if (period === 'monthly') return 4
  return 1
}

/**
 * The recipes the planning table works with: ACTIVE only, one row per family
 * `code`. Demote-on-activate is best-effort (see lib/api/recipes.ts), so two
 * ACTIVE rows can share a code after a partial failure — keep the highest
 * version. The incoming order is preserved so the table keeps its existing
 * `updated_at DESC` ordering.
 */
export function selectActiveRecipes(recipes: Recipe[]): Recipe[] {
  const byCode = new Map<string, Recipe>()

  for (const recipe of recipes) {
    if (recipe.status !== 'ACTIVE') continue
    const existing = byCode.get(recipe.code)
    if (!existing || recipe.version > existing.version) {
      byCode.set(recipe.code, recipe)
    }
  }

  return Array.from(byCode.values())
}

/**
 * Fingerprint of the inputs a calculation ran on. Comparing it against the
 * snapshot stored with the results tells the page whether they are stale.
 * The period is part of it because the results are period-scoped.
 */
export function buildCalcSignature(period: PlanningPeriod, batchCounts: BatchCountMap): string {
  const parts = Object.keys(batchCounts)
    .sort()
    .map(code => [code, batchCounts[code]?.[period] ?? 0] as const)
    .filter(([, count]) => count > 0)
    .map(([code, count]) => `${code}:${count}`)

  return `${period}|${parts.join(',')}`
}

export function formatCalculatedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}
