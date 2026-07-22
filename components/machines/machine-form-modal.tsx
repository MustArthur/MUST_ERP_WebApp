'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Machine, CreateMachineInput, UpdateMachineInput } from '@/types/machine'
import { generateMachineCode } from '@/lib/api/machines'
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
import { Wrench, Save } from 'lucide-react'

const machineFormSchema = z.object({
    code: z.string().min(1, 'กรุณาระบุรหัส'),
    name: z.string().min(1, 'กรุณาระบุชื่อเครื่องจักร'),
    location: z.string().optional(),
    isActive: z.boolean(),
})

type MachineFormValues = z.infer<typeof machineFormSchema>

interface MachineFormModalProps {
    machine?: Machine | null
    isOpen: boolean
    onClose: () => void
    onSave: (data: CreateMachineInput | UpdateMachineInput, isNew: boolean) => Promise<void>
}

export function MachineFormModal({
    machine,
    isOpen,
    onClose,
    onSave,
}: MachineFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEditing = !!machine

    const form = useForm<MachineFormValues>({
        resolver: zodResolver(machineFormSchema),
        defaultValues: {
            code: '',
            name: '',
            location: '',
            isActive: true,
        },
    })

    useEffect(() => {
        async function initializeForm() {
            if (machine) {
                form.reset({
                    code: machine.code,
                    name: machine.name,
                    location: machine.location || '',
                    isActive: machine.isActive,
                })
            } else {
                form.reset({
                    code: '',
                    name: '',
                    location: '',
                    isActive: true,
                })

                try {
                    const newCode = await generateMachineCode()
                    form.setValue('code', newCode)
                } catch (error) {
                    console.error('Failed to generate machine code:', error)
                }
            }
        }

        if (isOpen) {
            initializeForm()
        }
    }, [machine, form, isOpen])

    const onSubmit = async (data: MachineFormValues) => {
        try {
            setIsSubmitting(true)
            if (isEditing) {
                await onSave({
                    name: data.name,
                    location: data.location,
                    isActive: data.isActive,
                }, false)
            } else {
                await onSave({
                    code: data.code,
                    name: data.name,
                    location: data.location,
                }, true)
            }
            onClose()
        } catch (error) {
            console.error('Error saving machine:', error)
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
                            <Wrench className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {isEditing ? 'แก้ไขเครื่องจักร' : 'เพิ่มเครื่องจักรใหม่'}
                            </DialogTitle>
                            <p className="text-muted-foreground">
                                {isEditing ? 'แก้ไขข้อมูลเครื่องจักร' : 'เพิ่มเครื่องจักรใหม่เข้าระบบ'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
                        <div className="overflow-y-auto flex-1 space-y-4 py-4 pr-1">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>รหัส *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="MC-YYYY-NNNN"
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
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อเครื่องจักร *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น เครื่องผสมแป้ง #1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ตำแหน่ง/แผนก</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น ไลน์ผลิต 1, แผนกบรรจุภัณฑ์" {...field} />
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
                                                    เปิด/ปิดการใช้งานเครื่องจักรนี้
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
