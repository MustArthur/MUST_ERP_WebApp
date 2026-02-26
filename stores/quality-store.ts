import { create } from 'zustand'
import {
  QCTemplate,
  QCInspection,
  QuarantineRecord,
  QCTemplateFilterState,
  QCInspectionFilterState,
  CreateQCTemplateInput,
  CreateQCInspectionInput,
  QCDashboard,
  InspectionStatus,
  InspectionType,
  QuarantineAction,
} from '@/types/quality'
import { QCService } from '@/lib/services/qc-service'

// ==========================================
// Store State Interface
// ==========================================

interface QualityState {
  // Data
  templates: QCTemplate[]
  inspections: QCInspection[]
  quarantineRecords: QuarantineRecord[]

  // Selected Items
  selectedTemplate: QCTemplate | null
  selectedInspection: QCInspection | null

  // UI State
  isLoading: boolean
  error: string | null
  templateFilters: QCTemplateFilterState
  inspectionFilters: QCInspectionFilterState

  // Template Actions
  fetchTemplates: () => Promise<void>
  createTemplate: (input: CreateQCTemplateInput) => Promise<QCTemplate>
  updateTemplate: (id: string, input: Partial<CreateQCTemplateInput>) => Promise<QCTemplate>

  // Inspection Actions
  fetchInspections: () => Promise<void>
  createInspection: (input: CreateQCInspectionInput) => Promise<QCInspection>
  updateInspectionStatus: (id: string, status: InspectionStatus, remarks?: string) => Promise<QCInspection>
  updateInspectionReadings: (
    id: string,
    readings: { parameterId: string; numericValue?: number; acceptanceValue?: string; remarks?: string }[],
    quantities?: { acceptedQty: number; rejectedQty: number; quarantineAction?: QuarantineAction }
  ) => Promise<QCInspection>
  startInspection: (id: string) => Promise<QCInspection>
  approveInspection: (id: string, approvedBy: string) => Promise<QCInspection>

  // Quarantine Actions
  fetchQuarantine: () => Promise<void>
  resolveQuarantine: (id: string, action: QuarantineAction, detail?: string) => Promise<void>

  // Filter Actions
  setTemplateFilters: (filters: Partial<QCTemplateFilterState>) => void
  setInspectionFilters: (filters: Partial<QCInspectionFilterState>) => void
  resetFilters: () => void

  // Selection Actions
  setSelectedTemplate: (template: QCTemplate | null) => void
  setSelectedInspection: (inspection: QCInspection | null) => void

  // Dashboard
  getDashboard: () => QCDashboard

  // UI Actions
  clearError: () => void
}

// ==========================================
// Default Filters
// ==========================================

const defaultTemplateFilters: QCTemplateFilterState = {
  search: '',
  type: 'all',
  status: 'all',
}

const defaultInspectionFilters: QCInspectionFilterState = {
  search: '',
  type: 'all',
  status: 'all',
  isCCPOnly: false,
}

// ==========================================
// Store Implementation
// ==========================================

export const useQualityStore = create<QualityState>((set, get) => ({
  // Initial State
  templates: [],
  inspections: [],
  quarantineRecords: [],
  selectedTemplate: null,
  selectedInspection: null,
  isLoading: false,
  error: null,
  templateFilters: defaultTemplateFilters,
  inspectionFilters: defaultInspectionFilters,

  // ==========================================
  // Template Actions
  // ==========================================

  fetchTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      const templates = await QCService.getTemplates()
      set({ templates, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      set({ error: 'ไม่สามารถโหลด QC Templates ได้', isLoading: false })
    }
  },

  createTemplate: async (input: CreateQCTemplateInput) => {
    set({ isLoading: true, error: null })
    try {
      const newTemplate = await QCService.createTemplate(input)
      const { templates } = get()
      set({ templates: [newTemplate, ...templates], isLoading: false })
      return newTemplate
    } catch (error) {
      console.error('Failed to create template:', error)
      set({ error: 'ไม่สามารถสร้าง QC Template ได้', isLoading: false })
      throw error
    }
  },

  updateTemplate: async (id: string, input: Partial<CreateQCTemplateInput>) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await QCService.updateTemplate(id, input)
      const { templates } = get()
      set({
        templates: templates.map(t => t.id === id ? updated : t),
        isLoading: false
      })
      return updated
    } catch (error) {
      console.error('Failed to update template:', error)
      set({ error: 'ไม่สามารถอัพเดท QC Template ได้', isLoading: false })
      throw error
    }
  },

  // ==========================================
  // Inspection Actions
  // ==========================================

  fetchInspections: async () => {
    console.log('=== quality-store fetchInspections called ===')
    set({ isLoading: true, error: null })
    try {
      const inspections = await QCService.getInspections()
      console.log('Inspections fetched, count:', inspections.length)
      set({ inspections, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch inspections:', error)
      set({ error: 'ไม่สามารถโหลดข้อมูลการตรวจสอบได้', isLoading: false })
    }
  },

  createInspection: async (input: CreateQCInspectionInput) => {
    set({ isLoading: true, error: null })
    try {
      const newInspection = await QCService.createInspection(input)
      const { inspections } = get()
      set({ inspections: [newInspection, ...inspections], isLoading: false })
      return newInspection
    } catch (error) {
      console.error('Failed to create inspection:', error)
      set({ error: 'ไม่สามารถสร้างใบตรวจสอบได้', isLoading: false })
      throw error
    }
  },

  updateInspectionStatus: async (id: string, status: InspectionStatus, remarks?: string) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await QCService.updateInspectionStatus(id, status, remarks)
      const { inspections } = get()
      set({
        inspections: inspections.map(i => i.id === id ? updated : i),
        isLoading: false
      })
      return updated
    } catch (error) {
      console.error('Failed to update inspection status:', error)
      set({ error: 'ไม่สามารถอัพเดทสถานะได้', isLoading: false })
      throw error
    }
  },

  updateInspectionReadings: async (
    id: string,
    readings: { parameterId: string; numericValue?: number; acceptanceValue?: string; remarks?: string }[],
    quantities?: { acceptedQty: number; rejectedQty: number; quarantineAction?: QuarantineAction }
  ) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await QCService.updateInspectionReadings(id, readings, quantities)
      const { inspections } = get()
      set({
        inspections: inspections.map(i => i.id === id ? updated : i),
        isLoading: false
      })
      // Also refresh quarantine records if there was rejected qty
      if (quantities?.rejectedQty && quantities.rejectedQty > 0) {
        const quarantineRecords = await QCService.getQuarantineRecords()
        set({ quarantineRecords })
      }
      return updated
    } catch (error) {
      console.error('Failed to update inspection readings:', error)
      set({ error: 'ไม่สามารถอัพเดทค่าตรวจสอบได้', isLoading: false })
      throw error
    }
  },

  startInspection: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await QCService.updateInspectionStatus(id, 'IN_PROGRESS')
      const { inspections } = get()
      set({
        inspections: inspections.map(i => i.id === id ? updated : i),
        isLoading: false
      })
      return updated
    } catch (error) {
      console.error('Failed to start inspection:', error)
      set({ error: 'ไม่สามารถเริ่มการตรวจสอบได้', isLoading: false })
      throw error
    }
  },

  approveInspection: async (id: string, approvedBy: string) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await QCService.approveInspection(id, approvedBy)
      const { inspections } = get()
      set({
        inspections: inspections.map(i => i.id === id ? updated : i),
        isLoading: false
      })
      return updated
    } catch (error) {
      console.error('Failed to approve inspection:', error)
      set({ error: 'ไม่สามารถอนุมัติได้', isLoading: false })
      throw error
    }
  },

  // ==========================================
  // Quarantine Actions
  // ==========================================

  fetchQuarantine: async () => {
    set({ isLoading: true, error: null })
    try {
      const quarantineRecords = await QCService.getQuarantineRecords()
      set({ quarantineRecords, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch quarantine:', error)
      set({ error: 'ไม่สามารถโหลดข้อมูล Quarantine ได้', isLoading: false })
    }
  },

  resolveQuarantine: async (id: string, action: QuarantineAction, detail?: string) => {
    set({ isLoading: true, error: null })
    try {
      await QCService.resolveQuarantine(id, action, detail)
      // Refresh quarantine records
      const quarantineRecords = await QCService.getQuarantineRecords()
      set({ quarantineRecords, isLoading: false })
    } catch (error) {
      console.error('Failed to resolve quarantine:', error)
      set({ error: 'ไม่สามารถจัดการ Quarantine ได้', isLoading: false })
      throw error
    }
  },

  // ==========================================
  // Filter Actions
  // ==========================================

  setTemplateFilters: (filters: Partial<QCTemplateFilterState>) => {
    set(state => ({
      templateFilters: { ...state.templateFilters, ...filters },
    }))
  },

  setInspectionFilters: (filters: Partial<QCInspectionFilterState>) => {
    set(state => ({
      inspectionFilters: { ...state.inspectionFilters, ...filters },
    }))
  },

  resetFilters: () => {
    set({
      templateFilters: defaultTemplateFilters,
      inspectionFilters: defaultInspectionFilters,
    })
  },

  // ==========================================
  // Selection Actions
  // ==========================================

  setSelectedTemplate: (template: QCTemplate | null) => {
    set({ selectedTemplate: template })
  },

  setSelectedInspection: (inspection: QCInspection | null) => {
    set({ selectedInspection: inspection })
  },

  // ==========================================
  // Dashboard
  // ==========================================

  getDashboard: (): QCDashboard => {
    const { inspections, quarantineRecords } = get()
    const passed = inspections.filter(i => i.status === 'PASSED').length
    const failed = inspections.filter(i => i.status === 'FAILED').length
    const pending = inspections.filter(i => i.status === 'IN_PROGRESS' || i.status === 'DRAFT').length
    const ccpDeviations = inspections.filter(i => i.isCCP && i.status === 'FAILED').length
    const quarantineItems = quarantineRecords.filter(q => q.status === 'PENDING').length

    return {
      totalInspections: inspections.length,
      passedCount: passed,
      failedCount: failed,
      pendingCount: pending,
      passRate: inspections.length > 0 ? Math.round((passed / inspections.length) * 100) : 0,
      ccpDeviations,
      quarantineItems,
      recentInspections: inspections.slice(0, 5),
    }
  },

  // ==========================================
  // UI Actions
  // ==========================================

  clearError: () => {
    set({ error: null })
  },
}))

// ==========================================
// Selector Hooks
// ==========================================

export function useFilteredInspections() {
  const { inspections, inspectionFilters } = useQualityStore()

  return inspections.filter(inspection => {
    // Search filter
    if (inspectionFilters.search) {
      const search = inspectionFilters.search.toLowerCase()
      const matchCode = inspection.code.toLowerCase().includes(search)
      const matchItem = inspection.itemName?.toLowerCase().includes(search)
      const matchBatch = inspection.batchNo?.toLowerCase().includes(search)
      if (!matchCode && !matchItem && !matchBatch) return false
    }

    // Type filter
    if (inspectionFilters.type !== 'all' && inspection.type !== inspectionFilters.type) {
      return false
    }

    // Status filter
    if (inspectionFilters.status !== 'all' && inspection.status !== inspectionFilters.status) {
      return false
    }

    // CCP only filter
    if (inspectionFilters.isCCPOnly && !inspection.isCCP) {
      return false
    }

    // Date filters
    if (inspectionFilters.dateFrom) {
      if (inspection.inspectionDate < inspectionFilters.dateFrom) return false
    }
    if (inspectionFilters.dateTo) {
      if (inspection.inspectionDate > inspectionFilters.dateTo) return false
    }

    return true
  })
}

export function useFilteredTemplates() {
  const { templates, templateFilters } = useQualityStore()

  return templates.filter(template => {
    // Search filter
    if (templateFilters.search) {
      const search = templateFilters.search.toLowerCase()
      const matchCode = template.code.toLowerCase().includes(search)
      const matchName = template.name.toLowerCase().includes(search)
      if (!matchCode && !matchName) return false
    }

    // Type filter
    if (templateFilters.type !== 'all' && template.type !== templateFilters.type) {
      return false
    }

    // Status filter
    if (templateFilters.status !== 'all' && template.status !== templateFilters.status) {
      return false
    }

    return true
  })
}
