'use client'

import { InventoryTransaction, transactionTypeLabels, transactionTypeColors, TransactionType } from '@/types/inventory-transaction'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    ArrowDownLeft,
    ArrowUpRight,
    ArrowLeftRight,
    Eye,
} from 'lucide-react'

interface TransactionTableProps {
    transactions: InventoryTransaction[]
    onView?: (transaction: InventoryTransaction) => void
}

function getTransactionIcon(type: TransactionType) {
    const inTypes = ['RECEIVE', 'ADJUST_IN', 'PRODUCTION_IN', 'RETURN']
    const outTypes = ['ISSUE', 'ADJUST_OUT', 'PRODUCTION_OUT', 'SCRAP']

    if (inTypes.includes(type)) {
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />
    }
    if (outTypes.includes(type)) {
        return <ArrowUpRight className="w-4 h-4 text-red-600" />
    }
    return <ArrowLeftRight className="w-4 h-4 text-blue-600" />
}

export function TransactionTable({ transactions, onView }: TransactionTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">เลขที่</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ประเภท</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">วันที่</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">สินค้า</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Lot</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">จาก</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ไป</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">จำนวน</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">มูลค่า</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">ดู</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map((t) => {
                            const colors = transactionTypeColors[t.transactionType]
                            return (
                                <tr
                                    key={t.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {getTransactionIcon(t.transactionType)}
                                            <span className="font-mono text-sm font-medium text-gray-900">
                                                {t.transactionNo}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={`${colors.bg} ${colors.text} hover:${colors.bg}`}>
                                            {transactionTypeLabels[t.transactionType]}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {formatDateTime(t.transactionDate)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{t.itemName}</div>
                                            <div className="text-xs text-gray-500 font-mono">{t.itemCode}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                                        {t.lotNumber || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {t.fromWarehouseName ? (
                                            <div>
                                                <div>{t.fromWarehouseName}</div>
                                                {t.fromLocationName && (
                                                    <div className="text-xs text-gray-400">{t.fromLocationName}</div>
                                                )}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {t.toWarehouseName ? (
                                            <div>
                                                <div>{t.toWarehouseName}</div>
                                                {t.toLocationName && (
                                                    <div className="text-xs text-gray-400">{t.toLocationName}</div>
                                                )}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="font-medium text-gray-900">
                                            {t.qty.toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 text-sm ml-1">{t.uomCode}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                        {formatCurrency(t.totalCost)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onView?.(t)}
                                            title="ดูรายละเอียด"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t">
                <span className="text-sm text-gray-500">
                    แสดง {transactions.length} รายการ
                </span>
            </div>
        </div>
    )
}
