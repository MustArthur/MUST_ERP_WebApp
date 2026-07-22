'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@/types/vehicle'
import { generateVehicleCode } from '@/lib/api/vehicles'
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
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Truck, Save } from 'lucide-react'

const vehicleFormSchema = z.object({
    code: z.string().min(1, 'กรุณาระบุรหัส'),
    plateNumber: z.string().optional(),
    name: z.string().min(1, 'กรุณาระบุชื่อ/รุ่นรถ'),
    vehicleType: z.string().optional(),
    isActive: z.boolean(),
})

type VehicleFormValues = z.infer<typeof vehicleFormSchema>

interface VehicleFormModalProps {
    vehicle?: Vehicle | null
    isOpen: boolean
    onClose: () => void
    onSave: (data: CreateVehicleInput | UpdateVehicleInput, isNew: boolean) => Promise<void>
}

export function VehicleFormModal({
    vehicle,
    isOpen,
    onClose,
    onSave,
}: VehicleFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEditing = !!vehicle

    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleFormSchema),
        defaultValues: {
            code: '',
            plateNumber: '',
            name: '',
            vehicleType: '',
            isActive: true,
        },
    })

    useEffect(() => {
        async function initializeForm() {
            if (vehicle) {
                form.reset({
                    code: vehicle.code,
                    plateNumber: vehicle.plateNumber || '',
                    name: vehicle.name,
                    vehicleType: vehicle.vehicleType || '',
                    isActive: vehicle.isActive,
                })
            } else {
                form.reset({
                    code: '',
                    plateNumber: '',
                    name: '',
                    vehicleType: '',
                    isActive: true,
                })

                try {
                    const newCode = await generateVehicleCode()
                    form.setValue('code', newCode)
                } catch (error) {
                    console.error('Failed to generate vehicle code:', error)
                }
            }
        }

        if (isOpen) {
            initializeForm()
        }
    }, [vehicle, form, isOpen])

    const onSubmit = async (data: VehicleFormValues) => {
        try {
            setIsSubmitting(true)
            if (isEditing) {
                await onSave({
                    plateNumber: data.plateNumber,
                    name: data.name,
                    vehicleType: data.vehicleType,
                    isActive: data.isActive,
                }, false)
            } else {
                await onSave({
                    code: data.code,
                    plateNumber: data.plateNumber,
                    name: data.name,
                    vehicleType: data.vehicleType,
                }, true)
            }
            onClose()
        } catch (error) {
            console.error('Error saving vehicle:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {isEditing ? 'แก้ไขรถขนส่ง' : 'เพิ่มรถขนส่งใหม่'}
                            </DialogTitle>
                            <p className="text-muted-foreground">
                                {isEditing ? 'แก้ไขข้อมูลรถขนส่ง' : 'เพิ่มรถขนส่งใหม่เข้าระบบ'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
                        <div className="overflow-y-auto flex-1 space-y-4 py-4 pr-1">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>รหัส *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="VH-YYYY-NNNN"
                                                    {...field}
                                                    disabled={true}
                                                    className="font-mono"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="plateNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ทะเบียนรถ</FormLabel>
                                            <FormControl>
                                                <Input placeholder="กข-1234" {...field} />
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
                                        <FormLabel>ชื่อ/รุ่นรถ *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น รถบรรทุก 6 ล้อ คันที่ 1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vehicleType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ประเภทรถ</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น รถบรรทุก, รถตู้, รถกระบะ" {...field} />
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
                                                    เปิด/ปิดการใช้งานรถคันนี้
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
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
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
