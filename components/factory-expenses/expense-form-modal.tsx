'use client'

import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    FactoryExpense,
    CreateFactoryExpenseInput,
    UpdateFactoryExpenseInput,
    ExpenseCategory,
    ExpenseSubcategory,
} from '@/types/factory-expense'
import { generateExpenseCode } from '@/lib/api/factory-expenses'
import { ExpenseVehicleOption, ExpenseMachineOption } from '@/stores/factory-expenses-store'
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
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Receipt, Save } from 'lucide-react'

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
    { value: 'LOGISTICS', label: 'Logistics (การขนส่ง)' },
    { value: 'MAINTENANCE', label: 'Maintenance (ซ่อมบำรุงเครื่องจักร)' },
    { value: 'FACTORY_SUPPLIES', label: 'Factory Supplies (วัสดุสิ้นเปลือง)' },
]

const FUEL_TYPE_OPTIONS = [
    'ดีเซล (DIESEL)',
    'แก๊สโซฮอล์ 95 (Gasohol 95)',
]

const SUBCATEGORY_OPTIONS: Record<ExpenseCategory, { value: ExpenseSubcategory; label: string }[]> = {
    LOGISTICS: [
        { value: 'FUEL', label: 'ค่าน้ำมันรถขนส่ง' },
        { value: 'VEHICLE_GENERAL', label: 'ค่าใช้จ่ายทั่วไป (ทางด่วน/บำรุงรักษารถ/ภาษี)' },
    ],
    MAINTENANCE: [
        { value: 'SPARE_PARTS', label: 'ค่าอะไหล่' },
        { value: 'CORRECTIVE_MAINTENANCE', label: 'ค่าซ่อมเครื่องจักร (Corrective Maintenance)' },
        { value: 'PREVENTIVE_MAINTENANCE', label: 'ค่าบำรุงรักษาเครื่องจักรตามรอบ (Preventive Maintenance)' },
    ],
    FACTORY_SUPPLIES: [
        { value: 'FACTORY_SUPPLIES', label: 'วัสดุของใช้สิ้นเปลืองในโรงงาน' },
    ],
}

const expenseFormSchema = z.object({
    code: z.string().min(1, 'กรุณาระบุรหัส'),
    category: z.enum(['LOGISTICS', 'MAINTENANCE', 'FACTORY_SUPPLIES']),
    subcategory: z.enum([
        'FUEL', 'VEHICLE_GENERAL', 'SPARE_PARTS',
        'CORRECTIVE_MAINTENANCE', 'PREVENTIVE_MAINTENANCE', 'FACTORY_SUPPLIES',
    ]),
    expenseDate: z.string().min(1, 'กรุณาระบุวันที่'),
    amount: z.number().min(0, 'จำนวนเงินต้องไม่ติดลบ'),
    description: z.string().optional(),
    vehicleId: z.string().optional(),
    fuelType: z.string().optional(),
    fuelQuantityLiters: z.number().optional(),
    fuelPricePerLiter: z.number().optional(),
    machineId: z.string().optional(),
    recordedBy: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>

const emptyDefaults: ExpenseFormValues = {
    code: '',
    category: 'LOGISTICS',
    subcategory: 'FUEL',
    expenseDate: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    vehicleId: '',
    fuelType: FUEL_TYPE_OPTIONS[0],
    fuelQuantityLiters: 0,
    fuelPricePerLiter: 0,
    machineId: '',
    recordedBy: 'กิตติชัย (ตั้ม)',
}

interface ExpenseFormModalProps {
    expense?: FactoryExpense | null
    vehicles: ExpenseVehicleOption[]
    machines: ExpenseMachineOption[]
    isOpen: boolean
    onClose: () => void
    onSave: (data: CreateFactoryExpenseInput | UpdateFactoryExpenseInput, isNew: boolean) => Promise<void>
}

export function ExpenseFormModal({
    expense,
    vehicles,
    machines,
    isOpen,
    onClose,
    onSave,
}: ExpenseFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEditing = !!expense

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: emptyDefaults,
    })

    const watchedCategory = useWatch({ control: form.control, name: 'category' })
    const watchedSubcategory = useWatch({ control: form.control, name: 'subcategory' })
    const watchedLiters = useWatch({ control: form.control, name: 'fuelQuantityLiters' })
    const watchedPricePerLiter = useWatch({ control: form.control, name: 'fuelPricePerLiter' })

    // Auto-calculate amount for fuel expenses (liters × price/L)
    useEffect(() => {
        if (watchedSubcategory === 'FUEL') {
            const calculated = Math.round((watchedLiters || 0) * (watchedPricePerLiter || 0) * 100) / 100
            form.setValue('amount', calculated)
        }
    }, [watchedSubcategory, watchedLiters, watchedPricePerLiter, form])

    // Reset subcategory to the first valid option when category changes
    useEffect(() => {
        const validSubcategories = SUBCATEGORY_OPTIONS[watchedCategory].map(o => o.value)
        if (!validSubcategories.includes(watchedSubcategory)) {
            form.setValue('subcategory', validSubcategories[0])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedCategory])

    useEffect(() => {
        async function initializeForm() {
            if (expense) {
                form.reset({
                    code: expense.code,
                    category: expense.category,
                    subcategory: expense.subcategory,
                    expenseDate: expense.expenseDate,
                    amount: expense.amount,
                    description: expense.description || '',
                    vehicleId: expense.vehicleId || '',
                    fuelType: expense.fuelType || '',
                    fuelQuantityLiters: expense.fuelQuantityLiters || 0,
                    fuelPricePerLiter: expense.fuelPricePerLiter || 0,
                    machineId: expense.machineId || '',
                    recordedBy: expense.recordedBy || '',
                })
            } else {
                form.reset(emptyDefaults)
                try {
                    const newCode = await generateExpenseCode()
                    form.setValue('code', newCode)
                } catch (error) {
                    console.error('Failed to generate expense code:', error)
                }
            }
        }

        if (isOpen) {
            initializeForm()
        }
    }, [expense, form, isOpen])

    const onSubmit = async (data: ExpenseFormValues) => {
        try {
            setIsSubmitting(true)
            const payload = {
                category: data.category,
                subcategory: data.subcategory,
                expenseDate: data.expenseDate,
                amount: data.amount,
                description: data.description || undefined,
                vehicleId: data.vehicleId || undefined,
                fuelType: data.fuelType || undefined,
                fuelQuantityLiters: data.fuelQuantityLiters || undefined,
                fuelPricePerLiter: data.fuelPricePerLiter || undefined,
                machineId: data.machineId || undefined,
                recordedBy: data.recordedBy || undefined,
            }
            if (isEditing) {
                await onSave(payload, false)
            } else {
                await onSave({ ...payload, code: data.code }, true)
            }
            onClose()
        } catch (error) {
            console.error('Error saving factory expense:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const isFuel = watchedSubcategory === 'FUEL'
    const isVehicleGeneral = watchedSubcategory === 'VEHICLE_GENERAL'
    const isMaintenance = ['SPARE_PARTS', 'CORRECTIVE_MAINTENANCE', 'PREVENTIVE_MAINTENANCE'].includes(watchedSubcategory)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Receipt className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {isEditing ? 'แก้ไขค่าใช้จ่าย' : 'เพิ่มค่าใช้จ่ายใหม่'}
                            </DialogTitle>
                            <p className="text-muted-foreground">
                                {isEditing ? 'แก้ไขข้อมูลค่าใช้จ่ายโรงงาน' : 'บันทึกค่าใช้จ่ายโรงงานใหม่'}
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
                                                    placeholder="EXP-YYYY-NNNN"
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
                                    name="expenseDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>วันที่ *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
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
                                                    {CATEGORY_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="subcategory"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ประเภท *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="เลือกประเภท" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {SUBCATEGORY_OPTIONS[watchedCategory].map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {isFuel && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="vehicleId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>รถขนส่ง *</FormLabel>
                                                <FormControl>
                                                    <SearchableSelect
                                                        options={vehicles.map(v => ({ value: v.id, label: v.plateNumber ? `${v.name} (${v.plateNumber})` : v.name }))}
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        placeholder="เลือกรถขนส่ง"
                                                        searchPlaceholder="พิมพ์ชื่อรถ..."
                                                        emptyMessage="ไม่พบรถขนส่ง"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="fuelType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>รายการน้ำมัน</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="เลือกรายการน้ำมัน" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {FUEL_TYPE_OPTIONS.map((opt) => (
                                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="fuelQuantityLiters"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ปริมาณ (L.)</FormLabel>
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
                                            name="fuelPricePerLiter"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ราคาต่อ L.</FormLabel>
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
                                    </div>
                                </>
                            )}

                            {isVehicleGeneral && (
                                <FormField
                                    control={form.control}
                                    name="vehicleId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>รถขนส่ง</FormLabel>
                                            <FormControl>
                                                <SearchableSelect
                                                    options={vehicles.map(v => ({ value: v.id, label: v.plateNumber ? `${v.name} (${v.plateNumber})` : v.name }))}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder="เลือกรถขนส่ง (ถ้ามี)"
                                                    searchPlaceholder="พิมพ์ชื่อรถ..."
                                                    emptyMessage="ไม่พบรถขนส่ง"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {isMaintenance && (
                                <FormField
                                    control={form.control}
                                    name="machineId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>เครื่องจักร *</FormLabel>
                                            <FormControl>
                                                <SearchableSelect
                                                    options={machines.map(m => ({ value: m.id, label: m.name }))}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder="เลือกเครื่องจักร"
                                                    searchPlaceholder="พิมพ์ชื่อเครื่องจักร..."
                                                    emptyMessage="ไม่พบเครื่องจักร"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>จำนวนเงิน (บาท) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                disabled={isFuel}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>รายละเอียด</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="รายละเอียดเพิ่มเติม" {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="recordedBy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ผู้บันทึก</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ชื่อผู้บันทึกรายการ" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
