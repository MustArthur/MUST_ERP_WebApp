import { create } from 'zustand'
import {
  WorkOrder,
  JobCard,
  Operation,
  Workstation,
  WorkOrderStatus,
  JobCardStatus,
  CCPStatus,
  CCPReading,
  CCPGateResult,
  CreateWorkOrderInput,
  RecordCCPReadingInput,
  WorkOrderFilters,
} from '@/types/production'
import {
  mockWorkOrders,
  mockOperations,
  mockWorkstations,
  mockOperators,
} from '@/lib/mock-data/production'
import { mockRecipes } from '@/lib/mock-data/recipes'

// =============================================================================
// Store State Interface
// =============================================================================

interface ProductionState {
  // Data
  workOrders: WorkOrder[]
  operations: Operation[]
  workstations: Workstation[]
  operators: { id: string; name: string; department: string }[]

  // UI State
  isLoading: boolean
  error: string | null

  // Filters
  workOrderFilters: WorkOrderFilters

  // Actions - Data Fetching
  fetchWorkOrders: () => Promise<void>
  fetchOperations: () => Promise<void>
  fetchWorkstations: () => Promise<void>

  // Actions - Work Order CRUD
  createWorkOrder: (input: CreateWorkOrderInput) => Promise<WorkOrder>
  releaseWorkOrder: (id: string) => Promise<void>
  startWorkOrder: (id: string) => Promise<void>
  completeWorkOrder: (id: string) => Promise<void>
  cancelWorkOrder: (id: string) => Promise<void>

  // Actions - Job Card Operations
  startJobCard: (jobCardId: string, operator: string) => Promise<void>
  completeJobCard: (jobCardId: string, completedQty: number) => Promise<void>
  failJobCard: (jobCardId: string, reason: string) => Promise<void>

  // Actions - CCP Gate Logic
  recordCCPReading: (input: RecordCCPReadingInput) => Promise<CCPGateResult>
  validateCCPGate: (workOrderId: string) => CCPGateResult

  // Actions - Filters
  setWorkOrderFilters: (filters: Partial<WorkOrderFilters>) => void
  resetFilters: () => void
}

// =============================================================================
// Initial State
// =============================================================================

const initialFilters: WorkOrderFilters = {
  search: '',
  status: 'all',
}

// =============================================================================
// Helper Functions
// =============================================================================

function generateWorkOrderCode(): string {
  const year = new Date().getFullYear()
  const sequence = Math.floor(Math.random() * 9000) + 1000
  return `WO-${year}-${sequence}`
}

function generateBatchNo(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '').slice(2)
  const sequence = Math.floor(Math.random() * 900) + 100
  return `B${now.getFullYear()}-${dateStr}-${sequence}`
}

function generateJobCardCode(workOrderCode: string, sequence: number): string {
  return `JC-${workOrderCode.replace('WO-', '')}-${String(sequence).padStart(2, '0')}`
}

function calculateProgress(jobCards: JobCard[]): number {
  if (jobCards.length === 0) return 0
  const completed = jobCards.filter(jc => jc.status === 'COMPLETED').length
  return Math.round((completed / jobCards.length) * 100)
}

function calculateCCPStatus(jobCards: JobCard[]): CCPStatus {
  const ccpCards = jobCards.filter(jc => jc.isCCP)
  if (ccpCards.length === 0) return 'NOT_REQUIRED'

  const hasFailed = ccpCards.some(jc => jc.ccpStatus === 'FAILED')
  if (hasFailed) return 'FAILED'

  const allPassed = ccpCards.every(jc => jc.ccpStatus === 'PASSED')
  if (allPassed) return 'PASSED'

  return 'PENDING'
}

// =============================================================================
// Store Implementation
// =============================================================================

export const useProductionStore = create<ProductionState>((set, get) => ({
  // Initial State
  workOrders: [],
  operations: [],
  workstations: [],
  operators: mockOperators,
  isLoading: false,
  error: null,
  workOrderFilters: initialFilters,

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  fetchWorkOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      set({ workOrders: [...mockWorkOrders], isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch work orders', isLoading: false })
    }
  },

  fetchOperations: async () => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      set({ operations: [...mockOperations], isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch operations', isLoading: false })
    }
  },

  fetchWorkstations: async () => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      set({ workstations: [...mockWorkstations], isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch workstations', isLoading: false })
    }
  },

  // ==========================================================================
  // Work Order CRUD
  // ==========================================================================

  createWorkOrder: async (input: CreateWorkOrderInput) => {
    set({ isLoading: true, error: null })
    try {
      const { operations } = get()
      const recipe = mockRecipes.find(r => r.id === input.recipeId)

      if (!recipe) {
        throw new Error('Recipe not found')
      }

      const workOrderCode = generateWorkOrderCode()

      // Determine which operations to use based on recipe type
      // Chicken recipes: all 7 operations
      // Plant-based recipes: skip Steam, Shred, Press (start from Mix)
      const isChickenRecipe = recipe.code.startsWith('BOM-CK')
      const applicableOperations = isChickenRecipe
        ? operations
        : operations.filter(op => !['CK-STEAM', 'CK-SHRED', 'CK-PRESS'].includes(op.code))

      // Create job cards for each operation
      const jobCards: JobCard[] = applicableOperations.map((op, idx) => ({
        id: `jc-new-${Date.now()}-${idx}`,
        code: generateJobCardCode(workOrderCode, idx + 1),
        workOrderId: `wo-new-${Date.now()}`,
        operationId: op.id,
        operation: op,
        status: 'PENDING' as JobCardStatus,
        sequence: idx + 1,
        plannedQty: input.plannedQty,
        completedQty: 0,
        isCCP: op.isCCP,
        ccpReadings: [],
        ccpStatus: op.isCCP ? 'PENDING' : 'NOT_REQUIRED',
      }))

      const newWorkOrder: WorkOrder = {
        id: `wo-new-${Date.now()}`,
        code: workOrderCode,
        status: 'DRAFT',
        recipeId: input.recipeId,
        recipeName: recipe.name,
        recipeCode: recipe.outputItemCode,
        plannedQty: input.plannedQty,
        completedQty: 0,
        plannedDate: input.plannedDate,
        batchNo: generateBatchNo(),
        jobCards,
        ccpStatus: 'PENDING',
        progress: 0,
        remarks: input.remarks,
        createdBy: 'ผู้ใช้ปัจจุบัน',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      set(state => ({
        workOrders: [newWorkOrder, ...state.workOrders],
        isLoading: false,
      }))

      return newWorkOrder
    } catch (error) {
      set({ error: 'Failed to create work order', isLoading: false })
      throw error
    }
  },

  releaseWorkOrder: async (id: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      set(state => ({
        workOrders: state.workOrders.map(wo =>
          wo.id === id
            ? { ...wo, status: 'RELEASED' as WorkOrderStatus, updatedAt: new Date().toISOString() }
            : wo
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to release work order', isLoading: false })
    }
  },

  startWorkOrder: async (id: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      set(state => ({
        workOrders: state.workOrders.map(wo =>
          wo.id === id
            ? {
                ...wo,
                status: 'IN_PROGRESS' as WorkOrderStatus,
                startDate: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString(),
              }
            : wo
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to start work order', isLoading: false })
    }
  },

  completeWorkOrder: async (id: string) => {
    const { workOrders, validateCCPGate } = get()
    const workOrder = workOrders.find(wo => wo.id === id)

    if (!workOrder) {
      throw new Error('Work order not found')
    }

    // Validate all job cards are completed
    const allCompleted = workOrder.jobCards.every(jc => jc.status === 'COMPLETED')
    if (!allCompleted) {
      throw new Error('ยังมี Job Card ที่ยังไม่เสร็จสิ้น')
    }

    // Validate CCP gates
    const ccpResult = validateCCPGate(id)
    if (!ccpResult.canProceed) {
      throw new Error(ccpResult.reason || 'CCP Gate ไม่ผ่าน')
    }

    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const completedQty = Math.min(
        ...workOrder.jobCards.map(jc => jc.completedQty)
      )

      set(state => ({
        workOrders: state.workOrders.map(wo =>
          wo.id === id
            ? {
                ...wo,
                status: 'COMPLETED' as WorkOrderStatus,
                endDate: new Date().toISOString().split('T')[0],
                completedQty,
                progress: 100,
                ccpStatus: 'PASSED',
                updatedAt: new Date().toISOString(),
              }
            : wo
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to complete work order', isLoading: false })
    }
  },

  cancelWorkOrder: async (id: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      set(state => ({
        workOrders: state.workOrders.map(wo =>
          wo.id === id
            ? { ...wo, status: 'CANCELLED' as WorkOrderStatus, updatedAt: new Date().toISOString() }
            : wo
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to cancel work order', isLoading: false })
    }
  },

  // ==========================================================================
  // Job Card Operations
  // ==========================================================================

  startJobCard: async (jobCardId: string, operator: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        workOrders: state.workOrders.map(wo => ({
          ...wo,
          jobCards: wo.jobCards.map(jc =>
            jc.id === jobCardId
              ? {
                  ...jc,
                  status: 'IN_PROGRESS' as JobCardStatus,
                  operator,
                  startTime: new Date().toISOString(),
                }
              : jc
          ),
          updatedAt: new Date().toISOString(),
        })),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to start job card', isLoading: false })
    }
  },

  completeJobCard: async (jobCardId: string, completedQty: number) => {
    const { workOrders, validateCCPGate } = get()

    // Find the job card and its work order
    let foundWorkOrder: WorkOrder | undefined
    let foundJobCard: JobCard | undefined

    for (const wo of workOrders) {
      const jc = wo.jobCards.find(j => j.id === jobCardId)
      if (jc) {
        foundWorkOrder = wo
        foundJobCard = jc
        break
      }
    }

    if (!foundJobCard || !foundWorkOrder) {
      throw new Error('Job card not found')
    }

    // If CCP job card, must have passed CCP readings
    if (foundJobCard.isCCP && foundJobCard.ccpStatus !== 'PASSED') {
      throw new Error('ต้องบันทึกค่า CCP และผ่านเกณฑ์ก่อนจึงจะปิด Job Card ได้')
    }

    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        workOrders: state.workOrders.map(wo => {
          const updatedJobCards = wo.jobCards.map(jc =>
            jc.id === jobCardId
              ? {
                  ...jc,
                  status: 'COMPLETED' as JobCardStatus,
                  completedQty,
                  endTime: new Date().toISOString(),
                }
              : jc
          )

          return {
            ...wo,
            jobCards: updatedJobCards,
            progress: calculateProgress(updatedJobCards),
            ccpStatus: calculateCCPStatus(updatedJobCards),
            updatedAt: new Date().toISOString(),
          }
        }),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to complete job card', isLoading: false })
    }
  },

  failJobCard: async (jobCardId: string, reason: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        workOrders: state.workOrders.map(wo => {
          const updatedJobCards = wo.jobCards.map(jc =>
            jc.id === jobCardId
              ? {
                  ...jc,
                  status: 'FAILED' as JobCardStatus,
                  ccpStatus: jc.isCCP ? ('FAILED' as CCPStatus) : jc.ccpStatus,
                  remarks: reason,
                  endTime: new Date().toISOString(),
                }
              : jc
          )

          return {
            ...wo,
            jobCards: updatedJobCards,
            ccpStatus: calculateCCPStatus(updatedJobCards),
            updatedAt: new Date().toISOString(),
          }
        }),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to fail job card', isLoading: false })
    }
  },

  // ==========================================================================
  // CCP Gate Logic (CRITICAL!)
  // ==========================================================================

  recordCCPReading: async (input: RecordCCPReadingInput) => {
    const { workOrders, operations } = get()

    // Find the job card
    let foundWorkOrder: WorkOrder | undefined
    let foundJobCard: JobCard | undefined

    for (const wo of workOrders) {
      const jc = wo.jobCards.find(j => j.id === input.jobCardId)
      if (jc) {
        foundWorkOrder = wo
        foundJobCard = jc
        break
      }
    }

    if (!foundJobCard || !foundWorkOrder) {
      throw new Error('Job card not found')
    }

    if (!foundJobCard.isCCP) {
      throw new Error('Job card is not a CCP operation')
    }

    // Get the operation's CCP criteria
    const operation = operations.find(op => op.id === foundJobCard?.operationId)
    if (!operation?.ccpCriteria) {
      throw new Error('No CCP criteria defined for this operation')
    }

    // Validate reading against criteria
    const criteria = operation.ccpCriteria
    let passed = true

    if (criteria.type === 'TEMPERATURE' || criteria.type === 'TEMP_TIME') {
      if (criteria.minTemp && (input.temperature === undefined || input.temperature < criteria.minTemp)) {
        passed = false
      }
      if (criteria.maxTemp && input.temperature !== undefined && input.temperature > criteria.maxTemp) {
        passed = false
      }
    }

    if (criteria.type === 'TIME' || criteria.type === 'TEMP_TIME') {
      if (criteria.holdingTime && (input.holdingTime === undefined || input.holdingTime < criteria.holdingTime)) {
        passed = false
      }
    }

    // Create the reading
    const reading: CCPReading = {
      id: `ccp-reading-${Date.now()}`,
      timestamp: new Date().toISOString(),
      temperature: input.temperature,
      holdingTime: input.holdingTime,
      operator: input.operator,
      passed,
      notes: input.notes,
    }

    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        workOrders: state.workOrders.map(wo => {
          const updatedJobCards = wo.jobCards.map(jc => {
            if (jc.id === input.jobCardId) {
              const updatedReadings = [...jc.ccpReadings, reading]
              // CCP status is PASSED only if latest reading passed
              const newCCPStatus = passed ? 'PASSED' : 'FAILED'

              return {
                ...jc,
                ccpReadings: updatedReadings,
                ccpStatus: newCCPStatus as CCPStatus,
              }
            }
            return jc
          })

          return {
            ...wo,
            jobCards: updatedJobCards,
            ccpStatus: calculateCCPStatus(updatedJobCards),
            updatedAt: new Date().toISOString(),
          }
        }),
        isLoading: false,
      }))

      // Return result
      if (!passed) {
        return {
          canProceed: false,
          blockedAt: operation.name,
          reason: `CCP ไม่ผ่าน: ${
            criteria.minTemp
              ? `อุณหภูมิต้อง ≥${criteria.minTemp}°C (วัดได้ ${input.temperature}°C)`
              : ''
          }${
            criteria.holdingTime
              ? ` เวลาต้อง ≥${criteria.holdingTime}วินาที (วัดได้ ${input.holdingTime}วินาที)`
              : ''
          }`,
        }
      }

      return { canProceed: true }
    } catch (error) {
      set({ error: 'Failed to record CCP reading', isLoading: false })
      throw error
    }
  },

  validateCCPGate: (workOrderId: string): CCPGateResult => {
    const { workOrders } = get()
    const workOrder = workOrders.find(wo => wo.id === workOrderId)

    if (!workOrder) {
      return { canProceed: false, reason: 'Work order not found' }
    }

    const ccpJobCards = workOrder.jobCards.filter(jc => jc.isCCP)

    for (const jc of ccpJobCards) {
      if (jc.ccpStatus === 'FAILED') {
        return {
          canProceed: false,
          blockedAt: jc.operation?.name,
          reason: `CCP ไม่ผ่านเกณฑ์ที่ขั้นตอน "${jc.operation?.name}" - ห้ามดำเนินการต่อ`,
        }
      }

      // If job card is completed but CCP not recorded
      if (jc.status === 'COMPLETED' && jc.ccpStatus === 'PENDING') {
        return {
          canProceed: false,
          blockedAt: jc.operation?.name,
          reason: `ต้องบันทึกค่า CCP ที่ขั้นตอน "${jc.operation?.name}" ก่อนดำเนินการต่อ`,
        }
      }

      // If this CCP is pending and next operations have started
      if (jc.ccpStatus === 'PENDING') {
        const nextCards = workOrder.jobCards.filter(
          nextJc => nextJc.sequence > jc.sequence && nextJc.status !== 'PENDING'
        )

        if (nextCards.length > 0) {
          return {
            canProceed: false,
            blockedAt: jc.operation?.name,
            reason: `CCP ที่ขั้นตอน "${jc.operation?.name}" ยังไม่ผ่าน แต่มีขั้นตอนถัดไปที่เริ่มแล้ว`,
          }
        }
      }
    }

    return { canProceed: true }
  },

  // ==========================================================================
  // Filters
  // ==========================================================================

  setWorkOrderFilters: (filters: Partial<WorkOrderFilters>) => {
    set(state => ({
      workOrderFilters: { ...state.workOrderFilters, ...filters },
    }))
  },

  resetFilters: () => {
    set({ workOrderFilters: initialFilters })
  },
}))
