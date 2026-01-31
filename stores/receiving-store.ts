import { create } from 'zustand'
import {
  Supplier,
  PurchaseReceipt,
  PurchaseReceiptItem,
  ReceiptStatus,
  QCStatusSummary,
  ReceiptFilterState,
  CreatePurchaseReceiptInput,
  UpdatePurchaseReceiptInput,
  ReceivingDashboard,
} from '@/types/receiving'
import { useInventoryStore } from './inventory-store'
import { useQualityStore } from './quality-store'
import {
  mockSuppliers,
  mockPurchaseReceipts,
  calculateReceiptTotal,
} from '@/lib/mock-data/receiving'
import { generateId, delay } from '@/lib/utils'

// ==========================================
// Store State Interface
// ==========================================

interface ReceivingState {
  // Data
  suppliers: Supplier[]
  receipts: PurchaseReceipt[]

  // Selected Items
  selectedReceipt: PurchaseReceipt | null

  // UI State
  isLoading: boolean
  error: string | null
  receiptFilters: ReceiptFilterState

  // Supplier Actions
  fetchSuppliers: () => Promise<void>

  // Receipt Actions
  fetchReceipts: () => Promise<void>
  createReceipt: (input: CreatePurchaseReceiptInput) => Promise<PurchaseReceipt>
  updateReceipt: (id: string, input: UpdatePurchaseReceiptInput) => Promise<PurchaseReceipt>
  submitReceipt: (id: string) => Promise<PurchaseReceipt>
  completeReceipt: (id: string) => Promise<PurchaseReceipt>
  cancelReceipt: (id: string) => Promise<void>

  // QC Integration
  updateItemQCStatus: (receiptId: string, itemId: string, status: 'PASSED' | 'FAILED', qcInspectionId?: string) => Promise<void>

  // Filter Actions
  setReceiptFilters: (filters: Partial<ReceiptFilterState>) => void
  resetFilters: () => void

  // Selection Actions
  setSelectedReceipt: (receipt: PurchaseReceipt | null) => void

  // Dashboard
  getDashboard: () => ReceivingDashboard

  // UI Actions
  clearError: () => void
}

// ==========================================
// Default Filters
// ==========================================

const defaultReceiptFilters: ReceiptFilterState = {
  search: '',
  status: 'all',
  qcStatus: 'all',
  supplierId: 'all',
}

// ==========================================
// In-memory Storage
// ==========================================

let suppliersData = [...mockSuppliers]
let receiptsData = [...mockPurchaseReceipts]

// ==========================================
// Store Implementation
// ==========================================

export const useReceivingStore = create<ReceivingState>((set, get) => ({
  // Initial State
  suppliers: [],
  receipts: [],
  selectedReceipt: null,
  isLoading: false,
  error: null,
  receiptFilters: defaultReceiptFilters,

  // ==========================================
  // Supplier Actions
  // ==========================================

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null })
    try {
      await delay(200)
      set({ suppliers: suppliersData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถโหลดข้อมูล Supplier ได้', isLoading: false })
    }
  },

  // ==========================================
  // Receipt Actions
  // ==========================================

  fetchReceipts: async () => {
    set({ isLoading: true, error: null })
    try {
      await delay(300)
      set({ receipts: receiptsData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถโหลดข้อมูลใบรับได้', isLoading: false })
    }
  },

  createReceipt: async (input: CreatePurchaseReceiptInput) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const { stockItems } = useInventoryStore.getState()
      const receiptCount = receiptsData.length + 1
      const code = `PR-2026-${receiptCount.toString().padStart(4, '0')}`

      // Build items with QC status
      const items: PurchaseReceiptItem[] = input.items.map((item, idx) => {
        const stockItem = stockItems.find(i => i.id === item.itemId)
        const requiresQC = stockItem?.requiresQC || false

        return {
          id: generateId(),
          lineNo: idx + 1,
          itemId: item.itemId,
          item: stockItem,
          qtyReceived: item.qtyReceived,
          qtyAccepted: 0,
          qtyRejected: 0,
          uom: item.uom,
          batchNo: item.batchNo,
          mfgDate: item.mfgDate,
          expDate: item.expDate,
          unitPrice: item.unitPrice,
          totalPrice: item.qtyReceived * item.unitPrice,
          warehouseId: item.warehouseId,
          qcStatus: requiresQC ? 'PENDING' : 'NOT_REQUIRED',
          remarks: item.remarks,
        }
      })

      // Determine overall QC status
      const hasQCRequired = items.some(i => i.qcStatus === 'PENDING')
      const qcStatus: QCStatusSummary = hasQCRequired ? 'PENDING' : 'NOT_REQUIRED'

      const supplier = suppliersData.find(s => s.id === input.supplierId)

      const newReceipt: PurchaseReceipt = {
        id: generateId(),
        code,
        status: 'DRAFT',
        supplierId: input.supplierId,
        supplier,
        receiptDate: input.receiptDate,
        poNumber: input.poNumber,
        invoiceNumber: input.invoiceNumber,
        items,
        qcStatus,
        totalAmount: calculateReceiptTotal(items),
        remarks: input.remarks,
        receivedBy: 'ระบบ',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      receiptsData = [...receiptsData, newReceipt]
      set({ receipts: receiptsData, isLoading: false })
      return newReceipt
    } catch {
      set({ error: 'ไม่สามารถสร้างใบรับได้', isLoading: false })
      throw new Error('Failed to create receipt')
    }
  },

  updateReceipt: async (id: string, input: UpdatePurchaseReceiptInput) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = receiptsData.findIndex(r => r.id === id)
      if (index === -1) throw new Error('Receipt not found')

      const existing = receiptsData[index]
      if (existing.status !== 'DRAFT') {
        throw new Error('Cannot update non-draft receipt')
      }

      const supplier = input.supplierId
        ? suppliersData.find(s => s.id === input.supplierId)
        : existing.supplier

      const updated: PurchaseReceipt = {
        ...existing,
        ...input,
        supplier,
        totalAmount: input.items
          ? calculateReceiptTotal(input.items as PurchaseReceiptItem[])
          : existing.totalAmount,
        updatedAt: new Date().toISOString(),
      }

      receiptsData = [
        ...receiptsData.slice(0, index),
        updated,
        ...receiptsData.slice(index + 1),
      ]
      set({ receipts: receiptsData, isLoading: false })
      return updated
    } catch (e) {
      set({ error: 'ไม่สามารถอัพเดทใบรับได้', isLoading: false })
      throw e
    }
  },

  submitReceipt: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(500)
      const index = receiptsData.findIndex(r => r.id === id)
      if (index === -1) throw new Error('Receipt not found')

      const receipt = receiptsData[index]
      if (receipt.status !== 'DRAFT') {
        throw new Error('Receipt already submitted')
      }

      const { stockItems } = useInventoryStore.getState()
      const { createInspection, templates } = useQualityStore.getState()

      // Process each item
      const updatedItems: PurchaseReceiptItem[] = []

      for (const item of receipt.items) {
        const stockItem = stockItems.find(i => i.id === item.itemId)
        const requiresQC = stockItem?.requiresQC || false

        let updatedItem = { ...item }

        if (requiresQC && stockItem?.qcTemplateId) {
          // Find template
          const template = templates.find(t => t.id === stockItem.qcTemplateId)

          if (template) {
            // Create QC Inspection
            const inspection = await createInspection({
              type: 'INCOMING',
              templateId: template.id,
              sourceDocType: 'PURCHASE_RECEIPT',
              sourceDocId: receipt.id,
              itemId: item.itemId,
              batchNo: item.batchNo,
              lotNo: item.batchNo,
              sampleQty: item.qtyReceived,
              readings: template.parameters.map(p => ({
                parameterId: p.id,
              })),
            })

            updatedItem = {
              ...updatedItem,
              qcInspectionId: inspection.id,
              qcStatus: 'PENDING',
              // Move to quarantine warehouse for items requiring QC
              warehouseId: 'wh-rm-quarantine',
            }
          }
        } else {
          // No QC required - accept immediately
          updatedItem = {
            ...updatedItem,
            qcStatus: 'NOT_REQUIRED',
            qtyAccepted: item.qtyReceived,
          }
        }

        updatedItems.push(updatedItem)
      }

      // Determine new status and QC status
      const hasPendingQC = updatedItems.some(i => i.qcStatus === 'PENDING')
      const newStatus: ReceiptStatus = hasPendingQC ? 'PENDING_QC' : 'COMPLETED'
      const newQCStatus: QCStatusSummary = hasPendingQC ? 'PENDING' : 'NOT_REQUIRED'

      const updated: PurchaseReceipt = {
        ...receipt,
        status: newStatus,
        qcStatus: newQCStatus,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      }

      receiptsData = [
        ...receiptsData.slice(0, index),
        updated,
        ...receiptsData.slice(index + 1),
      ]
      set({ receipts: receiptsData, isLoading: false })
      return updated
    } catch (e) {
      set({ error: 'ไม่สามารถยืนยันใบรับได้', isLoading: false })
      throw e
    }
  },

  completeReceipt: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = receiptsData.findIndex(r => r.id === id)
      if (index === -1) throw new Error('Receipt not found')

      const receipt = receiptsData[index]

      // Check if all QC items are resolved
      const pendingItems = receipt.items.filter(i => i.qcStatus === 'PENDING')
      if (pendingItems.length > 0) {
        throw new Error('ยังมีรายการรอตรวจ QC')
      }

      // Calculate final QC status
      const failedItems = receipt.items.filter(i => i.qcStatus === 'FAILED')
      const passedItems = receipt.items.filter(i => i.qcStatus === 'PASSED' || i.qcStatus === 'NOT_REQUIRED')

      let finalQCStatus: QCStatusSummary = 'NOT_REQUIRED'
      if (failedItems.length > 0 && passedItems.length > 0) {
        finalQCStatus = 'PARTIAL'
      } else if (failedItems.length > 0) {
        finalQCStatus = 'FAILED'
      } else if (passedItems.some(i => i.qcStatus === 'PASSED')) {
        finalQCStatus = 'PASSED'
      }

      const updated: PurchaseReceipt = {
        ...receipt,
        status: 'COMPLETED',
        qcStatus: finalQCStatus,
        updatedAt: new Date().toISOString(),
      }

      receiptsData = [
        ...receiptsData.slice(0, index),
        updated,
        ...receiptsData.slice(index + 1),
      ]
      set({ receipts: receiptsData, isLoading: false })
      return updated
    } catch (e) {
      set({ error: 'ไม่สามารถปิดใบรับได้', isLoading: false })
      throw e
    }
  },

  cancelReceipt: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = receiptsData.findIndex(r => r.id === id)
      if (index === -1) throw new Error('Receipt not found')

      const receipt = receiptsData[index]
      if (receipt.status === 'COMPLETED') {
        throw new Error('Cannot cancel completed receipt')
      }

      const updated: PurchaseReceipt = {
        ...receipt,
        status: 'CANCELLED',
        updatedAt: new Date().toISOString(),
      }

      receiptsData = [
        ...receiptsData.slice(0, index),
        updated,
        ...receiptsData.slice(index + 1),
      ]
      set({ receipts: receiptsData, isLoading: false })
    } catch (e) {
      set({ error: 'ไม่สามารถยกเลิกใบรับได้', isLoading: false })
      throw e
    }
  },

  // ==========================================
  // QC Integration
  // ==========================================

  updateItemQCStatus: async (receiptId: string, itemId: string, status: 'PASSED' | 'FAILED', qcInspectionId?: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(300)
      const receiptIndex = receiptsData.findIndex(r => r.id === receiptId)
      if (receiptIndex === -1) throw new Error('Receipt not found')

      const receipt = receiptsData[receiptIndex]
      const itemIndex = receipt.items.findIndex(i => i.id === itemId)
      if (itemIndex === -1) throw new Error('Item not found')

      const item = receipt.items[itemIndex]

      // Update item
      const updatedItem: PurchaseReceiptItem = {
        ...item,
        qcStatus: status,
        qcInspectionId: qcInspectionId || item.qcInspectionId,
        qtyAccepted: status === 'PASSED' ? item.qtyReceived : 0,
        qtyRejected: status === 'FAILED' ? item.qtyReceived : 0,
        // Move from quarantine to normal warehouse if passed
        warehouseId: status === 'PASSED'
          ? (item.warehouseId === 'wh-rm-quarantine' ? 'wh-rm-cold' : item.warehouseId)
          : item.warehouseId,
      }

      const updatedItems = [
        ...receipt.items.slice(0, itemIndex),
        updatedItem,
        ...receipt.items.slice(itemIndex + 1),
      ]

      // Check if all items are resolved
      const pendingCount = updatedItems.filter(i => i.qcStatus === 'PENDING').length
      const passedCount = updatedItems.filter(i => i.qcStatus === 'PASSED' || i.qcStatus === 'NOT_REQUIRED').length
      const failedCount = updatedItems.filter(i => i.qcStatus === 'FAILED').length

      let newQCStatus: QCStatusSummary = receipt.qcStatus
      if (pendingCount === 0) {
        if (failedCount === 0) {
          newQCStatus = 'PASSED'
        } else if (passedCount === 0) {
          newQCStatus = 'FAILED'
        } else {
          newQCStatus = 'PARTIAL'
        }
      }

      const updated: PurchaseReceipt = {
        ...receipt,
        items: updatedItems,
        qcStatus: newQCStatus,
        // Auto-complete if all QC resolved
        status: pendingCount === 0 ? 'COMPLETED' : receipt.status,
        updatedAt: new Date().toISOString(),
      }

      receiptsData = [
        ...receiptsData.slice(0, receiptIndex),
        updated,
        ...receiptsData.slice(receiptIndex + 1),
      ]
      set({ receipts: receiptsData, isLoading: false })
    } catch (e) {
      set({ error: 'ไม่สามารถอัพเดทสถานะ QC ได้', isLoading: false })
      throw e
    }
  },

  // ==========================================
  // Filter Actions
  // ==========================================

  setReceiptFilters: (filters: Partial<ReceiptFilterState>) => {
    set(state => ({
      receiptFilters: { ...state.receiptFilters, ...filters },
    }))
  },

  resetFilters: () => {
    set({ receiptFilters: defaultReceiptFilters })
  },

  // ==========================================
  // Selection Actions
  // ==========================================

  setSelectedReceipt: (receipt: PurchaseReceipt | null) => {
    set({ selectedReceipt: receipt })
  },

  // ==========================================
  // Dashboard
  // ==========================================

  getDashboard: (): ReceivingDashboard => {
    const { receipts } = get()
    const today = new Date().toISOString().split('T')[0]

    const todayReceipts = receipts.filter(r => r.receiptDate === today)
    const pendingQC = receipts.filter(r => r.qcStatus === 'PENDING')
    const todayPassed = todayReceipts.filter(r => r.qcStatus === 'PASSED' || r.qcStatus === 'NOT_REQUIRED')
    const todayFailed = todayReceipts.filter(r => r.qcStatus === 'FAILED')

    return {
      todayCount: todayReceipts.length,
      pendingQCCount: pendingQC.length,
      passedCount: todayPassed.length,
      failedCount: todayFailed.length,
      totalValue: todayReceipts.reduce((sum, r) => sum + r.totalAmount, 0),
      recentReceipts: receipts.slice(-5).reverse(),
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

export function useFilteredReceipts() {
  const { receipts, receiptFilters } = useReceivingStore()

  return receipts.filter(receipt => {
    // Search filter
    if (receiptFilters.search) {
      const search = receiptFilters.search.toLowerCase()
      const matchCode = receipt.code.toLowerCase().includes(search)
      const matchSupplier = receipt.supplier?.name.toLowerCase().includes(search)
      const matchPO = receipt.poNumber?.toLowerCase().includes(search)
      if (!matchCode && !matchSupplier && !matchPO) return false
    }

    // Status filter
    if (receiptFilters.status !== 'all' && receipt.status !== receiptFilters.status) {
      return false
    }

    // QC Status filter
    if (receiptFilters.qcStatus !== 'all' && receipt.qcStatus !== receiptFilters.qcStatus) {
      return false
    }

    // Supplier filter
    if (receiptFilters.supplierId !== 'all' && receipt.supplierId !== receiptFilters.supplierId) {
      return false
    }

    // Date filters
    if (receiptFilters.dateFrom && receipt.receiptDate < receiptFilters.dateFrom) {
      return false
    }
    if (receiptFilters.dateTo && receipt.receiptDate > receiptFilters.dateTo) {
      return false
    }

    return true
  })
}
