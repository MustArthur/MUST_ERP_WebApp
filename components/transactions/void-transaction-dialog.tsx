'use client'

import { useState } from 'react'
import { InventoryTransaction, transactionTypeLabels } from '@/types/inventory-transaction'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface VoidTransactionDialogProps {
    transaction: InventoryTransaction | null
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
}

export function VoidTransactionDialog({
    transaction,
    isOpen,
    onClose,
    onConfirm,
}: VoidTransactionDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleConfirm = async () => {
        setIsLoading(true)
        try {
            await onConfirm()
            onClose()
        } catch (error) {
            console.error('Error voiding transaction:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!transaction) return null

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        ยืนยันการยกเลิกรายการ
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        คุณต้องการยกเลิกรายการนี้หรือไม่? ระบบจะสร้างรายการกลับรายการอัตโนมัติเพื่อคืนสต็อก
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Transaction Summary */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">เลขที่รายการ:</span>
                        <span className="font-mono font-medium">{transaction.transactionNo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">ประเภท:</span>
                        <Badge variant="outline">
                            {transactionTypeLabels[transaction.transactionType]}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">สินค้า:</span>
                        <span className="font-medium">{transaction.itemName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">จำนวน:</span>
                        <span className="font-medium">
                            {transaction.qty.toLocaleString()} {transaction.uomCode}
                        </span>
                    </div>
                    {transaction.fromWarehouseName && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">จากคลัง:</span>
                            <span>{transaction.fromWarehouseName}</span>
                        </div>
                    )}
                    {transaction.toWarehouseName && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">ไปคลัง:</span>
                            <span>{transaction.toWarehouseName}</span>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        <strong>หมายเหตุ:</strong> การยกเลิกจะไม่ลบข้อมูลออกจากระบบ แต่จะทำเครื่องหมาย VOIDED และสร้างรายการกลับรายการเพื่อรักษาประวัติการทำงาน
                    </p>
                </div>

                <AlertDialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        ยืนยันการยกเลิก
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
