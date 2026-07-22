// Vehicle Types
export interface Vehicle {
    id: string
    code: string
    plateNumber: string | null
    name: string
    vehicleType: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateVehicleInput {
    code: string
    plateNumber?: string
    name: string
    vehicleType?: string
}

export interface UpdateVehicleInput {
    plateNumber?: string
    name?: string
    vehicleType?: string
    isActive?: boolean
}

export interface VehicleFilters {
    search: string
    status: 'all' | 'active' | 'inactive'
}
