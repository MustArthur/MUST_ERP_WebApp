'use client'

import { useState, useEffect } from 'react'
import { QCInspection, QCTemplate, InspectionType, CreateQCInspectionInput } from '@/types/quality'
import { useQualityStore } from '@/stores/quality-store'
import { useInventoryStore } from '@/stores/inventory-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ClipboardCheck, Save, X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface InspectionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (inspection: QCInspection) => void
}

interface ReadingInput {
  parameterId: string
  numericValue?: number
  acceptanceValue?: string
  remarks?: string
}

export function InspectionFormModal({
  isOpen,
  onClose,
  onSave,
}: InspectionFormModalProps) {
  const { templates, createInspection, isLoading } = useQualityStore()
  const { stockItems } = useInventoryStore()

  const [formData, setFormData] = useState<{
    type: InspectionType
    templateId: string
    itemId: string
    batchNo: string
    sampleQty: number
    remarks: string
  }>({
    type: 'INCOMING',
    templateId: '',
    itemId: '',
    batchNo: '',
    sampleQty: 1,
    remarks: '',
  })

  const [readings, setReadings] = useState<ReadingInput[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get selected template
  const selectedTemplate = templates.find(t => t.id === formData.templateId)

  // Get active templates
  const activeTemplates = templates.filter(t => t.status === 'ACTIVE')

  // Initialize readings when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setReadings(
        selectedTemplate.parameters.map(param => ({
          parameterId: param.id,
          numericValue: undefined,
          acceptanceValue: undefined,
          remarks: '',
        }))
      )
    } else {
      setReadings([])
    }
  }, [selectedTemplate])

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleReadingChange = (parameterId: string, field: string, value: unknown) => {
    setReadings(prev =>
      prev.map(r =>
        r.parameterId === parameterId ? { ...r, [field]: value } : r
      )
    )
  }

  const getReadingStatus = (reading: ReadingInput): 'PASS' | 'FAIL' | 'PENDING' => {
    if (!selectedTemplate) return 'PENDING'
    const param = selectedTemplate.parameters.find(p => p.id === reading.parameterId)
    if (!param) return 'PENDING'

    if (param.type === 'NUMERIC') {
      if (reading.numericValue === undefined) return 'PENDING'
      const minOk = param.minValue === undefined || reading.numericValue >= param.minValue
      const maxOk = param.maxValue === undefined || reading.numericValue <= param.maxValue
      return minOk && maxOk ? 'PASS' : 'FAIL'
    } else if (param.type === 'ACCEPTANCE') {
      if (!reading.acceptanceValue) return 'PENDING'
      return param.acceptableValues?.includes(reading.acceptanceValue) ? 'PASS' : 'FAIL'
    }

    return 'PENDING'
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.templateId) {
      newErrors.templateId = 'กรุณาเลือก Template'
    }
    if (!formData.itemId) {
      newErrors.itemId = 'กรุณาเลือกสินค้า'
    }
    if (formData.sampleQty <= 0) {
      newErrors.sampleQty = 'จำนวนตัวอย่างต้องมากกว่า 0'
    }

    // Check if all readings have values
    const incompleteReadings = readings.some(r => {
      const param = selectedTemplate?.parameters.find(p => p.id === r.parameterId)
      if (!param) return false
      if (param.type === 'NUMERIC') return r.numericValue === undefined
      if (param.type === 'ACCEPTANCE') return !r.acceptanceValue
      return false
    })

    if (incompleteReadings) {
      newErrors.readings = 'กรุณากรอกค่าทุกพารามิเตอร์'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      const input: CreateQCInspectionInput = {
        type: formData.type,
        templateId: formData.templateId,
        sourceDocType: 'STOCK_ENTRY',
        sourceDocId: 'manual',
        itemId: formData.itemId,
        batchNo: formData.batchNo || undefined,
        sampleQty: formData.sampleQty,
        readings: readings.map(r => ({
          parameterId: r.parameterId,
          numericValue: r.numericValue,
          acceptanceValue: r.acceptanceValue,
          remarks: r.remarks,
        })),
        remarks: formData.remarks || undefined,
      }

      const savedInspection = await createInspection(input)
      onSave(savedInspection)
      onClose()
    } catch (error) {
      console.error('Failed to create inspection:', error)
    }
  }

  const inspectionTypes: { value: InspectionType; label: string }[] = [
    { value: 'INCOMING', label: 'ตรวจรับ' },
    { value: 'IN_PROCESS', label: 'ระหว่างผลิต' },
    { value: 'FINAL', label: 'สินค้าสำเร็จรูป' },
    { value: 'PATROL', label: 'ตรวจประจำ' },
  ]

  // Calculate summary
  const passCount = readings.filter(r => getReadingStatus(r) === 'PASS').length
  const failCount = readings.filter(r => getReadingStatus(r) === 'FAIL').length
  const pendingCount = readings.filter(r => getReadingStatus(r) === 'PENDING').length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle className="text-xl">สร้างใบตรวจสอบใหม่</DialogTitle>
          </div>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">ข้อมูลการตรวจสอบ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ประเภทการตรวจ</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {inspectionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Template *</Label>
                <Select
                  value={formData.templateId}
                  onValueChange={(value) => handleChange('templateId', value)}
                >
                  <SelectTrigger className={errors.templateId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="เลือก Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.code} - {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.templateId && (
                  <p className="text-sm text-red-500">{errors.templateId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>สินค้า *</Label>
                <Select
                  value={formData.itemId}
                  onValueChange={(value) => handleChange('itemId', value)}
                >
                  <SelectTrigger className={errors.itemId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="เลือกสินค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.code} - {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.itemId && (
                  <p className="text-sm text-red-500">{errors.itemId}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNo">Batch/Lot</Label>
                <Input
                  id="batchNo"
                  value={formData.batchNo}
                  onChange={(e) => handleChange('batchNo', e.target.value)}
                  placeholder="เช่น L2026-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sampleQty">จำนวนตัวอย่าง *</Label>
                <Input
                  id="sampleQty"
                  type="number"
                  min="1"
                  value={formData.sampleQty}
                  onChange={(e) => handleChange('sampleQty', parseInt(e.target.value) || 1)}
                  className={errors.sampleQty ? 'border-red-500' : ''}
                />
                {errors.sampleQty && (
                  <p className="text-sm text-red-500">{errors.sampleQty}</p>
                )}
              </div>
            </div>
          </div>

          {/* Readings */}
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  บันทึกผลตรวจสอบ ({selectedTemplate.parameters.length} รายการ)
                </h3>
                {readings.length > 0 && (
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
                )}
              </div>

              {errors.readings && (
                <p className="text-sm text-red-500">{errors.readings}</p>
              )}

              <div className="space-y-3">
                {selectedTemplate.parameters.map((param, idx) => {
                  const reading = readings.find(r => r.parameterId === param.id)
                  const status = reading ? getReadingStatus(reading) : 'PENDING'

                  return (
                    <div
                      key={param.id}
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
                                {param.minValue !== undefined && `≥ ${param.minValue}`}
                                {param.minValue !== undefined && param.maxValue !== undefined && ' และ '}
                                {param.maxValue !== undefined && `≤ ${param.maxValue}`}
                                {param.uom && ` ${param.uom}`}
                              </>
                            ) : (
                              param.acceptableValues?.join(', ')
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
                                value={reading?.numericValue ?? ''}
                                onChange={(e) => handleReadingChange(
                                  param.id,
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
                                value={reading?.acceptanceValue || ''}
                                onValueChange={(value) => handleReadingChange(
                                  param.id,
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
                                  {/* Add common rejection values */}
                                  <SelectItem value="ผิดปกติ">ผิดปกติ</SelectItem>
                                  <SelectItem value="ไม่ผ่าน">ไม่ผ่าน</SelectItem>
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
                          value={reading?.remarks || ''}
                          onChange={(e) => handleReadingChange(param.id, 'remarks', e.target.value)}
                          className="bg-white text-sm"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Overall Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">หมายเหตุรวม</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม..."
              rows={2}
            />
          </div>

          {/* Warning if any fail */}
          {failCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">พบรายการไม่ผ่าน {failCount} รายการ</p>
                <p className="text-sm text-red-600">
                  การตรวจสอบจะถูกบันทึกเป็นสถานะ "ไม่ผ่าน"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedTemplate}
            className={failCount > 0 ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'กำลังบันทึก...' : 'บันทึกผลตรวจ'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
