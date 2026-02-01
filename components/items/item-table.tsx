'use client'

import { Item } from '@/types/item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
    Edit2,
    Trash2,
    Package,
    Box,
    Tag,
} from 'lucide-react'

interface ItemTableProps {
    items: Item[]
    onEdit: (item: Item) => void
    onDelete: (item: Item) => void
}

const getItemTypeBadge = (code: string) => {
    if (code.startsWith('RM-')) {
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Package className="w-3 h-3 mr-1" />วัตถุดิบ</Badge>
    }
    if (code.startsWith('FG-')) {
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><Box className="w-3 h-3 mr-1" />สินค้าสำเร็จ</Badge>
    }
    if (code.startsWith('PKG-')) {
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100"><Tag className="w-3 h-3 mr-1" />บรรจุภัณฑ์</Badge>
    }
    return <Badge variant="outline">อื่นๆ</Badge>
}

export function ItemTable({ items, onEdit, onDelete }: ItemTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">รหัส</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ชื่อ</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">ประเภท</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">หมวดหมู่</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">หน่วย</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">ราคา/หน่วย</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">สถานะ</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <span className="font-mono text-sm font-medium text-gray-900">{item.code}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-gray-900">{item.name}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {getItemTypeBadge(item.code)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {item.categoryName || '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Badge variant="outline" className="font-mono">
                                        {item.baseUomCode || '-'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(item.lastPurchaseCost)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {item.isActive ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ใช้งาน</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-gray-500">ไม่ใช้งาน</Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(item)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(item)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary */}
            <div className="bg-gray-50 px-4 py-3 border-t">
                <span className="text-sm text-gray-500">
                    แสดง {items.length} รายการ
                </span>
            </div>
        </div>
    )
}
