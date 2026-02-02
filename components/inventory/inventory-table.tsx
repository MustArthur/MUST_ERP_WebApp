'use client'

import { StockItemWithBalance } from '@/types/inventory'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Eye, Clock, AlertTriangle } from 'lucide-react'

interface InventoryTableProps {
    items: StockItemWithBalance[]
    onView: (item: StockItemWithBalance) => void
}

export function InventoryTable({ items, onView }: InventoryTableProps) {
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'RAW_MATERIAL':
                return 'วัตถุดิบ'
            case 'SEMI_FINISHED':
                return 'กึ่งสำเร็จรูป'
            case 'FINISHED_GOOD':
                return 'สินค้าสำเร็จรูป'
            case 'PACKAGING':
                return 'บรรจุภัณฑ์'
            default:
                return type
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'RAW_MATERIAL':
                return 'bg-blue-100 text-blue-800'
            case 'SEMI_FINISHED':
                return 'bg-yellow-100 text-yellow-800'
            case 'FINISHED_GOOD':
                return 'bg-green-100 text-green-800'
            case 'PACKAGING':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>รหัสสินค้า</TableHead>
                        <TableHead>ชื่อสินค้า</TableHead>
                        <TableHead>ประเภท</TableHead>
                        <TableHead className="text-right">คงเหลือ</TableHead>
                        <TableHead className="text-right">มูลค่ารวม</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50/50" onClick={() => onView(item)}>
                            <TableCell>
                                <div className="flex gap-1 justify-center">
                                    {item.isLowStock && (
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    )}
                                    {item.isExpiringSoon && !item.isLowStock && (
                                        <Clock className="w-4 h-4 text-orange-500" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">{item.code}</TableCell>
                            <TableCell>
                                <div className="font-medium text-gray-700">{item.name}</div>
                                {item.hasBatch && <div className="text-xs text-muted-foreground">{item.balances.length} Lot/Batch</div>}
                            </TableCell>
                            <TableCell>
                                <Badge className={cn('font-normal', getTypeColor(item.type))}>
                                    {getTypeLabel(item.type)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className={cn("font-medium", item.isLowStock ? 'text-red-600' : 'text-gray-900')}>
                                    {formatNumber(item.totalQty)} {item.uom}
                                </div>
                                {item.isLowStock && <div className="text-xs text-red-500">ต่ำกว่า {item.minStock}</div>}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(item.totalQty * item.costPerUnit)}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onView(item)
                                    }}
                                >
                                    <Eye className="w-4 h-4 text-gray-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
