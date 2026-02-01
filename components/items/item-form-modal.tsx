'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Item, Category, UnitOfMeasure, CreateItemInput, UpdateItemInput } from '@/types/item'
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
import { Switch } from '@/components/ui/switch'
import { Package, Save } from 'lucide-react'

const itemFormSchema = z.object({
    code: z.string().min(1, 'กรุณาระบุรหัส'),
    name: z.string().min(1, 'กรุณาระบุชื่อ'),
    categoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
    baseUomId: z.string().min(1, 'กรุณาเลือกหน่วย'),
    lastPurchaseCost: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    isActive: z.boolean(),
})

type ItemFormValues = z.infer<typeof itemFormSchema>

interface ItemFormModalProps {
    item?: Item | null
    categories: Category[]
    uoms: UnitOfMeasure[]
    isOpen: boolean
    onClose: () => void
    onSave: (data: CreateItemInput | UpdateItemInput, isNew: boolean) => Promise<void>
}

export function ItemFormModal({
    item,
    categories,
    uoms,
    isOpen,
    onClose,
    onSave,
}: ItemFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEditing = !!item

    const form = useForm<ItemFormValues>({
        resolver: zodResolver(itemFormSchema),
        defaultValues: {
            code: '',
            name: '',
            categoryId: '',
            baseUomId: '',
            lastPurchaseCost: 0,
            isActive: true,
        },
    })

    // Populate form when editing
    useEffect(() => {
        if (item) {
            form.reset({
                code: item.code,
                name: item.name,
                categoryId: item.categoryId,
                baseUomId: item.baseUomId,
                lastPurchaseCost: item.lastPurchaseCost,
                isActive: item.isActive,
            })
        } else {
            form.reset({
                code: '',
                name: '',
                categoryId: '',
                baseUomId: '',
                lastPurchaseCost: 0,
                isActive: true,
            })
        }
    }, [item, form])

    const onSubmit = async (data: ItemFormValues) => {
        try {
            setIsSubmitting(true)
            if (isEditing) {
                await onSave({
                    name: data.name,
                    categoryId: data.categoryId,
                    baseUomId: data.baseUomId,
                    lastPurchaseCost: data.lastPurchaseCost,
                    isActive: data.isActive,
                }, false)
            } else {
                await onSave({
                    code: data.code,
                    name: data.name,
                    categoryId: data.categoryId,
                    baseUomId: data.baseUomId,
                    lastPurchaseCost: data.lastPurchaseCost,
                }, true)
            }
            onClose()
        } catch (error) {
            console.error('Error saving item:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {isEditing ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
                            </DialogTitle>
                            <p className="text-muted-foreground">
                                {isEditing ? 'แก้ไขข้อมูลวัตถุดิบหรือสินค้า' : 'เพิ่มวัตถุดิบหรือสินค้าใหม่เข้าระบบ'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>รหัส *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="RM-XXX หรือ FG-XXX"
                                            {...field}
                                            disabled={isEditing}
                                            className="font-mono"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ชื่อ *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ชื่อวัตถุดิบหรือสินค้า" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>หมวดหมู่ *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
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
                                name="baseUomId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>หน่วย *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกหน่วย" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {uoms.map((uom) => (
                                                    <SelectItem key={uom.id} value={uom.id}>
                                                        {uom.name} ({uom.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="lastPurchaseCost"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ราคา/หน่วย (บาท)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isEditing && (
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">สถานะใช้งาน</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                เปิด/ปิดการใช้งานรายการนี้
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
