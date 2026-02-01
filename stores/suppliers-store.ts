import { create } from 'zustand'
import { Supplier, CreateSupplierInput, UpdateSupplierInput, SupplierFilters } from '@/types/supplier'
import { getAllSuppliersWithItems, SupplierWithItems, createSupplier, updateSupplier, deleteSupplier } from '@/lib/api/suppliers'

interface SuppliersState {
    // Data
    suppliers: SupplierWithItems[]

    // UI State
    isLoading: boolean
    error: string | null
    filters: SupplierFilters

    // Actions
    fetchSuppliers: () => Promise<void>
    createSupplier: (input: CreateSupplierInput) => Promise<Supplier | null>
    updateSupplier: (id: string, input: UpdateSupplierInput) => Promise<Supplier | null>
    deleteSupplier: (id: string) => Promise<boolean>
    setFilters: (filters: Partial<SupplierFilters>) => void
    resetFilters: () => void
}

const defaultFilters: SupplierFilters = {
    search: '',
    status: 'all',
}

export const useSuppliersStore = create<SuppliersState>((set, get) => ({
    // Initial state
    suppliers: [],
    isLoading: false,
    error: null,
    filters: defaultFilters,

    // Fetch all suppliers with items
    fetchSuppliers: async () => {
        set({ isLoading: true, error: null })
        try {
            const suppliers = await getAllSuppliersWithItems()
            set({ suppliers, isLoading: false })
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
        }
    },

    // Create supplier
    createSupplier: async (input: CreateSupplierInput) => {
        set({ isLoading: true, error: null })
        try {
            const newSupplier = await createSupplier(input)
            // Refetch to get updated list with items
            const suppliers = await getAllSuppliersWithItems()
            set({ suppliers, isLoading: false })
            return newSupplier
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Update supplier
    updateSupplier: async (id: string, input: UpdateSupplierInput) => {
        set({ isLoading: true, error: null })
        try {
            const updatedSupplier = await updateSupplier(id, input)
            // Refetch to get updated list with items
            const suppliers = await getAllSuppliersWithItems()
            set({ suppliers, isLoading: false })
            return updatedSupplier
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Delete supplier
    deleteSupplier: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
            await deleteSupplier(id)
            set(state => ({
                suppliers: state.suppliers.filter(s => s.id !== id),
                isLoading: false
            }))
            return true
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Set filters
    setFilters: (filters: Partial<SupplierFilters>) => {
        set(state => ({
            filters: { ...state.filters, ...filters }
        }))
    },

    // Reset filters
    resetFilters: () => {
        set({ filters: defaultFilters })
    },
}))
