'use client'

import { QCInspection, QCParameter } from '@/types/quality'
import { useQualityStore } from '@/stores/quality-store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  User,
} from 'lucide-react'

interface InspectionCardProps {
  inspection: QCInspection
  onView: (inspection: QCInspection) => void
}

export function InspectionCard({ inspection, onView }: InspectionCardProps) {
  const { templates } = useQualityStore()

  // Get template for parameter names
  const template = templates.find(t => t.id === inspection.templateId) || inspection.template

  // Get parameter name by ID
  const getParameterName = (parameterId: string): string => {
    const param = template?.parameters.find(p => p.id === parameterId)
    return param?.name || `พารามิเตอร์ #${parameterId.slice(-4)}`
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PASSED':
        return {
          label: 'ผ่าน',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600',
        }
      case 'FAILED':
        return {
          label: 'ไม่ผ่าน',
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          iconColor: 'text-red-600',
        }
      case 'IN_PROGRESS':
        return {
          label: 'กำลังตรวจ',
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          iconColor: 'text-blue-600',
        }
      case 'ON_HOLD':
        return {
          label: 'รอพิจารณา',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          iconColor: 'text-yellow-600',
        }
      default:
        return {
          label: 'ร่าง',
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          iconColor: 'text-gray-600',
        }
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INCOMING':
        return 'ตรวจรับ'
      case 'IN_PROCESS':
        return 'ระหว่างผลิต'
      case 'FINAL':
        return 'สินค้าสำเร็จรูป'
      case 'PATROL':
        return 'ตรวจประจำ'
      default:
        return type
    }
  }

  const statusConfig = getStatusConfig(inspection.status)
  const StatusIcon = statusConfig.icon

  // Calculate pass/fail readings
  const passCount = inspection.readings.filter(r => r.status === 'PASS').length
  const failCount = inspection.readings.filter(r => r.status === 'FAIL').length
  const totalCount = inspection.readings.length

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        inspection.status === 'FAILED' && 'border-red-300',
        inspection.isCCP && inspection.status === 'FAILED' && 'border-red-500 border-2'
      )}
      onClick={() => onView(inspection)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'p-2 rounded-lg',
                inspection.status === 'PASSED' ? 'bg-green-100' :
                inspection.status === 'FAILED' ? 'bg-red-100' : 'bg-gray-100'
              )}
            >
              <StatusIcon className={cn('w-5 h-5', statusConfig.iconColor)} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{inspection.code}</h3>
              <p className="text-sm text-gray-500">{getTypeLabel(inspection.type)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            {inspection.isCCP && (
              <Badge variant="destructive" className="text-xs">
                CCP
              </Badge>
            )}
          </div>
        </div>

        {/* CCP Warning */}
        {inspection.isCCP && inspection.status === 'FAILED' && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700 font-medium">
              CCP Deviation - ต้องดำเนินการแก้ไข
            </span>
          </div>
        )}

        {/* Item Info */}
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">{inspection.itemName}</p>
          <p className="text-sm text-gray-500">
            {inspection.itemCode} {inspection.batchNo && `• ${inspection.batchNo}`}
          </p>
        </div>

        {/* Reading Summary */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">ผ่าน</p>
            <p className="text-lg font-semibold text-green-600">{passCount}</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">ไม่ผ่าน</p>
            <p className="text-lg font-semibold text-red-600">{failCount}</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">ทั้งหมด</p>
            <p className="text-lg font-semibold text-gray-900">{totalCount}</p>
          </div>
        </div>

        {/* Failed Parameters Preview */}
        {failCount > 0 && (
          <div className="mb-3 p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 font-medium mb-1">รายการไม่ผ่าน:</p>
            <div className="flex flex-wrap gap-1">
              {inspection.readings
                .filter(r => r.status === 'FAIL')
                .slice(0, 3)
                .map((reading) => (
                  <Badge
                    key={reading.id}
                    variant="outline"
                    className="text-xs bg-white border-red-200 text-red-700"
                  >
                    {getParameterName(reading.parameterId)}
                  </Badge>
                ))}
              {failCount > 3 && (
                <Badge variant="outline" className="text-xs bg-white border-red-200 text-red-700">
                  +{failCount - 3} อื่นๆ
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{inspection.inspectedBy}</span>
          </div>
          <span>{formatDate(inspection.inspectionDate)}</span>
        </div>

        {/* Approved Status */}
        {inspection.approvedBy && (
          <div className="flex items-center gap-1 text-sm text-green-600 mb-3">
            <CheckCircle className="w-4 h-4" />
            <span>อนุมัติโดย {inspection.approvedBy}</span>
          </div>
        )}

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation()
            onView(inspection)
          }}
        >
          <Eye className="w-4 h-4 mr-1" />
          ดูรายละเอียด
        </Button>
      </CardContent>
    </Card>
  )
}
