'use client'

import { DeliveryNote, DeliveryNoteStatus } from '@/types/delivery'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/utils'
import {
  Clock,
  Truck,
  CheckCircle,
  RotateCcw,
  XCircle,
  Eye,
  Thermometer,
  Play,
  AlertTriangle,
} from 'lucide-react'

interface DeliveryNoteTableProps {
  deliveryNotes: DeliveryNote[]
  onViewDetails?: (note: DeliveryNote) => void
  onDispatch?: (note: DeliveryNote) => void
  onComplete?: (note: DeliveryNote) => void
}

export function DeliveryNoteTable({
  deliveryNotes,
  onViewDetails,
  onDispatch,
  onComplete,
}: DeliveryNoteTableProps) {
  const statusConfig: Record<
    DeliveryNoteStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }
  > = {
    PENDING: { label: 'รอจัดส่ง', variant: 'outline', icon: Clock },
    IN_TRANSIT: { label: 'กำลังส่ง', variant: 'secondary', icon: Truck },
    DELIVERED: { label: 'ส่งสำเร็จ', variant: 'default', icon: CheckCircle },
    PARTIAL: { label: 'ส่งบางส่วน', variant: 'outline', icon: RotateCcw },
    RETURNED: { label: 'ตีกลับ', variant: 'destructive', icon: RotateCcw },
    CANCELLED: { label: 'ยกเลิก', variant: 'destructive', icon: XCircle },
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>เลขที่</TableHead>
            <TableHead>ลูกค้า</TableHead>
            <TableHead>คนขับ / รถ</TableHead>
            <TableHead>ออกเดินทาง</TableHead>
            <TableHead className="text-right">จำนวน</TableHead>
            <TableHead>อุณหภูมิ</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="text-right">การดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveryNotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                ไม่พบใบส่งสินค้า
              </TableCell>
            </TableRow>
          ) : (
            deliveryNotes.map((note) => {
              const status = statusConfig[note.status]
              const StatusIcon = status.icon

              return (
                <TableRow key={note.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {note.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{note.customer?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {note.order?.code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{note.driverName}</p>
                      <p className="text-xs text-muted-foreground">{note.vehicleNo}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatTime(note.dispatchTime)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(note.totalQuantity)} ขวด
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Thermometer
                        className={`h-4 w-4 ${
                          note.coldChainCompliant ? 'text-cyan-600' : 'text-red-500'
                        }`}
                      />
                      {note.avgTemperature !== undefined ? (
                        <span
                          className={`text-sm font-medium ${
                            note.coldChainCompliant ? 'text-cyan-600' : 'text-red-500'
                          }`}
                        >
                          {note.avgTemperature.toFixed(1)}°C
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                      {!note.coldChainCompliant && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {note.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDispatch?.(note)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          เริ่มส่ง
                        </Button>
                      )}
                      {note.status === 'IN_TRANSIT' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onComplete?.(note)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          ส่งสำเร็จ
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails?.(note)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
