'use client'

import { useEffect, useCallback } from 'react'
import { useRecipeStore } from '@/stores/recipe-store'
import { useItemsStore } from '@/stores/items-store'
import { useProductionPlanningStore } from '@/stores/production-planning-store'
import { StockCheckSheet } from '@/components/production-planning/stock-check-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Printer, RotateCcw, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import { PlanningPeriod } from '@/types/production-planning'
import { cn } from '@/lib/utils'

const PERIODS: { value: PlanningPeriod; label: string }[] = [
  { value: 'daily', label: 'รายวัน' },
  { value: 'weekly', label: 'รายสัปดาห์' },
  { value: 'monthly', label: 'รายเดือน' },
]

const statusConfig = {
  OK: { label: 'ปกติ', icon: CheckCircle, className: 'text-green-600 bg-green-50' },
  LOW: { label: 'ต่ำ', icon: AlertTriangle, className: 'text-yellow-600 bg-yellow-50' },
  CRITICAL: { label: 'วิกฤต', icon: AlertCircle, className: 'text-red-600 bg-red-50' },
}

export default function ProductionPlanningPage() {
  const { recipes, fetchRecipes, isLoading: recipesLoading } = useRecipeStore()
  const { items, fetchItems, isLoading: itemsLoading } = useItemsStore()
  const {
    batchPlan,
    aggregated,
    period,
    initPlan,
    setBatchCount,
    calculate,
    setPeriod,
    reset,
  } = useProductionPlanningStore()

  const isLoading = recipesLoading || itemsLoading

  useEffect(() => {
    fetchRecipes()
    fetchItems()
  }, [fetchRecipes, fetchItems])

  useEffect(() => {
    if (recipes.length > 0) {
      initPlan(recipes)
    }
  }, [recipes, initPlan])

  const handleCalculate = useCallback(() => {
    calculate(recipes, items)
  }, [calculate, recipes, items])

  const handlePrint = () => {
    window.print()
  }

  const activeRecipes = recipes.filter(r => r.status === 'ACTIVE')
  const totalBatches = batchPlan.reduce((s, p) => s + p.batchCount, 0)

  const criticalCount = aggregated.filter(m => m.status === 'CRITICAL').length
  const lowCount = aggregated.filter(m => m.status === 'LOW').length

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Screen-only content */}
      <div className="print:hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">วางแผนการผลิต</h1>
                  <p className="text-sm text-gray-500">คำนวณวัตถุดิบและ Safety Stock ตามรอบการผลิต</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={reset} disabled={isLoading}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  รีเซ็ต
                </Button>
                <Button onClick={handleCalculate} disabled={isLoading || totalBatches === 0}>
                  คำนวณวัตถุดิบ
                </Button>
                {aggregated.length > 0 && (
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" />
                    พิมพ์ใบเช็ค Stock
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Period selector */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">รอบการผลิต:</span>
              <div className="flex gap-2">
                {PERIODS.map(p => (
                  <Button
                    key={p.value}
                    variant={period === p.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod(p.value)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Section A: Batch Plan Input */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-800">แผนการผลิต — จำนวน Batch ต่อสูตร</h2>
              <p className="text-xs text-gray-500 mt-0.5">ใส่จำนวน Batch ที่ต้องการผลิตในแต่ละสูตร แล้วกด "คำนวณวัตถุดิบ"</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
                <p className="mt-2 text-gray-500">กำลังโหลด...</p>
              </div>
            ) : activeRecipes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarDays className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>ยังไม่มีสูตรการผลิตที่ใช้งานอยู่</p>
                <p className="text-xs mt-1">กรุณาเพิ่มสูตรที่มีสถานะ "ใช้งาน" ก่อน</p>
              </div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">รหัสสูตร</th>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">ชื่อสูตร</th>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">สินค้าที่ได้</th>
                      <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600 w-36">จำนวน Batch</th>
                      <th className="px-4 py-2.5 text-right text-sm font-medium text-gray-600">ผลผลิตรวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batchPlan.map(plan => (
                      <tr key={plan.recipeId} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-sm text-blue-600">{plan.recipeCode}</span>
                        </td>
                        <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{plan.recipeName}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">{plan.outputItem}</td>
                        <td className="px-4 py-2.5">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={plan.batchCount || ''}
                            placeholder="0"
                            className="text-center h-8 w-full"
                            onChange={e => setBatchCount(plan.recipeId, parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm text-gray-700">
                          {plan.batchCount > 0
                            ? `${(plan.outputQtyPerBatch * plan.batchCount).toLocaleString('th-TH', { maximumFractionDigits: 2 })} ${plan.outputUom}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-2.5 text-sm font-medium text-gray-700">รวมทั้งหมด</td>
                      <td className="px-4 py-2.5 text-center text-sm font-bold text-blue-600">{totalBatches} Batch</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Section B: Aggregated Materials */}
          {aggregated.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">วัตถุดิบที่ต้องใช้</h2>
                  <p className="text-xs text-gray-500 mt-0.5">รวมจากทุกสูตร คำนวณรวม Scrap แล้ว</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {criticalCount > 0 && (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      วิกฤต {criticalCount} รายการ
                    </span>
                  )}
                  {lowCount > 0 && (
                    <span className="flex items-center gap-1 text-yellow-600 font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      ต่ำ {lowCount} รายการ
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">รหัส</th>
                      <th className="px-4 py-2.5 text-left text-sm font-medium text-gray-600">ชื่อวัตถุดิบ</th>
                      <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600">หน่วย</th>
                      <th className="px-4 py-2.5 text-right text-sm font-medium text-gray-600">ต้องใช้ 1 รอบ</th>
                      <th className="px-4 py-2.5 text-right text-sm font-medium text-gray-600">Stock ปัจจุบัน</th>
                      <th className="px-4 py-2.5 text-right text-sm font-medium text-gray-600">Safety Stock<br /><span className="font-normal text-xs">(Lead Time × รายสัปดาห์)</span></th>
                      <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600">Lead Time<br />(สัปดาห์)</th>
                      <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600">พอกี่ Batch</th>
                      <th className="px-4 py-2.5 text-center text-sm font-medium text-gray-600">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {aggregated.map(m => {
                      const cfg = statusConfig[m.status]
                      const Icon = cfg.icon
                      return (
                        <tr key={m.itemId} className={cn(
                          'hover:bg-gray-50',
                          m.status === 'CRITICAL' && 'bg-red-50/40',
                          m.status === 'LOW' && 'bg-yellow-50/40',
                        )}>
                          <td className="px-4 py-2.5 font-mono text-sm text-blue-600">{m.itemCode}</td>
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{m.itemName}</td>
                          <td className="px-4 py-2.5 text-sm text-center text-gray-600">{m.uom}</td>
                          <td className="px-4 py-2.5 text-sm text-right text-gray-800">
                            {m.totalQty.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-right font-medium">
                            <span className={m.currentStock < m.safetyStockNeeded ? 'text-red-600' : 'text-gray-800'}>
                              {m.currentStock.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-right text-gray-800">
                            {m.safetyStockNeeded.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-center text-gray-600">{m.leadTimeWeeks}</td>
                          <td className="px-4 py-2.5 text-sm text-center font-medium text-gray-800">
                            {m.coverageBatches >= 999 ? '∞' : m.coverageBatches}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full', cfg.className)}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state for Section B */}
          {aggregated.length === 0 && totalBatches > 0 && (
            <div className="bg-white rounded-xl shadow-sm border text-center py-12 text-gray-500">
              <p>กด "คำนวณวัตถุดิบ" เพื่อดูรายการวัตถุดิบที่ต้องใช้</p>
            </div>
          )}
        </main>
      </div>

      {/* Print-only stock check sheet */}
      <StockCheckSheet materials={aggregated} period={period} />
    </div>
  )
}
