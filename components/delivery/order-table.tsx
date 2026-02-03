'use client'

import { CustomerOrder, CustomerOrderStatus } from '@/types/delivery'
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
import { formatNumber } from '@/lib/utils'
import {
  FileText,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  Eye,
  ClipboardList,
  Zap,
} from 'lucide-react'

interface OrderTableProps {
  orders: CustomerOrder[]
  onViewDetails?: (order: CustomerOrder) => void
  onCreatePickList?: (order: CustomerOrder) => void
}

export function OrderTable({
  orders,
  onViewDetails,
  onCreatePickList,
}: OrderTableProps) {
  const statusConfig: Record<
    CustomerOrderStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof FileText }
  > = {
    DRAFT: { label: 'ร่าง', variant: 'outline', icon: FileText },
    CONFIRMED: { label: 'ยืนยันแล้ว', variant: 'secondary', icon: CheckCircle },
    PICKING: { label: 'กำลังหยิบ', variant: 'secondary', icon: Package },
    PICKED: { label: 'หยิบแล้ว', variant: 'default', icon: Package },
    DISPATCHED: { label: 'จัดส่งแล้ว', variant: 'default', icon: Truck },
    DELIVERED: { label: 'ส่งสำเร็จ', variant: 'default', icon: CheckCircle },
    PARTIAL: { label: 'ส่งบางส่วน', variant: 'outline', icon: Package },
    CANCELLED: { label: 'ยกเลิก', variant: 'destructive', icon: XCircle },
  }

  const priorityConfig = {
    NORMAL: { label: 'ปกติ', className: 'bg-gray-100 text-gray-700' },
    URGENT: { label: 'ด่วน', className: 'bg-amber-100 text-amber-700' },
    EXPRESS: { label: 'ด่วนมาก', className: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>เลขที่</TableHead>
            <TableHead>ลูกค้า</TableHead>
            <TableHead>วันที่สั่ง</TableHead>
            <TableHead>กำหนดส่ง</TableHead>
            <TableHead className="text-right">จำนวน</TableHead>
            <TableHead className="text-right">มูลค่า</TableHead>
            <TableHead>ความเร่งด่วน</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="text-right">การดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                ไม่พบคำสั่งซื้อ
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const status = statusConfig[order.status]
              const priority = priorityConfig[order.priority]
              const StatusIcon = status.icon

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {order.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{order.orderDate}</TableCell>
                  <TableCell className="text-sm">{order.requestedDeliveryDate}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(order.totalQuantity)} ขวด
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ฿{formatNumber(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priority.className}`}
                    >
                      {order.priority === 'EXPRESS' && <Zap className="h-3 w-3" />}
                      {priority.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {order.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCreatePickList?.(order)}
                        >
                          <ClipboardList className="h-4 w-4 mr-1" />
                          สร้าง Pick List
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails?.(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
