'use client'

import { WorkOrder } from '@/types/production'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn, formatNumber } from '@/lib/utils'
import {
  Factory,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlayCircle,
  FileText,
  Thermometer,
} from 'lucide-react'

interface WorkOrderCardProps {
  workOrder: WorkOrder
  onClick?: (workOrder: WorkOrder) => void
}

export function WorkOrderCard({ workOrder, onClick }: WorkOrderCardProps) {
  const statusConfig = {
    DRAFT: {
      label: 'ร่าง',
      variant: 'outline' as const,
      icon: FileText,
      color: 'text-gray-500',
    },
    RELEASED: {
      label: 'พร้อมผลิต',
      variant: 'secondary' as const,
      icon: PlayCircle,
      color: 'text-blue-600',
    },
    IN_PROGRESS: {
      label: 'กำลังผลิต',
      variant: 'default' as const,
      icon: Factory,
      color: 'text-yellow-600',
    },
    COMPLETED: {
      label: 'เสร็จสิ้น',
      variant: 'default' as const,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    CANCELLED: {
      label: 'ยกเลิก',
      variant: 'destructive' as const,
      icon: XCircle,
      color: 'text-red-600',
    },
  }

  const ccpStatusConfig = {
    PENDING: {
      label: 'รอ CCP',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
    },
    PASSED: {
      label: 'CCP ผ่าน',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    FAILED: {
      label: 'CCP ไม่ผ่าน',
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
    },
    NOT_REQUIRED: {
      label: 'ไม่มี CCP',
      color: 'bg-gray-100 text-gray-600',
      icon: null,
    },
  }

  const status = statusConfig[workOrder.status]
  const ccpStatus = ccpStatusConfig[workOrder.ccpStatus]
  const StatusIcon = status.icon
  const CCPIcon = ccpStatus.icon

  // Get CCP job cards status summary
  const ccpJobCards = workOrder.jobCards.filter(jc => jc.isCCP)
  const ccpPassedCount = ccpJobCards.filter(jc => jc.ccpStatus === 'PASSED').length
  const ccpTotalCount = ccpJobCards.length

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        workOrder.status === 'CANCELLED' && 'opacity-60'
      )}
      onClick={() => onClick?.(workOrder)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-gray-900">
                {workOrder.code}
              </span>
              <Badge variant={status.variant} className="text-xs">
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">{workOrder.recipeName}</p>
          </div>

          {/* CCP Status Badge */}
          {workOrder.ccpStatus !== 'NOT_REQUIRED' && (
            <Badge className={cn('text-xs', ccpStatus.color)}>
              {CCPIcon && <CCPIcon className="w-3 h-3 mr-1" />}
              {ccpStatus.label}
            </Badge>
          )}
        </div>

        {/* Info Row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Factory className="w-4 h-4" />
            <span>{formatNumber(workOrder.plannedQty)} ขวด</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{workOrder.plannedDate}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>ความคืบหน้า</span>
            <span>{workOrder.progress}%</span>
          </div>
          <Progress value={workOrder.progress} className="h-2" />
        </div>

        {/* CCP Summary */}
        {ccpTotalCount > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-600">
              CCP: {ccpPassedCount}/{ccpTotalCount} ผ่าน
            </span>
            {ccpJobCards.map((jc) => (
              <Badge
                key={jc.id}
                variant="outline"
                className={cn(
                  'text-xs',
                  jc.ccpStatus === 'PASSED' && 'border-green-500 text-green-700',
                  jc.ccpStatus === 'FAILED' && 'border-red-500 text-red-700',
                  jc.ccpStatus === 'PENDING' && 'border-yellow-500 text-yellow-700'
                )}
              >
                {jc.operation?.code || 'CCP'}
                {jc.ccpStatus === 'PASSED' && (
                  <CheckCircle className="w-3 h-3 ml-1" />
                )}
                {jc.ccpStatus === 'FAILED' && (
                  <XCircle className="w-3 h-3 ml-1" />
                )}
                {jc.ccpStatus === 'PENDING' && (
                  <Clock className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Batch Number */}
        <div className="text-xs text-gray-400 mt-2">
          Batch: {workOrder.batchNo}
        </div>
      </CardContent>
    </Card>
  )
}
