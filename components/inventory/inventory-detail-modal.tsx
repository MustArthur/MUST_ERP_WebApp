'use client'

import { StockItem, StockBalance, Warehouse, StockEntry } from '@/types/inventory'
import { useInventoryStore } from '@/stores/inventory-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import {
  Package,
  Warehouse as WarehouseIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  Edit,
  AlertTriangle,
  Thermometer,
  Calendar,
  Settings,
  History,
  BarChart3,
} from 'lucide-react'

interface InventoryDetailModalProps {
  item: StockItem | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (item: StockItem) => void
  onReceive?: (item: StockItem) => void
  onTransfer?: (item: StockItem) => void
}

export function InventoryDetailModal({
  item,
  isOpen,
  onClose,
  onEdit,
  onReceive,
  onTransfer,
}: InventoryDetailModalProps) {
  const { stockBalances, warehouses, stockEntries } = useInventoryStore()

  if (!item) return null

  // Get balances for this item
  const itemBalances = stockBalances.filter(b => b.itemId === item.id)
  const totalQty = itemBalances
    .filter(b => b.status === 'AVAILABLE')
    .reduce((sum, b) => sum + b.qty, 0)
  const totalValue = totalQty * item.costPerUnit

  // Check stock level
  const isLowStock = item.minStock !== undefined && totalQty < item.minStock
  const stockPercentage = item.maxStock
    ? Math.min((totalQty / item.maxStock) * 100, 100)
    : 50

  // Get expiring soon items
  const expiringBalances = itemBalances.filter(b => {
    if (!b.expDate) return false
    const expDate = new Date(b.expDate)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + 7)
    return expDate <= cutoff && b.status === 'AVAILABLE'
  })

  // Get recent entries for this item
  const recentEntries = stockEntries
    .filter(e => e.items.some(i => i.itemId === item.id))
    .slice(-5)
    .reverse()

  // Get warehouse name
  const getWarehouseName = (warehouseId: string) => {
    return warehouses.find(w => w.id === warehouseId)?.name || warehouseId
  }

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'RAW_MATERIAL': return 'วัตถุดิบ'
      case 'SEMI_FINISHED': return 'กึ่งสำเร็จรูป'
      case 'FINISHED_GOOD': return 'สินค้าสำเร็จรูป'
      case 'PACKAGING': return 'บรรจุภัณฑ์'
      default: return type
    }
  }

  // Get entry type label
  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'RECEIVE': return 'รับเข้า'
      case 'ISSUE': return 'จ่ายออก'
      case 'TRANSFER': return 'โอนย้าย'
      case 'ADJUSTMENT': return 'ปรับปรุง'
      default: return type
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{item.code}</DialogTitle>
              <p className="text-muted-foreground">{item.name}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
              {isLowStock && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  สต็อกต่ำ
                </Badge>
              )}
              {item.requiresQC && (
                <Badge className="bg-purple-100 text-purple-800">ต้อง QC</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Info Bar */}
        <div className="py-3 border-y grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">คงเหลือ</p>
            <p className={cn(
              "font-medium text-lg",
              isLowStock ? "text-red-600" : "text-gray-900"
            )}>
              {totalQty.toLocaleString()} {item.uom}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">ขั้นต่ำ</p>
            <p className="font-medium">{item.minStock?.toLocaleString() || '-'} {item.uom}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">ขั้นสูง</p>
            <p className="font-medium">{item.maxStock?.toLocaleString() || '-'} {item.uom}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">มูลค่ารวม</p>
            <p className="font-medium">{formatCurrency(totalValue)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">หมดอายุใกล้</p>
            <p className={cn(
              "font-medium",
              expiringBalances.length > 0 ? "text-orange-600" : "text-gray-900"
            )}>
              {expiringBalances.length > 0 ? `${expiringBalances.length} รายการ` : '-'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-fit">
            <TabsTrigger value="overview" className="gap-2">
              <Package className="w-4 h-4" />
              ภาพรวม
            </TabsTrigger>
            <TabsTrigger value="stock" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              ระดับสต็อก
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              ประวัติ ({recentEntries.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              ตั้งค่า
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">ข้อมูลทั่วไป</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">รหัสสินค้า</span>
                      <span className="font-medium">{item.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ประเภท</span>
                      <span className="font-medium">{getTypeLabel(item.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">หน่วยนับ</span>
                      <span className="font-medium">{item.uom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ราคาต่อหน่วย</span>
                      <span className="font-medium">{formatCurrency(item.costPerUnit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">อายุสินค้า</span>
                      <span className="font-medium">{item.shelfLifeDays ? `${item.shelfLifeDays} วัน` : '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">การจัดการ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ติดตาม Batch</span>
                      <span className="font-medium">{item.hasBatch ? 'ใช่' : 'ไม่'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ติดตามวันหมดอายุ</span>
                      <span className="font-medium">{item.hasExpiry ? 'ใช่' : 'ไม่'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ต้องตรวจ QC</span>
                      <span className="font-medium">{item.requiresQC ? 'ใช่' : 'ไม่'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">จุดสั่งซื้อ</span>
                      <span className="font-medium">{item.reorderPoint?.toLocaleString() || '-'} {item.uom}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance by warehouse */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <WarehouseIcon className="w-4 h-4" />
                  ยอดคงเหลือตามคลัง
                </h4>
                {itemBalances.length > 0 ? (
                  <div className="space-y-2">
                    {itemBalances.map((balance) => (
                      <div
                        key={balance.id}
                        className="flex items-center justify-between bg-white rounded-lg p-3 border"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{getWarehouseName(balance.warehouseId)}</p>
                          {balance.batchNo && (
                            <p className="text-sm text-gray-500">Batch: {balance.batchNo}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{balance.qty.toLocaleString()} {balance.uom}</p>
                          {balance.expDate && (
                            <p className={cn(
                              "text-xs",
                              new Date(balance.expDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                ? "text-orange-600"
                                : "text-gray-500"
                            )}>
                              หมดอายุ: {formatDate(balance.expDate)}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={cn(
                            "ml-3",
                            balance.status === 'AVAILABLE' && 'bg-green-100 text-green-800',
                            balance.status === 'RESERVED' && 'bg-blue-100 text-blue-800',
                            balance.status === 'ON_HOLD' && 'bg-yellow-100 text-yellow-800',
                            balance.status === 'QUARANTINE' && 'bg-red-100 text-red-800'
                          )}
                        >
                          {balance.status === 'AVAILABLE' ? 'พร้อมใช้' :
                           balance.status === 'RESERVED' ? 'จองแล้ว' :
                           balance.status === 'ON_HOLD' ? 'พักไว้' : 'กักกัน'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">ไม่มียอดคงเหลือ</p>
                )}
              </div>
            </TabsContent>

            {/* Stock Level Tab */}
            <TabsContent value="stock" className="m-0 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">ระดับสต็อกปัจจุบัน</h4>

                <div className="space-y-6">
                  {/* Stock Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">คงเหลือ</span>
                      <span className="font-medium">{totalQty.toLocaleString()} / {item.maxStock?.toLocaleString() || '∞'} {item.uom}</span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={stockPercentage}
                        className={cn(
                          "h-4",
                          isLowStock && "[&>div]:bg-red-500"
                        )}
                      />
                      {/* Min stock marker */}
                      {item.minStock && item.maxStock && (
                        <div
                          className="absolute top-0 h-full w-0.5 bg-orange-500"
                          style={{ left: `${(item.minStock / item.maxStock) * 100}%` }}
                        />
                      )}
                      {/* Reorder point marker */}
                      {item.reorderPoint && item.maxStock && (
                        <div
                          className="absolute top-0 h-full w-0.5 bg-yellow-500"
                          style={{ left: `${(item.reorderPoint / item.maxStock) * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      {item.minStock && <span className="text-orange-600">Min: {item.minStock}</span>}
                      {item.reorderPoint && <span className="text-yellow-600">Reorder: {item.reorderPoint}</span>}
                      <span>{item.maxStock?.toLocaleString() || '∞'}</span>
                    </div>
                  </div>

                  {/* Stock Status Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={cn(
                      "p-4 rounded-lg border text-center",
                      isLowStock ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                    )}>
                      <p className="text-2xl font-bold">{totalQty.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">คงเหลือทั้งหมด</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 text-center">
                      <p className="text-2xl font-bold">{itemBalances.filter(b => b.status === 'RESERVED').reduce((sum, b) => sum + b.qty, 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">จองแล้ว</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-orange-50 border-orange-200 text-center">
                      <p className="text-2xl font-bold">{expiringBalances.reduce((sum, b) => sum + b.qty, 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">ใกล้หมดอายุ</p>
                    </div>
                  </div>

                  {/* Alerts */}
                  {isLowStock && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">สต็อกต่ำกว่าขั้นต่ำ</p>
                        <p className="text-sm text-red-600">
                          ควรสั่งซื้อเพิ่มอย่างน้อย {(item.minStock! - totalQty).toLocaleString()} {item.uom}
                        </p>
                      </div>
                    </div>
                  )}

                  {expiringBalances.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800">มีสินค้าใกล้หมดอายุ</p>
                        <p className="text-sm text-orange-600">
                          {expiringBalances.length} Batch รวม {expiringBalances.reduce((sum, b) => sum + b.qty, 0).toLocaleString()} {item.uom}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="m-0 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">ประวัติเคลื่อนไหว (5 รายการล่าสุด)</h4>

                {recentEntries.length > 0 ? (
                  <div className="space-y-2">
                    {recentEntries.map((entry) => {
                      const entryItem = entry.items.find(i => i.itemId === item.id)
                      if (!entryItem) return null

                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between bg-white rounded-lg p-3 border"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              entry.type === 'RECEIVE' ? "bg-green-100" : "bg-red-100"
                            )}>
                              {entry.type === 'RECEIVE' ? (
                                <ArrowDownToLine className={cn(
                                  "w-4 h-4",
                                  entry.type === 'RECEIVE' ? "text-green-600" : "text-red-600"
                                )} />
                              ) : (
                                <ArrowUpFromLine className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{entry.code}</p>
                              <p className="text-sm text-gray-500">
                                {getEntryTypeLabel(entry.type)} • {formatDate(entry.postingDate)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-medium",
                              entry.type === 'RECEIVE' ? "text-green-600" : "text-red-600"
                            )}>
                              {entry.type === 'RECEIVE' ? '+' : '-'}{entryItem.qty.toLocaleString()} {entryItem.uom}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn(
                                entry.status === 'SUBMITTED' && 'border-green-500 text-green-700',
                                entry.status === 'DRAFT' && 'border-yellow-500 text-yellow-700',
                                entry.status === 'CANCELLED' && 'border-red-500 text-red-700'
                              )}
                            >
                              {entry.status === 'SUBMITTED' ? 'ยืนยันแล้ว' :
                               entry.status === 'DRAFT' ? 'ร่าง' : 'ยกเลิก'}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">ไม่มีประวัติเคลื่อนไหว</p>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">การควบคุมสต็อก</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">ขั้นต่ำ (Min)</label>
                      <p className="font-medium">{item.minStock?.toLocaleString() || 'ไม่กำหนด'} {item.minStock ? item.uom : ''}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">ขั้นสูง (Max)</label>
                      <p className="font-medium">{item.maxStock?.toLocaleString() || 'ไม่กำหนด'} {item.maxStock ? item.uom : ''}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">จุดสั่งซื้อ (Reorder Point)</label>
                      <p className="font-medium">{item.reorderPoint?.toLocaleString() || 'ไม่กำหนด'} {item.reorderPoint ? item.uom : ''}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">การจัดเก็บ</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">คลังเริ่มต้น</label>
                      <p className="font-medium">{getWarehouseName(item.defaultWarehouseId)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">อายุสินค้า (Shelf Life)</label>
                      <p className="font-medium">{item.shelfLifeDays ? `${item.shelfLifeDays} วัน` : 'ไม่กำหนด'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {item.requiresQC && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">ต้องตรวจสอบคุณภาพ (QC)</h4>
                  <p className="text-sm text-purple-600">
                    สินค้านี้ต้องผ่านการตรวจ QC ก่อนนำไปใช้งาน
                    {item.qcTemplateId && ` (Template: ${item.qcTemplateId})`}
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            อัพเดทล่าสุด: {formatDate(item.updatedAt)}
          </div>
          <div className="flex gap-2">
            {onReceive && (
              <Button variant="outline" onClick={() => onReceive(item)}>
                <ArrowDownToLine className="w-4 h-4 mr-2" />
                รับเข้า
              </Button>
            )}
            {onTransfer && (
              <Button variant="outline" onClick={() => onTransfer(item)}>
                <WarehouseIcon className="w-4 h-4 mr-2" />
                โอนย้าย
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(item)}>
                <Edit className="w-4 h-4 mr-2" />
                แก้ไข
              </Button>
            )}
            <Button onClick={onClose}>ปิด</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
