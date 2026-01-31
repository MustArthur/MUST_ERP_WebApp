// ==========================================
// Quality Control Types (Phase 1)
// ==========================================

// QC Template Parameter Types
export type ParameterType = 'NUMERIC' | 'ACCEPTANCE' | 'FORMULA'

export type ParameterStatus = 'PASS' | 'FAIL' | 'PENDING'

export interface QCParameter {
  id: string
  lineNo: number
  name: string                    // e.g., "Temperature (°C)"
  nameEn?: string                 // English name
  type: ParameterType
  // For NUMERIC type
  minValue?: number               // e.g., 0
  maxValue?: number               // e.g., 4 (for temp ≤ 4°C)
  uom?: string                    // e.g., "°C"
  // For ACCEPTANCE type
  acceptableValues?: string[]     // e.g., ["Normal", "Pink"]
  // Common
  isCritical: boolean             // CCP parameter
  description?: string
}

// QC Template
export type TemplateType = 'RAW_MATERIAL' | 'SEMI_FINISHED' | 'FINISHED_GOOD' | 'PROCESS'

export type TemplateStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT'

export interface QCTemplate {
  id: string
  code: string                    // e.g., "QIT-RAW-CHICKEN"
  name: string                    // e.g., "เกณฑ์ตรวจสอบไก่ดิบ"
  type: TemplateType
  status: TemplateStatus
  version: number
  description?: string
  parameters: QCParameter[]
  itemIds?: string[]              // Linked items
  appliesTo: 'PURCHASE' | 'PRODUCTION' | 'BOTH'
  createdAt: string
  updatedAt: string
}

// QC Inspection
export type InspectionStatus = 'DRAFT' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'ON_HOLD'

export type InspectionType = 'INCOMING' | 'IN_PROCESS' | 'FINAL' | 'PATROL'

export interface InspectionReading {
  id: string
  parameterId: string
  parameter?: QCParameter
  // For NUMERIC
  numericValue?: number
  // For ACCEPTANCE
  acceptanceValue?: string
  // Result
  status: ParameterStatus
  remarks?: string
}

export interface QCInspection {
  id: string
  code: string                    // e.g., "QI-2026-0001"
  type: InspectionType
  status: InspectionStatus
  templateId: string
  template?: QCTemplate
  // Source document
  sourceDocType: 'PURCHASE_RECEIPT' | 'WORK_ORDER' | 'JOB_CARD' | 'STOCK_ENTRY'
  sourceDocId: string
  sourceDocCode?: string
  // Item being inspected
  itemId: string
  itemCode?: string
  itemName?: string
  // Batch info
  batchNo?: string
  lotNo?: string
  // Quantity
  sampleQty: number
  inspectedQty: number
  acceptedQty: number
  rejectedQty: number
  // Readings
  readings: InspectionReading[]
  // Result
  result?: 'ACCEPTED' | 'REJECTED' | 'CONDITIONAL'
  resultRemarks?: string
  // Inspection details
  inspectionDate: string
  inspectionTime: string
  inspectedBy: string
  approvedBy?: string
  approvedAt?: string
  // CCP specific (for food safety)
  isCCP: boolean
  ccpDeviationAction?: string     // Action taken if CCP fails
  // Attachments
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

// ==========================================
// Quarantine Types
// ==========================================

export type QuarantineReason =
  | 'QC_FAILED'
  | 'PENDING_QC'
  | 'TEMPERATURE_DEVIATION'
  | 'EXPIRED'
  | 'DAMAGED'
  | 'CUSTOMER_COMPLAINT'
  | 'OTHER'

export type QuarantineAction =
  | 'RETURN_TO_SUPPLIER'
  | 'DISPOSE'
  | 'REWORK'
  | 'RELEASE'
  | 'DOWNGRADE'

export type QuarantineStatus = 'PENDING' | 'RESOLVED' | 'DISPOSED'

export interface QuarantineRecord {
  id: string
  code: string                    // e.g., "QR-2026-0001"
  status: QuarantineStatus
  // Item info
  itemId: string
  itemCode?: string
  itemName?: string
  batchNo?: string
  qty: number
  uom: string
  // Reason
  reason: QuarantineReason
  reasonDetail?: string
  qcInspectionId?: string
  // Resolution
  action?: QuarantineAction
  actionDetail?: string
  resolvedBy?: string
  resolvedAt?: string
  // Location
  warehouseId: string
  warehouseName?: string
  // Timeline
  quarantinedAt: string
  quarantinedBy: string
  createdAt: string
  updatedAt: string
}

// ==========================================
// Input Types (for forms)
// ==========================================

export interface CreateQCTemplateInput {
  code: string
  name: string
  type: TemplateType
  description?: string
  parameters: {
    name: string
    nameEn?: string
    type: ParameterType
    minValue?: number
    maxValue?: number
    uom?: string
    acceptableValues?: string[]
    isCritical: boolean
    description?: string
  }[]
  itemIds?: string[]
  appliesTo: 'PURCHASE' | 'PRODUCTION' | 'BOTH'
}

export interface CreateQCInspectionInput {
  type: InspectionType
  templateId: string
  sourceDocType: 'PURCHASE_RECEIPT' | 'WORK_ORDER' | 'JOB_CARD' | 'STOCK_ENTRY'
  sourceDocId: string
  itemId: string
  batchNo?: string
  lotNo?: string
  sampleQty: number
  readings: {
    parameterId: string
    numericValue?: number
    acceptanceValue?: string
    remarks?: string
  }[]
  remarks?: string
}

export interface CreateQuarantineInput {
  itemId: string
  batchNo?: string
  qty: number
  uom: string
  reason: QuarantineReason
  reasonDetail?: string
  qcInspectionId?: string
  warehouseId: string
}

// ==========================================
// Filter Types
// ==========================================

export interface QCTemplateFilterState {
  search: string
  type: TemplateType | 'all'
  status: TemplateStatus | 'all'
}

export interface QCInspectionFilterState {
  search: string
  type: InspectionType | 'all'
  status: InspectionStatus | 'all'
  dateFrom?: string
  dateTo?: string
  isCCPOnly: boolean
}

export interface QuarantineFilterState {
  search: string
  status: QuarantineStatus | 'all'
  reason: QuarantineReason | 'all'
}

// ==========================================
// Computed/Dashboard Types
// ==========================================

export interface QCDashboard {
  totalInspections: number
  passedCount: number
  failedCount: number
  pendingCount: number
  passRate: number                // Percentage
  ccpDeviations: number           // CCP failures
  quarantineItems: number
  recentInspections: QCInspection[]
}

export interface SupplierQuality {
  supplierId: string
  supplierName: string
  totalDeliveries: number
  passedDeliveries: number
  failedDeliveries: number
  qualityScore: number            // Percentage
  commonIssues: string[]
}
