import { create } from 'zustand'
import {
    Item,
    Category,
    UnitOfMeasure,
    CreateItemInput,
    UpdateItemInput,
    ItemFilters
} from '@/types/item'
import {
    getAllItems,
    createItem,
    updateItem,
    deleteItem,
    getCategories,
    getUnitsOfMeasure
} from '@/lib/api/items'

interface ItemsState {
    // Data
    items: Item[]
    categories: Category[]
    uoms: UnitOfMeasure[]

    // UI State
    isLoading: boolean
    error: string | null
    filters: ItemFilters

    // Actions
    fetchItems: () => Promise<void>
    fetchCategories: () => Promise<void>
    fetchUOMs: () => Promise<void>
    createItem: (input: CreateItemInput) => Promise<Item | null>
    updateItem: (id: string, input: UpdateItemInput) => Promise<Item | null>
    deleteItem: (id: string) => Promise<boolean>
    setFilters: (filters: Partial<ItemFilters>) => void
    resetFilters: () => void
}

const defaultFilters: ItemFilters = {
    search: '',
    type: 'ALL',
    categoryId: '',
}

export const useItemsStore = create<ItemsState>((set, get) => ({
    // Initial state
    items: [],
    categories: [],
    uoms: [],
    isLoading: false,
    error: null,
    filters: defaultFilters,

    // Fetch all items
    fetchItems: async () => {
        set({ isLoading: true, error: null })
        try {
            const items = await getAllItems()
            set({ items, isLoading: false })
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
        }
    },

    // Fetch categories
    fetchCategories: async () => {
        try {
            const categories = await getCategories()
            set({ categories })
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    },

    // Fetch units of measure
    fetchUOMs: async () => {
        try {
            const uoms = await getUnitsOfMeasure()
            set({ uoms })
        } catch (error) {
            console.error('Error fetching UOMs:', error)
        }
    },

    // Create item
    createItem: async (input: CreateItemInput) => {
        set({ isLoading: true, error: null })
        try {
            const newItem = await createItem(input)
            if (newItem) {
                set(state => ({
                    items: [...state.items, newItem],
                    isLoading: false
                }))
            }
            return newItem
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Update item
    updateItem: async (id: string, input: UpdateItemInput) => {
        set({ isLoading: true, error: null })
        try {
            const updatedItem = await updateItem(id, input)
            if (updatedItem) {
                set(state => ({
                    items: state.items.map(item =>
                        item.id === id ? updatedItem : item
                    ),
                    isLoading: false
                }))
            }
            return updatedItem
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Delete item
    deleteItem: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
            await deleteItem(id)
            set(state => ({
                items: state.items.filter(item => item.id !== id),
                isLoading: false
            }))
            return true
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Set filters
    setFilters: (filters: Partial<ItemFilters>) => {
        set(state => ({
            filters: { ...state.filters, ...filters }
        }))
    },

    // Reset filters
    resetFilters: () => {
        set({ filters: defaultFilters })
    },
}))
