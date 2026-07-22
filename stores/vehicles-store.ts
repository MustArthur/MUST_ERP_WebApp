import { create } from 'zustand'
import { Vehicle, CreateVehicleInput, UpdateVehicleInput, VehicleFilters } from '@/types/vehicle'
import { getAllVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/lib/api/vehicles'

interface VehiclesState {
    // Data
    vehicles: Vehicle[]

    // UI State
    isLoading: boolean
    error: string | null
    filters: VehicleFilters

    // Actions
    fetchVehicles: () => Promise<void>
    createVehicle: (input: CreateVehicleInput) => Promise<Vehicle | null>
    updateVehicle: (id: string, input: UpdateVehicleInput) => Promise<Vehicle | null>
    deleteVehicle: (id: string) => Promise<boolean>
    setFilters: (filters: Partial<VehicleFilters>) => void
    resetFilters: () => void
}

const defaultFilters: VehicleFilters = {
    search: '',
    status: 'all',
}

export const useVehiclesStore = create<VehiclesState>((set, get) => ({
    // Initial state
    vehicles: [],
    isLoading: false,
    error: null,
    filters: defaultFilters,

    // Fetch all vehicles
    fetchVehicles: async () => {
        set({ isLoading: true, error: null })
        try {
            const vehicles = await getAllVehicles()
            set({ vehicles, isLoading: false })
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
        }
    },

    // Create vehicle
    createVehicle: async (input: CreateVehicleInput) => {
        set({ isLoading: true, error: null })
        try {
            const newVehicle = await createVehicle(input)
            const vehicles = await getAllVehicles()
            set({ vehicles, isLoading: false })
            return newVehicle
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Update vehicle
    updateVehicle: async (id: string, input: UpdateVehicleInput) => {
        set({ isLoading: true, error: null })
        try {
            const updatedVehicle = await updateVehicle(id, input)
            const vehicles = await getAllVehicles()
            set({ vehicles, isLoading: false })
            return updatedVehicle
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Delete vehicle
    deleteVehicle: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
            await deleteVehicle(id)
            set(state => ({
                vehicles: state.vehicles.filter(v => v.id !== id),
                isLoading: false
            }))
            return true
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false })
            throw error
        }
    },

    // Set filters
    setFilters: (filters: Partial<VehicleFilters>) => {
        set(state => ({
            filters: { ...state.filters, ...filters }
        }))
    },

    // Reset filters
    resetFilters: () => {
        set({ filters: defaultFilters })
    },
}))
