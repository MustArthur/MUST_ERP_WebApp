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
        } catch (error: any) {
            console.error('Fetch items error:', error)
            set({ error: error?.message || 'ไม่สามารถโหลดข้อมูลสินค้าได้', isLoading: false })
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
            set(state => ({
                items: newItem ? [...state.items, newItem] : state.items,
                isLoading: false,
            }))
            return newItem
        } catch (error: any) {
            console.error('Create item error:', error)
            set({ error: error?.message || 'ไม่สามารถสร้างสินค้าได้', isLoading: false })
            throw new Error(error?.message || 'ไม่สามารถสร้างสินค้าได้')
        }
    },

    // Update item
    updateItem: async (id: string, input: UpdateItemInput) => {
        set({ isLoading: true, error: null })
        try {
            const updatedItem = await updateItem(id, input)
            set(state => ({
                items: updatedItem
                    ? state.items.map(item => item.id === id ? updatedItem : item)
                    : state.items,
                isLoading: false,
            }))
            return updatedItem
        } catch (error: any) {
            console.error('Update item error:', error)
            set({ error: error?.message || 'ไม่สามารถแก้ไขสินค้าได้', isLoading: false })
            throw new Error(error?.message || 'ไม่สามารถแก้ไขสินค้าได้')
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
        } catch (error: any) {
            console.error('Delete item error:', error)
            set({ error: error?.message || 'ไม่สามารถลบสินค้าได้', isLoading: false })
            throw new Error(error?.message || 'ไม่สามารถลบสินค้าได้')
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
