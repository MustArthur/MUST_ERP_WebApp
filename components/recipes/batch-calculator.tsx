'use client'

import { useState } from 'react'
import { Recipe } from '@/types/recipe'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calculateIngredientCost } from '@/stores/recipe-store'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface BatchCalculatorProps {
  recipe: Recipe
}

export function BatchCalculator({ recipe }: BatchCalculatorProps) {
  const [batchMultiplier, setBatchMultiplier] = useState(1)

  const calculateTotal = () => {
    return recipe.ingredients.reduce((sum, ing) => {
      const { totalCost } = calculateIngredientCost(ing.qty, ing.scrap, ing.cost)
      return sum + totalCost
    }, 0)
  }

  const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    setBatchMultiplier(Math.max(1, Math.min(100, value)))
  }

  const baseCost = calculateTotal()

  return (
    <div className="space-y-4">
      {/* Batch Input */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">คำนวณวัตถุดิบตามจำนวน Batch</h4>
        <div className="flex items-center gap-4">
          <Label htmlFor="batch" className="text-sm text-blue-700">จำนวน Batch:</Label>
          <Input
            id="batch"
            type="number"
            min={1}
            max={100}
            value={batchMultiplier}
            onChange={handleBatchChange}
            className="w-24 text-center font-bold text-lg"
          />
          <span className="text-blue-700">
            = <strong>{formatNumber(recipe.outputQty * batchMultiplier)}</strong> {recipe.outputUom}
          </span>
        </div>
      </div>

      {/* Calculated Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">วัตถุดิบ</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">ต่อ Batch</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                รวม {batchMultiplier} Batch
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">ต้นทุนรวม</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recipe.ingredients.map(ing => {
              const { qtyWithScrap, totalCost } = calculateIngredientCost(ing.qty, ing.scrap, ing.cost)
              const totalQty = qtyWithScrap * batchMultiplier
              const scaledCost = totalCost * batchMultiplier

              return (
                <tr key={ing.id}>
                  <td className="px-3 py-2 text-sm">{ing.item}</td>
                  <td className="px-3 py-2 text-sm text-right">
                    {formatNumber(qtyWithScrap, 2)} {ing.uom}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-blue-600">
                    {formatNumber(totalQty, 2)} {ing.uom}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(scaledCost)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-green-50">
            <tr>
              <td colSpan={3} className="px-3 py-3 text-right font-medium">
                ต้นทุนรวม ({batchMultiplier} Batch):
              </td>
              <td className="px-3 py-3 text-right font-bold text-green-600 text-lg">
                {formatCurrency(baseCost * batchMultiplier)}
              </td>
            </tr>
            <tr className="bg-green-100">
              <td colSpan={3} className="px-3 py-2 text-right text-sm text-gray-600">
                ต้นทุนต่อหน่วย:
              </td>
              <td className="px-3 py-2 text-right font-medium">
                {formatCurrency(baseCost / recipe.outputQty)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
