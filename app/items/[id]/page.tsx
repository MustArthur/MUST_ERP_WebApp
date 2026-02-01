'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Item as ItemType, UnitOfMeasure, Category, UpdateItemInput } from '@/types/item'
import { getAllItems, updateItem, getCategories, getUnitsOfMeasure } from '@/lib/api/items'
import { ItemFormModal, ItemSupplierSection } from '@/components/items'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import {
    ArrowLeft,
    Edit2,
    Package,
    Box,
    Tag,
    RefreshCw,
} from 'lucide-react'

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

export default function ItemDetailPage() {
    const params = useParams()
    const router = useRouter()
    const itemId = params.id as string

    const [item, setItem] = useState<ItemType | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [uoms, setUoms] = useState<UnitOfMeasure[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)

    // Load item data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true)
            const [items, cats, units] = await Promise.all([
                getAllItems(),
                getCategories(),
                getUnitsOfMeasure(),
            ])
            const foundItem = items.find(i => i.id === itemId)
            setItem(foundItem || null)
            setCategories(cats)
            setUoms(units)
            setIsLoading(false)
        }
        loadData()
    }, [itemId])

    const handleSaveItem = async (data: UpdateItemInput) => {
        if (!item) return
        try {
            const updated = await updateItem(item.id, data)
            if (updated) {
                setItem(updated)
            }
        } catch (error) {
            console.error('Error updating item:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบรายการ</h2>
                <p className="text-gray-500 mb-4">รายการที่ค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
                <Button onClick={() => router.push('/items')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    กลับไปหน้ารายการ
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => router.push('/items')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                กลับ
                            </Button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                                    {getItemTypeBadge(item.code)}
                                </div>
                                <p className="text-gray-500 font-mono">{item.code}</p>
                            </div>
                        </div>
                        <Button onClick={() => setShowEditModal(true)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            แก้ไขข้อมูล
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">ข้อมูลพื้นฐาน</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">รหัส</p>
                            <p className="font-mono font-medium">{item.code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ชื่อ</p>
                            <p className="font-medium">{item.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">หมวดหมู่</p>
                            <p className="font-medium">{item.categoryName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">หน่วยฐาน</p>
                            <Badge variant="outline">{item.baseUomCode}</Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ราคาล่าสุด</p>
                            <p className="font-medium text-lg">{formatCurrency(item.lastPurchaseCost)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">สถานะ</p>
                            {item.isActive ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ใช้งาน</Badge>
                            ) : (
                                <Badge variant="outline" className="text-gray-500">ไม่ใช้งาน</Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Supplier Section */}
                <ItemSupplierSection item={item} />
            </main>

            {/* Edit Modal */}
            <ItemFormModal
                item={item}
                categories={categories}
                uoms={uoms}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={async (data, isNew) => {
                    await handleSaveItem(data as UpdateItemInput)
                }}
            />
        </div>
    )
}
