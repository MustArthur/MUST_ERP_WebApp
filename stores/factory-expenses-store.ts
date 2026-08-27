import { create } from 'zustand'
import {
    FactoryExpense,
    CreateFactoryExpenseInput,
    UpdateFactoryExpenseInput,
    FactoryExpenseFilters,
    ExpenseCategory,
} from '@/types/factory-expense'
import {
    getAllExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getCustomSubcategories,
    createCustomSubcategory,
} from '@/lib/api/factory-expenses'
import { supabase } from '@/lib/supabase'

export interface ExpenseVehicleOption {
    id: string
    name: string
    plateNumber: string | null
}

export interface ExpenseMachineOption {
    id: string
    name: string
}

export interface ExpenseCustomSubcategoryOption {
    id: string
    name: string
}

interface FactoryExpensesState {
    // Data
    expenses: FactoryExpense[]
    vehicles: ExpenseVehicleOption[]
    machines: ExpenseMachineOption[]
    customSubcategories: Partial<Record<ExpenseCategory, ExpenseCustomSubcategoryOption[]>>

    // UI State
    isLoading: boolean
    error: string | null
    filters: FactoryExpenseFilters

    // Actions
    fetchExpenses: () => Promise<void>
    fetchVehicles: () => Promise<void>
    fetchMachines: () => Promise<void>
    fetchCustomSubcategories: (category: ExpenseCategory) => Promise<void>
    createCustomSubcategory: (category: ExpenseCategory, name: string) => Promise<ExpenseCustomSubcategoryOption | null>
    createExpense: (input: CreateFactoryExpenseInput) => Promise<FactoryExpense | null>
    updateExpense: (id: string, input: UpdateFactoryExpenseInput) => Promise<FactoryExpense | null>
    deleteExpense: (id: string) => Promise<boolean>
    setFilters: (filters: Partial<FactoryExpenseFilters>) => void
    resetFilters: () => void
}

const defaultFilters: FactoryExpenseFilters = {
    search: '',
    category: 'all',
    subcategory: 'all',
}

export const useFactoryExpensesStore = create<FactoryExpensesState>((set, get) => ({
    // Initial state
    expenses: [],
    vehicles: [],
    machines: [],
    customSubcategories: {},
    isLoading: false,
    error: null,
    filters: defaultFilters,

    // Fetch all expenses
    fetchExpenses: async () => {
        set({ isLoading: true, error: null })
        try {
            const expenses = await getAllExpenses()
            set({ expenses, isLoading: false })
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
        }
    },

    // Fetch active vehicles for the create-form dropdown
    fetchVehicles: async () => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('id, name, plate_number')
            .eq('is_active', true)
            .order('name')

        if (error) {
            console.error('Error fetching vehicles:', error)
            return
        }
        set({
            vehicles: (data || []).map(v => ({
                id: v.id,
                name: v.name,
                plateNumber: v.plate_number,
            }))
        })
    },

    // Fetch active machines for the create-form dropdown
    fetchMachines: async () => {
        const { data, error } = await supabase
            .from('machines')
            .select('id, name')
            .eq('is_active', true)
            .order('name')

        if (error) {
            console.error('Error fetching machines:', error)
            return
        }
        set({ machines: data || [] })
    },

    // Fetch a category's custom subcategories (previously user-typed, for the creatable dropdown)
    fetchCustomSubcategories: async (category: ExpenseCategory) => {
        const list = await getCustomSubcategories(category)
        set(state => ({
            customSubcategories: { ...state.customSubcategories, [category]: list },
        }))
    },

    // Create a new custom subcategory for a category (or reuse an existing one with the same name)
    createCustomSubcategory: async (category: ExpenseCategory, name: string) => {
        try {
            const created = await createCustomSubcategory(category, name)
            set(state => {
                const current = state.customSubcategories[category] ?? []
                if (current.some(c => c.id === created.id)) return state
                return {
                    customSubcategories: {
                        ...state.customSubcategories,
                        [category]: [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
                    },
                }
            })
            return created
        } catch (error) {
            set({ error: (error as Error).message })
            throw error
        }
    },

    // Create expense
    createExpense: async (input: CreateFactoryExpenseInput) => {
        set({ isLoading: true, error: null })
        try {
            const newExpense = await createExpense(input)
            const expenses = await getAllExpenses()
            set({ expenses, isLoading: false })
            return newExpense
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Update expense
    updateExpense: async (id: string, input: UpdateFactoryExpenseInput) => {
        set({ isLoading: true, error: null })
        try {
            const updatedExpense = await updateExpense(id, input)
            const expenses = await getAllExpenses()
            set({ expenses, isLoading: false })
            return updatedExpense
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Delete expense
    deleteExpense: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
            await deleteExpense(id)
            set(state => ({
                expenses: state.expenses.filter(e => e.id !== id),
                isLoading: false
            }))
            return true
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Set filters
    setFilters: (filters: Partial<FactoryExpenseFilters>) => {
        set(state => ({
            filters: { ...state.filters, ...filters }
        }))
    },

    // Reset filters
    resetFilters: () => {
        set({ filters: defaultFilters })
    },
}))
