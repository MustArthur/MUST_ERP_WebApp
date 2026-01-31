'use client'

import { useEffect, useState } from 'react'
import { useQualityStore, useFilteredInspections } from '@/stores/quality-store'
import { useInventoryStore } from '@/stores/inventory-store'
import { QCInspection, InspectionType, InspectionStatus } from '@/types/quality'
import {
  InspectionCard,
  InspectionDetailModal,
  InspectionFormModal,
} from '@/components/quality'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import {
  Search,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Filter,
} from 'lucide-react'

export default function QualityPage() {
  const {
    fetchInspections,
    fetchTemplates,
    fetchQuarantine,
    inspectionFilters,
    setInspectionFilters,
    getDashboard,
    isLoading,
  } = useQualityStore()

  const filteredInspections = useFilteredInspections()

  // Load stock items for form
  const { fetchStockItems } = useInventoryStore()

  // Modal state
  const [selectedInspection, setSelectedInspection] = useState<QCInspection | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)

  // Load data on mount
  useEffect(() => {
    fetchInspections()
    fetchTemplates()
    fetchQuarantine()
    fetchStockItems()
  }, [fetchInspections, fetchTemplates, fetchQuarantine, fetchStockItems])

  // Get dashboard data
  const dashboard = getDashboard()

  // Handlers
  const handleViewInspection = (inspection: QCInspection) => {
    setSelectedInspection(inspection)
    setShowDetailModal(true)
  }

  const handleCreateInspection = () => {
    setShowFormModal(true)
  }

  const handleApproveInspection = async (inspection: QCInspection) => {
    // This would typically call an API - for now, just refresh
    const { approveInspection } = useQualityStore.getState()
    await approveInspection(inspection.id, 'ผู้จัดการ QC')
    setShowDetailModal(false)
    fetchInspections()
  }

  const handleSaveInspection = (inspection: QCInspection) => {
    fetchInspections()
    setShowFormModal(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInspectionFilters({ search: e.target.value })
  }

  const handleTypeFilter = (type: InspectionType | 'all') => {
    setInspectionFilters({ type })
  }

  const handleStatusFilter = (status: InspectionStatus | 'all') => {
    setInspectionFilters({ status })
  }

  const toggleCCPFilter = () => {
    setInspectionFilters({ isCCPOnly: !inspectionFilters.isCCPOnly })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ควบคุมคุณภาพ (QC)</h1>
              <p className="text-sm text-gray-500">ตรวจสอบคุณภาพวัตถุดิบและสินค้า</p>
            </div>
            <Button onClick={handleCreateInspection}>
              <Plus className="w-5 h-5 mr-2" />
              สร้างใบตรวจสอบ
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">ตรวจทั้งหมด</p>
                <p className="text-xl font-semibold">{dashboard.totalInspections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">ผ่าน</p>
                <p className="text-xl font-semibold text-green-600">
                  {dashboard.passedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">ไม่ผ่าน</p>
                <p className="text-xl font-semibold text-red-600">
                  {dashboard.failedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pass Rate</p>
                <p className="text-xl font-semibold">{dashboard.passRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Quarantine</p>
                <p className="text-xl font-semibold text-orange-600">
                  {dashboard.quarantineItems}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CCP Warning */}
        {dashboard.ccpDeviations > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">
                CCP Deviation: {dashboard.ccpDeviations} รายการ
              </p>
              <p className="text-sm text-red-600">
                พบการเบี่ยงเบนจากจุดควบคุมวิกฤต ต้องดำเนินการแก้ไข
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหาด้วยรหัส, สินค้า หรือ Batch..."
                className="pl-10"
                value={inspectionFilters.search}
                onChange={handleSearchChange}
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={inspectionFilters.type === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTypeFilter('all')}
              >
                ทั้งหมด
              </Button>
              <Button
                variant={inspectionFilters.type === 'INCOMING' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  inspectionFilters.type === 'INCOMING' && 'bg-blue-600 hover:bg-blue-700'
                )}
                onClick={() => handleTypeFilter('INCOMING')}
              >
                ตรวจรับ
              </Button>
              <Button
                variant={inspectionFilters.type === 'IN_PROCESS' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  inspectionFilters.type === 'IN_PROCESS' && 'bg-yellow-600 hover:bg-yellow-700'
                )}
                onClick={() => handleTypeFilter('IN_PROCESS')}
              >
                ระหว่างผลิต
              </Button>
              <Button
                variant={inspectionFilters.type === 'FINAL' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  inspectionFilters.type === 'FINAL' && 'bg-green-600 hover:bg-green-700'
                )}
                onClick={() => handleTypeFilter('FINAL')}
              >
                สินค้าสำเร็จรูป
              </Button>
            </div>

            {/* Status & CCP Filter */}
            <div className="flex gap-2">
              <Button
                variant={inspectionFilters.status === 'PASSED' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  inspectionFilters.status === 'PASSED' && 'bg-green-600 hover:bg-green-700'
                )}
                onClick={() => handleStatusFilter(
                  inspectionFilters.status === 'PASSED' ? 'all' : 'PASSED'
                )}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                ผ่าน
              </Button>
              <Button
                variant={inspectionFilters.status === 'FAILED' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter(
                  inspectionFilters.status === 'FAILED' ? 'all' : 'FAILED'
                )}
              >
                <XCircle className="w-4 h-4 mr-1" />
                ไม่ผ่าน
              </Button>
              <Button
                variant={inspectionFilters.isCCPOnly ? 'destructive' : 'outline'}
                size="sm"
                onClick={toggleCCPFilter}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                CCP
              </Button>
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

        {/* Inspections Grid */}
        {!isLoading && filteredInspections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInspections.map(inspection => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                onView={handleViewInspection}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredInspections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border">
            <ClipboardCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">ไม่พบรายการตรวจสอบที่ค้นหา</p>
            <Button variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              สร้างใบตรวจสอบใหม่
            </Button>
          </div>
        )}
      </main>

      {/* Detail Modal - NEW */}
      <InspectionDetailModal
        inspection={selectedInspection}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onApprove={handleApproveInspection}
      />

      {/* Form Modal - NEW */}
      <InspectionFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveInspection}
      />
    </div>
  )
}
