'use client'

import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useFactoryExpensesStore } from '@/stores/factory-expenses-store'
import {
    FactoryExpense,
    CreateFactoryExpenseInput,
    UpdateFactoryExpenseInput,
    ExpenseCategory,
} from '@/types/factory-expense'
import { ExpenseTable, ExpenseFormModal } from '@/components/factory-expenses'
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
import { formatCurrency } from '@/lib/utils'
import {
    Receipt,
    Plus,
    RefreshCw,
    Search,
    Truck,
    Wrench,
    Package,
} from 'lucide-react'

export default function FactoryExpensesPage() {
    const {
        expenses,
        vehicles,
        machines,
        isLoading,
        filters,
        fetchExpenses,
        fetchVehicles,
        fetchMachines,
        createExpense,
        updateExpense,
        deleteExpense,
        setFilters,
    } = useFactoryExpensesStore()

    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedExpense, setSelectedExpense] = useState<FactoryExpense | null>(null)

    useEffect(() => {
        fetchExpenses()
        fetchVehicles()
        fetchMachines()
    }, [fetchExpenses, fetchVehicles, fetchMachines])

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const searchLower = filters.search.toLowerCase()
            const matchesSearch = !filters.search ||
                expense.code.toLowerCase().includes(searchLower) ||
                (expense.description?.toLowerCase().includes(searchLower)) ||
                (expense.vehicleName?.toLowerCase().includes(searchLower)) ||
                (expense.machineName?.toLowerCase().includes(searchLower))

            const matchesCategory = filters.category === 'all' || expense.category === filters.category
            const matchesSubcategory = filters.subcategory === 'all' || expense.subcategory === filters.subcategory

            return matchesSearch && matchesCategory && matchesSubcategory
        })
    }, [expenses, filters])

    const stats = useMemo(() => {
        const now = new Date()
        const thisMonthExpenses = expenses.filter(e => {
            const d = new Date(e.expenseDate)
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
        })
        return {
            totalThisMonth: thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0),
            logisticsCount: expenses.filter(e => e.category === 'LOGISTICS').length,
            maintenanceCount: expenses.filter(e => e.category === 'MAINTENANCE').length,
            suppliesCount: expenses.filter(e => e.category === 'FACTORY_SUPPLIES').length,
        }
    }, [expenses])

    const handleCreateExpense = () => {
        setSelectedExpense(null)
        setShowFormModal(true)
    }

    const handleEditExpense = (expense: FactoryExpense) => {
        setSelectedExpense(expense)
        setShowFormModal(true)
    }

    const handleDeletePrompt = (expense: FactoryExpense) => {
        setSelectedExpense(expense)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedExpense) return
        try {
            await deleteExpense(selectedExpense.id)
            toast.success('ลบค่าใช้จ่ายสำเร็จ')
            setShowDeleteModal(false)
            setSelectedExpense(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'ไม่สามารถลบค่าใช้จ่ายได้')
        }
    }

    const handleSaveExpense = async (data: CreateFactoryExpenseInput | UpdateFactoryExpenseInput, isNew: boolean) => {
        try {
            if (isNew) {
                await createExpense(data as CreateFactoryExpenseInput)
                toast.success('บันทึกค่าใช้จ่ายสำเร็จ')
            } else if (selectedExpense) {
                await updateExpense(selectedExpense.id, data as UpdateFactoryExpenseInput)
                toast.success('แก้ไขค่าใช้จ่ายสำเร็จ')
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'ไม่สามารถบันทึกค่าใช้จ่ายได้')
            throw error
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">ค่าใช้จ่ายโรงงาน</h1>
                            <p className="text-sm text-gray-500">บันทึกค่าใช้จ่าย Logistics, Maintenance และ Factory Supplies</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => fetchExpenses()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                รีเฟรช
                            </Button>
                            <Button onClick={handleCreateExpense}>
                                <Plus className="w-5 h-5 mr-2" />
                                เพิ่มค่าใช้จ่าย
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <Receipt className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ค่าใช้จ่ายเดือนนี้</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalThisMonth)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Truck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Logistics</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.logisticsCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100">
                                <Wrench className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Maintenance</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.maintenanceCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Factory Supplies</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.suppliesCount}</p>
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
                                placeholder="ค้นหา รหัส, รายละเอียด, รถ, เครื่องจักร..."
                                value={filters.search}
                                onChange={(e) => setFilters({ search: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={filters.category}
                            onValueChange={(value: 'all' | ExpenseCategory) => setFilters({ category: value, subcategory: 'all' })}
                        >
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="หมวดหมู่" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                                <SelectItem value="LOGISTICS">Logistics (การขนส่ง)</SelectItem>
                                <SelectItem value="MAINTENANCE">Maintenance (ซ่อมบำรุง)</SelectItem>
                                <SelectItem value="FACTORY_SUPPLIES">Factory Supplies (วัสดุสิ้นเปลือง)</SelectItem>
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
                ) : filteredExpenses.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบค่าใช้จ่าย</h3>
                        <p className="text-gray-500 mb-4">
                            {filters.search || filters.category !== 'all'
                                ? 'ลองปรับเงื่อนไขการค้นหา'
                                : 'ยังไม่มีค่าใช้จ่ายในระบบ'}
                        </p>
                        <Button onClick={handleCreateExpense}>
                            <Plus className="w-5 h-5 mr-2" />
                            เพิ่มค่าใช้จ่ายใหม่
                        </Button>
                    </div>
                ) : (
                    <ExpenseTable
                        expenses={filteredExpenses}
                        onEdit={handleEditExpense}
                        onDelete={handleDeletePrompt}
                    />
                )}
            </main>

            <ExpenseFormModal
                expense={selectedExpense}
                vehicles={vehicles}
                machines={machines}
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false)
                    setSelectedExpense(null)
                }}
                onSave={handleSaveExpense}
            />

            <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการลบค่าใช้จ่าย "{selectedExpense?.code}" หรือไม่?
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
