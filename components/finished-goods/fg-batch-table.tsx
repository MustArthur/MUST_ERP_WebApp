'use client'

import { FinishedGoodsEntry, FGEntryStatus } from '@/types/finished-goods'
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
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Ban,
  Eye,
  Truck,
} from 'lucide-react'
import { calculateDaysToExpiry } from '@/lib/mock-data/finished-goods'

interface FGBatchTableProps {
  entries: FinishedGoodsEntry[]
  onViewDetails?: (entry: FinishedGoodsEntry) => void
  onApproveQC?: (entry: FinishedGoodsEntry) => void
}

export function FGBatchTable({
  entries,
  onViewDetails,
  onApproveQC,
}: FGBatchTableProps) {
  const statusConfig: Record<
    FGEntryStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Package }
  > = {
    AVAILABLE: {
      label: 'พร้อมส่ง',
      variant: 'default',
      icon: CheckCircle,
    },
    RESERVED: {
      label: 'จองแล้ว',
      variant: 'secondary',
      icon: Truck,
    },
    DELIVERED: {
      label: 'ส่งแล้ว',
      variant: 'outline',
      icon: Package,
    },
    ON_HOLD: {
      label: 'รอตรวจ QC',
      variant: 'secondary',
      icon: Clock,
    },
    QUARANTINE: {
      label: 'กักกัน',
      variant: 'destructive',
      icon: Ban,
    },
    EXPIRED: {
      label: 'หมดอายุ',
      variant: 'destructive',
      icon: AlertTriangle,
    },
  }

  const getExpiryBadge = (expDate: string) => {
    const daysToExpire = calculateDaysToExpiry(expDate)

    if (daysToExpire <= 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          หมดอายุแล้ว
        </Badge>
      )
    }

    if (daysToExpire <= 7) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600 gap-1">
          <AlertTriangle className="h-3 w-3" />
          {daysToExpire} วัน
        </Badge>
      )
    }

    return (
      <span className="text-sm text-muted-foreground">
        {daysToExpire} วัน
      </span>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัส FG</TableHead>
            <TableHead>สินค้า</TableHead>
            <TableHead>Lot/Batch</TableHead>
            <TableHead className="text-right">จำนวน</TableHead>
            <TableHead className="text-right">พร้อมส่ง</TableHead>
            <TableHead>หมดอายุ</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>คลัง</TableHead>
            <TableHead className="text-right">การดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                ไม่พบข้อมูลสินค้าสำเร็จรูป
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => {
              const status = statusConfig[entry.status]
              const StatusIcon = status.icon

              return (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-sm">{entry.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.productName}</p>
                      <p className="text-xs text-muted-foreground">{entry.productCode}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{entry.batchNo}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(entry.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={entry.availableQty > 0 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                      {formatNumber(entry.availableQty)}
                    </span>
                    {entry.reservedQty > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (จอง {entry.reservedQty})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{entry.expDate}</span>
                      {getExpiryBadge(entry.expDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{entry.warehouseName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {entry.status === 'ON_HOLD' && entry.qcStatus === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApproveQC?.(entry)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          อนุมัติ QC
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails?.(entry)}
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
