'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransactionsStore } from '@/stores/transactions-store'
import { TransactionType, transactionTypeLabels } from '@/types/inventory-transaction'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

const transactionSchema = z.object({
    transactionType: z.string().min(1, 'กรุณาเลือกประเภท'),
    itemId: z.string().min(1, 'กรุณาเลือกสินค้า'),
    lotId: z.string().optional(),
    fromWarehouseId: z.string().optional(),
    fromLocationId: z.string().optional(),
    toWarehouseId: z.string().optional(),
    toLocationId: z.string().optional(),
    qty: z.number().min(0.01, 'จำนวนต้องมากกว่า 0'),
    unitCost: z.number().optional(),
    notes: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormModalProps {
    isOpen: boolean
    onClose: () => void
    defaultType?: TransactionType
}

const transactionTypes: TransactionType[] = [
    'RECEIVE',
    'ISSUE',
    'TRANSFER',
    'ADJUST_IN',
    'ADJUST_OUT',
    'PRODUCTION_IN',
    'PRODUCTION_OUT',
    'SCRAP',
    'RETURN',
]

export function TransactionFormModal({ isOpen, onClose, defaultType }: TransactionFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {
        warehouses,
        locations,
        items,
        lots,
        fetchWarehouses,
        fetchLocations,
        fetchItems,
        fetchLots,
        createTransaction
    } = useTransactionsStore()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            transactionType: defaultType || 'RECEIVE',
            qty: 0,
            unitCost: 0,
        },
    })

    const watchedType = watch('transactionType') as TransactionType
    const watchedItem = watch('itemId')
    const watchedFromWarehouse = watch('fromWarehouseId')
    const watchedToWarehouse = watch('toWarehouseId')

    // Load initial data
    useEffect(() => {
        if (isOpen) {
            fetchWarehouses()
            fetchItems()
        }
    }, [isOpen, fetchWarehouses, fetchItems])

    // Load locations when warehouse changes
    useEffect(() => {
        if (watchedFromWarehouse) {
            fetchLocations(watchedFromWarehouse)
        }
    }, [watchedFromWarehouse, fetchLocations])

    useEffect(() => {
        if (watchedToWarehouse) {
            fetchLocations(watchedToWarehouse)
        }
    }, [watchedToWarehouse, fetchLocations])

    // Load lots when item changes
    useEffect(() => {
        if (watchedItem) {
            fetchLots(watchedItem)
            // Set UOM from item
            const item = items.find(i => i.id === watchedItem)
            if (item) {
                // UOM is embedded in the item
            }
        }
    }, [watchedItem, fetchLots, items])

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            reset({
                transactionType: defaultType || 'RECEIVE',
                qty: 0,
                unitCost: 0,
            })
        }
    }, [isOpen, defaultType, reset])

    // Determine which fields to show based on transaction type
    const needsFromLocation = ['ISSUE', 'TRANSFER', 'ADJUST_OUT', 'PRODUCTION_OUT', 'SCRAP'].includes(watchedType)
    const needsToLocation = ['RECEIVE', 'TRANSFER', 'ADJUST_IN', 'PRODUCTION_IN', 'RETURN'].includes(watchedType)

    const onSubmit = async (data: TransactionFormData) => {
        setIsSubmitting(true)
        try {
            const selectedItem = items.find(i => i.id === data.itemId)
            await createTransaction({
                transactionType: data.transactionType as TransactionType,
                itemId: data.itemId,
                lotId: data.lotId || undefined,
                fromWarehouseId: data.fromWarehouseId || undefined,
                fromLocationId: data.fromLocationId || undefined,
                toWarehouseId: data.toWarehouseId || undefined,
                toLocationId: data.toLocationId || undefined,
                qty: data.qty,
                uomId: selectedItem?.baseUomId || '',
                unitCost: data.unitCost || 0,
                notes: data.notes || undefined,
            })
            onClose()
        } catch (error) {
            console.error('Error creating transaction:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>บันทึกรายการเคลื่อนไหว</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Transaction Type */}
                    <div className="space-y-2">
                        <Label>ประเภทรายการ *</Label>
                        <Select
                            value={watchedType}
                            onValueChange={(v) => setValue('transactionType', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                {transactionTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {transactionTypeLabels[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.transactionType && (
                            <p className="text-sm text-red-500">{errors.transactionType.message}</p>
                        )}
                    </div>

                    {/* Item */}
                    <div className="space-y-2">
                        <Label>สินค้า *</Label>
                        <Select
                            value={watchedItem}
                            onValueChange={(v) => setValue('itemId', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกสินค้า" />
                            </SelectTrigger>
                            <SelectContent>
                                {items.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.code} - {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.itemId && (
                            <p className="text-sm text-red-500">{errors.itemId.message}</p>
                        )}
                    </div>

                    {/* Lot (if available) */}
                    {watchedItem && lots[watchedItem]?.length > 0 && (
                        <div className="space-y-2">
                            <Label>Lot</Label>
                            <Select
                                value={watch('lotId') || ''}
                                onValueChange={(v) => setValue('lotId', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือก Lot (ถ้ามี)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lots[watchedItem]?.map((lot) => (
                                        <SelectItem key={lot.id} value={lot.id}>
                                            {lot.lotNumber} {lot.expiryDate ? `(Exp: ${lot.expiryDate})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* From Warehouse/Location */}
                    {needsFromLocation && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>คลังต้นทาง</Label>
                                <Select
                                    value={watchedFromWarehouse || ''}
                                    onValueChange={(v) => {
                                        setValue('fromWarehouseId', v)
                                        setValue('fromLocationId', '')
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกคลัง" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((wh) => (
                                            <SelectItem key={wh.id} value={wh.id}>
                                                {wh.code} - {wh.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>ตำแหน่งต้นทาง</Label>
                                <Select
                                    value={watch('fromLocationId') || ''}
                                    onValueChange={(v) => setValue('fromLocationId', v)}
                                    disabled={!watchedFromWarehouse}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกตำแหน่ง" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(locations[watchedFromWarehouse || ''] || []).map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.code} - {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* To Warehouse/Location */}
                    {needsToLocation && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>คลังปลายทาง</Label>
                                <Select
                                    value={watchedToWarehouse || ''}
                                    onValueChange={(v) => {
                                        setValue('toWarehouseId', v)
                                        setValue('toLocationId', '')
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกคลัง" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((wh) => (
                                            <SelectItem key={wh.id} value={wh.id}>
                                                {wh.code} - {wh.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>ตำแหน่งปลายทาง</Label>
                                <Select
                                    value={watch('toLocationId') || ''}
                                    onValueChange={(v) => setValue('toLocationId', v)}
                                    disabled={!watchedToWarehouse}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกตำแหน่ง" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(locations[watchedToWarehouse || ''] || []).map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.code} - {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Quantity and Cost */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>จำนวน *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register('qty', { valueAsNumber: true })}
                                placeholder="0.00"
                            />
                            {errors.qty && (
                                <p className="text-sm text-red-500">{errors.qty.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>ราคาต่อหน่วย</Label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register('unitCost', { valueAsNumber: true })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>หมายเหตุ</Label>
                        <Textarea
                            {...register('notes')}
                            placeholder="รายละเอียดเพิ่มเติม..."
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            บันทึก
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
