// Production Module Types

// =============================================================================
// Workstation
// =============================================================================

export type WorkstationType =
  | 'STEAMER'
  | 'SHREDDER'
  | 'PRESS'
  | 'MIXER'
  | 'PASTEURIZER'
  | 'FILLER'
  | 'COOLER'

export type WorkstationStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'

export interface Workstation {
  id: string
  code: string                    // WS-STEAMER-01
  name: string                    // เครื่องนึ่ง 1
  type: WorkstationType
  status: WorkstationStatus
  capacity?: number               // units per hour
  location?: string
}

// =============================================================================
// CCP (Critical Control Point)
// =============================================================================

export type CCPType = 'TEMPERATURE' | 'TIME' | 'TEMP_TIME'

export interface CCPCriteria {
  type: CCPType
  minTemp?: number                // °C (minimum required)
  maxTemp?: number                // °C (maximum allowed)
  holdingTime?: number            // seconds
  notes?: string
}

export interface CCPReading {
  id: string
  timestamp: string
  temperature?: number            // °C
  holdingTime?: number            // seconds
  operator: string
  passed: boolean
  notes?: string
}

export interface CCPGateResult {
  canProceed: boolean
  blockedAt?: string              // operation name
  reason?: string
}

// =============================================================================
// Operation
// =============================================================================

export interface Operation {
  id: string
  code: string                    // CK-STEAM, PAS, FILL
  name: string                    // นึ่งไก่, พาสเจอร์ไรซ์
  description?: string
  workstationId: string
  workstation?: Workstation
  isCCP: boolean                  // Critical Control Point
  ccpCriteria?: CCPCriteria       // เกณฑ์ CCP (if isCCP)
  estimatedTime: number           // minutes
  sequence: number                // ลำดับใน routing
}

// =============================================================================
// Work Order
// =============================================================================

export type WorkOrderStatus =
  | 'DRAFT'
  | 'RELEASED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type CCPStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'NOT_REQUIRED'

export interface WorkOrder {
  id: string
  code: string                    // WO-2026-0001
  status: WorkOrderStatus
  recipeId: string
  recipeName?: string             // for display
  recipeCode?: string
  plannedQty: number              // จำนวนที่วางแผน (bottles)
  completedQty: number            // จำนวนที่ผลิตได้จริง
  plannedDate: string             // วันที่วางแผนผลิต
  startDate?: string              // วันที่เริ่มผลิตจริง
  endDate?: string                // วันที่เสร็จสิ้น
  batchNo: string                 // เลข Batch
  jobCards: JobCard[]
  ccpStatus: CCPStatus            // overall CCP status
  progress: number                // 0-100 %
  remarks?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// =============================================================================
// Job Card
// =============================================================================

export type JobCardStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

export interface JobCard {
  id: string
  code: string                    // JC-2026-0001-01
  workOrderId: string
  operationId: string
  operation?: Operation
  status: JobCardStatus
  sequence: number                // ลำดับ operation
  plannedQty: number
  completedQty: number
  startTime?: string
  endTime?: string
  operator?: string

  // CCP Data
  isCCP: boolean
  ccpReadings: CCPReading[]
  ccpStatus: CCPStatus

  remarks?: string
}

// =============================================================================
// Input Types
// =============================================================================

export interface CreateWorkOrderInput {
  recipeId: string
  plannedQty: number
  plannedDate: string
  remarks?: string
}

export interface RecordCCPReadingInput {
  jobCardId: string
  temperature?: number
  holdingTime?: number
  operator: string
  notes?: string
}

// =============================================================================
// Filter Types
// =============================================================================

export interface WorkOrderFilters {
  search: string
  status: WorkOrderStatus | 'all'
  dateFrom?: string
  dateTo?: string
  recipeId?: string
}
