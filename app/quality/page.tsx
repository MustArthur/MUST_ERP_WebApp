'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useQualityStore, useFilteredInspections, useFilteredTemplates } from '@/stores/quality-store'
import { useInventoryStore } from '@/stores/inventory-store'
import {
  QCInspection,
  QCTemplate,
  QuarantineRecord,
  InspectionType,
  InspectionStatus,
  TemplateType,
  TemplateStatus,
  QuarantineAction,
  CreateQCTemplateInput,
} from '@/types/quality'
import {
  InspectionCard,
  InspectionDetailModal,
  InspectionFormModal,
  TemplateTable,
  TemplateFormModal,
  QuarantineTable,
  QuarantineResolveModal,
} from '@/components/quality'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import {
  Search,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  FileText,
  Package,
  ArrowLeft,
} from 'lucide-react'

export default function QualityPage() {
  const {
    templates,
    quarantineRecords,
    fetchInspections,
    fetchTemplates,
    fetchQuarantine,
    inspectionFilters,
    templateFilters,
    setInspectionFilters,
    setTemplateFilters,
    getDashboard,
    createTemplate,
    updateTemplate,
    resolveQuarantine,
    isLoading,
  } = useQualityStore()

  const filteredInspections = useFilteredInspections()
  const filteredTemplates = useFilteredTemplates()

  // Load stock items for form
  const { fetchStockItems } = useInventoryStore()

  // Active tab
  const [activeTab, setActiveTab] = useState('inspections')

  // Inspection modals
  const [selectedInspection, setSelectedInspection] = useState<QCInspection | null>(null)
  const [showInspectionDetail, setShowInspectionDetail] = useState(false)
  const [showInspectionForm, setShowInspectionForm] = useState(false)

  // Template modals
  const [selectedTemplate, setSelectedTemplate] = useState<QCTemplate | null>(null)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<QCTemplate | null>(null)

  // Quarantine modals
  const [selectedQuarantine, setSelectedQuarantine] = useState<QuarantineRecord | null>(null)
  const [showQuarantineResolve, setShowQuarantineResolve] = useState(false)

  // Load data on mount
  useEffect(() => {
    fetchInspections()
    fetchTemplates()
    fetchQuarantine()
    fetchStockItems()
  }, [fetchInspections, fetchTemplates, fetchQuarantine, fetchStockItems])

  // Get dashboard data
  const dashboard = getDashboard()

  // Filter pending quarantine records
  const pendingQuarantine = quarantineRecords.filter(q => q.status === 'PENDING')

  // Inspection handlers
  const handleViewInspection = (inspection: QCInspection) => {
    setSelectedInspection(inspection)
    setShowInspectionDetail(true)
  }

  const handleCreateInspection = () => {
    setShowInspectionForm(true)
  }

  const handleApproveInspection = async (inspection: QCInspection) => {
    const { approveInspection } = useQualityStore.getState()
    await approveInspection(inspection.id, 'ผู้จัดการ QC')
    setShowInspectionDetail(false)
    fetchInspections()
  }

  const handleSaveInspection = () => {
    fetchInspections()
    setShowInspectionForm(false)
  }

  // Template handlers
  const handleViewTemplate = (template: QCTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateForm(true)
  }

  const handleEditTemplate = (template: QCTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateForm(true)
  }

  const handleCreateTemplate = () => {
    setSelectedTemplate(null)
    setShowTemplateForm(true)
  }

  const handleDeleteTemplate = (template: QCTemplate) => {
    setTemplateToDelete(template)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteTemplate = async () => {
    if (templateToDelete) {
      // Soft delete by updating status to INACTIVE
      await updateTemplate(templateToDelete.id, { status: 'INACTIVE' } as any)
      fetchTemplates()
    }
    setShowDeleteConfirm(false)
    setTemplateToDelete(null)
  }

  const handleSaveTemplate = async (data: CreateQCTemplateInput) => {
    if (selectedTemplate) {
      await updateTemplate(selectedTemplate.id, data)
    } else {
      await createTemplate(data)
    }
    fetchTemplates()
    setShowTemplateForm(false)
    setSelectedTemplate(null)
  }

  // Quarantine handlers
  const handleViewQuarantine = (record: QuarantineRecord) => {
    setSelectedQuarantine(record)
    setShowQuarantineResolve(true)
  }

  const handleResolveQuarantine = (record: QuarantineRecord) => {
    setSelectedQuarantine(record)
    setShowQuarantineResolve(true)
  }

  const handleQuarantineResolved = async (id: string, action: QuarantineAction, detail?: string) => {
    await resolveQuarantine(id, action, detail)
    fetchQuarantine()
    setShowQuarantineResolve(false)
    setSelectedQuarantine(null)
  }

  // Filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeTab === 'inspections') {
      setInspectionFilters({ search: e.target.value })
    } else if (activeTab === 'templates') {
      setTemplateFilters({ search: e.target.value })
    }
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

  const handleTemplateTypeFilter = (type: TemplateType | 'all') => {
    setTemplateFilters({ type })
  }

  const handleTemplateStatusFilter = (status: TemplateStatus | 'all') => {
    setTemplateFilters({ status })
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
                <h1 className="text-2xl font-bold text-gray-900">ควบคุมคุณภาพ (QC)</h1>
                <p className="text-sm text-gray-500">ตรวจสอบคุณภาพวัตถุดิบและสินค้า</p>
              </div>
            </div>
            <div className="flex gap-2">
              {activeTab === 'inspections' && (
                <Button onClick={handleCreateInspection}>
                  <Plus className="w-5 h-5 mr-2" />
                  สร้างใบตรวจสอบ
                </Button>
              )}
              {activeTab === 'templates' && (
                <Button onClick={handleCreateTemplate}>
                  <Plus className="w-5 h-5 mr-2" />
                  สร้าง Template
                </Button>
              )}
            </div>
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="inspections" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              การตรวจสอบ
              <Badge variant="secondary" className="ml-1">
                {filteredInspections.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              QC Templates
              <Badge variant="secondary" className="ml-1">
                {templates.filter(t => t.status === 'ACTIVE').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="quarantine" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Quarantine
              {pendingQuarantine.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingQuarantine.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Inspections Tab */}
          <TabsContent value="inspections">
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
                <Button variant="outline" className="mt-4" onClick={handleCreateInspection}>
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างใบตรวจสอบใหม่
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            {/* Filters */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ค้นหาด้วยรหัสหรือชื่อ Template..."
                    className="pl-10"
                    value={templateFilters.search}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Type Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={templateFilters.type === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTemplateTypeFilter('all')}
                  >
                    ทั้งหมด
                  </Button>
                  <Button
                    variant={templateFilters.type === 'RAW_MATERIAL' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      templateFilters.type === 'RAW_MATERIAL' && 'bg-blue-600 hover:bg-blue-700'
                    )}
                    onClick={() => handleTemplateTypeFilter('RAW_MATERIAL')}
                  >
                    วัตถุดิบ
                  </Button>
                  <Button
                    variant={templateFilters.type === 'PROCESS' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      templateFilters.type === 'PROCESS' && 'bg-purple-600 hover:bg-purple-700'
                    )}
                    onClick={() => handleTemplateTypeFilter('PROCESS')}
                  >
                    กระบวนการ
                  </Button>
                  <Button
                    variant={templateFilters.type === 'FINISHED_GOOD' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      templateFilters.type === 'FINISHED_GOOD' && 'bg-green-600 hover:bg-green-700'
                    )}
                    onClick={() => handleTemplateTypeFilter('FINISHED_GOOD')}
                  >
                    สินค้าสำเร็จรูป
                  </Button>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  <Button
                    variant={templateFilters.status === 'ACTIVE' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      templateFilters.status === 'ACTIVE' && 'bg-green-600 hover:bg-green-700'
                    )}
                    onClick={() => handleTemplateStatusFilter(
                      templateFilters.status === 'ACTIVE' ? 'all' : 'ACTIVE'
                    )}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    ใช้งาน
                  </Button>
                  <Button
                    variant={templateFilters.status === 'INACTIVE' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTemplateStatusFilter(
                      templateFilters.status === 'INACTIVE' ? 'all' : 'INACTIVE'
                    )}
                  >
                    ปิดใช้งาน
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

            {/* Templates Table */}
            {!isLoading && (
              <TemplateTable
                templates={filteredTemplates}
                onView={handleViewTemplate}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
              />
            )}
          </TabsContent>

          {/* Quarantine Tab */}
          <TabsContent value="quarantine">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-2 text-gray-500">กำลังโหลด...</p>
              </div>
            )}

            {/* Quarantine Table */}
            {!isLoading && (
              <QuarantineTable
                records={quarantineRecords}
                onView={handleViewQuarantine}
                onResolve={handleResolveQuarantine}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Inspection Detail Modal */}
      <InspectionDetailModal
        inspection={selectedInspection}
        isOpen={showInspectionDetail}
        onClose={() => setShowInspectionDetail(false)}
        onApprove={handleApproveInspection}
      />

      {/* Inspection Form Modal */}
      <InspectionFormModal
        isOpen={showInspectionForm}
        onClose={() => setShowInspectionForm(false)}
        onSave={handleSaveInspection}
      />

      {/* Template Form Modal */}
      <TemplateFormModal
        isOpen={showTemplateForm}
        onClose={() => {
          setShowTemplateForm(false)
          setSelectedTemplate(null)
        }}
        onSave={handleSaveTemplate}
        template={selectedTemplate}
      />

      {/* Delete Template Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการปิดใช้งาน Template</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการปิดใช้งาน Template "{templateToDelete?.name}" หรือไม่?
              <br />
              Template นี้จะไม่สามารถใช้สร้างใบตรวจสอบใหม่ได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
            >
              ปิดใช้งาน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quarantine Resolve Modal */}
      <QuarantineResolveModal
        record={selectedQuarantine}
        isOpen={showQuarantineResolve}
        onClose={() => {
          setShowQuarantineResolve(false)
          setSelectedQuarantine(null)
        }}
        onResolve={handleQuarantineResolved}
      />
    </div>
  )
}
