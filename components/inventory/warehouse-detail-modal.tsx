'use client'

import { useEffect, useState } from 'react'
import { Warehouse, WarehouseStockItem } from '@/types/inventory'
import { getWarehouseStock } from '@/lib/api/inventory'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Warehouse as WarehouseIcon,
    Package,
    DollarSign,
    AlertTriangle,
    Clock,
    Thermometer,
    Loader2,
} from 'lucide-react'

interface WarehouseDetailModalProps {
    warehouse: Warehouse | null
    isOpen: boolean
    onClose: () => void
}

export function WarehouseDetailModal({
    warehouse,
    isOpen,
    onClose,
}: WarehouseDetailModalProps) {
    const [stockItems, setStockItems] = useState<WarehouseStockItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && warehouse) {
            loadWarehouseStock()
        }
    }, [isOpen, warehouse])

    const loadWarehouseStock = async () => {
        if (!warehouse) return

        setIsLoading(true)
        setError(null)

        try {
            const data = await getWarehouseStock(warehouse.id)
            setStockItems(data)
        } catch (err) {
            console.error('Failed to load warehouse stock:', err)
            setError('ไม่สามารถโหลดข้อมูลสต็อกได้')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setStockItems([])
        setError(null)
        onClose()
    }

    if (!warehouse) return null

    // Calculate summary
    const totalValue = stockItems.reduce((sum, item) => sum + item.totalValue, 0)
    const totalItems = stockItems.length

    // Count expiring items (within 7 days)
    const today = new Date()
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    let expiringCount = 0
    stockItems.forEach(item => {
        item.lots.forEach(lot => {
            if (lot.expDate) {
                const expDate = new Date(lot.expDate)
                if (expDate <= sevenDaysFromNow) {
                    expiringCount++
                }
            }
        })
    })

    // Flatten lots for table display
    const tableRows: Array<{
        itemId: string
        itemCode: string
        itemName: string
        lotNumber: string | null
        qty: number
        uomCode: string
        unitCost: number
        totalValue: number
        expDate: string | null
        status: string
        isExpiring: boolean
    }> = []

    stockItems.forEach(item => {
        item.lots.forEach(lot => {
            const isExpiring = lot.expDate ? new Date(lot.expDate) <= sevenDaysFromNow : false
            tableRows.push({
                itemId: item.itemId,
                itemCode: item.itemCode,
                itemName: item.itemName,
                lotNumber: lot.lotNumber,
                qty: lot.qty,
                uomCode: item.uomCode,
                unitCost: item.unitCost,
                totalValue: lot.qty * item.unitCost,
                expDate: lot.expDate,
                status: lot.status,
                isExpiring,
            })
        })
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return <Badge className="bg-green-100 text-green-800">พร้อมใช้</Badge>
            case 'RESERVED':
                return <Badge className="bg-blue-100 text-blue-800">จอง</Badge>
            case 'ON_HOLD':
                return <Badge className="bg-yellow-100 text-yellow-800">ระงับ</Badge>
            case 'QUARANTINE':
                return <Badge className="bg-red-100 text-red-800">กักกัน</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <WarehouseIcon className="w-5 h-5" />
                        คลัง: {warehouse.name}
                        <span className="text-sm font-normal text-gray-500">
                            ({warehouse.code})
                        </span>
                    </DialogTitle>
                </DialogHeader>

                {/* Warehouse Info */}
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 border-b pb-3">
                    {warehouse.location && (
                        <span>📍 {warehouse.location}</span>
                    )}
                    {warehouse.temperatureControlled && (
                        <span className="flex items-center gap-1 text-blue-600">
                            <Thermometer className="w-4 h-4" />
                            {warehouse.minTemp}°C - {warehouse.maxTemp}°C
                        </span>
                    )}
                    {warehouse.isQuarantine && (
                        <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            คลังกักกัน
                        </Badge>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <Package className="w-4 h-4" />
                            <span className="text-xs">รายการสินค้า</span>
                        </div>
                        <p className="text-xl font-semibold text-gray-900">{totalItems}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs">มูลค่ารวม</span>
                        </div>
                        <p className="text-xl font-semibold text-gray-900">
                            {formatCurrency(totalValue)}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Package className="w-4 h-4" />
                            <span className="text-xs">จำนวน Lot</span>
                        </div>
                        <p className="text-xl font-semibold text-gray-900">{tableRows.length}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-orange-600 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">ใกล้หมดอายุ</span>
                        </div>
                        <p className="text-xl font-semibold text-orange-600">{expiringCount}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto mt-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            <span className="ml-2 text-gray-500">กำลังโหลด...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            {error}
                        </div>
                    ) : tableRows.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>ไม่มีสินค้าในคลังนี้</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-24">รหัส</TableHead>
                                    <TableHead>ชื่อสินค้า</TableHead>
                                    <TableHead className="w-28">Lot/Batch</TableHead>
                                    <TableHead className="w-24 text-right">จำนวน</TableHead>
                                    <TableHead className="w-16 text-center">หน่วย</TableHead>
                                    <TableHead className="w-24 text-right">ราคา/หน่วย</TableHead>
                                    <TableHead className="w-28 text-right">มูลค่า</TableHead>
                                    <TableHead className="w-28 text-center">หมดอายุ</TableHead>
                                    <TableHead className="w-24 text-center">สถานะ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableRows.map((row, index) => (
                                    <TableRow
                                        key={`${row.itemId}-${row.lotNumber || index}`}
                                        className={row.isExpiring ? 'bg-orange-50' : undefined}
                                    >
                                        <TableCell className="font-mono text-sm">
                                            {row.itemCode}
                                        </TableCell>
                                        <TableCell>{row.itemName}</TableCell>
                                        <TableCell className="font-mono text-sm text-gray-600">
                                            {row.lotNumber || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatNumber(row.qty)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-mono">
                                                {row.uomCode}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(row.unitCost)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(row.totalValue)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.expDate ? (
                                                <span className={row.isExpiring ? 'text-orange-600 font-medium' : ''}>
                                                    {formatDate(row.expDate)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(row.status)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="border-t pt-4 mt-2">
                    <div className="flex-1 text-sm text-gray-500">
                        แสดง {tableRows.length} รายการ
                    </div>
                    <Button variant="outline" onClick={handleClose}>
                        ปิด
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
