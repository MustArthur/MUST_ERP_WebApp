'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Supplier, CreateSupplierInput, UpdateSupplierInput } from '@/types/supplier'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Building2, Save } from 'lucide-react'

const supplierFormSchema = z.object({
    code: z.string().min(1, 'กรุณาระบุรหัส'),
    name: z.string().min(1, 'กรุณาระบุชื่อ'),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
    address: z.string().optional(),
    taxId: z.string().optional(),
    paymentTerms: z.number().min(0, 'ต้องไม่ติดลบ'),
    isActive: z.boolean(),
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>

interface SupplierFormModalProps {
    supplier?: Supplier | null
    isOpen: boolean
    onClose: () => void
    onSave: (data: CreateSupplierInput | UpdateSupplierInput, isNew: boolean) => Promise<void>
}

export function SupplierFormModal({
    supplier,
    isOpen,
    onClose,
    onSave,
}: SupplierFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEditing = !!supplier

    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierFormSchema),
        defaultValues: {
            code: '',
            name: '',
            contactName: '',
            phone: '',
            email: '',
            address: '',
            taxId: '',
            paymentTerms: 30,
            isActive: true,
        },
    })

    // Populate form when editing
    useEffect(() => {
        if (supplier) {
            form.reset({
                code: supplier.code,
                name: supplier.name,
                contactName: supplier.contactName || '',
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || '',
                taxId: supplier.taxId || '',
                paymentTerms: supplier.paymentTerms,
                isActive: supplier.isActive,
            })
        } else {
            form.reset({
                code: '',
                name: '',
                contactName: '',
                phone: '',
                email: '',
                address: '',
                taxId: '',
                paymentTerms: 30,
                isActive: true,
            })
        }
    }, [supplier, form])

    const onSubmit = async (data: SupplierFormValues) => {
        try {
            setIsSubmitting(true)
            if (isEditing) {
                await onSave({
                    name: data.name,
                    contactName: data.contactName,
                    phone: data.phone,
                    email: data.email || undefined,
                    address: data.address,
                    taxId: data.taxId,
                    paymentTerms: data.paymentTerms,
                    isActive: data.isActive,
                }, false)
            } else {
                await onSave({
                    code: data.code,
                    name: data.name,
                    contactName: data.contactName,
                    phone: data.phone,
                    email: data.email || undefined,
                    address: data.address,
                    taxId: data.taxId,
                    paymentTerms: data.paymentTerms,
                }, true)
            }
            onClose()
        } catch (error) {
            console.error('Error saving supplier:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {isEditing ? 'แก้ไข Supplier' : 'เพิ่ม Supplier ใหม่'}
                            </DialogTitle>
                            <p className="text-muted-foreground">
                                {isEditing ? 'แก้ไขข้อมูล Supplier' : 'เพิ่ม Supplier ใหม่เข้าระบบ'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>รหัส *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="SUP-XXX"
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
                                name="paymentTerms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Credit (วัน)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ชื่อ Supplier *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ชื่อบริษัท/ร้านค้า" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contactName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ผู้ติดต่อ</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ชื่อผู้ติดต่อ" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เบอร์โทร</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0812345678" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>อีเมล</FormLabel>
                                        <FormControl>
                                            <Input placeholder="email@supplier.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="taxId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เลขประจำตัวผู้เสียภาษี</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1234567890123" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ที่อยู่</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="ที่อยู่เต็ม" {...field} rows={3} />
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
                                                เปิด/ปิดการใช้งาน Supplier นี้
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
