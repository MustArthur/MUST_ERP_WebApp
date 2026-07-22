import { create } from 'zustand'
import { Machine, CreateMachineInput, UpdateMachineInput, MachineFilters } from '@/types/machine'
import { getAllMachines, createMachine, updateMachine, deleteMachine } from '@/lib/api/machines'

interface MachinesState {
    // Data
    machines: Machine[]

    // UI State
    isLoading: boolean
    error: string | null
    filters: MachineFilters

    // Actions
    fetchMachines: () => Promise<void>
    createMachine: (input: CreateMachineInput) => Promise<Machine | null>
    updateMachine: (id: string, input: UpdateMachineInput) => Promise<Machine | null>
    deleteMachine: (id: string) => Promise<boolean>
    setFilters: (filters: Partial<MachineFilters>) => void
    resetFilters: () => void
}

const defaultFilters: MachineFilters = {
    search: '',
    status: 'all',
}

export const useMachinesStore = create<MachinesState>((set, get) => ({
    // Initial state
    machines: [],
    isLoading: false,
    error: null,
    filters: defaultFilters,

    // Fetch all machines
    fetchMachines: async () => {
        set({ isLoading: true, error: null })
        try {
            const machines = await getAllMachines()
            set({ machines, isLoading: false })
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
        }
    },

    // Create machine
    createMachine: async (input: CreateMachineInput) => {
        set({ isLoading: true, error: null })
        try {
            const newMachine = await createMachine(input)
            const machines = await getAllMachines()
            set({ machines, isLoading: false })
            return newMachine
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Update machine
    updateMachine: async (id: string, input: UpdateMachineInput) => {
        set({ isLoading: true, error: null })
        try {
            const updatedMachine = await updateMachine(id, input)
            const machines = await getAllMachines()
            set({ machines, isLoading: false })
            return updatedMachine
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Delete machine
    deleteMachine: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
            await deleteMachine(id)
            set(state => ({
                machines: state.machines.filter(m => m.id !== id),
                isLoading: false
            }))
            return true
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Set filters
    setFilters: (filters: Partial<MachineFilters>) => {
        set(state => ({
            filters: { ...state.filters, ...filters }
        }))
    },

    // Reset filters
    resetFilters: () => {
        set({ filters: defaultFilters })
    },
}))
