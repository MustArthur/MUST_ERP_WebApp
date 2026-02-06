'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  useInventoryStore,
  useStockItemsWithBalance,
  useWarehousesWithStock,
} from '@/stores/inventory-store'
import { Warehouse, StockItem, StockItemWithBalance, ItemType } from '@/types/inventory'
import {
  WarehouseCard,
  StockItemCard,
  InventoryDetailModal,
  StockFormModal,
  InventoryTable,
} from '@/components/inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import {
  Search,
  Warehouse as WarehouseIcon,
  Package,
  Plus,
  AlertTriangle,
  Clock,
  Thermometer,
  ArrowLeft,
} from 'lucide-react'

export default function InventoryPage() {
  const {
    fetchWarehouses,
    fetchStockItems,
    fetchStockBalances,
    inventoryFilters,
    setInventoryFilters,
    isLoading,
  } = useInventoryStore()

  const warehouses = useWarehousesWithStock()
  const stockItems = useStockItemsWithBalance()

  // Modal state
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [selectedItem, setSelectedItem] = useState<StockItemWithBalance | null>(null)
  const [showWarehouseModal, setShowWarehouseModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)

  // Load data on mount
  useEffect(() => {
    fetchWarehouses()
    fetchStockItems()
    fetchStockBalances()
  }, [fetchWarehouses, fetchStockItems, fetchStockBalances])

  // Handlers
  const handleViewWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse)
    setShowWarehouseModal(true)
  }

  const handleViewItem = (item: StockItemWithBalance) => {
    setSelectedItem(item)
    setShowItemModal(true)
  }

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item)
    setShowItemModal(false)
    setShowFormModal(true)
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setShowFormModal(true)
  }

  const handleSaveItem = (item: StockItem) => {
    // Refresh data after save
    fetchStockItems()
    fetchStockBalances()
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInventoryFilters({ search: e.target.value })
  }

  const handleTypeFilter = (type: ItemType | 'all') => {
    setInventoryFilters({ itemType: type })
  }

  // Filter stock items
  const filteredItems = stockItems.filter(item => {
    if (inventoryFilters.search) {
      const search = inventoryFilters.search.toLowerCase()
      if (
        !item.code.toLowerCase().includes(search) &&
        !item.name.toLowerCase().includes(search)
      ) {
        return false
      }
    }
    if (inventoryFilters.itemType !== 'all' && item.type !== inventoryFilters.itemType) {
      return false
    }
    if (inventoryFilters.status === 'low_stock' && !item.isLowStock) {
      return false
    }
    if (inventoryFilters.status === 'expiring' && !item.isExpiringSoon) {
      return false
    }
    return true
  })

  // Summary stats
  const lowStockCount = stockItems.filter(i => i.isLowStock).length
  const expiringCount = stockItems.filter(i => i.isExpiringSoon).length
  const totalValue = stockItems.reduce(
    (sum, item) => sum + item.totalQty * item.costPerUnit,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  หน้าแรก
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">คลังสินค้า</h1>
                <p className="text-sm text-gray-500">จัดการวัตถุดิบและสินค้าสำเร็จรูป</p>
              </div>
            </div>
            <Button onClick={handleAddItem}>
              <Plus className="w-5 h-5 mr-2" />
              เพิ่มสินค้าใหม่
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">รายการสินค้า</p>
                <p className="text-xl font-semibold">{stockItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <WarehouseIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">มูลค่ารวม</p>
                <p className="text-xl font-semibold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">สต็อกต่ำ</p>
                <p className="text-xl font-semibold text-red-600">{lowStockCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">ใกล้หมดอายุ</p>
                <p className="text-xl font-semibold text-orange-600">{expiringCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="warehouses" className="space-y-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="warehouses" className="gap-2">
              <WarehouseIcon className="w-4 h-4" />
              คลังสินค้า
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2">
              <Package className="w-4 h-4" />
              รายการสินค้า
            </TabsTrigger>
          </TabsList>

          {/* Warehouses Tab */}
          <TabsContent value="warehouses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouses.map(warehouse => (
                <WarehouseCard
                  key={warehouse.id}
                  warehouse={warehouse}
                  onView={handleViewWarehouse}
                />
              ))}
            </div>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            {/* Filters */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ค้นหาด้วยรหัสหรือชื่อสินค้า..."
                    className="pl-10"
                    value={inventoryFilters.search}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Type Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={inventoryFilters.itemType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTypeFilter('all')}
                  >
                    ทั้งหมด
                  </Button>
                  <Button
                    variant={inventoryFilters.itemType === 'RAW_MATERIAL' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      inventoryFilters.itemType === 'RAW_MATERIAL' && 'bg-blue-600 hover:bg-blue-700'
                    )}
                    onClick={() => handleTypeFilter('RAW_MATERIAL')}
                  >
                    วัตถุดิบ
                  </Button>
                  <Button
                    variant={inventoryFilters.itemType === 'SEMI_FINISHED' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      inventoryFilters.itemType === 'SEMI_FINISHED' && 'bg-yellow-600 hover:bg-yellow-700'
                    )}
                    onClick={() => handleTypeFilter('SEMI_FINISHED')}
                  >
                    กึ่งสำเร็จรูป
                  </Button>
                  <Button
                    variant={inventoryFilters.itemType === 'FINISHED_GOOD' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      inventoryFilters.itemType === 'FINISHED_GOOD' && 'bg-green-600 hover:bg-green-700'
                    )}
                    onClick={() => handleTypeFilter('FINISHED_GOOD')}
                  >
                    สินค้าสำเร็จรูป
                  </Button>
                  <Button
                    variant={inventoryFilters.itemType === 'PACKAGING' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      inventoryFilters.itemType === 'PACKAGING' && 'bg-purple-600 hover:bg-purple-700'
                    )}
                    onClick={() => handleTypeFilter('PACKAGING')}
                  >
                    บรรจุภัณฑ์
                  </Button>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  {lowStockCount > 0 && (
                    <Button
                      variant={inventoryFilters.status === 'low_stock' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setInventoryFilters({
                          status: inventoryFilters.status === 'low_stock' ? 'all' : 'low_stock',
                        })
                      }
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      สต็อกต่ำ ({lowStockCount})
                    </Button>
                  )}
                  {expiringCount > 0 && (
                    <Button
                      variant={inventoryFilters.status === 'expiring' ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        inventoryFilters.status === 'expiring' && 'bg-orange-600 hover:bg-orange-700'
                      )}
                      onClick={() =>
                        setInventoryFilters({
                          status: inventoryFilters.status === 'expiring' ? 'all' : 'expiring',
                        })
                      }
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      ใกล้หมดอายุ ({expiringCount})
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-2 text-gray-500">กำลังโหลด...</p>
              </div>
            )}

            {/* Items Table */}
            {!isLoading && filteredItems.length > 0 && (
              <InventoryTable
                items={filteredItems}
                onView={handleViewItem}
              />
            )}

            {/* Empty State */}
            {!isLoading && filteredItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">ไม่พบรายการสินค้าที่ค้นหา</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Warehouse Detail Modal */}
      <Dialog open={showWarehouseModal} onOpenChange={setShowWarehouseModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WarehouseIcon className="w-5 h-5" />
              {selectedWarehouse?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedWarehouse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">รหัสคลัง</p>
                  <p className="font-medium">{selectedWarehouse.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">สถานที่</p>
                  <p className="font-medium">{selectedWarehouse.location || '-'}</p>
                </div>
              </div>

              {selectedWarehouse.temperatureControlled && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Thermometer className="w-5 h-5 text-blue-600" />
                  <span>
                    ควบคุมอุณหภูมิ {selectedWarehouse.minTemp}°C -{' '}
                    {selectedWarehouse.maxTemp}°C
                  </span>
                </div>
              )}

              {selectedWarehouse.isQuarantine && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">
                    คลังกักกัน - ห้ามใช้ในการผลิต
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">ความจุ</p>
                  <p className="text-lg font-semibold">
                    {formatNumber(selectedWarehouse.currentStock || 0)} /{' '}
                    {formatNumber(selectedWarehouse.capacity || 0)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">รายการสินค้า</p>
                  <p className="text-lg font-semibold">
                    {(selectedWarehouse as any).stockCount || 0} รายการ
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Item Detail Modal - NEW */}
      <InventoryDetailModal
        item={selectedItem}
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        onEdit={handleEditItem}
      />

      {/* Stock Form Modal - NEW */}
      <StockFormModal
        item={editingItem}
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveItem}
      />
    </div>
  )
}
