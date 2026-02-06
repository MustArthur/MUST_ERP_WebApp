'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDeliveryStore } from '@/stores/delivery-store'
import {
  CustomerOrder,
  CustomerOrderStatus,
  DeliveryNote,
  DeliveryNoteStatus,
} from '@/types/delivery'
import {
  DeliveryStatsCards,
  OrderTable,
  DeliveryNoteTable,
  ColdChainLog,
} from '@/components/delivery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Search,
  ShoppingCart,
  Truck,
  Plus,
  RefreshCw,
  CheckCircle,
  ClipboardList,
  ArrowLeft,
} from 'lucide-react'

export default function DeliveryPage() {
  const {
    orders,
    deliveryNotes,
    drivers,
    customers,
    summary,
    orderFilters,
    deliveryFilters,
    isLoading,
    fetchOrders,
    fetchDeliveryNotes,
    fetchDrivers,
    fetchCustomers,
    createPickList,
    dispatchDelivery,
    completeDelivery,
    setOrderFilters,
    setDeliveryFilters,
    getFilteredOrders,
    getFilteredDeliveryNotes,
    checkColdChainCompliance,
  } = useDeliveryStore()

  // State
  const [activeMainTab, setActiveMainTab] = useState<'orders' | 'deliveries'>('orders')
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null)
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<DeliveryNote | null>(null)
  const [showPickListModal, setShowPickListModal] = useState(false)
  const [showDeliveryDetailModal, setShowDeliveryDetailModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [receiverName, setReceiverName] = useState('')

  // Load data on mount
  useEffect(() => {
    fetchOrders()
    fetchDeliveryNotes()
    fetchDrivers()
    fetchCustomers()
  }, [fetchOrders, fetchDeliveryNotes, fetchDrivers, fetchCustomers])

  // Handlers
  const handleRefresh = async () => {
    await Promise.all([
      fetchOrders(),
      fetchDeliveryNotes(),
      fetchDrivers(),
    ])
    toast.success('รีเฟรชข้อมูลแล้ว')
  }

  const handleViewOrderDetails = (order: CustomerOrder) => {
    setSelectedOrder(order)
    toast.info(`ดูรายละเอียด: ${order.code}`)
  }

  const handleCreatePickList = (order: CustomerOrder) => {
    setSelectedOrder(order)
    setShowPickListModal(true)
  }

  const handleConfirmPickList = async () => {
    if (!selectedOrder) return
    try {
      await createPickList(selectedOrder.id, 'มานี จัดส่ง')
      await fetchOrders()
      toast.success(`สร้าง Pick List สำหรับ ${selectedOrder.code} สำเร็จ`)
      setShowPickListModal(false)
      setSelectedOrder(null)
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการสร้าง Pick List')
    }
  }

  const handleViewDeliveryDetails = (note: DeliveryNote) => {
    setSelectedDeliveryNote(note)
    setShowDeliveryDetailModal(true)
  }

  const handleDispatch = async (note: DeliveryNote) => {
    try {
      await dispatchDelivery(note.id)
      await fetchDeliveryNotes()
      await fetchOrders()
      toast.success(`ออกจัดส่ง ${note.code} สำเร็จ`)
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการออกจัดส่ง')
    }
  }

  const handleCompleteDelivery = (note: DeliveryNote) => {
    setSelectedDeliveryNote(note)
    setReceiverName('')
    setShowCompleteModal(true)
  }

  const handleConfirmComplete = async () => {
    if (!selectedDeliveryNote || !receiverName.trim()) {
      toast.error('กรุณาระบุชื่อผู้รับสินค้า')
      return
    }

    try {
      await completeDelivery(selectedDeliveryNote.id, receiverName)
      await fetchDeliveryNotes()
      await fetchOrders()
      toast.success(`ส่งสำเร็จ: ${selectedDeliveryNote.code}`)
      setShowCompleteModal(false)
      setSelectedDeliveryNote(null)
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกการส่ง')
    }
  }

  // Filter handlers
  const handleOrderSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderFilters({ search: e.target.value })
  }

  const handleDeliverySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryFilters({ search: e.target.value })
  }

  // Get filtered data
  const filteredOrders = getFilteredOrders()
  const filteredDeliveryNotes = getFilteredDeliveryNotes()

  // Status counts
  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => ['CONFIRMED', 'PICKING', 'PICKED'].includes(o.status)).length,
    dispatched: orders.filter(o => o.status === 'DISPATCHED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  }

  const deliveryCounts = {
    all: deliveryNotes.length,
    pending: deliveryNotes.filter(d => d.status === 'PENDING').length,
    inTransit: deliveryNotes.filter(d => d.status === 'IN_TRANSIT').length,
    delivered: deliveryNotes.filter(d => d.status === 'DELIVERED').length,
  }

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
                <h1 className="text-2xl font-bold text-gray-900">จัดส่งสินค้า</h1>
                <p className="text-sm text-gray-500">จัดการคำสั่งซื้อและ Cold Chain Tracking</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-1" />
                รีเฟรช
              </Button>
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                สร้างคำสั่งซื้อ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <DeliveryStatsCards summary={summary} />

        {/* Main Tabs */}
        <div className="mt-6">
          <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as 'orders' | 'deliveries')}>
            <TabsList className="bg-white border">
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                คำสั่งซื้อ ({orderCounts.all})
              </TabsTrigger>
              <TabsTrigger value="deliveries" className="gap-2">
                <Truck className="w-4 h-4" />
                ใบส่งสินค้า ({deliveryCounts.all})
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-4 space-y-4">
              {/* Order Filters */}
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="ค้นหาเลขที่คำสั่งซื้อ, ลูกค้า..."
                      className="pl-10"
                      value={orderFilters.search}
                      onChange={handleOrderSearchChange}
                    />
                  </div>
                  <Select
                    value={orderFilters.status}
                    onValueChange={(v) => setOrderFilters({ status: v as CustomerOrderStatus | 'all' })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="CONFIRMED">ยืนยันแล้ว</SelectItem>
                      <SelectItem value="PICKING">กำลังหยิบ</SelectItem>
                      <SelectItem value="PICKED">หยิบแล้ว</SelectItem>
                      <SelectItem value="DISPATCHED">จัดส่งแล้ว</SelectItem>
                      <SelectItem value="DELIVERED">ส่งสำเร็จ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={orderFilters.priority}
                    onValueChange={(v) => setOrderFilters({ priority: v as 'all' | 'NORMAL' | 'URGENT' | 'EXPRESS' })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="ความเร่งด่วน" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกระดับ</SelectItem>
                      <SelectItem value="NORMAL">ปกติ</SelectItem>
                      <SelectItem value="URGENT">ด่วน</SelectItem>
                      <SelectItem value="EXPRESS">ด่วนมาก</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Orders Table */}
              {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-full" />
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded w-full" />
                    ))}
                  </div>
                </div>
              ) : (
                <OrderTable
                  orders={filteredOrders}
                  onViewDetails={handleViewOrderDetails}
                  onCreatePickList={handleCreatePickList}
                />
              )}
            </TabsContent>

            {/* Deliveries Tab */}
            <TabsContent value="deliveries" className="mt-4 space-y-4">
              {/* Delivery Filters */}
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="ค้นหาเลขที่ใบส่ง, ลูกค้า, คนขับ..."
                      className="pl-10"
                      value={deliveryFilters.search}
                      onChange={handleDeliverySearchChange}
                    />
                  </div>
                  <Select
                    value={deliveryFilters.status}
                    onValueChange={(v) => setDeliveryFilters({ status: v as DeliveryNoteStatus | 'all' })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="PENDING">รอจัดส่ง</SelectItem>
                      <SelectItem value="IN_TRANSIT">กำลังส่ง</SelectItem>
                      <SelectItem value="DELIVERED">ส่งสำเร็จ</SelectItem>
                      <SelectItem value="RETURNED">ตีกลับ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={deliveryFilters.driverId}
                    onValueChange={(v) => setDeliveryFilters({ driverId: v })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="คนขับ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกคนขับ</SelectItem>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Delivery Notes Table */}
              {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-full" />
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded w-full" />
                    ))}
                  </div>
                </div>
              ) : (
                <DeliveryNoteTable
                  deliveryNotes={filteredDeliveryNotes}
                  onViewDetails={handleViewDeliveryDetails}
                  onDispatch={handleDispatch}
                  onComplete={handleCompleteDelivery}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Pick List Confirmation Modal */}
      <Dialog open={showPickListModal} onOpenChange={setShowPickListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              สร้าง Pick List
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedOrder.code}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.customer?.name}
                </p>
                <p className="text-sm mt-2">
                  จำนวน: {selectedOrder.totalQuantity} ขวด |
                  มูลค่า: ฿{selectedOrder.totalAmount.toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                ระบบจะจัดสรร Batch ตามหลัก FEFO (First Expire First Out) โดยอัตโนมัติ
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPickListModal(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleConfirmPickList}>
              <ClipboardList className="h-4 w-4 mr-1" />
              สร้าง Pick List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Detail Modal */}
      <Dialog open={showDeliveryDetailModal} onOpenChange={setShowDeliveryDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              รายละเอียดใบส่งสินค้า
            </DialogTitle>
          </DialogHeader>
          {selectedDeliveryNote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">เลขที่</p>
                  <p className="font-medium">{selectedDeliveryNote.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ลูกค้า</p>
                  <p className="font-medium">{selectedDeliveryNote.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">คนขับ</p>
                  <p className="font-medium">{selectedDeliveryNote.driverName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">รถ</p>
                  <p className="font-medium">{selectedDeliveryNote.vehicleNo}</p>
                </div>
              </div>

              {/* Cold Chain Log */}
              <ColdChainLog
                logs={selectedDeliveryNote.temperatureLogs}
                alerts={selectedDeliveryNote.temperatureAlerts}
                avgTemperature={selectedDeliveryNote.avgTemperature}
                minTemperature={selectedDeliveryNote.minTemperature}
                maxTemperature={selectedDeliveryNote.maxTemperature}
                compliant={selectedDeliveryNote.coldChainCompliant}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDetailModal(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Delivery Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              ยืนยันการส่งสำเร็จ
            </DialogTitle>
          </DialogHeader>
          {selectedDeliveryNote && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedDeliveryNote.code}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedDeliveryNote.customer?.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">ชื่อผู้รับสินค้า</label>
                <Input
                  className="mt-1"
                  placeholder="ระบุชื่อผู้รับสินค้า"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleConfirmComplete}>
              <CheckCircle className="h-4 w-4 mr-1" />
              ยืนยันส่งสำเร็จ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
