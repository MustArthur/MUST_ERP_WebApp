'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  QCTemplate,
  TemplateType,
  ParameterType,
  CreateQCTemplateInput,
} from '@/types/quality'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Plus, Trash2, AlertTriangle, GripVertical } from 'lucide-react'

// Validation schema
const parameterSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อพารามิเตอร์'),
  nameEn: z.string().optional(),
  type: z.enum(['NUMERIC', 'ACCEPTANCE', 'FORMULA']),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  uom: z.string().optional(),
  acceptableValues: z.array(z.string()).optional(),
  isCritical: z.boolean(),
  description: z.string().optional(),
})

const templateSchema = z.object({
  code: z.string().min(1, 'กรุณากรอกรหัส Template'),
  name: z.string().min(1, 'กรุณากรอกชื่อ Template'),
  type: z.enum(['RAW_MATERIAL', 'SEMI_FINISHED', 'FINISHED_GOOD', 'PROCESS']),
  description: z.string().optional(),
  parameters: z.array(parameterSchema).min(1, 'ต้องมีอย่างน้อย 1 พารามิเตอร์'),
  appliesTo: z.enum(['PURCHASE', 'PRODUCTION', 'BOTH']),
})

type FormData = z.infer<typeof templateSchema>

interface TemplateFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateQCTemplateInput) => Promise<void>
  template?: QCTemplate | null
}

const typeOptions: { value: TemplateType; label: string }[] = [
  { value: 'RAW_MATERIAL', label: 'วัตถุดิบ' },
  { value: 'SEMI_FINISHED', label: 'กึ่งสำเร็จรูป' },
  { value: 'FINISHED_GOOD', label: 'สินค้าสำเร็จรูป' },
  { value: 'PROCESS', label: 'กระบวนการ' },
]

const parameterTypeOptions: { value: ParameterType; label: string }[] = [
  { value: 'NUMERIC', label: 'ตัวเลข' },
  { value: 'ACCEPTANCE', label: 'ยอมรับ/ไม่ยอมรับ' },
  { value: 'FORMULA', label: 'สูตรคำนวณ' },
]

const appliesToOptions = [
  { value: 'PURCHASE', label: 'การจัดซื้อ' },
  { value: 'PRODUCTION', label: 'การผลิต' },
  { value: 'BOTH', label: 'ทั้งสองอย่าง' },
]

export function TemplateFormModal({
  isOpen,
  onClose,
  onSave,
  template,
}: TemplateFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptableInput, setAcceptableInput] = useState<Record<number, string>>({})

  const isEdit = !!template

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'RAW_MATERIAL',
      description: '',
      parameters: [
        {
          name: '',
          type: 'NUMERIC',
          isCritical: false,
        },
      ],
      appliesTo: 'PURCHASE',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parameters',
  })

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      reset({
        code: template.code,
        name: template.name,
        type: template.type,
        description: template.description || '',
        parameters: template.parameters.map((p) => ({
          name: p.name,
          nameEn: p.nameEn,
          type: p.type,
          minValue: p.minValue,
          maxValue: p.maxValue,
          uom: p.uom,
          acceptableValues: p.acceptableValues,
          isCritical: p.isCritical,
          description: p.description,
        })),
        appliesTo: template.appliesTo,
      })
    } else {
      reset({
        code: '',
        name: '',
        type: 'RAW_MATERIAL',
        description: '',
        parameters: [
          {
            name: '',
            type: 'NUMERIC',
            isCritical: false,
          },
        ],
        appliesTo: 'PURCHASE',
      })
    }
  }, [template, reset])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await onSave(data as CreateQCTemplateInput)
      onClose()
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addAcceptableValue = (index: number) => {
    const value = acceptableInput[index]?.trim()
    if (!value) return

    const current = watch(`parameters.${index}.acceptableValues`) || []
    if (!current.includes(value)) {
      setValue(`parameters.${index}.acceptableValues`, [...current, value])
    }
    setAcceptableInput({ ...acceptableInput, [index]: '' })
  }

  const removeAcceptableValue = (paramIndex: number, valueIndex: number) => {
    const current = watch(`parameters.${paramIndex}.acceptableValues`) || []
    setValue(
      `parameters.${paramIndex}.acceptableValues`,
      current.filter((_, i) => i !== valueIndex)
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'แก้ไข QC Template' : 'สร้าง QC Template ใหม่'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">รหัส Template *</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="เช่น QIT-RAW-CHICKEN"
                disabled={isEdit}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ Template *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="เช่น เกณฑ์ตรวจสอบไก่ดิบ"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">ประเภท *</Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value as TemplateType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appliesTo">ใช้สำหรับ *</Label>
              <Select
                value={watch('appliesTo')}
                onValueChange={(value) =>
                  setValue('appliesTo', value as 'PURCHASE' | 'PRODUCTION' | 'BOTH')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือก" />
                </SelectTrigger>
                <SelectContent>
                  {appliesToOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="รายละเอียดเพิ่มเติม..."
                rows={2}
              />
            </div>
          </div>

          {/* Parameters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">พารามิเตอร์ตรวจสอบ</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    name: '',
                    type: 'NUMERIC',
                    isCritical: false,
                  })
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                เพิ่มพารามิเตอร์
              </Button>
            </div>

            {errors.parameters && typeof errors.parameters === 'object' && 'message' in errors.parameters && (
              <p className="text-sm text-red-500">{errors.parameters.message as string}</p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => {
                const paramType = watch(`parameters.${index}.type`)
                const isCritical = watch(`parameters.${index}.isCritical`)
                const acceptableValues =
                  watch(`parameters.${index}.acceptableValues`) || []

                return (
                  <div
                    key={field.id}
                    className={cn(
                      'p-4 border rounded-lg space-y-4',
                      isCritical && 'border-red-300 bg-red-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">
                          พารามิเตอร์ #{index + 1}
                        </span>
                        {isCritical && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            CCP
                          </Badge>
                        )}
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>ชื่อพารามิเตอร์ *</Label>
                        <Input
                          {...register(`parameters.${index}.name`)}
                          placeholder="เช่น อุณหภูมิ"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>ชื่อภาษาอังกฤษ</Label>
                        <Input
                          {...register(`parameters.${index}.nameEn`)}
                          placeholder="e.g., Temperature"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>ประเภทค่า *</Label>
                        <Select
                          value={paramType}
                          onValueChange={(value) =>
                            setValue(
                              `parameters.${index}.type`,
                              value as ParameterType
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {parameterTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Numeric fields */}
                    {paramType === 'NUMERIC' && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>ค่าต่ำสุด</Label>
                          <Input
                            type="number"
                            step="any"
                            {...register(`parameters.${index}.minValue`, {
                              valueAsNumber: true,
                            })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ค่าสูงสุด</Label>
                          <Input
                            type="number"
                            step="any"
                            {...register(`parameters.${index}.maxValue`, {
                              valueAsNumber: true,
                            })}
                            placeholder="100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>หน่วย</Label>
                          <Input
                            {...register(`parameters.${index}.uom`)}
                            placeholder="เช่น °C, kg"
                          />
                        </div>
                      </div>
                    )}

                    {/* Acceptance fields */}
                    {paramType === 'ACCEPTANCE' && (
                      <div className="space-y-2">
                        <Label>ค่าที่ยอมรับได้</Label>
                        <div className="flex gap-2">
                          <Input
                            value={acceptableInput[index] || ''}
                            onChange={(e) =>
                              setAcceptableInput({
                                ...acceptableInput,
                                [index]: e.target.value,
                              })
                            }
                            placeholder="พิมพ์แล้วกด Enter หรือ เพิ่ม"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addAcceptableValue(index)
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addAcceptableValue(index)}
                          >
                            เพิ่ม
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {acceptableValues.map((value, vIndex) => (
                            <Badge
                              key={vIndex}
                              variant="secondary"
                              className="cursor-pointer hover:bg-red-100"
                              onClick={() => removeAcceptableValue(index, vIndex)}
                            >
                              {value}
                              <span className="ml-1 text-red-500">×</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>คำอธิบาย</Label>
                        <Input
                          {...register(`parameters.${index}.description`)}
                          placeholder="รายละเอียดเพิ่มเติม..."
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-6">
                        <Switch
                          checked={isCritical}
                          onCheckedChange={(checked) =>
                            setValue(`parameters.${index}.isCritical`, checked)
                          }
                        />
                        <Label className="flex items-center gap-2 cursor-pointer">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          จุดวิกฤต (CCP)
                        </Label>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'สร้าง Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
