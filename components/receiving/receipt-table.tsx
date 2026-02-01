'use client'

import { PurchaseReceipt, ReceiptStatus, QCStatusSummary } from '@/types/receiving'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
} from 'lucide-react'

interface ReceiptTableProps {
    receipts: PurchaseReceipt[]
    suppliers: { id: string; name: string }[]
    onView: (receipt: PurchaseReceipt) => void
}

const getStatusBadge = (status: ReceiptStatus) => {
    switch (status) {
        case 'DRAFT':
            return <Badge variant="outline" className="text-gray-600 border-gray-300">ร่าง</Badge>
        case 'PENDING_QC':
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />รอ QC</Badge>
        case 'COMPLETED':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />เสร็จสิ้น</Badge>
        case 'CANCELLED':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />ยกเลิก</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getQCStatusBadge = (qcStatus: QCStatusSummary) => {
    switch (qcStatus) {
        case 'NOT_REQUIRED':
            return <span className="text-gray-400 text-sm">-</span>
        case 'PENDING':
            return <Badge variant="outline" className="text-yellow-600 border-yellow-300">รอตรวจ</Badge>
        case 'PASSED':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">QC ผ่าน</Badge>
        case 'FAILED':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">QC ไม่ผ่าน</Badge>
        case 'PARTIAL':
            return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100"><AlertTriangle className="w-3 h-3 mr-1" />ผ่านบางส่วน</Badge>
        default:
            return <span className="text-gray-400">-</span>
    }
}

export function ReceiptTable({ receipts, suppliers, onView }: ReceiptTableProps) {
    const getSupplierName = (supplierId: string) => {
        return suppliers.find(s => s.id === supplierId)?.name || supplierId
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">เลขที่ใบรับ</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">วันที่</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Supplier</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">เลข PO</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">รายการ</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">สถานะ</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">QC</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">มูลค่า</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {receipts.map((receipt) => (
                            <tr
                                key={receipt.id}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => onView(receipt)}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium text-gray-900">{receipt.code}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {formatDate(receipt.receiptDate)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-900">{getSupplierName(receipt.supplierId)}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {receipt.poNumber || '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
                                        {receipt.items.length}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {getStatusBadge(receipt.status)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {getQCStatusBadge(receipt.qcStatus)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="font-medium text-gray-900">{formatCurrency(receipt.totalAmount)}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onView(receipt)
                                        }}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        ดู
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary */}
            <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">
                    แสดง {receipts.length} รายการ
                </span>
                <span className="font-medium text-gray-900">
                    รวม: {formatCurrency(receipts.reduce((sum, r) => sum + r.totalAmount, 0))}
                </span>
            </div>
        </div>
    )
}
