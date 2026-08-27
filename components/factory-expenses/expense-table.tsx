'use client'

import { FactoryExpense, ExpenseCategory, ExpenseSubcategory } from '@/types/factory-expense'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
    Edit2,
    Trash2,
    Truck,
    Wrench,
    Package,
    HardHat,
} from 'lucide-react'

interface ExpenseTableProps {
    expenses: FactoryExpense[]
    onEdit: (expense: FactoryExpense) => void
    onDelete: (expense: FactoryExpense) => void
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    LOGISTICS: 'Logistics',
    MAINTENANCE: 'Maintenance',
    FACTORY_SUPPLIES: 'Factory Supplies',
    PROJECT: 'Project',
}

const SUBCATEGORY_LABELS: Record<ExpenseSubcategory, string> = {
    FUEL: 'ค่าน้ำมัน',
    VEHICLE_GENERAL: 'ค่าใช้จ่ายทั่วไป (รถ)',
    FRESH_LOGISTICS: 'Fresh Logistics',
    SPARE_PARTS: 'ค่าอะไหล่',
    CORRECTIVE_MAINTENANCE: 'ซ่อมเครื่องจักร',
    PREVENTIVE_MAINTENANCE: 'บำรุงรักษาตามรอบ',
    FACTORY_SUPPLIES: 'วัสดุสิ้นเปลือง',
    MACHINE_INSTALLATION: 'ติดตั้งเครื่องจักร',
    STAFF_MEALS: 'ค่าอาหารพนักงาน',
    PROJECT_CUSTOM: 'อื่นๆ',
    LOGISTICS_CUSTOM: 'อื่นๆ',
}

const CUSTOM_SUBCATEGORIES: ExpenseSubcategory[] = ['PROJECT_CUSTOM', 'LOGISTICS_CUSTOM']

const getSubcategoryLabel = (expense: FactoryExpense) =>
    CUSTOM_SUBCATEGORIES.includes(expense.subcategory)
        ? (expense.customSubcategoryName || SUBCATEGORY_LABELS[expense.subcategory])
        : SUBCATEGORY_LABELS[expense.subcategory]

const getCategoryBadge = (category: ExpenseCategory) => {
    switch (category) {
        case 'LOGISTICS':
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Truck className="w-3 h-3 mr-1" />{CATEGORY_LABELS[category]}</Badge>
        case 'MAINTENANCE':
            return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100"><Wrench className="w-3 h-3 mr-1" />{CATEGORY_LABELS[category]}</Badge>
        case 'FACTORY_SUPPLIES':
            return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100"><Package className="w-3 h-3 mr-1" />{CATEGORY_LABELS[category]}</Badge>
        case 'PROJECT':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><HardHat className="w-3 h-3 mr-1" />{CATEGORY_LABELS[category]}</Badge>
    }
}

export function ExpenseTable({ expenses, onEdit, onDelete }: ExpenseTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">รหัส</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">วันที่</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">หมวดหมู่</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ประเภท</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">รถ/เครื่องจักร</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">รายละเอียด</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">จำนวนเงิน</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className="font-mono text-sm font-medium text-gray-900">{expense.code}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {formatDate(expense.expenseDate)}
                                </td>
                                <td className="px-4 py-3">
                                    {getCategoryBadge(expense.category)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {getSubcategoryLabel(expense)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {expense.vehicleName || expense.machineName || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                    {expense.description || '-'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="font-medium text-gray-900">{formatCurrency(expense.amount)}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(expense)}
                                            title="แก้ไข"
                                            aria-label="แก้ไข"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(expense)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            title="ลบ"
                                            aria-label="ลบ"
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
            <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">
                    แสดง {expenses.length} รายการ
                </span>
                <span className="font-medium text-gray-900">
                    รวม: {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
                </span>
            </div>
        </div>
    )
}
