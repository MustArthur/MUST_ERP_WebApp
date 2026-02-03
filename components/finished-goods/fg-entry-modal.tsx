'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { CreateFGEntryInput } from '@/types/finished-goods'
import { mockFGWarehouses } from '@/lib/mock-data/finished-goods'

// Mock work orders for the dropdown
const mockCompletedWorkOrders = [
  { id: 'wo-001', code: 'WO-2026-0001', productName: 'โปรตีนไก่ บลูเบอร์รี่' },
  { id: 'wo-002', code: 'WO-2026-0002', productName: 'โปรตีนพืช สตรอว์เบอร์รี่' },
]

const formSchema = z.object({
  workOrderId: z.string().min(1, 'กรุณาเลือก Work Order'),
  quantity: z.number().min(1, 'จำนวนต้องมากกว่า 0'),
  warehouseId: z.string().min(1, 'กรุณาเลือกคลังสินค้า'),
  mfgDate: z.string().min(1, 'กรุณาระบุวันที่ผลิต'),
  expDate: z.string().min(1, 'กรุณาระบุวันหมดอายุ'),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface FGEntryModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateFGEntryInput) => Promise<void>
}

export function FGEntryModal({ open, onClose, onSubmit }: FGEntryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workOrderId: '',
      quantity: 0,
      warehouseId: 'wh-fg-hold',
      mfgDate: new Date().toISOString().split('T')[0],
      expDate: '',
      remarks: '',
    },
  })

  const selectedWorkOrder = mockCompletedWorkOrders.find(
    wo => wo.id === form.watch('workOrderId')
  )

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)

      const workOrder = mockCompletedWorkOrders.find(wo => wo.id === values.workOrderId)

      await onSubmit({
        workOrderId: values.workOrderId,
        productId: values.workOrderId, // Simplified
        productCode: workOrder?.code || '',
        productName: workOrder?.productName || '',
        batchNo: `L${values.mfgDate.replace(/-/g, '')}-001`,
        mfgDate: values.mfgDate,
        expDate: values.expDate,
        quantity: values.quantity,
        warehouseId: values.warehouseId,
        remarks: values.remarks,
      })

      form.reset()
      onClose()
    } catch (error) {
      console.error('Failed to create FG entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>รับเข้าสินค้าสำเร็จรูป</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="workOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Order</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก Work Order ที่เสร็จสิ้น" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockCompletedWorkOrders.map((wo) => (
                        <SelectItem key={wo.id} value={wo.id}>
                          {wo.code} - {wo.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedWorkOrder && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm font-medium">{selectedWorkOrder.productName}</p>
                <p className="text-xs text-muted-foreground">{selectedWorkOrder.code}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวน (ขวด)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mfgDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันที่ผลิต</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expDate"
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
            </div>

            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คลังสินค้า</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกคลังสินค้า" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockFGWarehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name} ({wh.temperature}°C)
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
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุ</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
