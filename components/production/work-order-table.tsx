'use client'

import { WorkOrder } from '@/types/production'
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
import { Progress } from '@/components/ui/progress'
import { cn, formatNumber } from '@/lib/utils'
import {
  Factory,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
  Eye,
  Thermometer,
} from 'lucide-react'

interface WorkOrderTableProps {
  workOrders: WorkOrder[]
  onView: (workOrder: WorkOrder) => void
}

export function WorkOrderTable({ workOrders, onView }: WorkOrderTableProps) {
  const statusConfig = {
    DRAFT: {
      label: 'ร่าง',
      variant: 'outline' as const,
      icon: FileText,
    },
    RELEASED: {
      label: 'พร้อมผลิต',
      variant: 'secondary' as const,
      icon: PlayCircle,
    },
    IN_PROGRESS: {
      label: 'กำลังผลิต',
      variant: 'default' as const,
      icon: Factory,
    },
    COMPLETED: {
      label: 'เสร็จสิ้น',
      variant: 'default' as const,
      icon: CheckCircle,
    },
    CANCELLED: {
      label: 'ยกเลิก',
      variant: 'destructive' as const,
      icon: XCircle,
    },
  }

  const ccpStatusConfig = {
    PENDING: {
      label: 'รอ CCP',
      color: 'bg-yellow-100 text-yellow-800',
    },
    PASSED: {
      label: 'ผ่าน',
      color: 'bg-green-100 text-green-800',
    },
    FAILED: {
      label: 'ไม่ผ่าน',
      color: 'bg-red-100 text-red-800',
    },
    NOT_REQUIRED: {
      label: '-',
      color: 'bg-gray-100 text-gray-600',
    },
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>เลขที่ใบสั่งผลิต</TableHead>
            <TableHead>สูตร/สินค้า</TableHead>
            <TableHead className="text-center">จำนวน</TableHead>
            <TableHead className="text-center">วันที่</TableHead>
            <TableHead className="text-center">สถานะ</TableHead>
            <TableHead className="text-center">CCP</TableHead>
            <TableHead>ความคืบหน้า</TableHead>
            <TableHead className="text-right">การดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((wo) => {
            const status = statusConfig[wo.status]
            const ccpStatus = ccpStatusConfig[wo.ccpStatus]
            const StatusIcon = status.icon

            return (
              <TableRow
                key={wo.id}
                className={cn(
                  'hover:bg-gray-50 cursor-pointer',
                  wo.status === 'CANCELLED' && 'opacity-60'
                )}
                onClick={() => onView(wo)}
              >
                <TableCell className="font-mono font-medium">
                  {wo.code}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{wo.recipeName}</p>
                    <p className="text-xs text-gray-500">{wo.recipeCode}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-medium">
                      {formatNumber(wo.completedQty || 0)}/{formatNumber(wo.plannedQty)}
                    </span>
                    <span className="text-xs text-gray-500">ขวด</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span>{wo.plannedDate}</span>
                    {wo.startDate && (
                      <span className="text-xs text-gray-500">
                        เริ่ม: {wo.startDate}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={status.variant}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {wo.ccpStatus !== 'NOT_REQUIRED' ? (
                    <Badge className={cn('text-xs', ccpStatus.color)}>
                      <Thermometer className="w-3 h-3 mr-1" />
                      {ccpStatus.label}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="w-24">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{wo.progress}%</span>
                    </div>
                    <Progress value={wo.progress} className="h-2" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onView(wo)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    ดู
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}

          {workOrders.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                <Factory className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>ไม่พบใบสั่งผลิต</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
