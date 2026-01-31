'use client'

import { PurchaseReceipt, PurchaseReceiptItem } from '@/types/receiving'
import { useReceivingStore } from '@/stores/receiving-store'
import { useInventoryStore } from '@/stores/inventory-store'
import { useQualityStore } from '@/stores/quality-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate, formatCurrency, formatNumber } from '@/lib/utils'
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  History,
  Send,
  Printer,
  ExternalLink,
} from 'lucide-react'

interface ReceiptDetailModalProps {
  receipt: PurchaseReceipt | null
  isOpen: boolean
  onClose: () => void
  onSubmit?: (receipt: PurchaseReceipt) => void
  onComplete?: (receipt: PurchaseReceipt) => void
  onPrint?: (receipt: PurchaseReceipt) => void
  onViewQC?: (inspectionId: string) => void
}

export function ReceiptDetailModal({
  receipt,
  isOpen,
  onClose,
  onSubmit,
  onComplete,
  onPrint,
  onViewQC,
}: ReceiptDetailModalProps) {
  const { receipts, suppliers } = useReceivingStore()
  const { stockItems, warehouses } = useInventoryStore()
  const { inspections } = useQualityStore()

  if (!receipt) return null

  // Get supplier details
  const supplier = suppliers.find(s => s.id === receipt.supplierId) || receipt.supplier

  // Get related receipts from same supplier
  const relatedReceipts = receipts
    .filter(r => r.supplierId === receipt.supplierId && r.id !== receipt.id)
    .slice(-5)
    .reverse()

  // Get item details
  const getItemName = (itemId: string): string => {
    const item = stockItems.find(i => i.id === itemId)
    return item?.name || itemId
  }

  // Get warehouse name
  const getWarehouseName = (warehouseId: string): string => {
    const wh = warehouses.find(w => w.id === warehouseId)
    return wh?.name || warehouseId
  }

  // Get QC inspection for item
  const getQCInspection = (item: PurchaseReceiptItem) => {
    if (item.qcInspectionId) {
      return inspections.find(i => i.id === item.qcInspectionId)
    }
    return null
  }

  // Status configs
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'เสร็จสิ้น',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600',
        }
      case 'PENDING_QC':
        return {
          label: 'รอ QC',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          iconColor: 'text-yellow-600',
        }
      case 'CANCELLED':
        return {
          label: 'ยกเลิก',
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          iconColor: 'text-red-600',
        }
      default:
        return {
          label: 'ร่าง',
          color: 'bg-gray-100 text-gray-800',
          icon: FileText,
          iconColor: 'text-gray-600',
        }
    }
  }

  const getQCStatusConfig = (status: string) => {
    switch (status) {
      case 'PASSED':
        return { label: 'QC ผ่าน', color: 'bg-green-100 text-green-800' }
      case 'FAILED':
        return { label: 'QC ไม่ผ่าน', color: 'bg-red-100 text-red-800' }
      case 'PARTIAL':
        return { label: 'ผ่านบางส่วน', color: 'bg-orange-100 text-orange-800' }
      case 'PENDING':
        return { label: 'รอตรวจ QC', color: 'bg-yellow-100 text-yellow-800' }
      default:
        return { label: 'ไม่ต้อง QC', color: 'bg-gray-100 text-gray-600' }
    }
  }

  const getItemQCConfig = (status: string) => {
    switch (status) {
      case 'PASSED':
        return { label: 'ผ่าน', color: 'bg-green-100 text-green-800', textColor: 'text-green-700' }
      case 'FAILED':
        return { label: 'ไม่ผ่าน', color: 'bg-red-100 text-red-800', textColor: 'text-red-700' }
      case 'PENDING':
        return { label: 'รอตรวจ', color: 'bg-yellow-100 text-yellow-800', textColor: 'text-yellow-700' }
      default:
        return { label: 'ไม่ต้อง', color: 'bg-gray-100 text-gray-600', textColor: 'text-gray-600' }
    }
  }

  const statusConfig = getStatusConfig(receipt.status)
  const qcConfig = getQCStatusConfig(receipt.qcStatus)
  const StatusIcon = statusConfig.icon

  // Calculate totals
  const totalReceived = receipt.items.reduce((sum, item) => sum + item.qtyReceived, 0)
  const totalAccepted = receipt.items.reduce((sum, item) => sum + item.qtyAccepted, 0)
  const totalRejected = receipt.items.reduce((sum, item) => sum + item.qtyRejected, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              receipt.status === 'COMPLETED' ? 'bg-green-100' :
              receipt.status === 'PENDING_QC' ? 'bg-yellow-100' : 'bg-gray-100'
            )}>
              <StatusIcon className={cn("w-6 h-6", statusConfig.iconColor)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{receipt.code}</DialogTitle>
              <p className="text-muted-foreground">ใบรับวัตถุดิบ</p>
            </div>
            <div className="flex gap-2">
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              {receipt.qcStatus !== 'NOT_REQUIRED' && (
                <Badge className={qcConfig.color}>{qcConfig.label}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Info Bar */}
        <div className="py-3 border-y grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Supplier</p>
            <p className="font-medium">{supplier?.name || receipt.supplierId}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">วันที่รับ</p>
            <p className="font-medium">{formatDate(receipt.receiptDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">PO Number</p>
            <p className="font-medium">{receipt.poNumber || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Invoice</p>
            <p className="font-medium">{receipt.invoiceNumber || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">มูลค่ารวม</p>
            <p className="font-medium">{formatCurrency(receipt.totalAmount)}</p>
          </div>
        </div>

        {/* QC Failed Warning */}
        {receipt.qcStatus === 'FAILED' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">สินค้าไม่ผ่านการตรวจ QC</p>
              <p className="text-sm text-red-600">กรุณาดำเนินการตามขั้นตอน</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="items" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-fit">
            <TabsTrigger value="items" className="gap-2">
              <Package className="w-4 h-4" />
              รายการสินค้า ({receipt.items.length})
            </TabsTrigger>
            <TabsTrigger value="qc" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              QC Status
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              ประวัติ ({relatedReceipts.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* Items Tab */}
            <TabsContent value="items" className="m-0 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{totalReceived}</p>
                  <p className="text-sm text-gray-600">รับเข้า</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{totalAccepted}</p>
                  <p className="text-sm text-gray-600">QC ผ่าน</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{totalRejected}</p>
                  <p className="text-sm text-gray-600">ปฏิเสธ</p>
                </div>
              </div>

              {/* Item Cards */}
              <div className="space-y-3">
                {receipt.items.map((item) => {
                  const itemQCConfig = getItemQCConfig(item.qcStatus)
                  const inspection = getQCInspection(item)

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-lg border p-4",
                        item.qcStatus === 'FAILED' ? "bg-red-50 border-red-200" :
                        item.qcStatus === 'PASSED' ? "bg-green-50 border-green-200" :
                        item.qcStatus === 'PENDING' ? "bg-yellow-50 border-yellow-200" :
                        "bg-white border-gray-200"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">#{item.lineNo}</span>
                            <h4 className="font-medium text-gray-900">
                              {getItemName(item.itemId)}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.batchNo && `Batch: ${item.batchNo}`}
                            {item.mfgDate && ` • ผลิต: ${formatDate(item.mfgDate)}`}
                            {item.expDate && ` • หมดอายุ: ${formatDate(item.expDate)}`}
                          </p>
                        </div>
                        <Badge className={itemQCConfig.color}>{itemQCConfig.label}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">สั่งซื้อ</p>
                          <p className="font-medium">
                            {item.qtyOrdered !== undefined ? formatNumber(item.qtyOrdered) : '-'} {item.uom}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">รับเข้า</p>
                          <p className="font-medium">{formatNumber(item.qtyReceived)} {item.uom}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">QC ผ่าน</p>
                          <p className={cn("font-medium", item.qtyAccepted > 0 && "text-green-700")}>
                            {formatNumber(item.qtyAccepted)} {item.uom}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">ปฏิเสธ</p>
                          <p className={cn("font-medium", item.qtyRejected > 0 && "text-red-700")}>
                            {formatNumber(item.qtyRejected)} {item.uom}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-dashed grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">ราคา/หน่วย</p>
                          <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">รวม</p>
                          <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">คลัง</p>
                          <p className="font-medium">{getWarehouseName(item.warehouseId)}</p>
                        </div>
                      </div>

                      {item.remarks && (
                        <div className="mt-3 pt-3 border-t border-dashed">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">หมายเหตุ:</span> {item.remarks}
                          </p>
                        </div>
                      )}

                      {/* QC Link */}
                      {inspection && onViewQC && (
                        <div className="mt-3 pt-3 border-t border-dashed">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewQC(inspection.id)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            ดู QC Report: {inspection.code}
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            {/* QC Tab */}
            <TabsContent value="qc" className="m-0 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">สถานะ QC รวม</h4>
                <div className="flex items-center gap-2">
                  <Badge className={qcConfig.color}>{qcConfig.label}</Badge>
                </div>
              </div>

              {/* QC Inspections for each item */}
              <div className="space-y-3">
                {receipt.items.map((item) => {
                  const inspection = getQCInspection(item)
                  const itemQCConfig = getItemQCConfig(item.qcStatus)

                  return (
                    <div
                      key={item.id}
                      className="bg-white border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{getItemName(item.itemId)}</span>
                        </div>
                        <Badge className={itemQCConfig.color}>{itemQCConfig.label}</Badge>
                      </div>

                      {inspection ? (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">QC Code</p>
                              <p className="font-medium">{inspection.code}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">วันที่ตรวจ</p>
                              <p className="font-medium">{formatDate(inspection.inspectionDate)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">ผู้ตรวจ</p>
                              <p className="font-medium">{inspection.inspectedBy}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">ผลตรวจ</p>
                              <p className="font-medium">
                                ผ่าน {inspection.readings.filter(r => r.status === 'PASS').length} /
                                ไม่ผ่าน {inspection.readings.filter(r => r.status === 'FAIL').length}
                              </p>
                            </div>
                          </div>
                          {onViewQC && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 w-full"
                              onClick={() => onViewQC(inspection.id)}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              ดูรายละเอียด QC
                            </Button>
                          )}
                        </div>
                      ) : item.qcStatus === 'PENDING' ? (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-700">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">กำลังรอตรวจ QC</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">ไม่ต้องตรวจ QC</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="m-0 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-gray-500" />
                  <h4 className="font-medium text-gray-900">
                    ประวัติรับสินค้าจาก {supplier?.name || receipt.supplierId}
                  </h4>
                </div>

                {supplier && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">รหัส</p>
                      <p className="font-medium">{supplier.code}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ผู้ติดต่อ</p>
                      <p className="font-medium">{supplier.contactPerson || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">โทรศัพท์</p>
                      <p className="font-medium">{supplier.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quality Score</p>
                      <p className="font-medium">{supplier.qualityScore || '-'}%</p>
                    </div>
                  </div>
                )}

                {relatedReceipts.length > 0 ? (
                  <div className="space-y-2">
                    {relatedReceipts.map((related) => {
                      const relatedStatus = getStatusConfig(related.status)
                      const RelatedIcon = relatedStatus.icon

                      return (
                        <div
                          key={related.id}
                          className="flex items-center justify-between bg-white rounded-lg p-3 border"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              related.status === 'COMPLETED' ? 'bg-green-100' :
                              related.status === 'PENDING_QC' ? 'bg-yellow-100' : 'bg-gray-100'
                            )}>
                              <RelatedIcon className={cn("w-4 h-4", relatedStatus.iconColor)} />
                            </div>
                            <div>
                              <p className="font-medium">{related.code}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(related.receiptDate)} • {related.items.length} รายการ
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {formatCurrency(related.totalAmount)}
                            </span>
                            <Badge className={relatedStatus.color}>
                              {relatedStatus.label}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">ไม่มีประวัติการรับสินค้าก่อนหน้า</p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Remarks */}
        {receipt.remarks && (
          <div className="p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-500 mb-1">หมายเหตุ</p>
            <p className="font-medium">{receipt.remarks}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            รับโดย: {receipt.receivedBy} • สร้างเมื่อ: {formatDate(receipt.createdAt)}
          </div>
          <div className="flex gap-2">
            {onPrint && (
              <Button variant="outline" onClick={() => onPrint(receipt)}>
                <Printer className="w-4 h-4 mr-2" />
                พิมพ์
              </Button>
            )}
            {onSubmit && receipt.status === 'DRAFT' && (
              <Button
                onClick={() => onSubmit(receipt)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                ส่งตรวจ QC
              </Button>
            )}
            {onComplete && receipt.status === 'PENDING_QC' && receipt.qcStatus !== 'PENDING' && (
              <Button
                onClick={() => onComplete(receipt)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                เสร็จสิ้น
              </Button>
            )}
            <Button onClick={onClose}>ปิด</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
