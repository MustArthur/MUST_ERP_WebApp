// ==========================================
// Raw Material Receiving Types
// ==========================================

import { StockItem, UnitOfMeasure } from './inventory'

// ==========================================
// Supplier Types
// ==========================================

export type SupplierStatus = 'ACTIVE' | 'INACTIVE'

export interface Supplier {
  id: string
  code: string                    // e.g., "SUP-CHICKEN"
  name: string                    // e.g., "ฟาร์มไก่สุขใจ"
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  qualityScore?: number           // 0-100
  status: SupplierStatus
  createdAt: string
  updatedAt: string
}

// ==========================================
// Purchase Receipt Types
// ==========================================

export type ReceiptStatus = 'DRAFT' | 'PENDING_QC' | 'COMPLETED' | 'CANCELLED'

export type QCStatusSummary = 'NOT_REQUIRED' | 'PENDING' | 'PASSED' | 'FAILED' | 'PARTIAL'

export type ItemQCStatus = 'NOT_REQUIRED' | 'PENDING' | 'PASSED' | 'FAILED'

export interface PurchaseReceiptItem {
  id: string
  lineNo: number
  itemId: string
  item?: StockItem
  qtyOrdered?: number             // From PO (optional)
  qtyReceived: number             // Actually received
  qtyAccepted: number             // After QC passed
  qtyRejected: number             // After QC failed
  uom: UnitOfMeasure
  batchNo?: string
  mfgDate?: string
  expDate?: string
  unitPrice: number               // Price per unit (THB)
  totalPrice: number              // = qtyReceived * unitPrice
  warehouseId: string             // Target warehouse
  qcInspectionId?: string         // Link to QC Inspection
  qcStatus: ItemQCStatus
  remarks?: string
}

export interface PurchaseReceipt {
  id: string
  code: string                    // e.g., "PR-2026-0001"
  status: ReceiptStatus
  supplierId: string
  supplier?: Supplier
  receiptDate: string             // Date of receipt
  poNumber?: string               // Purchase Order reference
  invoiceNumber?: string          // Supplier invoice
  items: PurchaseReceiptItem[]
  qcStatus: QCStatusSummary       // Overall QC status
  totalAmount: number             // Sum of all items
  remarks?: string
  receivedBy: string              // Person who received
  createdAt: string
  updatedAt: string
}

// ==========================================
// Input Types (for forms)
// ==========================================

export interface CreateSupplierInput {
  code: string
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
}

export interface CreateReceiptItemInput {
  itemId: string
  qtyReceived: number
  uom: UnitOfMeasure
  batchNo?: string
  mfgDate?: string
  expDate?: string
  unitPrice: number
  warehouseId: string
  remarks?: string
}

export interface CreatePurchaseReceiptInput {
  supplierId: string
  receiptDate: string
  poNumber?: string
  invoiceNumber?: string
  items: CreateReceiptItemInput[]
  remarks?: string
}

export interface UpdateReceiptItemInput {
  id?: string                     // For existing items
  itemId: string
  qtyReceived: number
  uom: UnitOfMeasure
  batchNo?: string
  mfgDate?: string
  expDate?: string
  unitPrice: number
  warehouseId: string
  remarks?: string
}

export interface UpdatePurchaseReceiptInput {
  supplierId?: string
  receiptDate?: string
  poNumber?: string
  invoiceNumber?: string
  items?: UpdateReceiptItemInput[]
  remarks?: string
}

// ==========================================
// Filter Types
// ==========================================

export interface ReceiptFilterState {
  search: string
  status: ReceiptStatus | 'all'
  qcStatus: QCStatusSummary | 'all'
  supplierId: string | 'all'
  dateFrom?: string
  dateTo?: string
}

export interface SupplierFilterState {
  search: string
  status: SupplierStatus | 'all'
}

// ==========================================
// Dashboard Types
// ==========================================

export interface ReceivingDashboard {
  todayCount: number              // Receipts today
  pendingQCCount: number          // Awaiting QC
  passedCount: number             // QC passed (today)
  failedCount: number             // QC failed (today)
  totalValue: number              // Total value today
  recentReceipts: PurchaseReceipt[]
}
