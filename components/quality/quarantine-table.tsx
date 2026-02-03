'use client'

import { QuarantineRecord, QuarantineStatus, QuarantineReason } from '@/types/quality'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, formatDate } from '@/lib/utils'
import {
  AlertTriangle,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Wrench,
} from 'lucide-react'

interface QuarantineTableProps {
  records: QuarantineRecord[]
  onView: (record: QuarantineRecord) => void
  onResolve: (record: QuarantineRecord) => void
}

const reasonLabels: Record<QuarantineReason, string> = {
  QC_FAILED: 'QC ไม่ผ่าน',
  PENDING_QC: 'รอตรวจ QC',
  TEMPERATURE_DEVIATION: 'อุณหภูมิผิดปกติ',
  EXPIRED: 'หมดอายุ',
  DAMAGED: 'เสียหาย',
  CUSTOMER_COMPLAINT: 'ลูกค้าร้องเรียน',
  OTHER: 'อื่นๆ',
}

const reasonColors: Record<QuarantineReason, string> = {
  QC_FAILED: 'bg-red-100 text-red-800',
  PENDING_QC: 'bg-yellow-100 text-yellow-800',
  TEMPERATURE_DEVIATION: 'bg-orange-100 text-orange-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  DAMAGED: 'bg-purple-100 text-purple-800',
  CUSTOMER_COMPLAINT: 'bg-blue-100 text-blue-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

const statusConfig: Record<QuarantineStatus, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  RESOLVED: { label: 'แก้ไขแล้ว', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  DISPOSED: { label: 'ทำลายแล้ว', color: 'bg-red-100 text-red-800', icon: XCircle },
}

export function QuarantineTable({ records, onView, onResolve }: QuarantineTableProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">ไม่มีรายการ Quarantine</p>
        <p className="text-sm text-gray-400 mt-1">สินค้าทั้งหมดผ่าน QC</p>
      </div>
    )
  }

  // Count pending items
  const pendingCount = records.filter(r => r.status === 'PENDING').length

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">
              มี {pendingCount} รายการรอดำเนินการ
            </p>
            <p className="text-sm text-yellow-600">
              กรุณาตรวจสอบและดำเนินการแก้ไขสินค้าใน Quarantine
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[140px]">รหัส</TableHead>
              <TableHead>สินค้า</TableHead>
              <TableHead className="w-[100px] text-right">จำนวน</TableHead>
              <TableHead className="w-[140px]">สาเหตุ</TableHead>
              <TableHead className="w-[120px]">สถานะ</TableHead>
              <TableHead className="w-[150px]">วันที่กักกัน</TableHead>
              <TableHead className="w-[140px] text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const status = statusConfig[record.status]
              const StatusIcon = status.icon

              return (
                <TableRow
                  key={record.id}
                  className={cn(
                    'hover:bg-gray-50',
                    record.status === 'PENDING' && 'bg-yellow-50/50'
                  )}
                >
                  <TableCell className="font-mono text-sm">{record.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{record.itemName}</p>
                      <p className="text-sm text-gray-500">
                        {record.itemCode}
                        {record.batchNo && ` • Batch: ${record.batchNo}`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {record.qty.toLocaleString()} {record.uom}
                  </TableCell>
                  <TableCell>
                    <Badge className={reasonColors[record.reason]}>
                      {reasonLabels[record.reason]}
                    </Badge>
                    {record.reasonDetail && (
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-[120px]">
                        {record.reasonDetail}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('flex items-center gap-1 w-fit', status.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                    {record.resolvedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        โดย {record.resolvedBy}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{formatDate(record.quarantinedAt)}</p>
                    <p className="text-xs text-gray-500">โดย {record.quarantinedBy}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(record)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {record.status === 'PENDING' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700"
                          onClick={() => onResolve(record)}
                        >
                          <Wrench className="w-4 h-4 mr-1" />
                          จัดการ
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
