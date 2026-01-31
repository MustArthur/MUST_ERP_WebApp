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
} from '@/types/quality'
import {
  mockQCTemplates,
  mockQCInspections,
  mockQuarantineRecords,
  calculatePassRate,
} from '@/lib/mock-data/quality'
import { generateId, delay } from '@/lib/utils'

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
  approveInspection: (id: string, approvedBy: string) => Promise<QCInspection>

  // Quarantine Actions
  fetchQuarantine: () => Promise<void>
  resolveQuarantine: (id: string, action: string, detail?: string) => Promise<void>

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
// In-memory Storage
// ==========================================

let templatesData = [...mockQCTemplates]
let inspectionsData = [...mockQCInspections]
let quarantineData = [...mockQuarantineRecords]

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
      await delay(300)
      set({ templates: templatesData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถโหลด QC Templates ได้', isLoading: false })
    }
  },

  createTemplate: async (input: CreateQCTemplateInput) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const newTemplate: QCTemplate = {
        ...input,
        id: generateId(),
        status: 'ACTIVE',
        version: 1,
        parameters: input.parameters.map((p, idx) => ({
          ...p,
          id: generateId(),
          lineNo: idx + 1,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      templatesData = [...templatesData, newTemplate]
      set({ templates: templatesData, isLoading: false })
      return newTemplate
    } catch {
      set({ error: 'ไม่สามารถสร้าง QC Template ได้', isLoading: false })
      throw new Error('Failed to create template')
    }
  },

  updateTemplate: async (id: string, input: Partial<CreateQCTemplateInput>) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = templatesData.findIndex(t => t.id === id)
      if (index === -1) throw new Error('Template not found')

      const existing = templatesData[index]
      const updated: QCTemplate = {
        ...existing,
        ...input,
        version: existing.version + 1,
        parameters: input.parameters
          ? input.parameters.map((p, idx) => ({
              ...p,
              id: generateId(),
              lineNo: idx + 1,
            }))
          : existing.parameters,
        updatedAt: new Date().toISOString(),
      }
      templatesData = [
        ...templatesData.slice(0, index),
        updated,
        ...templatesData.slice(index + 1),
      ]
      set({ templates: templatesData, isLoading: false })
      return updated
    } catch {
      set({ error: 'ไม่สามารถอัพเดท QC Template ได้', isLoading: false })
      throw new Error('Failed to update template')
    }
  },

  // ==========================================
  // Inspection Actions
  // ==========================================

  fetchInspections: async () => {
    set({ isLoading: true, error: null })
    try {
      await delay(300)
      set({ inspections: inspectionsData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถโหลดข้อมูลการตรวจสอบได้', isLoading: false })
    }
  },

  createInspection: async (input: CreateQCInspectionInput) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const template = templatesData.find(t => t.id === input.templateId)
      const inspectionCount = inspectionsData.length + 1
      const code = `QI-2026-${inspectionCount.toString().padStart(4, '0')}`

      // Determine status based on readings
      const readings = input.readings.map(r => {
        const param = template?.parameters.find(p => p.id === r.parameterId)
        let status: 'PASS' | 'FAIL' | 'PENDING' = 'PENDING'

        if (param) {
          if (param.type === 'NUMERIC' && r.numericValue !== undefined) {
            const minOk = param.minValue === undefined || r.numericValue >= param.minValue
            const maxOk = param.maxValue === undefined || r.numericValue <= param.maxValue
            status = minOk && maxOk ? 'PASS' : 'FAIL'
          } else if (param.type === 'ACCEPTANCE' && r.acceptanceValue) {
            status = param.acceptableValues?.includes(r.acceptanceValue) ? 'PASS' : 'FAIL'
          }
        }

        return {
          id: generateId(),
          parameterId: r.parameterId,
          numericValue: r.numericValue,
          acceptanceValue: r.acceptanceValue,
          status,
          remarks: r.remarks,
        }
      })

      const hasFail = readings.some(r => r.status === 'FAIL')
      const allPass = readings.every(r => r.status === 'PASS')

      const newInspection: QCInspection = {
        id: generateId(),
        code,
        type: input.type,
        status: hasFail ? 'FAILED' : allPass ? 'PASSED' : 'IN_PROGRESS',
        templateId: input.templateId,
        template,
        sourceDocType: input.sourceDocType,
        sourceDocId: input.sourceDocId,
        itemId: input.itemId,
        batchNo: input.batchNo,
        lotNo: input.lotNo,
        sampleQty: input.sampleQty,
        inspectedQty: input.sampleQty,
        acceptedQty: hasFail ? 0 : input.sampleQty,
        rejectedQty: hasFail ? input.sampleQty : 0,
        readings,
        result: hasFail ? 'REJECTED' : allPass ? 'ACCEPTED' : undefined,
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionTime: new Date().toTimeString().slice(0, 5),
        inspectedBy: 'ระบบ',
        isCCP: template?.parameters.some(p => p.isCritical) || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      inspectionsData = [...inspectionsData, newInspection]
      set({ inspections: inspectionsData, isLoading: false })
      return newInspection
    } catch {
      set({ error: 'ไม่สามารถสร้างใบตรวจสอบได้', isLoading: false })
      throw new Error('Failed to create inspection')
    }
  },

  updateInspectionStatus: async (id: string, status: InspectionStatus, remarks?: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = inspectionsData.findIndex(i => i.id === id)
      if (index === -1) throw new Error('Inspection not found')

      const updated: QCInspection = {
        ...inspectionsData[index],
        status,
        resultRemarks: remarks,
        result: status === 'PASSED' ? 'ACCEPTED' : status === 'FAILED' ? 'REJECTED' : undefined,
        updatedAt: new Date().toISOString(),
      }
      inspectionsData = [
        ...inspectionsData.slice(0, index),
        updated,
        ...inspectionsData.slice(index + 1),
      ]
      set({ inspections: inspectionsData, isLoading: false })
      return updated
    } catch {
      set({ error: 'ไม่สามารถอัพเดทสถานะได้', isLoading: false })
      throw new Error('Failed to update status')
    }
  },

  approveInspection: async (id: string, approvedBy: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = inspectionsData.findIndex(i => i.id === id)
      if (index === -1) throw new Error('Inspection not found')

      const updated: QCInspection = {
        ...inspectionsData[index],
        approvedBy,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      inspectionsData = [
        ...inspectionsData.slice(0, index),
        updated,
        ...inspectionsData.slice(index + 1),
      ]
      set({ inspections: inspectionsData, isLoading: false })
      return updated
    } catch {
      set({ error: 'ไม่สามารถอนุมัติได้', isLoading: false })
      throw new Error('Failed to approve')
    }
  },

  // ==========================================
  // Quarantine Actions
  // ==========================================

  fetchQuarantine: async () => {
    set({ isLoading: true, error: null })
    try {
      await delay(300)
      set({ quarantineRecords: quarantineData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถโหลดข้อมูล Quarantine ได้', isLoading: false })
    }
  },

  resolveQuarantine: async (id: string, action: string, detail?: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = quarantineData.findIndex(q => q.id === id)
      if (index === -1) throw new Error('Record not found')

      quarantineData[index] = {
        ...quarantineData[index],
        status: action === 'DISPOSE' ? 'DISPOSED' : 'RESOLVED',
        action: action as any,
        actionDetail: detail,
        resolvedBy: 'ผู้จัดการ',
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      set({ quarantineRecords: [...quarantineData], isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถจัดการ Quarantine ได้', isLoading: false })
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
      recentInspections: inspections.slice(-5).reverse(),
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
