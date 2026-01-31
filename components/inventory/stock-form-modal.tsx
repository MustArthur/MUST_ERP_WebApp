'use client'

import { useState, useEffect } from 'react'
import { StockItem, ItemType, UnitOfMeasure, CreateStockItemInput } from '@/types/inventory'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Package, Save, X } from 'lucide-react'

interface StockFormModalProps {
  item?: StockItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (item: StockItem) => void
}

export function StockFormModal({
  item,
  isOpen,
  onClose,
  onSave,
}: StockFormModalProps) {
  const { warehouses, createStockItem, updateStockItem, isLoading } = useInventoryStore()

  const [formData, setFormData] = useState<CreateStockItemInput>({
    code: '',
    name: '',
    type: 'RAW_MATERIAL',
    uom: 'KG',
    defaultWarehouseId: '',
    hasBatch: true,
    hasExpiry: true,
    shelfLifeDays: undefined,
    minStock: undefined,
    maxStock: undefined,
    reorderPoint: undefined,
    requiresQC: false,
    qcTemplateId: undefined,
    costPerUnit: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing
  useEffect(() => {
    if (item) {
      setFormData({
        code: item.code,
        name: item.name,
        type: item.type,
        uom: item.uom,
        defaultWarehouseId: item.defaultWarehouseId,
        hasBatch: item.hasBatch,
        hasExpiry: item.hasExpiry,
        shelfLifeDays: item.shelfLifeDays,
        minStock: item.minStock,
        maxStock: item.maxStock,
        reorderPoint: item.reorderPoint,
        requiresQC: item.requiresQC,
        qcTemplateId: item.qcTemplateId,
        costPerUnit: item.costPerUnit,
      })
    } else {
      // Reset form for new item
      setFormData({
        code: '',
        name: '',
        type: 'RAW_MATERIAL',
        uom: 'KG',
        defaultWarehouseId: warehouses[0]?.id || '',
        hasBatch: true,
        hasExpiry: true,
        shelfLifeDays: undefined,
        minStock: undefined,
        maxStock: undefined,
        reorderPoint: undefined,
        requiresQC: false,
        qcTemplateId: undefined,
        costPerUnit: 0,
      })
    }
    setErrors({})
  }, [item, warehouses])

  const handleChange = (field: keyof CreateStockItemInput, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = 'กรุณากรอกรหัสสินค้า'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อสินค้า'
    }
    if (!formData.defaultWarehouseId) {
      newErrors.defaultWarehouseId = 'กรุณาเลือกคลังเริ่มต้น'
    }
    if (formData.costPerUnit < 0) {
      newErrors.costPerUnit = 'ราคาต้องไม่ติดลบ'
    }
    if (formData.minStock !== undefined && formData.maxStock !== undefined) {
      if (formData.minStock > formData.maxStock) {
        newErrors.minStock = 'ขั้นต่ำต้องน้อยกว่าขั้นสูง'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      let savedItem: StockItem
      if (item) {
        savedItem = await updateStockItem(item.id, formData)
      } else {
        savedItem = await createStockItem(formData)
      }
      onSave(savedItem)
      onClose()
    } catch (error) {
      console.error('Failed to save stock item:', error)
    }
  }

  const itemTypes: { value: ItemType; label: string }[] = [
    { value: 'RAW_MATERIAL', label: 'วัตถุดิบ' },
    { value: 'SEMI_FINISHED', label: 'กึ่งสำเร็จรูป' },
    { value: 'FINISHED_GOOD', label: 'สินค้าสำเร็จรูป' },
    { value: 'PACKAGING', label: 'บรรจุภัณฑ์' },
  ]

  const uomOptions: { value: UnitOfMeasure; label: string }[] = [
    { value: 'KG', label: 'กิโลกรัม (KG)' },
    { value: 'G', label: 'กรัม (G)' },
    { value: 'L', label: 'ลิตร (L)' },
    { value: 'ML', label: 'มิลลิลิตร (ML)' },
    { value: 'PC', label: 'ชิ้น (PC)' },
    { value: 'BTL', label: 'ขวด (BTL)' },
    { value: 'PKG', label: 'แพ็ค (PKG)' },
    { value: 'BOX', label: 'กล่อง (BOX)' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle className="text-xl">
              {item ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">ข้อมูลพื้นฐาน</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">รหัสสินค้า *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="เช่น RM-001"
                  className={errors.code ? 'border-red-500' : ''}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อสินค้า *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="เช่น อกไก่สด"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ประเภท</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>หน่วยนับ</Label>
                <Select
                  value={formData.uom}
                  onValueChange={(value) => handleChange('uom', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uomOptions.map(uom => (
                      <SelectItem key={uom.value} value={uom.value}>
                        {uom.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerUnit">ราคาต่อหน่วย (฿)</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => handleChange('costPerUnit', parseFloat(e.target.value) || 0)}
                  className={errors.costPerUnit ? 'border-red-500' : ''}
                />
                {errors.costPerUnit && (
                  <p className="text-sm text-red-500">{errors.costPerUnit}</p>
                )}
              </div>
            </div>
          </div>

          {/* Warehouse */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">คลังสินค้า</h3>
            <div className="space-y-2">
              <Label>คลังเริ่มต้น *</Label>
              <Select
                value={formData.defaultWarehouseId}
                onValueChange={(value) => handleChange('defaultWarehouseId', value)}
              >
                <SelectTrigger className={errors.defaultWarehouseId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="เลือกคลังสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(wh => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.code} - {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.defaultWarehouseId && (
                <p className="text-sm text-red-500">{errors.defaultWarehouseId}</p>
              )}
            </div>
          </div>

          {/* Stock Control */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">การควบคุมสต็อก</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minStock">ขั้นต่ำ (Min)</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock ?? ''}
                  onChange={(e) => handleChange('minStock', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="ไม่กำหนด"
                  className={errors.minStock ? 'border-red-500' : ''}
                />
                {errors.minStock && (
                  <p className="text-sm text-red-500">{errors.minStock}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStock">ขั้นสูง (Max)</Label>
                <Input
                  id="maxStock"
                  type="number"
                  min="0"
                  value={formData.maxStock ?? ''}
                  onChange={(e) => handleChange('maxStock', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="ไม่กำหนด"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderPoint">จุดสั่งซื้อ</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  min="0"
                  value={formData.reorderPoint ?? ''}
                  onChange={(e) => handleChange('reorderPoint', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="ไม่กำหนด"
                />
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">การติดตาม</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <Label>ติดตาม Batch</Label>
                  <p className="text-sm text-gray-500">เก็บหมายเลข Batch ของสินค้า</p>
                </div>
                <Switch
                  checked={formData.hasBatch}
                  onCheckedChange={(checked) => handleChange('hasBatch', checked)}
                />
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <Label>ติดตามวันหมดอายุ</Label>
                  <p className="text-sm text-gray-500">เก็บวันหมดอายุของสินค้า</p>
                </div>
                <Switch
                  checked={formData.hasExpiry}
                  onCheckedChange={(checked) => handleChange('hasExpiry', checked)}
                />
              </div>
            </div>

            {formData.hasExpiry && (
              <div className="space-y-2">
                <Label htmlFor="shelfLifeDays">อายุสินค้า (วัน)</Label>
                <Input
                  id="shelfLifeDays"
                  type="number"
                  min="0"
                  value={formData.shelfLifeDays ?? ''}
                  onChange={(e) => handleChange('shelfLifeDays', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="ระบุจำนวนวัน"
                  className="max-w-xs"
                />
              </div>
            )}
          </div>

          {/* QC */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">การควบคุมคุณภาพ</h3>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div>
                <Label>ต้องตรวจ QC ก่อนใช้งาน</Label>
                <p className="text-sm text-gray-500">สินค้าต้องผ่าน QC ก่อนนำไปใช้</p>
              </div>
              <Switch
                checked={formData.requiresQC}
                onCheckedChange={(checked) => handleChange('requiresQC', checked)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
