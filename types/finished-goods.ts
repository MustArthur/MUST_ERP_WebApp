// Finished Goods Types for MUST ERP
// FG Management - Batch tracking with FEFO (First Expire First Out)

import { WorkOrder } from './production'

// FG Entry from Production
export interface FinishedGoodsEntry {
  id: string
  code: string                    // FG-2026-0001
  workOrderId: string
  workOrder?: WorkOrder
  productId: string               // CK_Blueberry, PB_Strawberry
  productCode: string             // CK-BLUEBERRY
  productName: string             // ไก่บลูเบอร์รี่
  batchNo: string                 // L2026-0131-001
  mfgDate: string                 // Manufacturing date
  expDate: string                 // Expiry date
  quantity: number                // Quantity produced
  availableQty: number            // Available for delivery
  reservedQty: number             // Reserved in pick lists
  deliveredQty: number            // Already delivered
  uom: 'BTL'                      // Unit of measure (bottles)
  warehouseId: string             // FG-Cold-Room
  warehouseName?: string
  status: FGEntryStatus
  temperature?: number            // Storage temperature
  qcStatus: 'PENDING' | 'PASSED' | 'FAILED'
  qcInspectionId?: string
  remarks?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type FGEntryStatus =
  | 'AVAILABLE'      // Ready for delivery
  | 'RESERVED'       // Reserved in pick list
  | 'DELIVERED'      // Fully delivered
  | 'EXPIRED'        // Past expiry date
  | 'ON_HOLD'        // QC hold
  | 'QUARANTINE'     // QC failed

// FG Batch Summary (for FEFO picking)
export interface FGBatch {
  batchNo: string
  productId: string
  productCode: string
  productName: string
  totalQuantity: number
  availableQty: number
  reservedQty: number
  deliveredQty: number
  mfgDate: string
  expDate: string
  daysToExpire: number            // Calculated field
  isExpiringSoon: boolean         // < 7 days
  isExpired: boolean
  warehouseId: string
  entries: FinishedGoodsEntry[]   // All entries for this batch
}

// FG Product Summary
export interface FGProductSummary {
  productId: string
  productCode: string
  productName: string
  totalQuantity: number
  availableQty: number
  reservedQty: number
  batches: FGBatch[]
  oldestExpiry: string            // Earliest expiry date
  daysToOldestExpiry: number
}

// FG Warehouse Summary
export interface FGWarehouse {
  id: string
  code: string                    // FG-Cold-Room, FG-Hold
  name: string
  type: 'COLD_STORAGE' | 'HOLD' | 'QUARANTINE'
  temperature: number             // Target temp (e.g., 2-4°C)
  capacity: number                // Max items
  currentStock: number
  utilizationPercent: number
}

// Create FG Entry Input
export interface CreateFGEntryInput {
  workOrderId: string
  productId: string
  productCode: string
  productName: string
  batchNo: string
  mfgDate: string
  expDate: string
  quantity: number
  warehouseId: string
  remarks?: string
}

// FG Filters
export interface FGFilters {
  search: string
  status: FGEntryStatus | 'all'
  productId: string | 'all'
  warehouseId: string | 'all'
  expiringWithinDays?: number     // Show items expiring within X days
}

// FG Movement Log
export interface FGMovement {
  id: string
  fgEntryId: string
  type: 'PRODUCTION' | 'PICK' | 'DELIVER' | 'RETURN' | 'DISPOSE' | 'ADJUST'
  quantity: number
  fromStatus: FGEntryStatus
  toStatus: FGEntryStatus
  referenceDocType?: 'WORK_ORDER' | 'PICK_LIST' | 'DELIVERY_NOTE' | 'ADJUSTMENT'
  referenceDocId?: string
  operator: string
  timestamp: string
  remarks?: string
}

// Expiry Alert
export interface ExpiryAlert {
  id: string
  fgEntryId: string
  batchNo: string
  productName: string
  expDate: string
  daysToExpire: number
  quantity: number
  severity: 'WARNING' | 'CRITICAL' | 'EXPIRED'
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}
