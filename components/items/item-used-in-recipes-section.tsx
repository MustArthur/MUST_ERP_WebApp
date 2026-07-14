'use client'

import { useEffect, useState } from 'react'
import { Item } from '@/types/item'
import { getActiveRecipeUsagesByItemId, RecipeUsage } from '@/lib/api/recipes'
import { FlaskConical, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemUsedInRecipesSectionProps {
    item: Item
}

export function ItemUsedInRecipesSection({ item }: ItemUsedInRecipesSectionProps) {
    const [usages, setUsages] = useState<RecipeUsage[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        async function load() {
            setIsLoading(true)
            const data = await getActiveRecipeUsagesByItemId(item.id)
            if (!cancelled) {
                setUsages(data)
                setIsLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [item.id])

    const convFactor = Math.max(0.000001, item.stockConversionFactor || 1)

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">ใช้ในสูตรการผลิต</h3>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            ) : usages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <FlaskConical className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>ยังไม่มีสูตรการผลิตที่ใช้งานอยู่ใช้วัตถุดิบนี้</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">รหัสสูตร</th>
                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">ชื่อสูตร</th>
                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">ปริมาณใช้/Batch</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600">Scrap</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600">พอผลิตได้อีก</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usages.map(u => {
                                const usagePerBatchStock = (u.qtyPerBatch * (1 + u.scrapPercent / 100)) / convFactor
                                const coverageBatches = usagePerBatchStock > 0
                                    ? Math.floor(item.stockQty / usagePerBatchStock)
                                    : 0

                                return (
                                    <tr key={u.recipeId} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-mono text-sm text-blue-600">{u.recipeCode}</td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{u.recipeName}</td>
                                        <td className="px-3 py-2 text-right text-sm text-gray-700">
                                            {u.qtyPerBatch.toLocaleString('th-TH', { maximumFractionDigits: 2 })} {u.uom}
                                        </td>
                                        <td className="px-3 py-2 text-center text-sm text-gray-500">
                                            {u.scrapPercent > 0 ? `${u.scrapPercent}%` : '-'}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={cn(
                                                'inline-block text-sm font-semibold px-2 py-0.5 rounded',
                                                coverageBatches === 0
                                                    ? 'text-red-700 bg-red-100'
                                                    : coverageBatches < 10
                                                    ? 'text-yellow-700 bg-yellow-100'
                                                    : 'text-green-700 bg-green-100'
                                            )}>
                                                {coverageBatches.toLocaleString('th-TH')} Batch
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
