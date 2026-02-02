'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTransactionsStore } from '@/stores/transactions-store'
import { InventoryTransaction, transactionTypeLabels, TransactionType } from '@/types/inventory-transaction'
import { TransactionTable, TransactionFormModal } from '@/components/transactions'
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    ArrowDownLeft,
    ArrowUpRight,
    ArrowLeftRight,
    Plus,
    RefreshCw,
    Search,
    Package,
    Calendar,
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { transactionTypeColors } from '@/types/inventory-transaction'

export default function TransactionsPage() {
    const {
        transactions,
        stats,
        isLoading,
        filters,
        fetchTransactions,
        fetchStats,
        setFilters,
    } = useTransactionsStore()

    const [showFormModal, setShowFormModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<InventoryTransaction | null>(null)
    const [defaultTransactionType, setDefaultTransactionType] = useState<TransactionType>('RECEIVE')

    // Load data on mount
    useEffect(() => {
        fetchTransactions()
        fetchStats()
    }, [fetchTransactions, fetchStats])

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Search
            const searchLower = filters.search.toLowerCase()
            const matchesSearch = !filters.search ||
                t.transactionNo.toLowerCase().includes(searchLower) ||
                t.itemName.toLowerCase().includes(searchLower) ||
                t.itemCode.toLowerCase().includes(searchLower) ||
                (t.lotNumber?.toLowerCase().includes(searchLower))

            // Type
            const matchesType = filters.transactionType === 'all' ||
                t.transactionType === filters.transactionType

            // Warehouse
            const matchesWarehouse = filters.warehouseId === 'all' ||
                t.fromWarehouseId === filters.warehouseId ||
                t.toWarehouseId === filters.warehouseId

            return matchesSearch && matchesType && matchesWarehouse
        })
    }, [transactions, filters])

    // Quick action buttons
    const handleQuickAction = (type: TransactionType) => {
        setDefaultTransactionType(type)
        setShowFormModal(true)
    }

    const handleViewTransaction = (t: InventoryTransaction) => {
        setSelectedTransaction(t)
        setShowDetailModal(true)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
                                <ArrowLeftRight className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Inventory Transactions</h1>
                                <p className="text-gray-500">บันทึกการรับ-เบิก-โอนย้ายสินค้า</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => { fetchTransactions(); fetchStats() }}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                รีเฟรช
                            </Button>
                            <Button onClick={() => handleQuickAction('RECEIVE')}>
                                <Plus className="w-5 h-5 mr-2" />
                                บันทึกรายการ
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">รับเข้าวันนี้</p>
                                <p className="text-2xl font-bold text-green-600">{stats.todayIn}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-100">
                                <ArrowDownLeft className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">เบิกออกวันนี้</p>
                                <p className="text-2xl font-bold text-red-600">{stats.todayOut}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-red-100">
                                <ArrowUpRight className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">รับเข้า 7 วัน</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.weekIn}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-100">
                                <Calendar className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">เบิกออก 7 วัน</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.weekOut}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-orange-100">
                                <Package className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction('RECEIVE')}>
                            <ArrowDownLeft className="w-4 h-4 mr-1 text-green-600" />
                            รับเข้า
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction('ISSUE')}>
                            <ArrowUpRight className="w-4 h-4 mr-1 text-red-600" />
                            เบิกออก
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction('TRANSFER')}>
                            <ArrowLeftRight className="w-4 h-4 mr-1 text-blue-600" />
                            โอนย้าย
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction('ADJUST_IN')}>
                            ปรับเพิ่ม
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction('ADJUST_OUT')}>
                            ปรับลด
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="ค้นหา เลขที่, สินค้า, Lot..."
                                value={filters.search}
                                onChange={(e) => setFilters({ search: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={filters.transactionType}
                            onValueChange={(value) => setFilters({ transactionType: value as TransactionType | 'all' })}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="ประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกประเภท</SelectItem>
                                <SelectItem value="RECEIVE">รับเข้า</SelectItem>
                                <SelectItem value="ISSUE">เบิกออก</SelectItem>
                                <SelectItem value="TRANSFER">โอนย้าย</SelectItem>
                                <SelectItem value="ADJUST_IN">ปรับเพิ่ม</SelectItem>
                                <SelectItem value="ADJUST_OUT">ปรับลด</SelectItem>
                                <SelectItem value="PRODUCTION_IN">รับจากผลิต</SelectItem>
                                <SelectItem value="PRODUCTION_OUT">เบิกไปผลิต</SelectItem>
                                <SelectItem value="SCRAP">ของเสีย</SelectItem>
                                <SelectItem value="RETURN">คืนของ</SelectItem>
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
                ) : filteredTransactions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <ArrowLeftRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบรายการ</h3>
                        <p className="text-gray-500 mb-4">
                            {filters.search || filters.transactionType !== 'all'
                                ? 'ลองปรับเงื่อนไขการค้นหา'
                                : 'ยังไม่มีรายการเคลื่อนไหวในระบบ'}
                        </p>
                        <Button onClick={() => handleQuickAction('RECEIVE')}>
                            <Plus className="w-5 h-5 mr-2" />
                            บันทึกรายการแรก
                        </Button>
                    </div>
                ) : (
                    <TransactionTable
                        transactions={filteredTransactions}
                        onView={handleViewTransaction}
                    />
                )}
            </main>

            {/* Form Modal */}
            <TransactionFormModal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                defaultType={defaultTransactionType}
            />

            {/* Detail Modal */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>รายละเอียดรายการ</DialogTitle>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className={`${transactionTypeColors[selectedTransaction.transactionType].bg} ${transactionTypeColors[selectedTransaction.transactionType].text}`}>
                                    {transactionTypeLabels[selectedTransaction.transactionType]}
                                </Badge>
                                <span className="font-mono font-medium">{selectedTransaction.transactionNo}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">วันที่</p>
                                    <p className="font-medium">{formatDateTime(selectedTransaction.transactionDate)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">สินค้า</p>
                                    <p className="font-medium">{selectedTransaction.itemName}</p>
                                    <p className="text-gray-500 font-mono text-xs">{selectedTransaction.itemCode}</p>
                                </div>
                                {selectedTransaction.lotNumber && (
                                    <div>
                                        <p className="text-gray-500">Lot</p>
                                        <p className="font-medium font-mono">{selectedTransaction.lotNumber}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-500">จำนวน</p>
                                    <p className="font-medium">{selectedTransaction.qty.toLocaleString()} {selectedTransaction.uomCode}</p>
                                </div>
                                {selectedTransaction.fromWarehouseName && (
                                    <div>
                                        <p className="text-gray-500">จาก</p>
                                        <p className="font-medium">{selectedTransaction.fromWarehouseName}</p>
                                        {selectedTransaction.fromLocationName && (
                                            <p className="text-gray-500 text-xs">{selectedTransaction.fromLocationName}</p>
                                        )}
                                    </div>
                                )}
                                {selectedTransaction.toWarehouseName && (
                                    <div>
                                        <p className="text-gray-500">ไปยัง</p>
                                        <p className="font-medium">{selectedTransaction.toWarehouseName}</p>
                                        {selectedTransaction.toLocationName && (
                                            <p className="text-gray-500 text-xs">{selectedTransaction.toLocationName}</p>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-500">ราคา/หน่วย</p>
                                    <p className="font-medium">{formatCurrency(selectedTransaction.unitCost)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">มูลค่ารวม</p>
                                    <p className="font-medium text-lg">{formatCurrency(selectedTransaction.totalCost)}</p>
                                </div>
                            </div>

                            {selectedTransaction.notes && (
                                <div className="pt-4 border-t">
                                    <p className="text-gray-500 text-sm">หมายเหตุ</p>
                                    <p className="text-sm">{selectedTransaction.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
