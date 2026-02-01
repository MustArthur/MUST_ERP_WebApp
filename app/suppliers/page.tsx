'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSuppliersStore } from '@/stores/suppliers-store'
import { Supplier, CreateSupplierInput, UpdateSupplierInput } from '@/types/supplier'
import { SupplierTable, SupplierFormModal } from '@/components/suppliers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    Building2,
    Plus,
    RefreshCw,
    Search,
    Users,
    CheckCircle,
    XCircle,
} from 'lucide-react'

export default function SuppliersPage() {
    const {
        suppliers,
        isLoading,
        filters,
        fetchSuppliers,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        setFilters,
    } = useSuppliersStore()

    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

    // Load suppliers on mount
    useEffect(() => {
        fetchSuppliers()
    }, [fetchSuppliers])

    // Filter suppliers
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier => {
            // Search
            const searchLower = filters.search.toLowerCase()
            const matchesSearch = !filters.search ||
                supplier.code.toLowerCase().includes(searchLower) ||
                supplier.name.toLowerCase().includes(searchLower) ||
                (supplier.contactName?.toLowerCase().includes(searchLower)) ||
                (supplier.phone?.includes(searchLower)) ||
                (supplier.email?.toLowerCase().includes(searchLower))

            // Status
            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'active' && supplier.isActive) ||
                (filters.status === 'inactive' && !supplier.isActive)

            return matchesSearch && matchesStatus
        })
    }, [suppliers, filters])

    // Stats
    const stats = useMemo(() => ({
        total: suppliers.length,
        active: suppliers.filter(s => s.isActive).length,
        inactive: suppliers.filter(s => !s.isActive).length,
    }), [suppliers])

    // Handlers
    const handleCreateSupplier = () => {
        setSelectedSupplier(null)
        setShowFormModal(true)
    }

    const handleEditSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier)
        setShowFormModal(true)
    }

    const handleDeletePrompt = (supplier: Supplier) => {
        setSelectedSupplier(supplier)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (selectedSupplier) {
            try {
                await deleteSupplier(selectedSupplier.id)
            } catch (error) {
                console.error('Error deleting supplier:', error)
            }
        }
        setShowDeleteModal(false)
        setSelectedSupplier(null)
    }

    const handleSaveSupplier = async (data: CreateSupplierInput | UpdateSupplierInput, isNew: boolean) => {
        if (isNew) {
            await createSupplier(data as CreateSupplierInput)
        } else if (selectedSupplier) {
            await updateSupplier(selectedSupplier.id, data as UpdateSupplierInput)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
                                <p className="text-gray-500">จัดการข้อมูล Suppliers</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => fetchSuppliers()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                รีเฟรช
                            </Button>
                            <Button onClick={handleCreateSupplier}>
                                <Plus className="w-5 h-5 mr-2" />
                                เพิ่ม Supplier
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">ทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">ใช้งาน</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-100">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">ไม่ใช้งาน</p>
                                <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-100">
                                <XCircle className="w-6 h-6 text-gray-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="ค้นหา รหัส, ชื่อ, ผู้ติดต่อ, เบอร์โทร..."
                                value={filters.search}
                                onChange={(e) => setFilters({ search: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={filters.status}
                            onValueChange={(value: 'all' | 'active' | 'inactive') => setFilters({ status: value })}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="active">ใช้งาน</SelectItem>
                                <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
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
                ) : filteredSuppliers.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบ Supplier</h3>
                        <p className="text-gray-500 mb-4">
                            {filters.search || filters.status !== 'all'
                                ? 'ลองปรับเงื่อนไขการค้นหา'
                                : 'ยังไม่มี Supplier ในระบบ'}
                        </p>
                        <Button onClick={handleCreateSupplier}>
                            <Plus className="w-5 h-5 mr-2" />
                            เพิ่ม Supplier ใหม่
                        </Button>
                    </div>
                ) : (
                    <SupplierTable
                        suppliers={filteredSuppliers}
                        onEdit={handleEditSupplier}
                        onDelete={handleDeletePrompt}
                    />
                )}
            </main>

            {/* Form Modal */}
            <SupplierFormModal
                supplier={selectedSupplier}
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false)
                    setSelectedSupplier(null)
                }}
                onSave={handleSaveSupplier}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการลบ Supplier "{selectedSupplier?.name}" หรือไม่?
                            การลบจะไม่สามารถกู้คืนได้
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
        </div>
    )
}
