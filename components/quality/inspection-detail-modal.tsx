'use client'

import { QCInspection, QCTemplate, QCParameter } from '@/types/quality'
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
import { cn, formatDate } from '@/lib/utils'
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  History,
  User,
  Calendar,
  Printer,
  ThumbsUp,
} from 'lucide-react'

interface InspectionDetailModalProps {
  inspection: QCInspection | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (inspection: QCInspection) => void
  onPrint?: (inspection: QCInspection) => void
}

export function InspectionDetailModal({
  inspection,
  isOpen,
  onClose,
  onApprove,
  onPrint,
}: InspectionDetailModalProps) {
  const { templates, inspections } = useQualityStore()

  if (!inspection) return null

  // Get template for this inspection
  const template = templates.find(t => t.id === inspection.templateId) || inspection.template

  // Get parameter info by ID
  const getParameter = (parameterId: string): QCParameter | undefined => {
    return template?.parameters.find(p => p.id === parameterId)
  }

  // Get related inspections (same item)
  const relatedInspections = inspections
    .filter(i => i.itemId === inspection.itemId && i.id !== inspection.id)
    .slice(-5)
    .reverse()

  // Get status config
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
          icon: ClipboardCheck,
          iconColor: 'text-blue-600',
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

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INCOMING': return 'ตรวจรับ'
      case 'IN_PROCESS': return 'ระหว่างผลิต'
      case 'FINAL': return 'สินค้าสำเร็จรูป'
      case 'PATROL': return 'ตรวจประจำ'
      default: return type
    }
  }

  const statusConfig = getStatusConfig(inspection.status)
  const StatusIcon = statusConfig.icon

  // Calculate pass/fail counts
  const passCount = inspection.readings.filter(r => r.status === 'PASS').length
  const failCount = inspection.readings.filter(r => r.status === 'FAIL').length
  const totalCount = inspection.readings.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              inspection.status === 'PASSED' ? 'bg-green-100' :
              inspection.status === 'FAILED' ? 'bg-red-100' : 'bg-gray-100'
            )}>
              <StatusIcon className={cn("w-6 h-6", statusConfig.iconColor)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{inspection.code}</DialogTitle>
              <p className="text-muted-foreground">{getTypeLabel(inspection.type)}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              {inspection.isCCP && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  CCP
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Info Bar */}
        <div className="py-3 border-y grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">สินค้า</p>
            <p className="font-medium">{inspection.itemName || inspection.itemCode}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Batch/Lot</p>
            <p className="font-medium">{inspection.batchNo || inspection.lotNo || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">วันที่ตรวจ</p>
            <p className="font-medium">{formatDate(inspection.inspectionDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">ผู้ตรวจ</p>
            <p className="font-medium">{inspection.inspectedBy}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Template</p>
            <p className="font-medium">{template?.code || '-'}</p>
          </div>
        </div>

        {/* CCP Deviation Warning */}
        {inspection.isCCP && inspection.status === 'FAILED' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">CCP Deviation - ต้องดำเนินการแก้ไข</p>
              {inspection.ccpDeviationAction && (
                <p className="text-sm text-red-600">การดำเนินการ: {inspection.ccpDeviationAction}</p>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="readings" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-fit">
            <TabsTrigger value="readings" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              ผลตรวจ ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="template" className="gap-2">
              <FileText className="w-4 h-4" />
              เทมเพลต
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              ประวัติ ({relatedInspections.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* Readings Tab */}
            <TabsContent value="readings" className="m-0 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{passCount}</p>
                  <p className="text-sm text-gray-600">ผ่าน</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{failCount}</p>
                  <p className="text-sm text-gray-600">ไม่ผ่าน</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                  <p className="text-sm text-gray-600">ทั้งหมด</p>
                </div>
              </div>

              {/* Reading Cards */}
              <div className="space-y-3">
                {inspection.readings.map((reading) => {
                  const param = getParameter(reading.parameterId)
                  const isPassed = reading.status === 'PASS'

                  return (
                    <div
                      key={reading.id}
                      className={cn(
                        "rounded-lg border p-4",
                        isPassed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {param?.name || `พารามิเตอร์ #${reading.parameterId}`}
                            </h4>
                            {param?.isCritical && (
                              <Badge variant="destructive" className="text-xs">CCP</Badge>
                            )}
                          </div>
                          {param?.nameEn && (
                            <p className="text-sm text-gray-500">{param.nameEn}</p>
                          )}
                        </div>
                        <Badge className={cn(
                          isPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        )}>
                          {isPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        {/* Criteria */}
                        <div>
                          <p className="text-gray-500">เกณฑ์</p>
                          <p className="font-medium">
                            {param?.type === 'NUMERIC' ? (
                              <>
                                {param.minValue !== undefined && `≥ ${param.minValue}`}
                                {param.minValue !== undefined && param.maxValue !== undefined && ' และ '}
                                {param.maxValue !== undefined && `≤ ${param.maxValue}`}
                                {param.uom && ` ${param.uom}`}
                              </>
                            ) : param?.type === 'ACCEPTANCE' ? (
                              param.acceptableValues?.join(', ')
                            ) : '-'}
                          </p>
                        </div>

                        {/* Measured Value */}
                        <div>
                          <p className="text-gray-500">ค่าที่วัดได้</p>
                          <p className={cn(
                            "font-medium",
                            isPassed ? "text-green-700" : "text-red-700"
                          )}>
                            {reading.numericValue !== undefined ? (
                              <>{reading.numericValue} {param?.uom || ''}</>
                            ) : reading.acceptanceValue ? (
                              reading.acceptanceValue
                            ) : '-'}
                          </p>
                        </div>
                      </div>

                      {reading.remarks && (
                        <div className="mt-3 pt-3 border-t border-dashed">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">หมายเหตุ:</span> {reading.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Overall Remarks */}
              {inspection.resultRemarks && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">หมายเหตุรวม</p>
                  <p className="font-medium">{inspection.resultRemarks}</p>
                </div>
              )}
            </TabsContent>

            {/* Template Tab */}
            <TabsContent value="template" className="m-0 space-y-4">
              {template ? (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">ข้อมูลเทมเพลต</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">รหัส</p>
                        <p className="font-medium">{template.code}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ชื่อ</p>
                        <p className="font-medium">{template.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ประเภท</p>
                        <p className="font-medium">
                          {template.type === 'RAW_MATERIAL' ? 'วัตถุดิบ' :
                           template.type === 'SEMI_FINISHED' ? 'กึ่งสำเร็จรูป' :
                           template.type === 'FINISHED_GOOD' ? 'สินค้าสำเร็จรูป' : 'กระบวนการ'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Version</p>
                        <p className="font-medium">v{template.version}</p>
                      </div>
                    </div>
                    {template.description && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-gray-500 text-sm">คำอธิบาย</p>
                        <p className="text-sm">{template.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      พารามิเตอร์ทั้งหมด ({template.parameters.length})
                    </h4>
                    <div className="space-y-2">
                      {template.parameters.map((param, idx) => (
                        <div
                          key={param.id}
                          className="flex items-center justify-between bg-white rounded-lg p-3 border"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm w-6">{idx + 1}.</span>
                            <div>
                              <p className="font-medium">{param.name}</p>
                              {param.nameEn && (
                                <p className="text-sm text-gray-500">{param.nameEn}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {param.type === 'NUMERIC' ? 'ตัวเลข' : 'ยอมรับ/ไม่ยอมรับ'}
                            </Badge>
                            {param.isCritical && (
                              <Badge variant="destructive">CCP</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  ไม่พบข้อมูลเทมเพลต
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="m-0 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  ประวัติการตรวจสินค้าเดียวกัน
                </h4>

                {relatedInspections.length > 0 ? (
                  <div className="space-y-2">
                    {relatedInspections.map((related) => {
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
                              related.status === 'PASSED' ? 'bg-green-100' :
                              related.status === 'FAILED' ? 'bg-red-100' : 'bg-gray-100'
                            )}>
                              <RelatedIcon className={cn("w-4 h-4", relatedStatus.iconColor)} />
                            </div>
                            <div>
                              <p className="font-medium">{related.code}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(related.inspectionDate)} • {related.inspectedBy}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {related.batchNo && (
                              <span className="text-sm text-gray-500">Batch: {related.batchNo}</span>
                            )}
                            <Badge className={relatedStatus.color}>
                              {relatedStatus.label}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">ไม่มีประวัติการตรวจก่อนหน้า</p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Approval Status */}
        {inspection.approvedBy && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">อนุมัติแล้ว</p>
              <p className="text-sm text-green-600">
                โดย {inspection.approvedBy}
                {inspection.approvedAt && ` เมื่อ ${formatDate(inspection.approvedAt)}`}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            สร้างเมื่อ: {formatDate(inspection.createdAt)}
          </div>
          <div className="flex gap-2">
            {onPrint && (
              <Button variant="outline" onClick={() => onPrint(inspection)}>
                <Printer className="w-4 h-4 mr-2" />
                พิมพ์รายงาน
              </Button>
            )}
            {onApprove && !inspection.approvedBy && inspection.status !== 'DRAFT' && (
              <Button
                onClick={() => onApprove(inspection)}
                className="bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                อนุมัติ
              </Button>
            )}
            <Button onClick={onClose}>ปิด</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
