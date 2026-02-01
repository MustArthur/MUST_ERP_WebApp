'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Supplier } from '@/types/supplier'
import { getSupplierItems, SupplierItem } from '@/lib/api/suppliers'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
    Package,
    Star,
    Loader2,
    ExternalLink,
} from 'lucide-react'

interface SupplierItemsSectionProps {
    supplier: Supplier
}

export function SupplierItemsSection({ supplier }: SupplierItemsSectionProps) {
    const [items, setItems] = useState<SupplierItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadItems() {
            setIsLoading(true)
            const data = await getSupplierItems(supplier.id)
            setItems(data)
            setIsLoading(false)
        }
        loadItems()
    }, [supplier.id])

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">สินค้าที่จำหน่าย</h3>
                    <Badge variant="outline" className="ml-2">{items.length} รายการ</Badge>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>ยังไม่มีสินค้าที่ผูกกับ Supplier นี้</p>
                    <p className="text-sm">ไปที่หน้า Items เพื่อเพิ่ม Supplier ให้กับสินค้า</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">รหัสสินค้า</th>
                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">ชื่อสินค้า</th>
                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">หมวดหมู่</th>
                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Part Number</th>
                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">ราคาซื้อ</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600">หน่วย</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            {item.isPreferred && (
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            )}
                                            <span className="font-mono text-sm font-medium">{item.itemCode}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className="text-gray-900">{item.itemName}</span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                        {item.categoryName || '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className="font-mono text-sm">{item.supplierPartNumber || '-'}</span>
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">
                                        {formatCurrency(item.purchasePrice)}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <Badge variant="outline">{item.purchaseUomCode || '-'}</Badge>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <Link
                                            href={`/items/${item.itemId}`}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="ดูรายละเอียดสินค้า"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
