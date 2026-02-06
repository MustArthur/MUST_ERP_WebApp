'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useReceivingStore } from '@/stores/receiving-store'
import { useQualityStore } from '@/stores/quality-store'
import {
  PurchaseReceipt,
  ReceiptStatus,
  QCStatusSummary,
  CreatePurchaseReceiptInput,
} from '@/types/receiving'
import {
  ReceiptCard,
  ReceiptTable,
  ReceiptDetailModal,
  ReceiptFormModal,
} from '@/components/receiving'
import { InspectionDetailModal } from '@/components/quality/inspection-detail-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'
import {
  Search,
  Truck,
  Plus,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  CalendarDays,
  ArrowLeft,
} from 'lucide-react'

export default function ReceivingPage() {
  const {
    receipts,
    suppliers,
    receiptFilters,
    isLoading,
    fetchReceipts,
    fetchSuppliers,
    createReceipt,
    submitReceipt,
    completeReceipt,
    setReceiptFilters,
  } = useReceivingStore()

  const { inspections, fetchInspections } = useQualityStore()

  // Modal state
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceipt | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showQCModal, setShowQCModal] = useState(false)
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null)

  // Confirmation dialogs
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [receiptToAction, setReceiptToAction] = useState<PurchaseReceipt | null>(null)

  // Load data on mount
  useEffect(() => {
    fetchReceipts()
    fetchSuppliers()
    fetchInspections()
  }, [fetchReceipts, fetchSuppliers, fetchInspections])

  // Handlers
  const handleViewReceipt = (receipt: PurchaseReceipt) => {
    setSelectedReceipt(receipt)
    setShowDetailModal(true)
  }

  const handleCreateReceipt = () => {
    setSelectedReceipt(null)
    setShowFormModal(true)
  }

  const handleSaveReceipt = async (data: CreatePurchaseReceiptInput) => {
    await createReceipt(data)
    fetchReceipts()
  }

  const handleSubmitReceipt = (receipt: PurchaseReceipt) => {
    setReceiptToAction(receipt)
    setShowSubmitConfirm(true)
  }

  const confirmSubmitReceipt = async () => {
    if (!receiptToAction) return
    await submitReceipt(receiptToAction.id)
    fetchReceipts()
    fetchInspections()
    setShowSubmitConfirm(false)
    setShowDetailModal(false)
    setReceiptToAction(null)
  }

  const handleCancelReceipt = (receipt: PurchaseReceipt) => {
    setReceiptToAction(receipt)
    setShowCancelConfirm(true)
  }

  const confirmCancelReceipt = async () => {
    if (!receiptToAction) return
    const { cancelReceipt } = useReceivingStore.getState()
    await cancelReceipt(receiptToAction.id)
    fetchReceipts()
    setShowCancelConfirm(false)
    setShowDetailModal(false)
    setReceiptToAction(null)
  }

  const handleCompleteReceipt = async (receipt: PurchaseReceipt) => {
    await completeReceipt(receipt.id)
    fetchReceipts()
    setShowDetailModal(false)
  }

  const handleViewQC = (inspectionId: string) => {
    setSelectedInspectionId(inspectionId)
    setShowDetailModal(false)
    setShowQCModal(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiptFilters({ search: e.target.value })
  }

  const handleStatusFilter = (status: ReceiptStatus | 'all') => {
    setReceiptFilters({ status })
  }

  const handleQCStatusFilter = (qcStatus: QCStatusSummary | 'all') => {
    setReceiptFilters({ qcStatus })
  }

  const handleSupplierFilter = (supplierId: string | 'all') => {
    setReceiptFilters({ supplierId })
  }

  // Filter receipts
  const filteredReceipts = receipts.filter(receipt => {
    if (receiptFilters.search) {
      const search = receiptFilters.search.toLowerCase()
      const supplier = suppliers.find(s => s.id === receipt.supplierId)
      if (
        !receipt.code.toLowerCase().includes(search) &&
        !(supplier?.name.toLowerCase().includes(search)) &&
        !(receipt.poNumber?.toLowerCase().includes(search))
      ) {
        return false
      }
    }
    if (receiptFilters.status !== 'all' && receipt.status !== receiptFilters.status) {
      return false
    }
    if (receiptFilters.qcStatus !== 'all' && receipt.qcStatus !== receiptFilters.qcStatus) {
      return false
    }
    if (receiptFilters.supplierId !== 'all' && receipt.supplierId !== receiptFilters.supplierId) {
      return false
    }
    return true
  })

  // Summary stats
  const todayReceipts = receipts.filter(r => r.receiptDate === new Date().toISOString().split('T')[0])
  const pendingQCCount = receipts.filter(r => r.qcStatus === 'PENDING').length
  const passedCount = receipts.filter(r => r.qcStatus === 'PASSED').length
  const failedCount = receipts.filter(r => r.qcStatus === 'FAILED').length
  const totalValueToday = todayReceipts.reduce((sum, r) => sum + r.totalAmount, 0)

  // Get selected inspection for QC modal
  const selectedInspection = selectedInspectionId
    ? inspections.find(i => i.id === selectedInspectionId)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  หน้าแรก
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">รับวัตถุดิบ</h1>
                <p className="text-sm text-gray-500">จัดการใบรับสินค้าจาก Supplier</p>
              </div>
            </div>
            <Button onClick={handleCreateReceipt}>
              <Plus className="w-5 h-5 mr-2" />
              สร้างใบรับ
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">วันนี้</p>
                <p className="text-2xl font-bold text-gray-900">{todayReceipts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">รอ QC</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingQCCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">QC ผ่าน</p>
                <p className="text-2xl font-bold text-green-600">{passedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">QC ไม่ผ่าน</p>
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">มูลค่าวันนี้</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalValueToday)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="ค้นหาเลขใบรับ, Supplier, PO..."
                className="pl-10"
                value={receiptFilters.search}
                onChange={handleSearchChange}
              />
            </div>

            {/* Status Filter */}
            <Select
              value={receiptFilters.status}
              onValueChange={(v) => handleStatusFilter(v as ReceiptStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="DRAFT">ร่าง</SelectItem>
                <SelectItem value="PENDING_QC">รอ QC</SelectItem>
                <SelectItem value="COMPLETED">เสร็จสิ้น</SelectItem>
                <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>

            {/* QC Status Filter */}
            <Select
              value={receiptFilters.qcStatus}
              onValueChange={(v) => handleQCStatusFilter(v as QCStatusSummary | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="สถานะ QC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ QC</SelectItem>
                <SelectItem value="NOT_REQUIRED">ไม่ต้อง QC</SelectItem>
                <SelectItem value="PENDING">รอตรวจ</SelectItem>
                <SelectItem value="PASSED">ผ่าน</SelectItem>
                <SelectItem value="FAILED">ไม่ผ่าน</SelectItem>
                <SelectItem value="PARTIAL">ผ่านบางส่วน</SelectItem>
              </SelectContent>
            </Select>

            {/* Supplier Filter */}
            <Select
              value={receiptFilters.supplierId}
              onValueChange={(v) => handleSupplierFilter(v as string | 'all')}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุก Supplier</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            variant={receiptFilters.status === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleStatusFilter('all')}
          >
            ทั้งหมด ({receipts.length})
          </Badge>
          <Badge
            variant={receiptFilters.status === 'DRAFT' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleStatusFilter('DRAFT')}
          >
            ร่าง ({receipts.filter(r => r.status === 'DRAFT').length})
          </Badge>
          <Badge
            variant={receiptFilters.status === 'PENDING_QC' ? 'default' : 'outline'}
            className="cursor-pointer bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            onClick={() => handleStatusFilter('PENDING_QC')}
          >
            <Clock className="w-3 h-3 mr-1" />
            รอ QC ({receipts.filter(r => r.status === 'PENDING_QC').length})
          </Badge>
          <Badge
            variant={receiptFilters.status === 'COMPLETED' ? 'default' : 'outline'}
            className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
            onClick={() => handleStatusFilter('COMPLETED')}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            เสร็จสิ้น ({receipts.filter(r => r.status === 'COMPLETED').length})
          </Badge>
        </div>

        {/* Receipt Table */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded w-full" />
              ))}
            </div>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบใบรับ</h3>
            <p className="text-gray-500 mb-4">
              {receiptFilters.search || receiptFilters.status !== 'all'
                ? 'ลองปรับเงื่อนไขการค้นหา'
                : 'ยังไม่มีใบรับวัตถุดิบในระบบ'}
            </p>
            <Button onClick={handleCreateReceipt}>
              <Plus className="w-5 h-5 mr-2" />
              สร้างใบรับใหม่
            </Button>
          </div>
        ) : (
          <ReceiptTable
            receipts={filteredReceipts}
            suppliers={suppliers}
            onView={handleViewReceipt}
          />
        )}
      </main>

      {/* Detail Modal */}
      <ReceiptDetailModal
        receipt={selectedReceipt}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onSubmit={handleSubmitReceipt}
        onComplete={handleCompleteReceipt}
        onCancel={handleCancelReceipt}
        onViewQC={handleViewQC}
      />

      {/* Form Modal */}
      <ReceiptFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveReceipt}
      />

      {/* QC Inspection Modal */}
      {selectedInspection && (
        <InspectionDetailModal
          inspection={selectedInspection}
          isOpen={showQCModal}
          onClose={() => {
            setShowQCModal(false)
            setSelectedInspectionId(null)
            setShowDetailModal(true)
          }}
        />
      )}

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการส่งใบรับ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการยืนยันใบรับ <strong>{receiptToAction?.code}</strong> หรือไม่?
              <br /><br />
              <span className="text-yellow-600">
                หลังยืนยันแล้ว ระบบจะสร้างใบตรวจ QC อัตโนมัติสำหรับสินค้าที่ต้องตรวจสอบ
                และไม่สามารถแก้ไขข้อมูลได้อีก
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmitReceipt}>
              ยืนยันส่งใบรับ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิกใบรับ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการยกเลิกใบรับ <strong>{receiptToAction?.code}</strong> หรือไม่?
              <br /><br />
              <span className="text-red-600">
                การยกเลิกใบรับไม่สามารถย้อนกลับได้
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ไม่ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelReceipt}
              className="bg-red-600 hover:bg-red-700"
            >
              ยืนยันยกเลิก
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
