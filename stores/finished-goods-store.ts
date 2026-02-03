import { create } from 'zustand'
import {
  FinishedGoodsEntry,
  FGBatch,
  FGProductSummary,
  FGWarehouse,
  FGFilters,
  FGEntryStatus,
  CreateFGEntryInput,
  ExpiryAlert,
} from '@/types/finished-goods'
import {
  mockFinishedGoodsEntries,
  mockFGWarehouses,
  mockExpiryAlerts,
  getFGBatches,
  getFGProductSummary,
  getFGDashboardStats,
  calculateDaysToExpiry,
} from '@/lib/mock-data/finished-goods'

// =============================================================================
// Store State Interface
// =============================================================================

interface FinishedGoodsState {
  // Data
  entries: FinishedGoodsEntry[]
  warehouses: FGWarehouse[]
  expiryAlerts: ExpiryAlert[]

  // Computed (cached)
  batches: FGBatch[]
  productSummary: FGProductSummary[]
  dashboardStats: ReturnType<typeof getFGDashboardStats>

  // UI State
  isLoading: boolean
  error: string | null
  selectedEntry: FinishedGoodsEntry | null

  // Filters
  filters: FGFilters

  // Actions - Data Fetching
  fetchEntries: () => Promise<void>
  fetchWarehouses: () => Promise<void>
  fetchExpiryAlerts: () => Promise<void>
  refreshData: () => Promise<void>

  // Actions - FG Entry Operations
  createEntry: (input: CreateFGEntryInput) => Promise<FinishedGoodsEntry>
  updateEntryStatus: (id: string, status: FGEntryStatus) => Promise<void>
  reserveStock: (id: string, quantity: number, pickListId: string) => Promise<void>
  releaseReservedStock: (id: string, quantity: number) => Promise<void>
  confirmDelivery: (id: string, deliveredQty: number) => Promise<void>
  markExpired: (id: string) => Promise<void>

  // Actions - Alerts
  acknowledgeAlert: (alertId: string, acknowledgedBy: string) => Promise<void>

  // Actions - Selection
  selectEntry: (entry: FinishedGoodsEntry | null) => void

  // Actions - Filters
  setFilters: (filters: Partial<FGFilters>) => void
  resetFilters: () => void

  // Computed Getters
  getFilteredEntries: () => FinishedGoodsEntry[]
  getAvailableStock: (productId: string) => number
  getBatchesForProduct: (productId: string) => FGBatch[]
  getExpiringEntries: (withinDays: number) => FinishedGoodsEntry[]
}

// =============================================================================
// Initial State
// =============================================================================

const initialFilters: FGFilters = {
  search: '',
  status: 'all',
  productId: 'all',
  warehouseId: 'all',
}

// =============================================================================
// Helper Functions
// =============================================================================

function generateFGCode(): string {
  const year = new Date().getFullYear()
  const sequence = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')
  return `FG-${year}-${sequence}`
}

// =============================================================================
// Store Implementation
// =============================================================================

export const useFinishedGoodsStore = create<FinishedGoodsState>((set, get) => ({
  // Initial State
  entries: [],
  warehouses: [],
  expiryAlerts: [],
  batches: [],
  productSummary: [],
  dashboardStats: getFGDashboardStats(),
  isLoading: false,
  error: null,
  selectedEntry: null,
  filters: initialFilters,

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  fetchEntries: async () => {
    set({ isLoading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const entries = [...mockFinishedGoodsEntries]
      set({
        entries,
        batches: getFGBatches(),
        productSummary: getFGProductSummary(),
        dashboardStats: getFGDashboardStats(),
        isLoading: false,
      })
    } catch (error) {
      set({ error: 'ไม่สามารถโหลดข้อมูลสินค้าสำเร็จรูปได้', isLoading: false })
    }
  },

  fetchWarehouses: async () => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      set({ warehouses: [...mockFGWarehouses], isLoading: false })
    } catch (error) {
      set({ error: 'ไม่สามารถโหลดข้อมูลคลังสินค้าได้', isLoading: false })
    }
  },

  fetchExpiryAlerts: async () => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      set({ expiryAlerts: [...mockExpiryAlerts], isLoading: false })
    } catch (error) {
      set({ error: 'ไม่สามารถโหลดการแจ้งเตือนหมดอายุได้', isLoading: false })
    }
  },

  refreshData: async () => {
    const { fetchEntries, fetchWarehouses, fetchExpiryAlerts } = get()
    await Promise.all([fetchEntries(), fetchWarehouses(), fetchExpiryAlerts()])
  },

  // ==========================================================================
  // FG Entry Operations
  // ==========================================================================

  createEntry: async (input: CreateFGEntryInput) => {
    set({ isLoading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const newEntry: FinishedGoodsEntry = {
        id: `fg-new-${Date.now()}`,
        code: generateFGCode(),
        workOrderId: input.workOrderId,
        productId: input.productId,
        productCode: input.productCode,
        productName: input.productName,
        batchNo: input.batchNo,
        mfgDate: input.mfgDate,
        expDate: input.expDate,
        quantity: input.quantity,
        availableQty: 0, // Start as ON_HOLD, awaiting QC
        reservedQty: 0,
        deliveredQty: 0,
        uom: 'BTL',
        warehouseId: input.warehouseId,
        warehouseName: mockFGWarehouses.find(w => w.id === input.warehouseId)?.name,
        status: 'ON_HOLD',
        qcStatus: 'PENDING',
        remarks: input.remarks,
        createdBy: 'ผู้ใช้ปัจจุบัน',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      set(state => ({
        entries: [newEntry, ...state.entries],
        isLoading: false,
      }))

      return newEntry
    } catch (error) {
      set({ error: 'ไม่สามารถสร้างรายการสินค้าสำเร็จรูปได้', isLoading: false })
      throw error
    }
  },

  updateEntryStatus: async (id: string, status: FGEntryStatus) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        entries: state.entries.map(entry => {
          if (entry.id === id) {
            // If moving to AVAILABLE, set availableQty = quantity - deliveredQty
            const availableQty =
              status === 'AVAILABLE'
                ? entry.quantity - entry.deliveredQty - entry.reservedQty
                : entry.availableQty

            return {
              ...entry,
              status,
              availableQty,
              qcStatus: status === 'AVAILABLE' ? 'PASSED' : entry.qcStatus,
              updatedAt: new Date().toISOString(),
            }
          }
          return entry
        }),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถอัพเดทสถานะได้', isLoading: false })
    }
  },

  reserveStock: async (id: string, quantity: number, pickListId: string) => {
    const { entries } = get()
    const entry = entries.find(e => e.id === id)

    if (!entry) {
      throw new Error('ไม่พบรายการสินค้า')
    }

    if (entry.availableQty < quantity) {
      throw new Error(`สต็อคไม่พอ (มี ${entry.availableQty} ต้องการ ${quantity})`)
    }

    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        entries: state.entries.map(e => {
          if (e.id === id) {
            const newAvailable = e.availableQty - quantity
            const newReserved = e.reservedQty + quantity
            return {
              ...e,
              availableQty: newAvailable,
              reservedQty: newReserved,
              status: newAvailable === 0 ? 'RESERVED' : e.status,
              updatedAt: new Date().toISOString(),
            }
          }
          return e
        }),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถจองสต็อคได้', isLoading: false })
      throw error
    }
  },

  releaseReservedStock: async (id: string, quantity: number) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        entries: state.entries.map(e => {
          if (e.id === id) {
            const newReserved = Math.max(0, e.reservedQty - quantity)
            const newAvailable = e.availableQty + quantity
            return {
              ...e,
              availableQty: newAvailable,
              reservedQty: newReserved,
              status: newAvailable > 0 ? 'AVAILABLE' : e.status,
              updatedAt: new Date().toISOString(),
            }
          }
          return e
        }),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถปล่อยสต็อคที่จองได้', isLoading: false })
    }
  },

  confirmDelivery: async (id: string, deliveredQty: number) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        entries: state.entries.map(e => {
          if (e.id === id) {
            const newReserved = Math.max(0, e.reservedQty - deliveredQty)
            const newDelivered = e.deliveredQty + deliveredQty
            const isFullyDelivered = newDelivered >= e.quantity

            return {
              ...e,
              reservedQty: newReserved,
              deliveredQty: newDelivered,
              status: isFullyDelivered ? 'DELIVERED' : e.status,
              updatedAt: new Date().toISOString(),
            }
          }
          return e
        }),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถยืนยันการส่งได้', isLoading: false })
    }
  },

  markExpired: async (id: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        entries: state.entries.map(e =>
          e.id === id
            ? {
                ...e,
                status: 'EXPIRED' as FGEntryStatus,
                availableQty: 0,
                updatedAt: new Date().toISOString(),
              }
            : e
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถทำเครื่องหมายหมดอายุได้', isLoading: false })
    }
  },

  // ==========================================================================
  // Alerts
  // ==========================================================================

  acknowledgeAlert: async (alertId: string, acknowledgedBy: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        expiryAlerts: state.expiryAlerts.map(alert =>
          alert.id === alertId
            ? {
                ...alert,
                acknowledged: true,
                acknowledgedBy,
                acknowledgedAt: new Date().toISOString(),
              }
            : alert
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถรับทราบการแจ้งเตือนได้', isLoading: false })
    }
  },

  // ==========================================================================
  // Selection
  // ==========================================================================

  selectEntry: (entry: FinishedGoodsEntry | null) => {
    set({ selectedEntry: entry })
  },

  // ==========================================================================
  // Filters
  // ==========================================================================

  setFilters: (filters: Partial<FGFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  resetFilters: () => {
    set({ filters: initialFilters })
  },

  // ==========================================================================
  // Computed Getters
  // ==========================================================================

  getFilteredEntries: () => {
    const { entries, filters } = get()

    return entries.filter(entry => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          entry.code.toLowerCase().includes(searchLower) ||
          entry.productName.toLowerCase().includes(searchLower) ||
          entry.productCode.toLowerCase().includes(searchLower) ||
          entry.batchNo.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== 'all' && entry.status !== filters.status) {
        return false
      }

      // Product filter
      if (filters.productId !== 'all' && entry.productId !== filters.productId) {
        return false
      }

      // Warehouse filter
      if (filters.warehouseId !== 'all' && entry.warehouseId !== filters.warehouseId) {
        return false
      }

      // Expiring within days filter
      if (filters.expiringWithinDays !== undefined) {
        const daysToExpire = calculateDaysToExpiry(entry.expDate)
        if (daysToExpire > filters.expiringWithinDays) {
          return false
        }
      }

      return true
    })
  },

  getAvailableStock: (productId: string) => {
    const { entries } = get()
    return entries
      .filter(e => e.productId === productId && e.status === 'AVAILABLE')
      .reduce((sum, e) => sum + e.availableQty, 0)
  },

  getBatchesForProduct: (productId: string) => {
    const { batches } = get()
    return batches.filter(b => b.productId === productId)
  },

  getExpiringEntries: (withinDays: number) => {
    const { entries } = get()
    return entries.filter(e => {
      if (e.status !== 'AVAILABLE') return false
      const daysToExpire = calculateDaysToExpiry(e.expDate)
      return daysToExpire <= withinDays && daysToExpire > 0
    })
  },
}))
