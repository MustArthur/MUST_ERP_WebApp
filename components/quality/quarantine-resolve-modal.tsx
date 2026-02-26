'use client'

import { useState } from 'react'
import { QuarantineRecord, QuarantineAction } from '@/types/quality'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import {
  AlertTriangle,
  Package,
  Undo2,
  Trash2,
  RefreshCw,
  CheckCircle,
  ArrowDownCircle,
} from 'lucide-react'

interface QuarantineResolveModalProps {
  record: QuarantineRecord | null
  isOpen: boolean
  onClose: () => void
  onResolve: (id: string, action: QuarantineAction, detail?: string) => Promise<void>
}

const actionOptions: {
  value: QuarantineAction
  label: string
  description: string
  icon: any
  color: string
  bgColor: string
}[] = [
  {
    value: 'RETURN_TO_SUPPLIER',
    label: 'คืน Supplier',
    description: 'ส่งคืนผู้จำหน่ายเพื่อขอเปลี่ยนหรือคืนเงิน',
    icon: Undo2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
  {
    value: 'DISPOSE',
    label: 'ทำลาย',
    description: 'ทำลายสินค้าตามระเบียบ (ไม่สามารถนำกลับมาใช้)',
    icon: Trash2,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200 hover:bg-red-100',
  },
  {
    value: 'REWORK',
    label: 'แก้ไข/Rework',
    description: 'นำกลับไปแก้ไขหรือผลิตใหม่',
    icon: RefreshCw,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  },
  {
    value: 'RELEASE',
    label: 'ปล่อยใช้งาน',
    description: 'ผ่านการตรวจสอบแล้ว นำกลับไปใช้งานได้',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200 hover:bg-green-100',
  },
  {
    value: 'DOWNGRADE',
    label: 'ลดเกรด',
    description: 'ปรับลดเกรดสินค้าเพื่อนำไปใช้งานอื่น',
    icon: ArrowDownCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  },
]

const reasonLabels: Record<string, string> = {
  QC_FAILED: 'QC ไม่ผ่าน',
  PENDING_QC: 'รอตรวจ QC',
  TEMPERATURE_DEVIATION: 'อุณหภูมิผิดปกติ',
  EXPIRED: 'หมดอายุ',
  DAMAGED: 'เสียหาย',
  CUSTOMER_COMPLAINT: 'ลูกค้าร้องเรียน',
  OTHER: 'อื่นๆ',
}

const actionLabels: Record<QuarantineAction, string> = {
  RETURN_TO_SUPPLIER: 'คืน Supplier',
  DISPOSE: 'ทำลาย',
  REWORK: 'แก้ไข/Rework',
  RELEASE: 'ปล่อยใช้งาน',
  DOWNGRADE: 'ลดเกรด',
}

export function QuarantineResolveModal({
  record,
  isOpen,
  onClose,
  onResolve,
}: QuarantineResolveModalProps) {
  const [selectedAction, setSelectedAction] = useState<QuarantineAction | null>(null)
  const [detail, setDetail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setSelectedAction(null)
    setDetail('')
    onClose()
  }

  const handleSubmit = async () => {
    if (!record || !selectedAction) return

    setIsSubmitting(true)
    try {
      await onResolve(record.id, selectedAction, detail || undefined)
      handleClose()
    } catch (error) {
      console.error('Failed to resolve quarantine:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!record) return null

  // Check if record is already resolved
  const isResolved = record.status !== 'PENDING'
  const resolvedAction = record.action ? actionOptions.find(a => a.value === record.action) : null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isResolved ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                รายละเอียด Quarantine
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                จัดการ Quarantine
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Item Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <Package className="w-8 h-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{record.itemName}</p>
                    <p className="text-sm text-gray-500">
                      {record.itemCode}
                      {record.batchNo && ` • Batch: ${record.batchNo}`}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 text-base px-3 py-1">
                    {record.qty.toLocaleString()} {record.uom}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">รหัส:</span>
                    <span className="ml-2 font-mono">{record.code}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">คลัง:</span>
                    <span className="ml-2">{record.warehouseName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">วันที่กักกัน:</span>
                    <span className="ml-2">{formatDate(record.quarantinedAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">กักกันโดย:</span>
                    <span className="ml-2">{record.quarantinedBy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-800">
                สาเหตุ: {reasonLabels[record.reason] || record.reason}
              </p>
              {record.reasonDetail && (
                <p className="text-sm text-red-600 mt-1">{record.reasonDetail}</p>
              )}
            </div>
          </div>

          {/* Show resolved status OR action selection based on record status */}
          {isResolved ? (
            /* Read-only view for resolved records */
            <div className="space-y-4">
              <div className={cn(
                'p-4 rounded-lg border-2',
                record.status === 'DISPOSED' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              )}>
                <div className="flex items-center gap-3">
                  {resolvedAction && (
                    <>
                      <div className={cn('p-2 rounded-lg bg-white')}>
                        <resolvedAction.icon className={cn('w-6 h-6', resolvedAction.color)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">การดำเนินการที่ทำไปแล้ว:</p>
                        <p className={cn('font-semibold text-lg', resolvedAction.color)}>
                          {resolvedAction.label}
                        </p>
                      </div>
                    </>
                  )}
                  {!resolvedAction && record.action && (
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">การดำเนินการที่ทำไปแล้ว:</p>
                      <Badge className="bg-gray-100 text-gray-800">
                        {actionLabels[record.action] || record.action}
                      </Badge>
                    </div>
                  )}
                </div>

                {record.actionDetail && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">รายละเอียด:</p>
                    <p className="text-gray-800">{record.actionDetail}</p>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">ดำเนินการโดย:</span>
                    <span className="ml-2 font-medium">{record.resolvedBy || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">วันที่ดำเนินการ:</span>
                    <span className="ml-2">{record.resolvedAt ? formatDate(record.resolvedAt) : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex justify-center">
                <Badge className={cn(
                  'px-4 py-2 text-base',
                  record.status === 'DISPOSED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                )}>
                  {record.status === 'DISPOSED' ? 'ทำลายแล้ว' : 'แก้ไขแล้ว'}
                </Badge>
              </div>
            </div>
          ) : (
            /* Action selection for pending records */
            <>
              <div className="space-y-3">
                <Label className="text-base font-semibold">เลือกวิธีจัดการ</Label>
                <div className="grid grid-cols-1 gap-3">
                  {actionOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = selectedAction === option.value

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all',
                          isSelected
                            ? `${option.bgColor} border-current ring-2 ring-offset-2`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        )}
                        onClick={() => setSelectedAction(option.value)}
                      >
                        <div
                          className={cn(
                            'p-2 rounded-lg',
                            isSelected ? 'bg-white' : 'bg-gray-100'
                          )}
                        >
                          <Icon className={cn('w-5 h-5', option.color)} />
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              'font-semibold',
                              isSelected ? option.color : 'text-gray-900'
                            )}
                          >
                            {option.label}
                          </p>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle className={cn('w-5 h-5 mt-1', option.color)} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Detail */}
              {selectedAction && (
                <div className="space-y-2">
                  <Label htmlFor="detail">รายละเอียดเพิ่มเติม</Label>
                  <Textarea
                    id="detail"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="ระบุรายละเอียดการดำเนินการ..."
                    rows={3}
                  />
                </div>
              )}

              {/* Warning for destructive actions */}
              {selectedAction === 'DISPOSE' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-medium text-red-800">
                      การทำลายสินค้าไม่สามารถย้อนกลับได้
                    </p>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {isResolved ? 'ปิด' : 'ยกเลิก'}
          </Button>
          {!isResolved && (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAction || isSubmitting}
              className={cn(
                selectedAction === 'DISPOSE' && 'bg-red-600 hover:bg-red-700',
                selectedAction === 'RELEASE' && 'bg-green-600 hover:bg-green-700'
              )}
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการดำเนินการ'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
