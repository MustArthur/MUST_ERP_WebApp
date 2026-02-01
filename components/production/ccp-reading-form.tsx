'use client'

import { useState } from 'react'
import { JobCard, RecordCCPReadingInput } from '@/types/production'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Thermometer, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface CCPReadingFormProps {
  jobCard: JobCard | null
  isOpen: boolean
  onClose: () => void
  onSave: (input: RecordCCPReadingInput) => void
  operators: { id: string; name: string; department: string }[]
}

export function CCPReadingForm({
  jobCard,
  isOpen,
  onClose,
  onSave,
  operators,
}: CCPReadingFormProps) {
  const [temperature, setTemperature] = useState('')
  const [holdingTime, setHoldingTime] = useState('')
  const [operator, setOperator] = useState('')
  const [notes, setNotes] = useState('')

  if (!jobCard) return null

  const criteria = jobCard.operation?.ccpCriteria
  const requiresTemp = criteria?.type === 'TEMPERATURE' || criteria?.type === 'TEMP_TIME'
  const requiresTime = criteria?.type === 'TIME' || criteria?.type === 'TEMP_TIME'

  // Real-time validation
  const tempValue = parseFloat(temperature)
  const timeValue = parseFloat(holdingTime)

  const isTempValid = !requiresTemp || (criteria?.minTemp !== undefined && tempValue >= criteria.minTemp)
  const isTimeValid = !requiresTime || (criteria?.holdingTime !== undefined && timeValue >= criteria.holdingTime)
  const isFormValid =
    operator &&
    (!requiresTemp || temperature) &&
    (!requiresTime || holdingTime)

  const handleSubmit = () => {
    if (!isFormValid) return

    onSave({
      jobCardId: jobCard.id,
      temperature: requiresTemp ? tempValue : undefined,
      holdingTime: requiresTime ? timeValue : undefined,
      operator,
      notes: notes || undefined,
    })

    // Reset form
    setTemperature('')
    setHoldingTime('')
    setOperator('')
    setNotes('')
    onClose()
  }

  const handleClose = () => {
    setTemperature('')
    setHoldingTime('')
    setOperator('')
    setNotes('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-500" />
            บันทึกค่า CCP
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Card Info */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-orange-100 text-orange-800">CCP</Badge>
              <span className="font-medium">{jobCard.operation?.name}</span>
            </div>
            <p className="text-sm text-gray-600">{jobCard.operation?.code}</p>
          </div>

          {/* CCP Criteria */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">เกณฑ์:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {criteria?.minTemp !== undefined && (
                <li className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  อุณหภูมิ ≥ {criteria.minTemp}°C
                </li>
              )}
              {criteria?.holdingTime !== undefined && (
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  เวลา ≥ {criteria.holdingTime} วินาที
                </li>
              )}
            </ul>
            {criteria?.notes && (
              <p className="text-xs text-gray-500 mt-2">{criteria.notes}</p>
            )}
          </div>

          {/* Temperature Input */}
          {requiresTemp && (
            <div className="space-y-2">
              <Label>อุณหภูมิ (°C) *</Label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.1"
                  className="pl-10"
                  placeholder={`≥ ${criteria?.minTemp || 72}`}
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>
              {temperature && (
                <div className="flex items-center gap-2 text-sm">
                  {isTempValid ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-700">ผ่านเกณฑ์</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-red-700">
                        ไม่ผ่านเกณฑ์ (ต้อง ≥ {criteria?.minTemp}°C)
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Holding Time Input */}
          {requiresTime && (
            <div className="space-y-2">
              <Label>เวลา (วินาที) *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  className="pl-10"
                  placeholder={`≥ ${criteria?.holdingTime || 15}`}
                  value={holdingTime}
                  onChange={(e) => setHoldingTime(e.target.value)}
                />
              </div>
              {holdingTime && (
                <div className="flex items-center gap-2 text-sm">
                  {isTimeValid ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-700">ผ่านเกณฑ์</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-red-700">
                        ไม่ผ่านเกณฑ์ (ต้อง ≥ {criteria?.holdingTime} วินาที)
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Operator */}
          <div className="space-y-2">
            <Label>ผู้บันทึก *</Label>
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกผู้บันทึก" />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op.id} value={op.name}>
                    {op.name} ({op.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>หมายเหตุ</Label>
            <Textarea
              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Warning if will fail */}
          {isFormValid && (!isTempValid || !isTimeValid) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  ค่าที่บันทึกไม่ผ่านเกณฑ์ CCP
                </p>
                <p className="text-xs text-red-700">
                  หากบันทึกค่านี้ CCP จะถือว่าไม่ผ่าน และจะไม่สามารถดำเนินการต่อได้
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={handleClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid}>
            <Thermometer className="w-4 h-4 mr-2" />
            บันทึก CCP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
