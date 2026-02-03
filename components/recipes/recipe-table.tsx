'use client'

import { Recipe } from '@/types/recipe'
import { StatusBadge } from './status-badge'
import { Edit, Copy, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'

interface RecipeTableProps {
    recipes: Recipe[]
    onView: (recipe: Recipe) => void
    onEdit?: (recipe: Recipe) => void
    onDuplicate?: (recipe: Recipe) => void
}

export function RecipeTable({ recipes, onView, onEdit, onDuplicate }: RecipeTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-auto max-h-[70vh] relative">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-600 shadow-sm">รหัสสูตร</th>
                            <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-600 shadow-sm">ชื่อสูตร</th>
                            <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-600 shadow-sm">สินค้าที่ได้</th>
                            <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-right text-sm font-medium text-gray-600 shadow-sm">จำนวนที่ได้</th>
                            <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-center text-sm font-medium text-gray-600 shadow-sm">ส่วนผสม</th>
                            <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-center text-sm font-medium text-gray-600 shadow-sm">Yield</th>
                            <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-center text-sm font-medium text-gray-600 shadow-sm">Version</th>
                            <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-center text-sm font-medium text-gray-600 shadow-sm">สถานะ</th>
                            <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-600 shadow-sm">อัพเดทล่าสุด</th>
                            <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-center text-sm font-medium text-gray-600 shadow-sm">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {recipes.map((recipe) => (
                            <tr
                                key={recipe.id}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => onView(recipe)}
                            >
                                <td className="px-4 py-3">
                                    <span className="font-mono text-sm font-medium text-blue-600">{recipe.code}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-medium text-gray-900">{recipe.name}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {recipe.outputItem}
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-gray-900">
                                    {recipe.outputQty} {recipe.outputUom}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-gray-600">
                                    {recipe.ingredients.length}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={recipe.expectedYield >= 90 ? "text-green-600 font-medium" : "text-yellow-600"}>
                                        {recipe.expectedYield}%
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-gray-500">
                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">v{recipe.version}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <StatusBadge status={recipe.status} />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {formatDateTime(recipe.updatedAt)}
                                </td>
                                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onView(recipe)}
                                            title="ดูรายละเอียด"
                                        >
                                            <Eye className="w-4 h-4 text-gray-500" />
                                        </Button>
                                        {onEdit && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(recipe)}
                                                title="แก้ไข"
                                            >
                                                <Edit className="w-4 h-4 text-blue-600" />
                                            </Button>
                                        )}
                                        {onDuplicate && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDuplicate(recipe)}
                                                title="คัดลอก"
                                            >
                                                <Copy className="w-4 h-4 text-gray-500" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t">
                <span className="text-sm text-gray-500">
                    แสดง {recipes.length} รายการ
                </span>
            </div>
        </div>
    )
}
