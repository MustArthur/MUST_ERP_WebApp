import { create } from 'zustand'
import {
    InventoryTransaction,
    CreateTransactionInput,
    TransactionFilters,
    TransactionType
} from '@/types/inventory-transaction'
import {
    getAllTransactions,
    createTransaction,
    getTransactionStats,
    getWarehouses,
    getLocationsByWarehouse,
    getItemsForTransaction,
    getLotsByItem,
    getStockBalance
} from '@/lib/api/inventory-transactions'
import { useInventoryStore } from './inventory-store'
import { useItemsStore } from './items-store'

interface TransactionStats {
    todayIn: number
    todayOut: number
    weekIn: number
    weekOut: number
}

interface Warehouse {
    id: string
    code: string
    name: string
}

interface Location {
    id: string
    code: string
    name: string
}

interface Item {
    id: string
    code: string
    name: string
    baseUomId: string
    baseUomCode: string
}

interface Lot {
    id: string
    lotNumber: string
    expiryDate?: string
    qty: number
}

interface TransactionsState {
    // Data
    transactions: InventoryTransaction[]
    stats: TransactionStats
    warehouses: Warehouse[]
    locations: Record<string, Location[]>
    items: Item[]
    lots: Record<string, Lot[]>

    // UI State
    isLoading: boolean
    error: string | null
    filters: TransactionFilters

    // Actions
    fetchTransactions: () => Promise<void>
    fetchStats: () => Promise<void>
    fetchWarehouses: () => Promise<void>
    fetchLocations: (warehouseId: string) => Promise<void>
    fetchItems: () => Promise<void>
    fetchLots: (itemId: string) => Promise<void>
    createTransaction: (input: CreateTransactionInput) => Promise<InventoryTransaction | null>
    setFilters: (filters: Partial<TransactionFilters>) => void
    resetFilters: () => void
    currentStock: number
    fetchStockBalance: (itemId: string, warehouseId: string, locationId?: string | null) => Promise<void>
}

const defaultFilters: TransactionFilters = {
    search: '',
    transactionType: 'all',
    warehouseId: 'all',
    dateFrom: '',
    dateTo: '',
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
    // Initial state
    transactions: [],
    stats: { todayIn: 0, todayOut: 0, weekIn: 0, weekOut: 0 },
    warehouses: [],
    locations: {},
    items: [],
    lots: {},
    isLoading: false,
    error: null,
    filters: defaultFilters,

    // Fetch all transactions
    fetchTransactions: async () => {
        set({ isLoading: true, error: null })
        try {
            const transactions = await getAllTransactions()
            set({ transactions, isLoading: false })
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
        }
    },

    // Fetch stats
    fetchStats: async () => {
        try {
            const stats = await getTransactionStats()
            set({ stats })
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    },

    // Fetch warehouses
    fetchWarehouses: async () => {
        try {
            const warehouses = await getWarehouses()
            set({ warehouses })
        } catch (error) {
            console.error('Error fetching warehouses:', error)
        }
    },

    // Fetch locations by warehouse
    fetchLocations: async (warehouseId: string) => {
        try {
            const locationsList = await getLocationsByWarehouse(warehouseId)
            set(state => ({
                locations: { ...state.locations, [warehouseId]: locationsList }
            }))
        } catch (error) {
            console.error('Error fetching locations:', error)
        }
    },

    // Fetch items
    fetchItems: async () => {
        try {
            const items = await getItemsForTransaction()
            set({ items })
        } catch (error) {
            console.error('Error fetching items:', error)
        }
    },

    // Fetch lots by item
    fetchLots: async (itemId: string) => {
        try {
            const lotsList = await getLotsByItem(itemId)
            set(state => ({
                lots: { ...state.lots, [itemId]: lotsList }
            }))
        } catch (error) {
            console.error('Error fetching lots:', error)
        }
    },

    // Create transaction
    createTransaction: async (input: CreateTransactionInput) => {
        set({ isLoading: true, error: null })
        try {
            const newTransaction = await createTransaction(input)
            if (newTransaction) {
                // Refetch transactions and stats
                const [transactions, stats] = await Promise.all([
                    getAllTransactions(),
                    getTransactionStats()
                ])
                set({ transactions, stats, isLoading: false })

                // Sync with Inventory Store - update stock balances
                useInventoryStore.getState().fetchStockBalances()

                // Sync with Items Store - update stock quantities in items list
                useItemsStore.getState().fetchItems()
            }
            return newTransaction
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Set filters
    setFilters: (filters: Partial<TransactionFilters>) => {
        set(state => ({
            filters: { ...state.filters, ...filters }
        }))
    },

    // Reset filters
    resetFilters: () => {
        set({ filters: defaultFilters })
    },

    // Current Stock State
    currentStock: 0,
    fetchStockBalance: async (itemId: string, warehouseId: string, locationId?: string | null) => {
        if (!itemId || !warehouseId) {
            set({ currentStock: 0 })
            return
        }
        try {
            const stock = await getStockBalance(itemId, warehouseId, locationId)
            set({ currentStock: stock })
        } catch (error) {
            console.error('Error fetching stock balance:', error)
            set({ currentStock: 0 })
        }
    }
}))
