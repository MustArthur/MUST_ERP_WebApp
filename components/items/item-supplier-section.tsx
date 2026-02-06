'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Item, ItemSupplier, UnitOfMeasure } from '@/types/item'
import {
    getItemSuppliers,
    addItemSupplier,
    updateItemSupplier,
    deleteItemSupplier,
    getSuppliers,
    getUnitsOfMeasure,
    updateItem,
} from '@/lib/api/items'
import { formatCurrency } from '@/lib/utils'
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    Plus,
    Edit2,
    Trash2,
    Package,
    Star,
    Save,
    Loader2,
    Calculator,
    Calendar as CalendarIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const supplierFormSchema = z.object({
    supplierId: z.string().min(1, 'กรุณาเลือก Supplier'),
    supplierPartNumber: z.string().optional(),
    purchasePrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    packagingSize: z.number().min(1, 'ขนาดบรรจุต้องมากกว่า 0'),
    purchaseUomId: z.string().optional(),
    leadTimeDays: z.number().min(0),
    minOrderQty: z.number().min(0),
    isPreferred: z.boolean(),
    priceUpdatedAt: z.date().optional(),
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>

interface ItemSupplierSectionProps {
    item: Item
    onItemUpdate?: (item: Item) => void
}

interface Supplier {
    id: string
    code: string
    name: string
}

export function ItemSupplierSection({ item, onItemUpdate }: ItemSupplierSectionProps) {
    const [itemSuppliers, setItemSuppliers] = useState<ItemSupplier[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [uoms, setUoms] = useState<UnitOfMeasure[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<ItemSupplier | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierFormSchema),
        defaultValues: {
            supplierId: '',
            supplierPartNumber: '',
            purchasePrice: 0,
            packagingSize: 1,
            purchaseUomId: '',
            leadTimeDays: 7,
            minOrderQty: 1,
            isPreferred: false,
            priceUpdatedAt: new Date(),
        },
    })

    // Watch for auto-calculation
    const watchedPrice = useWatch({ control: form.control, name: 'purchasePrice' })
    const watchedPackaging = useWatch({ control: form.control, name: 'packagingSize' })

    // Calculate unit price
    const calculatedUnitPrice = useMemo(() => {
        if (watchedPackaging > 0) {
            return watchedPrice / watchedPackaging
        }
        return 0
    }, [watchedPrice, watchedPackaging])

    // Load data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true)
            const [suppliersData, uomsData, itemSuppliersData] = await Promise.all([
                getSuppliers(),
                getUnitsOfMeasure(),
                getItemSuppliers(item.id),
            ])
            setSuppliers(suppliersData)
            setUoms(uomsData)
            setItemSuppliers(itemSuppliersData)
            setIsLoading(false)
        }
        loadData()
    }, [item.id])

    // Reset form when editing
    useEffect(() => {
        if (selectedSupplier) {
            form.reset({
                supplierId: selectedSupplier.supplierId,
                supplierPartNumber: selectedSupplier.supplierPartNumber || '',
                purchasePrice: selectedSupplier.purchasePrice,
                packagingSize: selectedSupplier.packagingSize || 1,
                purchaseUomId: selectedSupplier.purchaseUomId || '',
                leadTimeDays: selectedSupplier.leadTimeDays,
                minOrderQty: selectedSupplier.minOrderQty,
                isPreferred: selectedSupplier.isPreferred,
                priceUpdatedAt: selectedSupplier.priceUpdatedAt ? new Date(selectedSupplier.priceUpdatedAt) : new Date(),
            })
        } else {
            form.reset({
                supplierId: '',
                supplierPartNumber: '',
                purchasePrice: 0,
                packagingSize: 1,
                purchaseUomId: item.baseUomId || '',
                leadTimeDays: 7,
                minOrderQty: 1,
                isPreferred: false,
                priceUpdatedAt: new Date(),
            })
        }
    }, [selectedSupplier, form, item.baseUomId])

    const handleAdd = () => {
        setSelectedSupplier(null)
        setShowFormModal(true)
    }

    const handleEdit = (supplier: ItemSupplier) => {
        setSelectedSupplier(supplier)
        setShowFormModal(true)
    }

    const handleDeletePrompt = (supplier: ItemSupplier) => {
        setSelectedSupplier(supplier)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (selectedSupplier) {
            try {
                await deleteItemSupplier(selectedSupplier.id)
                setItemSuppliers(prev => prev.filter(s => s.id !== selectedSupplier.id))
            } catch (error) {
                console.error('Error deleting supplier:', error)
            }
        }
        setShowDeleteModal(false)
        setSelectedSupplier(null)
    }

    const onSubmit = async (data: SupplierFormValues) => {
        try {
            setIsSubmitting(true)
            const unitPrice = data.packagingSize > 0 ? data.purchasePrice / data.packagingSize : 0

            if (selectedSupplier) {
                // Update
                const updated = await updateItemSupplier(selectedSupplier.id, item.id, {
                    supplierPartNumber: data.supplierPartNumber,
                    purchasePrice: data.purchasePrice,
                    packagingSize: data.packagingSize,
                    purchaseUomId: data.purchaseUomId || undefined,
                    leadTimeDays: data.leadTimeDays,
                    minOrderQty: data.minOrderQty,
                    isPreferred: data.isPreferred,
                    priceUpdatedAt: data.priceUpdatedAt?.toISOString(),
                })
                if (updated) {
                    setItemSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s))
                    // Auto-update item's lastPurchaseCost if preferred or if it's the only supplier
                    if (data.isPreferred || itemSuppliers.length === 1) {
                        const updatedItem = await updateItem(item.id, { lastPurchaseCost: unitPrice })
                        if (updatedItem && onItemUpdate) {
                            onItemUpdate(updatedItem)
                        }
                    }
                }
            } else {
                // Create
                const created = await addItemSupplier({
                    itemId: item.id,
                    supplierId: data.supplierId,
                    supplierPartNumber: data.supplierPartNumber,
                    purchasePrice: data.purchasePrice,
                    packagingSize: data.packagingSize,
                    purchaseUomId: data.purchaseUomId || undefined,
                    leadTimeDays: data.leadTimeDays,
                    minOrderQty: data.minOrderQty,
                    isPreferred: data.isPreferred,
                    priceUpdatedAt: data.priceUpdatedAt?.toISOString(),
                })
                if (created) {
                    setItemSuppliers(prev => [...prev, created])
                    // Auto-update lastPurchaseCost if first supplier or preferred
                    if (data.isPreferred || itemSuppliers.length === 0) {
                        const updatedItem = await updateItem(item.id, { lastPurchaseCost: unitPrice })
                        if (updatedItem && onItemUpdate) {
                            onItemUpdate(updatedItem)
                        }
                    }
                }
            }
            setShowFormModal(false)
            setSelectedSupplier(null)
        } catch (error) {
            console.error('Error saving supplier:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Filter out already added suppliers
    const availableSuppliers = selectedSupplier
        ? suppliers
        : suppliers.filter(s => !itemSuppliers.some(is => is.supplierId === s.id))

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">ข้อมูล Supplier</h3>
                </div>
                <Button size="sm" onClick={handleAdd}>
                    <Plus className="w-4 h-4 mr-1" />
                    เพิ่ม Supplier
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            ) : itemSuppliers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>ยังไม่มีข้อมูล Supplier</p>
                    <p className="text-sm">คลิก "เพิ่ม Supplier" เพื่อเพิ่มข้อมูล</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Supplier</th>
                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Part Number</th>
                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">ราคาซื้อ</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600">ขนาดบรรจุ</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600">หน่วยซื้อ</th>
                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">ราคา/หน่วย</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600">Lead Time</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600">ราคา ณ วันที่</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600">MOQ</th>
                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-600">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {itemSuppliers.map((supplier) => {
                                const unitPrice = supplier.packagingSize > 0
                                    ? supplier.purchasePrice / supplier.packagingSize
                                    : supplier.purchasePrice
                                return (
                                    <tr key={supplier.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                {supplier.isPreferred && (
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{supplier.supplierName}</p>
                                                    <p className="text-xs text-gray-500">{supplier.supplierCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="font-mono text-sm">{supplier.supplierPartNumber || '-'}</span>
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium">
                                            {formatCurrency(supplier.purchasePrice)}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <Badge variant="secondary">{supplier.packagingSize || 1}</Badge>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <Badge variant="outline">{supplier.purchaseUomCode || item.baseUomCode}</Badge>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <span className="font-medium text-green-600">
                                                {formatCurrency(unitPrice)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center text-sm">
                                            {supplier.leadTimeDays} วัน
                                        </td>
                                        <td className="px-3 py-2 text-center text-sm">
                                            {supplier.priceUpdatedAt ? format(new Date(supplier.priceUpdatedAt), 'dd/MM/yyyy') : '-'}
                                        </td>
                                        <td className="px-3 py-2 text-center text-sm">
                                            {supplier.minOrderQty}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeletePrompt(supplier)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Form Modal */}
            <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedSupplier ? 'แก้ไขข้อมูล Supplier' : 'เพิ่ม Supplier'}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="supplierId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!!selectedSupplier}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือก Supplier" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableSuppliers.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        [{s.code}] {s.name}
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
                                name="supplierPartNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier Part Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="รหัสสินค้าของ Supplier" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Price & Packaging Section with Auto-Calculate */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Calculator className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">คำนวณราคาต่อหน่วยอัตโนมัติ</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="purchasePrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ราคาซื้อ (บาท)</FormLabel>
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
                                        name="packagingSize"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ขนาดบรรจุ</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        min="1"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">ราคา/หน่วย</label>
                                        <div className="h-10 px-3 flex items-center bg-green-100 rounded-md border border-green-200">
                                            <span className="font-bold text-green-700">
                                                ฿{calculatedUnitPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="priceUpdatedAt"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>ราคา ณ วันที่</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>เลือกวันที่</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date: Date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="purchaseUomId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>หน่วยซื้อ</FormLabel>
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

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="leadTimeDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lead Time (วัน)</FormLabel>
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

                                <FormField
                                    control={form.control}
                                    name="minOrderQty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>MOQ (จำนวนขั้นต่ำ)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="isPreferred"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base flex items-center gap-2">
                                                <Star className="w-4 h-4" />
                                                Preferred Supplier
                                            </FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                กำหนดเป็น Supplier หลัก (อัปเดตราคาต่อหน่วยในข้อมูลสินค้า)
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

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>
                                    ยกเลิก
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    <Save className="w-4 h-4 mr-2" />
                                    บันทึก
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการลบ Supplier "{selectedSupplier?.supplierName}" หรือไม่?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            ลบ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
