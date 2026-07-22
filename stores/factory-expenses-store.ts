import { create } from 'zustand'
import {
    FactoryExpense,
    CreateFactoryExpenseInput,
    UpdateFactoryExpenseInput,
    FactoryExpenseFilters,
} from '@/types/factory-expense'
import { getAllExpenses, createExpense, updateExpense, deleteExpense } from '@/lib/api/factory-expenses'
import { supabase } from '@/lib/supabase'

export interface ExpenseVehicleOption {
    id: string
    name: string
}

export interface ExpenseMachineOption {
    id: string
    name: string
}

interface FactoryExpensesState {
    // Data
    expenses: FactoryExpense[]
    vehicles: ExpenseVehicleOption[]
    machines: ExpenseMachineOption[]

    // UI State
    isLoading: boolean
    error: string | null
    filters: FactoryExpenseFilters

    // Actions
    fetchExpenses: () => Promise<void>
    fetchVehicles: () => Promise<void>
    fetchMachines: () => Promise<void>
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
            .select('id, name')
            .eq('is_active', true)
            .order('name')

        if (error) {
            console.error('Error fetching vehicles:', error)
            return
        }
        set({ vehicles: data || [] })
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
