import { create } from 'zustand'
import {
  Warehouse,
  StockItem,
  StockBalance,
  StockEntry,
  StockItemWithBalance,
  WarehouseWithStock,
  InventoryFilterState,
  StockEntryFilterState,
  CreateWarehouseInput,
  CreateStockItemInput,
  CreateStockEntryInput,
} from '@/types/inventory'
import {
  mockWarehouses,
  mockStockItems,
  mockStockBalances,
  mockStockEntries,
  getTotalStock,
  isLowStock,
  getExpiringItems,
} from '@/lib/mock-data/inventory'
import { generateId, delay } from '@/lib/utils'

// ==========================================
// Store State Interface
// ==========================================

interface InventoryState {
  // Data
  warehouses: Warehouse[]
  stockItems: StockItem[]
  stockBalances: StockBalance[]
  stockEntries: StockEntry[]

  // Selected Items
  selectedWarehouse: Warehouse | null
  selectedItem: StockItem | null
  selectedEntry: StockEntry | null

  // UI State
  isLoading: boolean
  error: string | null
  inventoryFilters: InventoryFilterState
  entryFilters: StockEntryFilterState

  // Warehouse Actions
  fetchWarehouses: () => Promise<void>
  createWarehouse: (input: CreateWarehouseInput) => Promise<Warehouse>
  updateWarehouse: (id: string, input: Partial<CreateWarehouseInput>) => Promise<Warehouse>

  // Stock Item Actions
  fetchStockItems: () => Promise<void>
  createStockItem: (input: CreateStockItemInput) => Promise<StockItem>
  updateStockItem: (id: string, input: Partial<CreateStockItemInput>) => Promise<StockItem>

  // Stock Balance Actions
  fetchStockBalances: () => Promise<void>
  getItemBalance: (itemId: string) => StockBalance[]

  // Stock Entry Actions
  fetchStockEntries: () => Promise<void>
  createStockEntry: (input: CreateStockEntryInput) => Promise<StockEntry>
  submitStockEntry: (id: string) => Promise<StockEntry>
  cancelStockEntry: (id: string) => Promise<void>

  // Filter Actions
  setInventoryFilters: (filters: Partial<InventoryFilterState>) => void
  setEntryFilters: (filters: Partial<StockEntryFilterState>) => void
  resetFilters: () => void

  // Selection Actions
  setSelectedWarehouse: (warehouse: Warehouse | null) => void
  setSelectedItem: (item: StockItem | null) => void
  setSelectedEntry: (entry: StockEntry | null) => void

  // UI Actions
  clearError: () => void
}

// ==========================================
// Default Filters
// ==========================================

const defaultInventoryFilters: InventoryFilterState = {
  search: '',
  warehouseId: 'all',
  itemType: 'all',
  status: 'all',
}

const defaultEntryFilters: StockEntryFilterState = {
  search: '',
  type: 'all',
  status: 'all',
}

// ==========================================
// In-memory Storage
// ==========================================

let warehousesData = [...mockWarehouses]
let stockItemsData = [...mockStockItems]
let stockBalancesData = [...mockStockBalances]
let stockEntriesData = [...mockStockEntries]

// ==========================================
// Store Implementation
// ==========================================

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial State
  warehouses: [],
  stockItems: [],
  stockBalances: [],
  stockEntries: [],
  selectedWarehouse: null,
  selectedItem: null,
  selectedEntry: null,
  isLoading: false,
  error: null,
  inventoryFilters: defaultInventoryFilters,
  entryFilters: defaultEntryFilters,

  // ==========================================
  // Warehouse Actions
  // ==========================================

  fetchWarehouses: async () => {
    set({ isLoading: true, error: null })
    try {
      await delay(300)
      set({ warehouses: warehousesData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถโหลดข้อมูลคลังสินค้าได้', isLoading: false })
    }
  },

  createWarehouse: async (input: CreateWarehouseInput) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const newWarehouse: Warehouse = {
        ...input,
        id: generateId(),
        status: 'ACTIVE',
        isQuarantine: input.isQuarantine ?? false,
        isDefault: input.isDefault ?? false,
        temperatureControlled: input.temperatureControlled ?? false,
        currentStock: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      warehousesData = [...warehousesData, newWarehouse]
      set({ warehouses: warehousesData, isLoading: false })
      return newWarehouse
    } catch {
      set({ error: 'ไม่สามารถสร้างคลังสินค้าได้', isLoading: false })
      throw new Error('Failed to create warehouse')
    }
  },

  updateWarehouse: async (id: string, input: Partial<CreateWarehouseInput>) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = warehousesData.findIndex(w => w.id === id)
      if (index === -1) throw new Error('Warehouse not found')

      const updated: Warehouse = {
        ...warehousesData[index],
        ...input,
        updatedAt: new Date().toISOString(),
      }
      warehousesData = [
        ...warehousesData.slice(0, index),
        updated,
        ...warehousesData.slice(index + 1),
      ]
      set({ warehouses: warehousesData, isLoading: false })
      return updated
    } catch {
      set({ error: 'ไม่สามารถอัพเดทคลังสินค้าได้', isLoading: false })
      throw new Error('Failed to update warehouse')
    }
  },

  // ==========================================
  // Stock Item Actions
  // ==========================================

  fetchStockItems: async () => {
    set({ isLoading: true, error: null })
    try {
      await delay(300)
      set({ stockItems: stockItemsData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถโหลดข้อมูลสินค้าได้', isLoading: false })
    }
  },

  createStockItem: async (input: CreateStockItemInput) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const newItem: StockItem = {
        ...input,
        id: generateId(),
        hasBatch: input.hasBatch ?? false,
        hasExpiry: input.hasExpiry ?? false,
        requiresQC: input.requiresQC ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      stockItemsData = [...stockItemsData, newItem]
      set({ stockItems: stockItemsData, isLoading: false })
      return newItem
    } catch {
      set({ error: 'ไม่สามารถสร้างรายการสินค้าได้', isLoading: false })
      throw new Error('Failed to create stock item')
    }
  },

  updateStockItem: async (id: string, input: Partial<CreateStockItemInput>) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = stockItemsData.findIndex(i => i.id === id)
      if (index === -1) throw new Error('Item not found')

      const updated: StockItem = {
        ...stockItemsData[index],
        ...input,
        updatedAt: new Date().toISOString(),
      }
      stockItemsData = [
        ...stockItemsData.slice(0, index),
        updated,
        ...stockItemsData.slice(index + 1),
      ]
      set({ stockItems: stockItemsData, isLoading: false })
      return updated
    } catch {
      set({ error: 'ไม่สามารถอัพเดทรายการสินค้าได้', isLoading: false })
      throw new Error('Failed to update stock item')
    }
  },

  // ==========================================
  // Stock Balance Actions
  // ==========================================

  fetchStockBalances: async () => {
    set({ isLoading: true, error: null })
    try {
      await delay(300)
      set({ stockBalances: stockBalancesData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถโหลดข้อมูลยอดคงเหลือได้', isLoading: false })
    }
  },

  getItemBalance: (itemId: string) => {
    return stockBalancesData.filter(b => b.itemId === itemId)
  },

  // ==========================================
  // Stock Entry Actions
  // ==========================================

  fetchStockEntries: async () => {
    set({ isLoading: true, error: null })
    try {
      await delay(300)
      set({ stockEntries: stockEntriesData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถโหลดข้อมูลใบรับ/จ่ายได้', isLoading: false })
    }
  },

  createStockEntry: async (input: CreateStockEntryInput) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const entryCount = stockEntriesData.length + 1
      const code = `SE-2026-${entryCount.toString().padStart(4, '0')}`

      // Check if any item requires QC
      const hasQCRequired = input.items.some(item => {
        const stockItem = stockItemsData.find(si => si.id === item.itemId)
        return stockItem?.requiresQC || false
      })

      const newEntry: StockEntry = {
        id: generateId(),
        code,
        type: input.type,
        status: 'DRAFT',
        postingDate: input.postingDate,
        postingTime: new Date().toTimeString().slice(0, 5),
        sourceDocType: input.sourceDocType,
        sourceDocId: input.sourceDocId,
        items: input.items.map((item, idx) => ({
          id: generateId(),
          lineNo: idx + 1,
          itemId: item.itemId,
          qty: item.qty,
          uom: item.uom,
          batchNo: item.batchNo,
          fromWarehouseId: item.fromWarehouseId,
          toWarehouseId: item.toWarehouseId,
          mfgDate: item.mfgDate,
          expDate: item.expDate,
          unitCost: item.unitCost,
          totalCost: item.unitCost ? item.unitCost * item.qty : undefined,
        })),
        remarks: input.remarks,
        isQCRequired: hasQCRequired,
        createdBy: 'ระบบ',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      stockEntriesData = [...stockEntriesData, newEntry]
      set({ stockEntries: stockEntriesData, isLoading: false })
      return newEntry
    } catch {
      set({ error: 'ไม่สามารถสร้างใบรับ/จ่ายได้', isLoading: false })
      throw new Error('Failed to create stock entry')
    }
  },

  submitStockEntry: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = stockEntriesData.findIndex(e => e.id === id)
      if (index === -1) throw new Error('Entry not found')

      const entry = stockEntriesData[index]
      const updated: StockEntry = {
        ...entry,
        status: 'SUBMITTED',
        updatedAt: new Date().toISOString(),
      }

      // Update stock balances based on entry type
      for (const item of entry.items) {
        if (entry.type === 'RECEIVE' && item.toWarehouseId) {
          // Add stock
          const newBalance: StockBalance = {
            id: generateId(),
            itemId: item.itemId,
            warehouseId: item.toWarehouseId,
            batchNo: item.batchNo,
            qty: item.qty,
            uom: item.uom,
            mfgDate: item.mfgDate,
            expDate: item.expDate,
            status: 'AVAILABLE',
            lastUpdated: new Date().toISOString(),
          }
          stockBalancesData = [...stockBalancesData, newBalance]
        } else if (entry.type === 'ISSUE' && item.fromWarehouseId) {
          // Deduct stock (simplified - in real app, need FIFO/LIFO logic)
          const balanceIndex = stockBalancesData.findIndex(
            b => b.itemId === item.itemId &&
                 b.warehouseId === item.fromWarehouseId &&
                 (!item.batchNo || b.batchNo === item.batchNo)
          )
          if (balanceIndex !== -1) {
            stockBalancesData[balanceIndex] = {
              ...stockBalancesData[balanceIndex],
              qty: stockBalancesData[balanceIndex].qty - item.qty,
              lastUpdated: new Date().toISOString(),
            }
          }
        }
      }

      stockEntriesData = [
        ...stockEntriesData.slice(0, index),
        updated,
        ...stockEntriesData.slice(index + 1),
      ]
      set({
        stockEntries: stockEntriesData,
        stockBalances: [...stockBalancesData],
        isLoading: false,
      })
      return updated
    } catch {
      set({ error: 'ไม่สามารถยืนยันใบรับ/จ่ายได้', isLoading: false })
      throw new Error('Failed to submit stock entry')
    }
  },

  cancelStockEntry: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)
      const index = stockEntriesData.findIndex(e => e.id === id)
      if (index === -1) throw new Error('Entry not found')

      const updated: StockEntry = {
        ...stockEntriesData[index],
        status: 'CANCELLED',
        updatedAt: new Date().toISOString(),
      }
      stockEntriesData = [
        ...stockEntriesData.slice(0, index),
        updated,
        ...stockEntriesData.slice(index + 1),
      ]
      set({ stockEntries: stockEntriesData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถยกเลิกใบรับ/จ่ายได้', isLoading: false })
    }
  },

  // ==========================================
  // Filter Actions
  // ==========================================

  setInventoryFilters: (filters: Partial<InventoryFilterState>) => {
    set(state => ({
      inventoryFilters: { ...state.inventoryFilters, ...filters },
    }))
  },

  setEntryFilters: (filters: Partial<StockEntryFilterState>) => {
    set(state => ({
      entryFilters: { ...state.entryFilters, ...filters },
    }))
  },

  resetFilters: () => {
    set({
      inventoryFilters: defaultInventoryFilters,
      entryFilters: defaultEntryFilters,
    })
  },

  // ==========================================
  // Selection Actions
  // ==========================================

  setSelectedWarehouse: (warehouse: Warehouse | null) => {
    set({ selectedWarehouse: warehouse })
  },

  setSelectedItem: (item: StockItem | null) => {
    set({ selectedItem: item })
  },

  setSelectedEntry: (entry: StockEntry | null) => {
    set({ selectedEntry: entry })
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

export function useFilteredStockItems() {
  const { stockItems, stockBalances, inventoryFilters } = useInventoryStore()

  return stockItems.filter(item => {
    // Search filter
    if (inventoryFilters.search) {
      const search = inventoryFilters.search.toLowerCase()
      const matchCode = item.code.toLowerCase().includes(search)
      const matchName = item.name.toLowerCase().includes(search)
      if (!matchCode && !matchName) return false
    }

    // Item type filter
    if (inventoryFilters.itemType !== 'all' && item.type !== inventoryFilters.itemType) {
      return false
    }

    // Warehouse filter
    if (inventoryFilters.warehouseId !== 'all') {
      const hasBalance = stockBalances.some(
        b => b.itemId === item.id && b.warehouseId === inventoryFilters.warehouseId
      )
      if (!hasBalance) return false
    }

    // Status filter
    if (inventoryFilters.status === 'low_stock' && !isLowStock(item)) {
      return false
    }

    return true
  })
}

export function useStockItemsWithBalance(): StockItemWithBalance[] {
  const { stockItems, stockBalances } = useInventoryStore()

  return stockItems.map(item => {
    const balances = stockBalances.filter(b => b.itemId === item.id)
    const totalQty = balances
      .filter(b => b.status === 'AVAILABLE')
      .reduce((sum, b) => sum + b.qty, 0)

    const expiringBalances = balances.filter(b => {
      if (!b.expDate) return false
      const expDate = new Date(b.expDate)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() + 7)
      return expDate <= cutoff && b.status === 'AVAILABLE'
    })

    return {
      ...item,
      totalQty,
      balances,
      isLowStock: item.minStock !== undefined && totalQty < item.minStock,
      isExpiringSoon: expiringBalances.length > 0,
    }
  })
}

export function useWarehousesWithStock(): WarehouseWithStock[] {
  const { warehouses, stockBalances, stockItems } = useInventoryStore()

  return warehouses.map(warehouse => {
    const balances = stockBalances.filter(b => b.warehouseId === warehouse.id)
    const uniqueItems = new Set(balances.map(b => b.itemId))

    // Calculate total value
    let totalValue = 0
    let lowStockItems = 0
    let expiringItems = 0

    balances.forEach(balance => {
      const item = stockItems.find(i => i.id === balance.itemId)
      if (item) {
        totalValue += balance.qty * item.costPerUnit

        // Check low stock
        const totalQty = getTotalStock(item.id)
        if (item.minStock !== undefined && totalQty < item.minStock) {
          lowStockItems++
        }

        // Check expiring
        if (balance.expDate) {
          const expDate = new Date(balance.expDate)
          const cutoff = new Date()
          cutoff.setDate(cutoff.getDate() + 7)
          if (expDate <= cutoff) {
            expiringItems++
          }
        }
      }
    })

    return {
      ...warehouse,
      stockCount: uniqueItems.size,
      totalValue,
      lowStockItems,
      expiringItems,
    }
  })
}
