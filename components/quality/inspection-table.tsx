'use client'

import { QCInspection, InspectionStatus, InspectionType } from '@/types/quality'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Play,
  ClipboardCheck,
} from 'lucide-react'

interface InspectionTableProps {
  inspections: QCInspection[]
  onView: (inspection: QCInspection) => void
  onStartInspection?: (inspection: QCInspection) => void
}

const getStatusBadge = (status: InspectionStatus) => {
  switch (status) {
    case 'PASSED':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />ผ่าน</Badge>
    case 'FAILED':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />ไม่ผ่าน</Badge>
    case 'IN_PROGRESS':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" />กำลังตรวจ</Badge>
    case 'ON_HOLD':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />รอพิจารณา</Badge>
    case 'CANCELLED':
      return <Badge variant="outline" className="text-gray-500">ยกเลิก</Badge>
    default:
      return <Badge variant="outline" className="text-gray-600 border-gray-300"><Clock className="w-3 h-3 mr-1" />ร่าง</Badge>
  }
}

const getTypeLabel = (type: InspectionType) => {
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

export function InspectionTable({ inspections, onView, onStartInspection }: InspectionTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">รหัส</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">สินค้า</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">สถานะ</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">ผลตรวจ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ผู้ตรวจ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">วันที่</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inspections.map((inspection) => {
              const passCount = inspection.readings.filter(r => r.status === 'PASS').length
              const failCount = inspection.readings.filter(r => r.status === 'FAIL').length
              const ccpFailed = inspection.isCCP && inspection.status === 'FAILED'

              return (
                <tr
                  key={inspection.id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors cursor-pointer',
                    inspection.status === 'FAILED' && 'bg-red-50/50'
                  )}
                  onClick={() => onView(inspection)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-900">{inspection.code}</span>
                          {inspection.isCCP && (
                            <Badge variant="destructive" className="text-xs">CCP</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{getTypeLabel(inspection.type)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{inspection.itemName}</p>
                    <p className="text-xs text-gray-500">
                      {inspection.itemCode}{inspection.batchNo && ` • ${inspection.batchNo}`}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(inspection.status)}
                    {ccpFailed && (
                      <div className="flex items-center justify-center gap-1 mt-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        CCP Deviation
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    <span className="text-green-600 font-medium">{passCount} ผ่าน</span>
                    {failCount > 0 && (
                      <>
                        {' / '}
                        <span className="text-red-600 font-medium">{failCount} ไม่ผ่าน</span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {inspection.inspectedBy}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(inspection.inspectionDate)}
                  </td>
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {inspection.status === 'DRAFT' && onStartInspection ? (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => onStartInspection(inspection)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        เริ่มตรวจ
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(inspection)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        ดู
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <span className="text-sm text-gray-500">
          แสดง {inspections.length} รายการ
        </span>
      </div>
    </div>
  )
}
