'use client'

import { useState, useEffect } from 'react'
import { QCInspection, QCParameter, QuarantineAction } from '@/types/quality'
import { useQualityStore } from '@/stores/quality-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ClipboardCheck,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
} from 'lucide-react'

interface InspectionEntryModalProps {
  inspection: QCInspection | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

interface ReadingInput {
  parameterId: string
  numericValue?: number
  acceptanceValue?: string
  remarks?: string
}

export function InspectionEntryModal({
  inspection,
  isOpen,
  onClose,
  onSave,
}: InspectionEntryModalProps) {
  const { updateInspectionReadings, isLoading } = useQualityStore()

  const [readings, setReadings] = useState<ReadingInput[]>([])

  // Partial pass state
  const [acceptedQty, setAcceptedQty] = useState<number>(0)
  const [rejectedQty, setRejectedQty] = useState<number>(0)
  const [quarantineAction, setQuarantineAction] = useState<QuarantineAction>('RETURN_TO_SUPPLIER')

  // Get template from inspection
  const template = inspection?.template

  // Initialize readings and quantities when inspection changes
  useEffect(() => {
    if (inspection && inspection.readings) {
      setReadings(
        inspection.readings.map(r => ({
          parameterId: r.parameterId,
          numericValue: r.numericValue ?? undefined,
          acceptanceValue: r.acceptanceValue ?? undefined,
          remarks: r.remarks ?? '',
        }))
      )
      // Initialize quantities from inspection
      setAcceptedQty(inspection.sampleQty || 0)
      setRejectedQty(0)
      setQuarantineAction('RETURN_TO_SUPPLIER')
    } else {
      setReadings([])
      setAcceptedQty(0)
      setRejectedQty(0)
    }
  }, [inspection])

  // Get parameter info by ID
  const getParameter = (parameterId: string): QCParameter | undefined => {
    // First try from template
    if (template?.parameters) {
      const param = template.parameters.find(p => p.id === parameterId)
      if (param) return param
    }
    // Fallback to reading's embedded parameter
    const reading = inspection?.readings.find(r => r.parameterId === parameterId)
    return reading?.parameter
  }

  const handleReadingChange = (parameterId: string, field: string, value: unknown) => {
    setReadings(prev =>
      prev.map(r =>
        r.parameterId === parameterId ? { ...r, [field]: value } : r
      )
    )
  }

  const getReadingStatus = (reading: ReadingInput): 'PASS' | 'FAIL' | 'PENDING' => {
    const param = getParameter(reading.parameterId)
    if (!param) return 'PENDING'

    if (param.type === 'NUMERIC') {
      if (reading.numericValue === undefined || reading.numericValue === null) return 'PENDING'
      const minOk = param.minValue === undefined || reading.numericValue >= param.minValue
      const maxOk = param.maxValue === undefined || reading.numericValue <= param.maxValue
      return minOk && maxOk ? 'PASS' : 'FAIL'
    } else if (param.type === 'ACCEPTANCE') {
      if (!reading.acceptanceValue) return 'PENDING'
      return param.acceptableValues?.includes(reading.acceptanceValue) ? 'PASS' : 'FAIL'
    }

    return 'PENDING'
  }

  // Handle accepted qty change - auto-calculate rejected
  const handleAcceptedQtyChange = (value: number) => {
    const sampleQty = inspection?.sampleQty || 0
    const newAccepted = Math.min(Math.max(0, value), sampleQty)
    setAcceptedQty(newAccepted)
    setRejectedQty(sampleQty - newAccepted)
  }

  // Handle rejected qty change - auto-calculate accepted
  const handleRejectedQtyChange = (value: number) => {
    const sampleQty = inspection?.sampleQty || 0
    const newRejected = Math.min(Math.max(0, value), sampleQty)
    setRejectedQty(newRejected)
    setAcceptedQty(sampleQty - newRejected)
  }

  const handleSubmit = async () => {
    if (!inspection) return

    try {
      // Prepare quantities if there are failed readings
      const quantities = failCount > 0 ? {
        acceptedQty,
        rejectedQty,
        quarantineAction: rejectedQty > 0 ? quarantineAction : undefined
      } : undefined

      await updateInspectionReadings(inspection.id, readings, quantities)
      onSave()
      onClose()
    } catch (error) {
      console.error('Failed to save inspection readings:', error)
    }
  }

  // Calculate summary
  const passCount = readings.filter(r => getReadingStatus(r) === 'PASS').length
  const failCount = readings.filter(r => getReadingStatus(r) === 'FAIL').length
  const pendingCount = readings.filter(r => getReadingStatus(r) === 'PENDING').length

  // Check if all readings have values
  const allReadingsComplete = pendingCount === 0

  // Validation for quantities
  const sampleQty = inspection?.sampleQty || 0
  const qtyValid = (acceptedQty + rejectedQty) === sampleQty
  const canSubmit = allReadingsComplete && (failCount === 0 || qtyValid)

  if (!inspection) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                บันทึกผลการตรวจสอบ - {inspection.code}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                กรอกค่าที่วัดได้สำหรับแต่ละรายการ
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Item Info */}
        <div className="py-3 border-b grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">สินค้า</p>
            <p className="font-medium">{inspection.itemName || inspection.itemCode}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Batch/Lot</p>
            <p className="font-medium">{inspection.batchNo || inspection.lotNo || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">จำนวนที่ตรวจ</p>
            <p className="font-medium">{inspection.sampleQty}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Template</p>
            <p className="font-medium">{template?.code || '-'}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between py-3">
          <h3 className="font-medium text-gray-900">
            รายการตรวจสอบ ({readings.length} รายการ)
          </h3>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800">
              ผ่าน: {passCount}
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              ไม่ผ่าน: {failCount}
            </Badge>
            <Badge className="bg-gray-100 text-gray-800">
              รอ: {pendingCount}
            </Badge>
          </div>
        </div>

        {/* Readings Form */}
        <div className="space-y-3">
          {readings.map((reading, idx) => {
            const param = getParameter(reading.parameterId)
            const status = getReadingStatus(reading)

            if (!param) {
              return (
                <div key={reading.parameterId} className="rounded-lg border p-4 bg-gray-50">
                  <p className="text-gray-500">ไม่พบข้อมูล Parameter #{reading.parameterId.slice(-4)}</p>
                </div>
              )
            }

            return (
              <div
                key={reading.parameterId}
                className={cn(
                  "rounded-lg border p-4",
                  status === 'PASS' && "bg-green-50 border-green-200",
                  status === 'FAIL' && "bg-red-50 border-red-200",
                  status === 'PENDING' && "bg-gray-50 border-gray-200"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">{idx + 1}.</span>
                    <div>
                      <p className="font-medium">{param.name}</p>
                      {param.nameEn && (
                        <p className="text-sm text-gray-500">{param.nameEn}</p>
                      )}
                    </div>
                    {param.isCritical && (
                      <Badge variant="destructive" className="text-xs">CCP</Badge>
                    )}
                  </div>
                  {status === 'PASS' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {status === 'FAIL' && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Criteria */}
                  <div className="text-sm">
                    <p className="text-gray-500 mb-1">เกณฑ์</p>
                    <p className="font-medium">
                      {param.type === 'NUMERIC' ? (
                        <>
                          {param.minValue !== undefined && `>= ${param.minValue}`}
                          {param.minValue !== undefined && param.maxValue !== undefined && ' และ '}
                          {param.maxValue !== undefined && `<= ${param.maxValue}`}
                          {param.uom && ` ${param.uom}`}
                        </>
                      ) : (
                        param.acceptableValues?.join(', ') || '-'
                      )}
                    </p>
                  </div>

                  {/* Input */}
                  <div>
                    {param.type === 'NUMERIC' ? (
                      <div className="space-y-1">
                        <Label className="text-sm">ค่าที่วัดได้ {param.uom && `(${param.uom})`}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={reading.numericValue ?? ''}
                          onChange={(e) => handleReadingChange(
                            reading.parameterId,
                            'numericValue',
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )}
                          placeholder={`ระบุค่า${param.uom ? ` (${param.uom})` : ''}`}
                          className="bg-white"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Label className="text-sm">เลือกผลตรวจ</Label>
                        <Select
                          value={reading.acceptanceValue || ''}
                          onValueChange={(value) => handleReadingChange(
                            reading.parameterId,
                            'acceptanceValue',
                            value
                          )}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="เลือก..." />
                          </SelectTrigger>
                          <SelectContent>
                            {param.acceptableValues?.map(val => (
                              <SelectItem key={val} value={val}>
                                {val}
                              </SelectItem>
                            ))}
                            {/* Add rejection values if not in acceptable list */}
                            {!param.acceptableValues?.includes('ผิดปกติ') && (
                              <SelectItem value="ผิดปกติ">ผิดปกติ</SelectItem>
                            )}
                            {!param.acceptableValues?.includes('ไม่ผ่าน') && (
                              <SelectItem value="ไม่ผ่าน">ไม่ผ่าน</SelectItem>
                            )}
                            {!param.acceptableValues?.includes('เสียหาย') && (
                              <SelectItem value="เสียหาย">เสียหาย</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div className="mt-3">
                  <Input
                    placeholder="หมายเหตุ (ถ้ามี)"
                    value={reading.remarks || ''}
                    onChange={(e) => handleReadingChange(reading.parameterId, 'remarks', e.target.value)}
                    className="bg-white text-sm"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Partial Pass Section - Show when there are failed readings */}
        {failCount > 0 && allReadingsComplete && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium text-orange-800">
                พบรายการไม่ผ่าน - กรุณาระบุจำนวน
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Accepted Qty */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  จำนวนที่ผ่าน
                </Label>
                <Input
                  type="number"
                  min="0"
                  max={sampleQty}
                  value={acceptedQty}
                  onChange={(e) => handleAcceptedQtyChange(parseFloat(e.target.value) || 0)}
                  className="bg-white"
                />
              </div>

              {/* Rejected Qty */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  จำนวนที่ไม่ผ่าน
                </Label>
                <Input
                  type="number"
                  min="0"
                  max={sampleQty}
                  value={rejectedQty}
                  onChange={(e) => handleRejectedQtyChange(parseFloat(e.target.value) || 0)}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Validation message */}
            {!qtyValid && (
              <p className="text-sm text-red-600">
                ผลรวมต้องเท่ากับจำนวนที่ตรวจ ({sampleQty})
              </p>
            )}

            {/* Quarantine Action - Show when there's rejected qty */}
            {rejectedQty > 0 && (
              <div className="pt-3 border-t border-orange-200 space-y-2">
                <Label>การจัดการส่วนที่ไม่ผ่าน ({rejectedQty})</Label>
                <Select
                  value={quarantineAction}
                  onValueChange={(value) => setQuarantineAction(value as QuarantineAction)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="เลือกการจัดการ..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RETURN_TO_SUPPLIER">ส่งคืน Supplier</SelectItem>
                    <SelectItem value="DISPOSE">ทำลาย/กำจัด</SelectItem>
                    <SelectItem value="REWORK">ส่งซ่อม/แก้ไข</SelectItem>
                    <SelectItem value="RELEASE">ปล่อยใช้งาน (มีเงื่อนไข)</SelectItem>
                    <SelectItem value="DOWNGRADE">ลดเกรด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Warning if all fail (no partial) */}
        {failCount > 0 && passCount === 0 && allReadingsComplete && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">ไม่ผ่านการตรวจสอบทั้งหมด</p>
              <p className="text-sm text-red-600">
                สินค้าทั้งหมดจะถูกส่งเข้า Quarantine
              </p>
            </div>
          </div>
        )}

        {/* Incomplete Warning */}
        {!allReadingsComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">ยังมีรายการที่ยังไม่ได้กรอก {pendingCount} รายการ</p>
              <p className="text-sm text-yellow-600">
                กรุณากรอกค่าให้ครบทุกรายการก่อนบันทึก
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !canSubmit}
            className={cn(
              failCount > 0 && "bg-orange-600 hover:bg-orange-700"
            )}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'กำลังบันทึก...' : 'บันทึกผลตรวจ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
