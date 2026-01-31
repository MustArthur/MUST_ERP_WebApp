'use client'

import { PurchaseReceipt } from '@/types/receiving'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  AlertTriangle,
  User,
} from 'lucide-react'

interface ReceiptCardProps {
  receipt: PurchaseReceipt
  onView: (receipt: PurchaseReceipt) => void
}

export function ReceiptCard({ receipt, onView }: ReceiptCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'เสร็จสิ้น',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
        }
      case 'PENDING_QC':
        return {
          label: 'รอ QC',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
        }
      case 'CANCELLED':
        return {
          label: 'ยกเลิก',
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
        }
      default:
        return {
          label: 'ร่าง',
          color: 'bg-gray-100 text-gray-800',
          icon: FileText,
          iconColor: 'text-gray-600',
          iconBg: 'bg-gray-100',
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

  const statusConfig = getStatusConfig(receipt.status)
  const qcConfig = getQCStatusConfig(receipt.qcStatus)
  const StatusIcon = statusConfig.icon

  // Calculate totals
  const totalItems = receipt.items.length
  const totalQty = receipt.items.reduce((sum, item) => sum + item.qtyReceived, 0)
  const hasRejected = receipt.items.some(item => item.qtyRejected > 0)

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        receipt.qcStatus === 'FAILED' && 'border-red-300',
        receipt.qcStatus === 'PENDING' && 'border-yellow-300'
      )}
      onClick={() => onView(receipt)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', statusConfig.iconBg)}>
              <StatusIcon className={cn('w-5 h-5', statusConfig.iconColor)} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{receipt.code}</h3>
              <p className="text-sm text-gray-500">{formatDate(receipt.receiptDate)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            {receipt.qcStatus !== 'NOT_REQUIRED' && (
              <Badge className={qcConfig.color}>{qcConfig.label}</Badge>
            )}
          </div>
        </div>

        {/* QC Warning */}
        {receipt.qcStatus === 'FAILED' && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700 font-medium">
              สินค้าไม่ผ่าน QC
            </span>
          </div>
        )}

        {/* Supplier Info */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">
              {receipt.supplier?.name || receipt.supplierId}
            </span>
          </div>
          {receipt.poNumber && (
            <p className="text-sm text-gray-500 mt-1 ml-6">
              PO: {receipt.poNumber}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">รายการ</p>
            <p className="text-lg font-semibold text-gray-900">{totalItems}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">จำนวน</p>
            <p className="text-lg font-semibold text-gray-900">{totalQty}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">มูลค่า</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(receipt.totalAmount)}
            </p>
          </div>
        </div>

        {/* Rejected Warning */}
        {hasRejected && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-orange-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-700">
              มีสินค้าถูกปฏิเสธ
            </span>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{receipt.receivedBy}</span>
          </div>
          {receipt.invoiceNumber && (
            <span>INV: {receipt.invoiceNumber}</span>
          )}
        </div>

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation()
            onView(receipt)
          }}
        >
          <Eye className="w-4 h-4 mr-1" />
          ดูรายละเอียด
        </Button>
      </CardContent>
    </Card>
  )
}
