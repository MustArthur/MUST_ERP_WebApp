'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useFinishedGoodsStore } from '@/stores/finished-goods-store'
import { FinishedGoodsEntry, FGEntryStatus } from '@/types/finished-goods'
import {
  FGStatsCards,
  FGBatchTable,
  FGEntryModal,
  ExpiryAlerts,
} from '@/components/finished-goods'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Search,
  Package,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
  ArrowLeft,
} from 'lucide-react'

export default function FinishedGoodsPage() {
  const {
    entries,
    warehouses,
    expiryAlerts,
    dashboardStats,
    filters,
    isLoading,
    fetchEntries,
    fetchWarehouses,
    fetchExpiryAlerts,
    createEntry,
    updateEntryStatus,
    acknowledgeAlert,
    setFilters,
    getFilteredEntries,
  } = useFinishedGoodsStore()

  // Modal state
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Load data on mount
  useEffect(() => {
    fetchEntries()
    fetchWarehouses()
    fetchExpiryAlerts()
  }, [fetchEntries, fetchWarehouses, fetchExpiryAlerts])

  // Handlers
  const handleCreateEntry = async (data: Parameters<typeof createEntry>[0]) => {
    try {
      await createEntry(data)
      toast.success('รับเข้าสินค้าสำเร็จรูปสำเร็จ')
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการรับเข้าสินค้า')
      throw error
    }
  }

  const handleApproveQC = async (entry: FinishedGoodsEntry) => {
    try {
      await updateEntryStatus(entry.id, 'AVAILABLE')
      await fetchEntries()
      toast.success(`อนุมัติ QC สำเร็จ: ${entry.code}`)
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอนุมัติ QC')
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId, 'ผู้ใช้ปัจจุบัน')
      toast.success('รับทราบการแจ้งเตือนแล้ว')
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleRefresh = async () => {
    await Promise.all([fetchEntries(), fetchWarehouses(), fetchExpiryAlerts()])
    toast.success('รีเฟรชข้อมูลแล้ว')
  }

  const handleViewDetails = (entry: FinishedGoodsEntry) => {
    // For now, just show an alert. In production, open a detail modal
    toast.info(`ดูรายละเอียด: ${entry.code}`)
  }

  // Filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value })
  }

  const handleStatusFilter = (status: FGEntryStatus | 'all') => {
    setFilters({ status })
    setActiveTab(status)
  }

  // Get filtered entries
  const filteredEntries = getFilteredEntries()

  // Status counts for tabs
  const statusCounts = {
    all: entries.length,
    AVAILABLE: entries.filter(e => e.status === 'AVAILABLE').length,
    ON_HOLD: entries.filter(e => e.status === 'ON_HOLD').length,
    RESERVED: entries.filter(e => e.status === 'RESERVED').length,
    DELIVERED: entries.filter(e => e.status === 'DELIVERED').length,
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
                <h1 className="text-2xl font-bold text-gray-900">สินค้าสำเร็จรูป</h1>
                <p className="text-sm text-gray-500">จัดการ FG Stock และการติดตามหมดอายุ (FEFO)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-1" />
                รีเฟรช
              </Button>
              <Button onClick={() => setShowEntryModal(true)}>
                <Plus className="w-5 h-5 mr-2" />
                รับเข้าจากผลิต
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <FGStatsCards stats={dashboardStats} />

        {/* Main Content Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Table */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="ค้นหารหัส FG, สินค้า, Batch..."
                    className="pl-10"
                    value={filters.search}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Warehouse Filter */}
                <Select
                  value={filters.warehouseId}
                  onValueChange={(v) => setFilters({ warehouseId: v })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="คลังสินค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกคลัง</SelectItem>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => handleStatusFilter(v as FGEntryStatus | 'all')}>
              <TabsList className="bg-white border">
                <TabsTrigger value="all" className="gap-1">
                  <Package className="w-4 h-4" />
                  ทั้งหมด ({statusCounts.all})
                </TabsTrigger>
                <TabsTrigger value="AVAILABLE" className="gap-1">
                  <CheckCircle className="w-4 h-4" />
                  พร้อมส่ง ({statusCounts.AVAILABLE})
                </TabsTrigger>
                <TabsTrigger value="ON_HOLD" className="gap-1">
                  <Clock className="w-4 h-4" />
                  รอ QC ({statusCounts.ON_HOLD})
                </TabsTrigger>
                <TabsTrigger value="RESERVED" className="gap-1">
                  <Truck className="w-4 h-4" />
                  จองแล้ว ({statusCounts.RESERVED})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                {isLoading ? (
                  <div className="bg-white rounded-xl shadow-sm border p-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-10 bg-gray-200 rounded w-full" />
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded w-full" />
                      ))}
                    </div>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบสินค้าสำเร็จรูป</h3>
                    <p className="text-gray-500 mb-4">
                      {filters.search || filters.status !== 'all'
                        ? 'ลองปรับเงื่อนไขการค้นหา'
                        : 'ยังไม่มีสินค้าสำเร็จรูปในระบบ'}
                    </p>
                    <Button onClick={() => setShowEntryModal(true)}>
                      <Plus className="w-5 h-5 mr-2" />
                      รับเข้าสินค้าใหม่
                    </Button>
                  </div>
                ) : (
                  <FGBatchTable
                    entries={filteredEntries}
                    onViewDetails={handleViewDetails}
                    onApproveQC={handleApproveQC}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Expiry Alerts */}
          <div className="lg:col-span-1">
            <ExpiryAlerts
              alerts={expiryAlerts}
              onAcknowledge={handleAcknowledgeAlert}
            />
          </div>
        </div>
      </main>

      {/* FG Entry Modal */}
      <FGEntryModal
        open={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSubmit={handleCreateEntry}
      />
    </div>
  )
}
