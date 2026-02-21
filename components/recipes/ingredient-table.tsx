'use client'

import Link from 'next/link'
import { Ingredient } from '@/types/recipe'
import { calculateIngredientCost } from '@/stores/recipe-store'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface IngredientTableProps {
  ingredients: Ingredient[]
  batchMultiplier?: number
  showTotal?: boolean
}

export function IngredientTable({ ingredients, batchMultiplier = 1, showTotal = true }: IngredientTableProps) {
  const calculateTotal = () => {
    return ingredients.reduce((sum, ing) => {
      const { totalCost } = calculateIngredientCost(ing.qty, ing.scrap, ing.cost)
      return sum + (totalCost * batchMultiplier)
    }, 0)
  }

  const total = calculateTotal()

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">รหัส</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">วัตถุดิบ</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">ปริมาณ/Batch</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">% ของเสีย</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">รวมของเสีย</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">ต้นทุน/หน่วย</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">ต้นทุนรวม</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">หลัก</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {ingredients.map(ing => {
            const { qtyWithScrap, totalCost } = calculateIngredientCost(ing.qty, ing.scrap, ing.cost)
            const scaledQty = qtyWithScrap * batchMultiplier
            const scaledCost = totalCost * batchMultiplier

            return (
              <tr key={ing.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-500">{ing.lineNo}</td>
                <td className="px-3 py-2 text-sm font-mono">
                  <Link href={`/items/${ing.itemId}`} className="text-blue-600 hover:underline">
                    {ing.code}
                  </Link>
                </td>
                <td className="px-3 py-2 text-sm">
                  <Link href={`/items/${ing.itemId}`} className="hover:text-blue-600 hover:underline">
                    {ing.item}
                  </Link>
                </td>
                <td className="px-3 py-2 text-sm text-right">
                  {formatNumber(ing.qty * batchMultiplier, 2)} {ing.uom}
                </td>
                <td className="px-3 py-2 text-sm text-right text-orange-600">
                  {ing.scrap > 0 ? `${ing.scrap}%` : '-'}
                </td>
                <td className="px-3 py-2 text-sm text-right font-medium">
                  {formatNumber(scaledQty, 2)} {ing.uom}
                </td>
                <td className="px-3 py-2 text-sm text-right text-gray-500">
                  {formatCurrency(ing.cost)}
                </td>
                <td className="px-3 py-2 text-sm text-right font-medium">
                  {formatCurrency(scaledCost)}
                </td>
                <td className="px-3 py-2 text-center">
                  {ing.isCritical && <span className="text-red-500">●</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
        {showTotal && (
          <tfoot className="bg-blue-50">
            <tr>
              <td colSpan={7} className="px-3 py-3 text-right font-medium">
                ต้นทุนวัตถุดิบรวม{batchMultiplier > 1 ? ` (${batchMultiplier} Batch)` : ' ต่อ Batch'}:
              </td>
              <td className="px-3 py-3 text-right font-bold text-blue-600">
                {formatCurrency(total)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
