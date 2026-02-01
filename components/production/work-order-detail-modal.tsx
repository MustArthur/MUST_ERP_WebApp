'use client'

import { useState } from 'react'
import { WorkOrder, JobCard } from '@/types/production'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JobCardTimeline } from './job-card-timeline'
import { cn, formatNumber } from '@/lib/utils'
import {
  Factory,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
  Thermometer,
  Package,
  Calendar,
  User,
  AlertTriangle,
  Layers,
} from 'lucide-react'

interface WorkOrderDetailModalProps {
  workOrder: WorkOrder | null
  isOpen: boolean
  onClose: () => void
  onRelease?: (workOrder: WorkOrder) => void
  onStart?: (workOrder: WorkOrder) => void
  onComplete?: (workOrder: WorkOrder) => void
  onCancel?: (workOrder: WorkOrder) => void
  onStartJobCard?: (jobCard: JobCard) => void
  onCompleteJobCard?: (jobCard: JobCard, completedQty: number) => void
  onRecordCCP?: (jobCard: JobCard) => void
}

export function WorkOrderDetailModal({
  workOrder,
  isOpen,
  onClose,
  onRelease,
  onStart,
  onComplete,
  onCancel,
  onStartJobCard,
  onCompleteJobCard,
  onRecordCCP,
}: WorkOrderDetailModalProps) {
  const [activeTab, setActiveTab] = useState('timeline')
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null)
  const [completedQty, setCompletedQty] = useState('')

  if (!workOrder) return null

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
    },
    PASSED: {
      label: 'CCP ผ่าน',
      color: 'bg-green-100 text-green-800',
    },
    FAILED: {
      label: 'CCP ไม่ผ่าน',
      color: 'bg-red-100 text-red-800',
    },
    NOT_REQUIRED: {
      label: 'ไม่มี CCP',
      color: 'bg-gray-100 text-gray-600',
    },
  }

  const status = statusConfig[workOrder.status]
  const ccpStatus = ccpStatusConfig[workOrder.ccpStatus]
  const StatusIcon = status.icon

  // Check if CCP gates allow completion
  const ccpJobCards = workOrder.jobCards.filter(jc => jc.isCCP)
  const allCCPPassed = ccpJobCards.every(jc => jc.ccpStatus === 'PASSED')
  const allJobCardsCompleted = workOrder.jobCards.every(jc => jc.status === 'COMPLETED')
  const canComplete = allCCPPassed && allJobCardsCompleted

  const handleCompleteJobCard = (jc: JobCard) => {
    setSelectedJobCard(jc)
    setCompletedQty(String(jc.plannedQty))
  }

  const confirmCompleteJobCard = () => {
    if (selectedJobCard && onCompleteJobCard) {
      onCompleteJobCard(selectedJobCard, parseInt(completedQty) || 0)
      setSelectedJobCard(null)
      setCompletedQty('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <span className="font-mono">{workOrder.code}</span>
                <Badge variant={status.variant}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
                {workOrder.ccpStatus !== 'NOT_REQUIRED' && (
                  <Badge className={cn('text-xs', ccpStatus.color)}>
                    <Thermometer className="w-3 h-3 mr-1" />
                    {ccpStatus.label}
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">{workOrder.recipeName}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Info Bar */}
        <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <Package className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">จำนวน</p>
            <p className="font-semibold">
              {formatNumber(workOrder.completedQty)}/{formatNumber(workOrder.plannedQty)}
            </p>
          </div>
          <div className="text-center">
            <Calendar className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">วันที่แผน</p>
            <p className="font-semibold">{workOrder.plannedDate}</p>
          </div>
          <div className="text-center">
            <Layers className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Batch</p>
            <p className="font-semibold text-sm">{workOrder.batchNo}</p>
          </div>
          <div className="text-center">
            <Clock className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">ความคืบหน้า</p>
            <p className="font-semibold">{workOrder.progress}%</p>
          </div>
          <div className="text-center">
            <User className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">สร้างโดย</p>
            <p className="font-semibold text-sm">{workOrder.createdBy}</p>
          </div>
        </div>

        {/* CCP Gate Warning */}
        {workOrder.ccpStatus === 'FAILED' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">CCP ไม่ผ่านเกณฑ์</p>
              <p className="text-sm text-red-700">
                ใบสั่งผลิตนี้มี CCP ที่ไม่ผ่านเกณฑ์ กรุณาตรวจสอบและดำเนินการแก้ไข
              </p>
            </div>
          </div>
        )}

        {workOrder.ccpStatus === 'PENDING' && workOrder.status === 'IN_PROGRESS' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">รอบันทึก CCP</p>
              <p className="text-sm text-yellow-700">
                ยังมี CCP ที่รอการบันทึกค่า กรุณาบันทึกค่า CCP ก่อนดำเนินการต่อ
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">
              <Clock className="w-4 h-4 mr-2" />
              ขั้นตอน
            </TabsTrigger>
            <TabsTrigger value="materials">
              <Package className="w-4 h-4 mr-2" />
              วัตถุดิบ
            </TabsTrigger>
            <TabsTrigger value="ccp">
              <Thermometer className="w-4 h-4 mr-2" />
              CCP Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            <JobCardTimeline
              jobCards={workOrder.jobCards}
              onStartJobCard={onStartJobCard}
              onCompleteJobCard={handleCompleteJobCard}
              onRecordCCP={onRecordCCP}
            />
          </TabsContent>

          <TabsContent value="materials" className="mt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-center text-gray-500">
                รายการวัตถุดิบที่ใช้ในการผลิตจะแสดงที่นี่
              </p>
              <p className="text-center text-gray-400 text-sm mt-2">
                (เชื่อมต่อกับ Recipe: {workOrder.recipeCode})
              </p>
            </div>
          </TabsContent>

          <TabsContent value="ccp" className="mt-4">
            <div className="space-y-4">
              {ccpJobCards.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                  ใบสั่งผลิตนี้ไม่มี CCP
                </div>
              ) : (
                ccpJobCards.map((jc) => (
                  <div key={jc.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-orange-500" />
                        <span className="font-medium">{jc.operation?.name}</span>
                        <Badge className="text-xs">{jc.operation?.code}</Badge>
                      </div>
                      <Badge
                        className={cn(
                          'text-xs',
                          jc.ccpStatus === 'PASSED' && 'bg-green-100 text-green-800',
                          jc.ccpStatus === 'FAILED' && 'bg-red-100 text-red-800',
                          jc.ccpStatus === 'PENDING' && 'bg-yellow-100 text-yellow-800'
                        )}
                      >
                        {jc.ccpStatus === 'PASSED' && 'ผ่าน'}
                        {jc.ccpStatus === 'FAILED' && 'ไม่ผ่าน'}
                        {jc.ccpStatus === 'PENDING' && 'รอบันทึก'}
                      </Badge>
                    </div>

                    {/* CCP Criteria */}
                    <div className="text-sm text-gray-600 mb-3">
                      <p>
                        <span className="font-medium">เกณฑ์: </span>
                        {jc.operation?.ccpCriteria?.minTemp !== undefined &&
                          `อุณหภูมิ ≥ ${jc.operation.ccpCriteria.minTemp}°C`}
                        {jc.operation?.ccpCriteria?.holdingTime !== undefined &&
                          ` • เวลา ≥ ${jc.operation.ccpCriteria.holdingTime} วินาที`}
                      </p>
                    </div>

                    {/* Readings */}
                    {jc.ccpReadings.length > 0 ? (
                      <div className="space-y-2">
                        {jc.ccpReadings.map((reading) => (
                          <div
                            key={reading.id}
                            className={cn(
                              'flex items-center justify-between p-2 rounded',
                              reading.passed ? 'bg-green-50' : 'bg-red-50'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {reading.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className={reading.passed ? 'text-green-800' : 'text-red-800'}>
                                {reading.temperature !== undefined && `${reading.temperature}°C`}
                                {reading.holdingTime !== undefined &&
                                  ` • ${reading.holdingTime} วินาที`}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              <span>{reading.operator}</span>
                              <span className="ml-2">
                                {new Date(reading.timestamp).toLocaleString('th-TH')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">ยังไม่มีการบันทึก CCP</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Complete Job Card Dialog */}
        {selectedJobCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="font-semibold mb-4">ปิด Job Card</h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedJobCard.operation?.name} ({selectedJobCard.code})
              </p>
              <div className="space-y-4">
                <div>
                  <Label>จำนวนที่ทำได้ (ขวด)</Label>
                  <Input
                    type="number"
                    value={completedQty}
                    onChange={(e) => setCompletedQty(e.target.value)}
                    max={selectedJobCard.plannedQty}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedJobCard(null)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={confirmCompleteJobCard}>ยืนยัน</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t mt-4">
          <div>
            {workOrder.status !== 'CANCELLED' && workOrder.status !== 'COMPLETED' && (
              <Button variant="destructive" onClick={() => onCancel?.(workOrder)}>
                <XCircle className="w-4 h-4 mr-2" />
                ยกเลิก
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {workOrder.status === 'DRAFT' && (
              <Button onClick={() => onRelease?.(workOrder)}>
                <PlayCircle className="w-4 h-4 mr-2" />
                ปล่อยใบสั่งผลิต
              </Button>
            )}

            {workOrder.status === 'RELEASED' && (
              <Button onClick={() => onStart?.(workOrder)}>
                <Factory className="w-4 h-4 mr-2" />
                เริ่มผลิต
              </Button>
            )}

            {workOrder.status === 'IN_PROGRESS' && canComplete && (
              <Button onClick={() => onComplete?.(workOrder)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                เสร็จสิ้น
              </Button>
            )}

            {workOrder.status === 'IN_PROGRESS' && !canComplete && (
              <Button disabled title="ต้อง CCP ผ่านทั้งหมดและ Job Cards เสร็จทั้งหมด">
                <CheckCircle className="w-4 h-4 mr-2" />
                เสร็จสิ้น
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
