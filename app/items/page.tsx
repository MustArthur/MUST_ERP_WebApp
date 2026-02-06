'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { useItemsStore } from '@/stores/items-store'
import { Item, CreateItemInput, UpdateItemInput } from '@/types/item'
import { ItemTable, ItemFormModal, QuickReceiveModal } from '@/components/items'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Plus,
    Search,
    Package,
    Box,
    Tag,
    RefreshCw,
    ArrowDownLeft,
    ArrowLeft,
} from 'lucide-react'

export default function ItemsPage() {
    const {
        items,
        categories,
        uoms,
        isLoading,
        filters,
        fetchItems,
        fetchCategories,
        fetchUOMs,
        createItem,
        updateItem,
        deleteItem,
        setFilters,
    } = useItemsStore()

    // Modals
    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showReceiveModal, setShowReceiveModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState<Item | null>(null)

    // Load data on mount
    useEffect(() => {
        fetchItems()
        fetchCategories()
        fetchUOMs()
    }, [fetchItems, fetchCategories, fetchUOMs])

    // Filter items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Search filter
            if (filters.search) {
                const search = filters.search.toLowerCase()
                if (!item.code.toLowerCase().includes(search) &&
                    !item.name.toLowerCase().includes(search)) {
                    return false
                }
            }
            // Type filter
            if (filters.type !== 'ALL') {
                if (filters.type === 'RAW_MATERIAL' && !item.code.startsWith('RM-')) return false
                if (filters.type === 'FINISHED_GOOD' && !item.code.startsWith('FG-')) return false
                if (filters.type === 'PACKAGING' && !item.code.startsWith('PKG-')) return false
            }
            // Category filter
            if (filters.categoryId && item.categoryId !== filters.categoryId) {
                return false
            }
            return true
        })
    }, [items, filters])

    // Stats
    const stats = useMemo(() => ({
        total: items.length,
        rawMaterials: items.filter(i => i.code.startsWith('RM-')).length,
        finishedGoods: items.filter(i => i.code.startsWith('FG-')).length,
        lowStock: items.filter(i => i.isLowStock).length,
    }), [items])

    // Handlers
    const handleCreateItem = () => {
        setSelectedItem(null)
        setShowFormModal(true)
    }

    const handleEditItem = (item: Item) => {
        setSelectedItem(item)
        setShowFormModal(true)
    }

    const handleDeletePrompt = (item: Item) => {
        setSelectedItem(item)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (selectedItem) {
            try {
                await deleteItem(selectedItem.id)
            } catch (error) {
                console.error('Error deleting item:', error)
            }
        }
        setShowDeleteModal(false)
        setSelectedItem(null)
    }

    const handleSaveItem = async (data: CreateItemInput | UpdateItemInput, isNew: boolean) => {
        if (isNew) {
            await createItem(data as CreateItemInput)
        } else if (selectedItem) {
            await updateItem(selectedItem.id, data as UpdateItemInput)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    หน้าแรก
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">จัดการรายการสินค้า</h1>
                                <p className="text-gray-500">Master Data - วัตถุดิบ, สินค้าสำเร็จ, บรรจุภัณฑ์</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => fetchItems()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                รีเฟรช
                            </Button>
                            <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => { setSelectedItem(null); setShowReceiveModal(true) }}>
                                <ArrowDownLeft className="w-4 h-4 mr-2" />
                                บันทึกรับเข้า
                            </Button>
                            <Button onClick={handleCreateItem}>
                                <Plus className="w-5 h-5 mr-2" />
                                เพิ่มรายการใหม่
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100">
                                <Package className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">วัตถุดิบ</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.rawMaterials}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                                <Box className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">สินค้าสำเร็จ</p>
                                <p className="text-2xl font-bold text-green-600">{stats.finishedGoods}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stats.lowStock > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                                <Tag className={`w-5 h-5 ${stats.lowStock > 0 ? 'text-red-600' : 'text-gray-600'}`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">สต็อกต่ำ</p>
                                <p className={`text-2xl font-bold ${stats.lowStock > 0 ? 'text-red-600' : 'text-gray-600'}`}>{stats.lowStock}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="ค้นหารหัส, ชื่อ..."
                                className="pl-10"
                                value={filters.search}
                                onChange={(e) => setFilters({ search: e.target.value })}
                            />
                        </div>
                        <Select
                            value={filters.type}
                            onValueChange={(value) => setFilters({ type: value as any })}
                        >
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="ประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">ทั้งหมด</SelectItem>
                                <SelectItem value="RAW_MATERIAL">วัตถุดิบ (RM-)</SelectItem>
                                <SelectItem value="FINISHED_GOOD">สินค้าสำเร็จ (FG-)</SelectItem>
                                <SelectItem value="PACKAGING">บรรจุภัณฑ์ (PKG-)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.categoryId || 'all'}
                            onValueChange={(value) => setFilters({ categoryId: value === 'all' ? '' : value })}
                        >
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="หมวดหมู่" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="bg-white rounded-xl shadow-sm border p-8">
                        <div className="animate-pulse space-y-4">
                            <div className="h-10 bg-gray-200 rounded w-full" />
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 bg-gray-100 rounded w-full" />
                            ))}
                        </div>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบรายการ</h3>
                        <p className="text-gray-500 mb-4">
                            {filters.search || filters.type !== 'ALL' || filters.categoryId
                                ? 'ลองปรับเงื่อนไขการค้นหา'
                                : 'ยังไม่มีรายการสินค้าในระบบ'}
                        </p>
                        <Button onClick={handleCreateItem}>
                            <Plus className="w-5 h-5 mr-2" />
                            เพิ่มรายการใหม่
                        </Button>
                    </div>
                ) : (
                    <ItemTable
                        items={filteredItems}
                        onEdit={handleEditItem}
                        onDelete={handleDeletePrompt}
                    />
                )}
            </main>

            {/* Form Modal */}
            <ItemFormModal
                item={selectedItem}
                categories={categories}
                uoms={uoms}
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false)
                    setSelectedItem(null)
                }}
                onSave={handleSaveItem}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการลบ "{selectedItem?.name}" ({selectedItem?.code}) หรือไม่?
                            <br />
                            การกระทำนี้ไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            ลบ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Quick Receive Modal */}
            <QuickReceiveModal
                item={selectedItem}
                items={items}
                uoms={uoms}
                isOpen={showReceiveModal}
                onClose={() => setShowReceiveModal(false)}
                onSuccess={() => fetchItems()}
            />
        </div>
    )
}
