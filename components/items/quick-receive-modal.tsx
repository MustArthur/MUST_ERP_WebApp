'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Item } from '@/types/item'
import { useTransactionsStore } from '@/stores/transactions-store'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowDownLeft, Save, Package, Search } from 'lucide-react'

const quickReceiveSchema = z.object({
    itemId: z.string().min(1, 'กรุณาเลือกสินค้า'),
    warehouseId: z.string().min(1, 'กรุณาเลือกคลังปลายทาง'),
    locationId: z.string().optional(),
    qty: z.number().min(0.01, 'จำนวนต้องมากกว่า 0'),
    unitCost: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    lotNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    notes: z.string().optional(),
})

type QuickReceiveValues = z.infer<typeof quickReceiveSchema>

interface QuickReceiveModalProps {
    item?: Item | null  // Optional pre-selected item
    items: Item[]       // List of all items for dropdown
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function QuickReceiveModal({ item, items, isOpen, onClose, onSuccess }: QuickReceiveModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [itemSearch, setItemSearch] = useState('')
    const {
        warehouses,
        locations,
        fetchWarehouses,
        fetchLocations,
        createTransaction,
    } = useTransactionsStore()

    const form = useForm<QuickReceiveValues>({
        resolver: zodResolver(quickReceiveSchema),
        defaultValues: {
            itemId: '',
            warehouseId: '',
            locationId: '',
            qty: undefined as unknown as number,
            unitCost: 0,
            lotNumber: '',
            expiryDate: '',
            notes: '',
        },
    })

    // Filter items based on search
    const filteredItems = useMemo(() => {
        if (!items || items.length === 0) return []
        if (!itemSearch.trim()) return items.slice(0, 50) // Show first 50 if no search
        const search = itemSearch.toLowerCase()
        return items.filter(i =>
            i.name.toLowerCase().includes(search) ||
            i.code.toLowerCase().includes(search)
        ).slice(0, 50)
    }, [items, itemSearch])

    // Load warehouses on mount
    useEffect(() => {
        if (isOpen) {
            fetchWarehouses()
            // Reset form when modal opens
            if (item) {
                form.setValue('itemId', item.id)
                form.setValue('unitCost', item.lastPurchaseCost || 0)
            } else {
                form.reset()
            }
        }
    }, [isOpen, fetchWarehouses, item, form])

    // Update unit cost when item changes
    const selectedItemId = form.watch('itemId')
    useEffect(() => {
        if (!items) return
        const selectedItem = items.find(i => i.id === selectedItemId)
        if (selectedItem) {
            form.setValue('unitCost', selectedItem.lastPurchaseCost || 0)
        }
    }, [selectedItemId, items, form])

    // Fetch locations when warehouse changes
    const selectedWarehouseId = form.watch('warehouseId')
    useEffect(() => {
        if (selectedWarehouseId) {
            fetchLocations(selectedWarehouseId)
            // Reset location when warehouse changes
            form.setValue('locationId', '')
        }
    }, [selectedWarehouseId, fetchLocations, form])

    // Get selected item for display
    const selectedItem = useMemo(() => {
        if (!items) return null
        return items.find(i => i.id === selectedItemId)
    }, [items, selectedItemId])

    const onSubmit = async (data: QuickReceiveValues) => {
        if (!items) return
        const targetItem = items.find(i => i.id === data.itemId)
        if (!targetItem) return

        try {
            setIsSubmitting(true)
            await createTransaction({
                transactionType: 'RECEIVE',
                itemId: data.itemId,
                toWarehouseId: data.warehouseId,
                toLocationId: data.locationId || undefined,
                qty: data.qty,
                uomId: targetItem.baseUomId,
                unitCost: data.unitCost,
                lotNumber: data.lotNumber || undefined,
                expiryDate: data.expiryDate || undefined,
                notes: data.notes || `รับเข้า ${targetItem.name}`,
            })
            form.reset()
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error creating receive transaction:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100">
                            <ArrowDownLeft className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">บันทึกรับเข้า</DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                เพิ่มสต็อกสินค้าเข้าคลัง
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Item Selector */}
                        <FormField
                            control={form.control}
                            name="itemId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>สินค้า *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกสินค้า" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <div className="px-2 py-1.5 sticky top-0 bg-white">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        placeholder="ค้นหาสินค้า..."
                                                        value={itemSearch}
                                                        onChange={(e) => setItemSearch(e.target.value)}
                                                        className="pl-8 h-8"
                                                    />
                                                </div>
                                            </div>
                                            {filteredItems.map((itm) => (
                                                <SelectItem key={itm.id} value={itm.id}>
                                                    <span className="font-mono text-xs text-gray-500 mr-2">{itm.code}</span>
                                                    {itm.name}
                                                </SelectItem>
                                            ))}
                                            {filteredItems.length === 0 && (
                                                <div className="px-2 py-4 text-center text-sm text-gray-500">
                                                    ไม่พบสินค้า
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Selected Item Info */}
                        {selectedItem && (
                            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                                <Package className="w-8 h-8 text-gray-400" />
                                <div>
                                    <p className="font-medium">{selectedItem.name}</p>
                                    <p className="text-sm text-gray-500 font-mono">{selectedItem.code}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="qty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>จำนวน *</FormLabel>
                                        <div className="flex gap-2 items-center">
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="กรอกจำนวน"
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        field.onChange(val === '' ? undefined : parseFloat(val))
                                                    }}
                                                />
                                            </FormControl>
                                            <div className="shrink-0 bg-gray-100 px-3 py-2 rounded-md border text-sm text-gray-600 font-medium">
                                                {items.find(i => i.id === form.watch('itemId'))?.baseUomCode || item?.baseUomCode || 'หน่วย'}
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unitCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ราคา/หน่วย</FormLabel>
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
                        </div>

                        <FormField
                            control={form.control}
                            name="warehouseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>คลังปลายทาง *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกคลัง" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {warehouses.map((wh) => (
                                                <SelectItem key={wh.id} value={wh.id}>
                                                    {wh.name} ({wh.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {selectedWarehouseId && (
                            <FormField
                                control={form.control}
                                name="locationId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location (ไม่บังคับ)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือก Location" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {locations[selectedWarehouseId]?.length > 0 ? (
                                                    locations[selectedWarehouseId].map((loc) => (
                                                        <SelectItem key={loc.id} value={loc.id}>
                                                            {loc.name} ({loc.code})
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="px-2 py-4 text-center text-sm text-gray-500">
                                                        กำลังโหลด Location...
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="lotNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lot Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="LOT-XXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="expiryDate"
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
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>หมายเหตุ</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="รายละเอียดเพิ่มเติม..."
                                            rows={2}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรับเข้า'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
