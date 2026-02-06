'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useProductionStore } from '@/stores/production-store'
import { useRecipeStore } from '@/stores/recipe-store'
import {
  WorkOrder,
  JobCard,
  WorkOrderStatus,
  RecordCCPReadingInput,
} from '@/types/production'
import {
  WorkOrderCard,
  WorkOrderTable,
  WorkOrderDetailModal,
  WorkOrderFormModal,
  CCPReadingForm,
} from '@/components/production'
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
import { cn, formatNumber } from '@/lib/utils'
import {
  Search,
  Factory,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
  CalendarDays,
  Thermometer,
  AlertTriangle,
  LayoutGrid,
  List,
  ArrowLeft,
} from 'lucide-react'

export default function ProductionPage() {
  const {
    workOrders,
    operations,
    operators,
    workOrderFilters,
    isLoading,
    fetchWorkOrders,
    fetchOperations,
    createWorkOrder,
    releaseWorkOrder,
    startWorkOrder,
    completeWorkOrder,
    cancelWorkOrder,
    startJobCard,
    completeJobCard,
    recordCCPReading,
    setWorkOrderFilters,
  } = useProductionStore()

  const { recipes, fetchRecipes } = useRecipeStore()

  // Modal state
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showCCPModal, setShowCCPModal] = useState(false)
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

  // Load data on mount
  useEffect(() => {
    fetchWorkOrders()
    fetchOperations()
    fetchRecipes()
  }, [fetchWorkOrders, fetchOperations, fetchRecipes])

  // Handlers
  const handleViewWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder)
    setShowDetailModal(true)
  }

  const handleCreateWorkOrder = () => {
    setShowFormModal(true)
  }

  const handleSaveWorkOrder = async (data: { recipeId: string; plannedQty: number; plannedDate: string; remarks?: string }) => {
    await createWorkOrder(data)
    await fetchWorkOrders()
  }

  const handleReleaseWorkOrder = async (workOrder: WorkOrder) => {
    await releaseWorkOrder(workOrder.id)
    await fetchWorkOrders()
    setShowDetailModal(false)
  }

  const handleStartWorkOrder = async (workOrder: WorkOrder) => {
    await startWorkOrder(workOrder.id)
    await fetchWorkOrders()
    // Update selected work order
    setSelectedWorkOrder(workOrders.find(wo => wo.id === workOrder.id) || null)
  }

  const handleCompleteWorkOrder = async (workOrder: WorkOrder) => {
    try {
      await completeWorkOrder(workOrder.id)
      await fetchWorkOrders()
      setShowDetailModal(false)
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      }
    }
  }

  const handleCancelWorkOrder = async (workOrder: WorkOrder) => {
    if (confirm('ยืนยันการยกเลิกใบสั่งผลิตนี้?')) {
      await cancelWorkOrder(workOrder.id)
      await fetchWorkOrders()
      setShowDetailModal(false)
    }
  }

  const handleStartJobCard = async (jobCard: JobCard) => {
    const operator = prompt('ชื่อผู้ปฏิบัติงาน:', operators[0]?.name)
    if (operator) {
      await startJobCard(jobCard.id, operator)
      await fetchWorkOrders()
      // Update selected work order
      if (selectedWorkOrder) {
        setSelectedWorkOrder(workOrders.find(wo => wo.id === selectedWorkOrder.id) || null)
      }
    }
  }

  const handleCompleteJobCard = async (jobCard: JobCard, completedQty: number) => {
    try {
      await completeJobCard(jobCard.id, completedQty)
      await fetchWorkOrders()
      // Update selected work order
      if (selectedWorkOrder) {
        setSelectedWorkOrder(workOrders.find(wo => wo.id === selectedWorkOrder.id) || null)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      }
    }
  }

  const handleRecordCCP = (jobCard: JobCard) => {
    setSelectedJobCard(jobCard)
    setShowCCPModal(true)
  }

  const handleSaveCCPReading = async (input: RecordCCPReadingInput) => {
    const result = await recordCCPReading(input)
    await fetchWorkOrders()

    if (!result.canProceed) {
      alert(`CCP ไม่ผ่าน: ${result.reason}`)
    }

    // Update selected work order
    if (selectedWorkOrder) {
      setSelectedWorkOrder(workOrders.find(wo => wo.id === selectedWorkOrder.id) || null)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkOrderFilters({ search: e.target.value })
  }

  const handleStatusFilter = (status: WorkOrderStatus | 'all') => {
    setWorkOrderFilters({ status })
  }

  // Filter work orders
  const filteredWorkOrders = workOrders.filter(wo => {
    if (workOrderFilters.search) {
      const search = workOrderFilters.search.toLowerCase()
      if (
        !wo.code.toLowerCase().includes(search) &&
        !wo.recipeName?.toLowerCase().includes(search) &&
        !wo.batchNo.toLowerCase().includes(search)
      ) {
        return false
      }
    }
    if (workOrderFilters.status !== 'all' && wo.status !== workOrderFilters.status) {
      return false
    }
    return true
  })

  // Summary stats
  const todayDate = new Date().toISOString().split('T')[0]
  const todayWorkOrders = workOrders.filter(wo => wo.plannedDate === todayDate)
  const inProgressCount = workOrders.filter(wo => wo.status === 'IN_PROGRESS').length
  const pendingCCPCount = workOrders.filter(wo => wo.ccpStatus === 'PENDING' && wo.status === 'IN_PROGRESS').length
  const completedCount = workOrders.filter(wo => wo.status === 'COMPLETED').length
  const failedCCPCount = workOrders.filter(wo => wo.ccpStatus === 'FAILED').length

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
                <h1 className="text-2xl font-bold text-gray-900">การผลิต</h1>
                <p className="text-sm text-gray-500">จัดการใบสั่งผลิตและ Job Cards</p>
              </div>
            </div>
            <Button onClick={handleCreateWorkOrder}>
              <Plus className="w-5 h-5 mr-2" />
              สร้างใบสั่งผลิต
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">วันนี้</p>
                <p className="text-2xl font-bold text-gray-900">{todayWorkOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Factory className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">กำลังผลิต</p>
                <p className="text-2xl font-bold text-yellow-600">{inProgressCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Thermometer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">รอ CCP</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCCPCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">เสร็จสิ้น</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">CCP ไม่ผ่าน</p>
                <p className="text-2xl font-bold text-red-600">{failedCCPCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="ค้นหาเลขใบสั่งผลิต, สูตร, Batch..."
                className="pl-10"
                value={workOrderFilters.search}
                onChange={handleSearchChange}
              />
            </div>

            {/* Status Filter */}
            <Select
              value={workOrderFilters.status}
              onValueChange={(v) => handleStatusFilter(v as WorkOrderStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="DRAFT">ร่าง</SelectItem>
                <SelectItem value="RELEASED">พร้อมผลิต</SelectItem>
                <SelectItem value="IN_PROGRESS">กำลังผลิต</SelectItem>
                <SelectItem value="COMPLETED">เสร็จสิ้น</SelectItem>
                <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            variant={workOrderFilters.status === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleStatusFilter('all')}
          >
            ทั้งหมด ({workOrders.length})
          </Badge>
          <Badge
            variant={workOrderFilters.status === 'DRAFT' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleStatusFilter('DRAFT')}
          >
            <FileText className="w-3 h-3 mr-1" />
            ร่าง ({workOrders.filter(wo => wo.status === 'DRAFT').length})
          </Badge>
          <Badge
            variant={workOrderFilters.status === 'IN_PROGRESS' ? 'default' : 'outline'}
            className="cursor-pointer bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            onClick={() => handleStatusFilter('IN_PROGRESS')}
          >
            <Factory className="w-3 h-3 mr-1" />
            กำลังผลิต ({workOrders.filter(wo => wo.status === 'IN_PROGRESS').length})
          </Badge>
          <Badge
            variant={workOrderFilters.status === 'COMPLETED' ? 'default' : 'outline'}
            className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
            onClick={() => handleStatusFilter('COMPLETED')}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            เสร็จสิ้น ({workOrders.filter(wo => wo.status === 'COMPLETED').length})
          </Badge>
        </div>

        {/* Work Order List */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded w-full" />
              ))}
            </div>
          </div>
        ) : filteredWorkOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Factory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบใบสั่งผลิต</h3>
            <p className="text-gray-500 mb-4">
              {workOrderFilters.search || workOrderFilters.status !== 'all'
                ? 'ลองปรับเงื่อนไขการค้นหา'
                : 'ยังไม่มีใบสั่งผลิตในระบบ'}
            </p>
            <Button onClick={handleCreateWorkOrder}>
              <Plus className="w-5 h-5 mr-2" />
              สร้างใบสั่งผลิตใหม่
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <WorkOrderTable
            workOrders={filteredWorkOrders}
            onView={handleViewWorkOrder}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkOrders.map((wo) => (
              <WorkOrderCard
                key={wo.id}
                workOrder={wo}
                onClick={handleViewWorkOrder}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <WorkOrderDetailModal
        workOrder={selectedWorkOrder}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onRelease={handleReleaseWorkOrder}
        onStart={handleStartWorkOrder}
        onComplete={handleCompleteWorkOrder}
        onCancel={handleCancelWorkOrder}
        onStartJobCard={handleStartJobCard}
        onCompleteJobCard={handleCompleteJobCard}
        onRecordCCP={handleRecordCCP}
      />

      {/* Form Modal */}
      <WorkOrderFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveWorkOrder}
        recipes={recipes}
      />

      {/* CCP Reading Modal */}
      <CCPReadingForm
        jobCard={selectedJobCard}
        isOpen={showCCPModal}
        onClose={() => {
          setShowCCPModal(false)
          setSelectedJobCard(null)
        }}
        onSave={handleSaveCCPReading}
        operators={operators}
      />
    </div>
  )
}
