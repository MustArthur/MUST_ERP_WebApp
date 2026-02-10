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
  calculateReceiptTotal,
} from '@/lib/mock-data/receiving'
import { delay } from '@/lib/utils'
import { ReceivingService } from '@/lib/services/receiving-service'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()


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

// Mock data removed in favor of Supabase integration

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
      const { data, error } = await supabase.from('suppliers').select('*').eq('is_active', true)
      if (error) throw error

      const mappedSuppliers: Supplier[] = data?.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        contactPerson: s.contact_name || undefined,
        phone: s.phone || undefined,
        email: s.email || undefined,
        address: s.address || undefined,
        status: s.is_active ? 'ACTIVE' : 'INACTIVE',
        createdAt: s.created_at,
        updatedAt: s.updated_at
      })) || []

      set({ suppliers: mappedSuppliers, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
      set({ error: 'ไม่สามารถโหลดข้อมูล Supplier ได้', isLoading: false })
    }
  },

  // ==========================================
  // Receipt Actions
  // ==========================================

  fetchReceipts: async () => {
    set({ isLoading: true, error: null })
    try {
      const receipts = await ReceivingService.getReceipts()
      set({ receipts, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch receipts:', error)
      set({ error: 'ไม่สามารถโหลดข้อมูลใบรับได้', isLoading: false })
    }
  },

  createReceipt: async (input: CreatePurchaseReceiptInput) => {
    set({ isLoading: true, error: null })
    try {
      const newReceipt = await ReceivingService.createReceipt(input)
      const { receipts } = get()
      set({ receipts: [newReceipt, ...receipts], isLoading: false })
      return newReceipt
    } catch (error) {
      console.error('Failed to create receipt:', error)
      set({ error: 'ไม่สามารถสร้างใบรับได้', isLoading: false })
      throw error
    }
  },

  updateReceipt: async (id: string, input: UpdatePurchaseReceiptInput) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await ReceivingService.updateReceipt(id, input)
      const { receipts } = get()
      set({
        receipts: receipts.map(r => r.id === id ? updated : r),
        isLoading: false
      })
      return updated
    } catch (error) {
      console.error('Failed to update receipt:', error)
      set({ error: 'ไม่สามารถอัพเดทใบรับได้', isLoading: false })
      throw error
    }
  },

  submitReceipt: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // For now, we assume standard flow where default QC status is handled by backend/service
      // If we need to trigger QC creation, it should be done here or in service.
      // Based on existing logic, we should probably update status to PENDING_QC if items require QC.
      // For MVP Database integration, we will simply update status.

      // TODO: Implement advanced QC trigger logic if needed, similar to original mockStore

      await ReceivingService.updateStatus(id, 'PENDING_QC')

      // Fetch updated
      const updated = await ReceivingService.getReceiptById(id)
      if (!updated) throw new Error('Failed to fetch updated receipt')

      const { receipts } = get()
      set({
        receipts: receipts.map(r => r.id === id ? updated : r),
        isLoading: false
      })
      return updated
    } catch (error) {
      console.error('Failed to submit receipt:', error)
      set({ error: 'ไม่สามารถยืนยันใบรับได้', isLoading: false })
      throw error
    }
  },

  completeReceipt: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await ReceivingService.updateStatus(id, 'COMPLETED')
      const updated = await ReceivingService.getReceiptById(id)
      if (!updated) throw new Error('Receipt not found after update')

      const { receipts } = get()
      set({
        receipts: receipts.map(r => r.id === id ? updated : r),
        isLoading: false
      })
      return updated
    } catch (error) {
      console.error('Failed to complete receipt:', error)
      set({ error: 'ไม่สามารถปิดใบรับได้', isLoading: false })
      throw error
    }
  },

  cancelReceipt: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await ReceivingService.updateStatus(id, 'CANCELLED')
      const { receipts } = get()
      set({
        receipts: receipts.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r),
        isLoading: false
      })
    } catch (error) {
      console.error('Failed to cancel receipt:', error)
      set({ error: 'ไม่สามารถยกเลิกใบรับได้', isLoading: false })
      throw error
    }
  },

  // ==========================================
  // QC Integration
  // ==========================================

  updateItemQCStatus: async (receiptId: string, itemId: string, status: 'PASSED' | 'FAILED', qcInspectionId?: string) => {
    set({ isLoading: true, error: null })
    try {
      await ReceivingService.updateReceiptItemQC(receiptId, itemId, status, qcInspectionId)

      const updated = await ReceivingService.getReceiptById(receiptId)
      if (!updated) throw new Error('Receipt not found after update')

      const { receipts } = get()
      set({
        receipts: receipts.map(r => r.id === receiptId ? updated : r),
        isLoading: false
      })
    } catch (error) {
      console.error('Failed to update QC status:', error)
      set({ error: 'ไม่สามารถอัพเดทสถานะ QC ได้', isLoading: false })
      throw error
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
