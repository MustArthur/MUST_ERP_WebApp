'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  PurchaseReceipt,
  CreatePurchaseReceiptInput,
  CreateReceiptItemInput,
} from '@/types/receiving'
import { UnitOfMeasure } from '@/types/inventory'
import { useReceivingStore } from '@/stores/receiving-store'
import { useInventoryStore } from '@/stores/inventory-store'
import { getRawMaterials, Item } from '@/lib/api/items'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import {
  Plus,
  Trash2,
  Save,
  Package,
  Truck,
  Calculator,
} from 'lucide-react'

const receiptItemSchema = z.object({
  itemId: z.string().min(1, 'กรุณาเลือกสินค้า'),
  qtyReceived: z.number().min(0.01, 'จำนวนต้องมากกว่า 0'),
  uom: z.string().min(1, 'กรุณาเลือกหน่วย'),
  batchNo: z.string().optional(),
  mfgDate: z.string().optional(),
  expDate: z.string().optional(),
  unitPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  warehouseId: z.string().min(1, 'กรุณาเลือกคลัง'),
  remarks: z.string().optional(),
})

const receiptFormSchema = z.object({
  supplierId: z.string().min(1, 'กรุณาเลือก Supplier'),
  receiptDate: z.string().min(1, 'กรุณาระบุวันที่'),
  poNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  items: z.array(receiptItemSchema).min(1, 'ต้องมีอย่างน้อย 1 รายการ'),
  remarks: z.string().optional(),
})

type ReceiptFormValues = z.infer<typeof receiptFormSchema>

interface ReceiptFormModalProps {
  receipt?: PurchaseReceipt | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreatePurchaseReceiptInput) => Promise<void>
}

const UOM_OPTIONS: { value: UnitOfMeasure; label: string }[] = [
  { value: 'KG', label: 'กิโลกรัม (KG)' },
  { value: 'G', label: 'กรัม (G)' },
  { value: 'L', label: 'ลิตร (L)' },
  { value: 'ML', label: 'มิลลิลิตร (ML)' },
  { value: 'PC', label: 'ชิ้น (PC)' },
  { value: 'BOX', label: 'กล่อง (BOX)' },
  { value: 'PKG', label: 'แพ็ค (PKG)' },
  { value: 'BTL', label: 'ขวด (BTL)' },
]

export function ReceiptFormModal({
  receipt,
  isOpen,
  onClose,
  onSave,
}: ReceiptFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rawMaterials, setRawMaterials] = useState<Item[]>([])
  const { suppliers, fetchSuppliers } = useReceivingStore()
  const { stockItems, warehouses, fetchStockItems, fetchWarehouses } = useInventoryStore()

  // Filter raw material warehouses (including quarantine)
  const rawMaterialWarehouses = warehouses.filter(
    w => w.type === 'RAW_MATERIAL'
  )

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      supplierId: '',
      receiptDate: new Date().toISOString().split('T')[0],
      poNumber: '',
      invoiceNumber: '',
      items: [
        {
          itemId: '',
          qtyReceived: 0,
          uom: 'KG',
          batchNo: '',
          mfgDate: '',
          expDate: '',
          unitPrice: 0,
          warehouseId: '',
          remarks: '',
        },
      ],
      remarks: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Load data on mount
  useEffect(() => {
    fetchSuppliers()
    fetchStockItems()
    fetchWarehouses()

    // Load raw materials from Supabase
    async function loadRawMaterials() {
      const items = await getRawMaterials()
      setRawMaterials(items)
    }
    loadRawMaterials()
  }, [fetchSuppliers, fetchStockItems, fetchWarehouses])

  // Populate form when editing
  useEffect(() => {
    if (receipt) {
      form.reset({
        supplierId: receipt.supplierId,
        receiptDate: receipt.receiptDate,
        poNumber: receipt.poNumber || '',
        invoiceNumber: receipt.invoiceNumber || '',
        items: receipt.items.map(item => ({
          itemId: item.itemId,
          qtyReceived: item.qtyReceived,
          uom: item.uom,
          batchNo: item.batchNo || '',
          mfgDate: item.mfgDate || '',
          expDate: item.expDate || '',
          unitPrice: item.unitPrice,
          warehouseId: item.warehouseId,
          remarks: item.remarks || '',
        })),
        remarks: receipt.remarks || '',
      })
    }
  }, [receipt, form])

  // Auto-fill item details when item selected
  const handleItemChange = (index: number, itemId: string) => {
    const item = rawMaterials.find(i => i.id === itemId)
    if (item) {
      form.setValue(`items.${index}.uom`, item.base_uom_code || 'KG')
      form.setValue(`items.${index}.unitPrice`, item.last_purchase_cost || 0)
      // Set default warehouse based on item type
      const defaultWarehouse = warehouses.find(
        w => w.type === 'RAW_MATERIAL' && w.status === 'ACTIVE'
      )
      if (defaultWarehouse) {
        form.setValue(`items.${index}.warehouseId`, defaultWarehouse.id)
      }
    }
  }

  // Calculate total
  const watchItems = form.watch('items')
  const totalAmount = watchItems.reduce((sum, item) => {
    return sum + (item.qtyReceived || 0) * (item.unitPrice || 0)
  }, 0)

  const onSubmit = async (data: ReceiptFormValues) => {
    try {
      setIsSubmitting(true)
      await onSave({
        supplierId: data.supplierId,
        receiptDate: data.receiptDate,
        poNumber: data.poNumber || undefined,
        invoiceNumber: data.invoiceNumber || undefined,
        items: data.items.map(item => ({
          itemId: item.itemId,
          qtyReceived: item.qtyReceived,
          uom: item.uom as UnitOfMeasure,
          batchNo: item.batchNo || undefined,
          mfgDate: item.mfgDate || undefined,
          expDate: item.expDate || undefined,
          unitPrice: item.unitPrice,
          warehouseId: item.warehouseId,
          remarks: item.remarks || undefined,
        })),
        remarks: data.remarks || undefined,
      })
      onClose()
    } catch (error) {
      console.error('Error saving receipt:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get item name by ID
  const getItemName = (itemId: string): string => {
    const item = rawMaterials.find(i => i.id === itemId)
    return item?.name || itemId
  }

  // Check if item requires QC (all raw materials require QC by default)
  const itemRequiresQC = (itemId: string): boolean => {
    return rawMaterials.some(i => i.id === itemId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {receipt ? 'แก้ไขใบรับวัตถุดิบ' : 'สร้างใบรับวัตถุดิบใหม่'}
              </DialogTitle>
              <p className="text-muted-foreground">
                กรอกข้อมูลการรับสินค้าจาก Supplier
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-6 py-4">
              {/* Header Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือก Supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              <div className="flex items-center gap-2">
                                <span>{supplier.name}</span>
                                {supplier.qualityScore && (
                                  <Badge variant="outline" className="text-xs">
                                    {supplier.qualityScore}%
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiptDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>วันที่รับ *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เลข PO</FormLabel>
                      <FormControl>
                        <Input placeholder="PO-2026-0001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เลข Invoice</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-2026-0001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    รายการสินค้า
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        itemId: '',
                        qtyReceived: 0,
                        uom: 'KG',
                        batchNo: '',
                        mfgDate: '',
                        expDate: '',
                        unitPrice: 0,
                        warehouseId: '',
                        remarks: '',
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    เพิ่มรายการ
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const itemId = form.watch(`items.${index}.itemId`)
                    const requiresQC = itemRequiresQC(itemId)

                    return (
                      <div
                        key={field.id}
                        className="p-4 border rounded-lg bg-gray-50 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">#{index + 1}</span>
                            {itemId && (
                              <span className="font-medium">{getItemName(itemId)}</span>
                            )}
                            {requiresQC && (
                              <Badge variant="outline" className="text-xs">
                                ต้อง QC
                              </Badge>
                            )}
                          </div>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.itemId`}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>สินค้า *</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    handleItemChange(index, value)
                                  }}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="เลือกสินค้า" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {rawMaterials.map((item) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        <div className="flex items-center gap-2">
                                          <span>{item.name}</span>
                                          <span className="text-gray-500">({item.code})</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.qtyReceived`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>จำนวน *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.uom`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>หน่วย *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {UOM_OPTIONS.map((uom) => (
                                      <SelectItem key={uom.value} value={uom.value}>
                                        {uom.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.batchNo`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Batch No.</FormLabel>
                                <FormControl>
                                  <Input placeholder="Batch-001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.mfgDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>วันผลิต</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.expDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>วันหมดอายุ</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ราคา/หน่วย *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.warehouseId`}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>คลัง *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="เลือกคลัง" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {rawMaterialWarehouses.map((wh) => (
                                      <SelectItem key={wh.id} value={wh.id}>
                                        {wh.name}
                                        {wh.isQuarantine && ' (กักกัน)'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.remarks`}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>หมายเหตุ</FormLabel>
                                <FormControl>
                                  <Input placeholder="หมายเหตุ..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Line Total */}
                        <div className="flex justify-end pt-2 border-t">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">รวมรายการ</p>
                            <p className="font-semibold text-lg">
                              {formatCurrency(
                                (form.watch(`items.${index}.qtyReceived`) || 0) *
                                (form.watch(`items.${index}.unitPrice`) || 0)
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Remarks */}
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมายเหตุใบรับ</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="หมายเหตุเพิ่มเติม..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer */}
            <div className="pt-4 border-t">
              {/* Total */}
              <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">มูลค่ารวมทั้งสิ้น</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'กำลังบันทึก...' : receipt ? 'บันทึกการแก้ไข' : 'สร้างใบรับ'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
