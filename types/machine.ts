// Machine Types
export interface Machine {
    id: string
    code: string
    name: string
    location: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateMachineInput {
    code: string
    name: string
    location?: string
}

export interface UpdateMachineInput {
    name?: string
    location?: string
    isActive?: boolean
}

export interface MachineFilters {
    search: string
    status: 'all' | 'active' | 'inactive'
}
