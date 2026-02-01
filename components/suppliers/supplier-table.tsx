'use client'

import { useRouter } from 'next/navigation'
import { Supplier } from '@/types/supplier'
import { SupplierItem } from '@/lib/api/suppliers'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Edit2,
    Trash2,
    Building2,
    Star,
    Package,
} from 'lucide-react'

interface SupplierWithItems extends Supplier {
    items?: SupplierItem[]
}

interface SupplierTableProps {
    suppliers: SupplierWithItems[]
    onEdit: (supplier: Supplier) => void
    onDelete: (supplier: Supplier) => void
    onView?: (supplier: Supplier) => void
}

export function SupplierTable({ suppliers, onEdit, onDelete, onView }: SupplierTableProps) {
    const router = useRouter()

    const handleRowClick = (supplier: Supplier) => {
        if (onView) {
            onView(supplier)
        } else {
            router.push(`/suppliers/${supplier.id}`)
        }
    }

    // Flatten suppliers with items for table display
    const tableRows: { supplier: SupplierWithItems; item?: SupplierItem; isFirst: boolean; rowSpan: number }[] = []

    suppliers.forEach(supplier => {
        const items = supplier.items || []
        if (items.length === 0) {
            tableRows.push({ supplier, item: undefined, isFirst: true, rowSpan: 1 })
        } else {
            items.forEach((item, index) => {
                tableRows.push({
                    supplier,
                    item,
                    isFirst: index === 0,
                    rowSpan: items.length
                })
            })
        }
    })

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">รหัส</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ชื่อ Supplier</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ชื่อสินค้า</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Part Number</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">ราคาซื้อ</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">หน่วย</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">สถานะ</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tableRows.map((row, index) => (
                            <tr
                                key={`${row.supplier.id}-${row.item?.id || 'no-item'}-${index}`}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => handleRowClick(row.supplier)}
                            >
                                {row.isFirst && (
                                    <>
                                        <td className="px-4 py-3" rowSpan={row.rowSpan}>
                                            <span className="font-mono text-sm font-medium text-gray-900">
                                                {row.supplier.code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3" rowSpan={row.rowSpan}>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">{row.supplier.name}</span>
                                            </div>
                                        </td>
                                    </>
                                )}
                                <td className="px-4 py-3">
                                    {row.item ? (
                                        <div className="flex items-center gap-2">
                                            {row.item.isPreferred && (
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{row.item.itemName}</div>
                                                <div className="text-xs text-gray-500 font-mono">{row.item.itemCode}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm flex items-center gap-1">
                                            <Package className="w-3 h-3" />
                                            ไม่มีสินค้า
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm font-mono text-gray-600">
                                    {row.item?.supplierPartNumber || '-'}
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-medium">
                                    {row.item ? formatCurrency(row.item.purchasePrice) : '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {row.item?.purchaseUomCode ? (
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {row.item.purchaseUomCode}
                                        </Badge>
                                    ) : '-'}
                                </td>
                                {row.isFirst && (
                                    <>
                                        <td className="px-4 py-3 text-center" rowSpan={row.rowSpan}>
                                            {row.supplier.isActive ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ใช้งาน</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-500">ไม่ใช้งาน</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center" rowSpan={row.rowSpan} onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(row.supplier)}
                                                    title="แก้ไข"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDelete(row.supplier)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary */}
            <div className="bg-gray-50 px-4 py-3 border-t">
                <span className="text-sm text-gray-500">
                    แสดง {suppliers.length} Suppliers
                </span>
            </div>
        </div>
    )
}

