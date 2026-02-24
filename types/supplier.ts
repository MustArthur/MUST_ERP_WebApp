// Supplier Types
export interface Supplier {
    id: string
    code: string
    name: string
    contactName: string | null
    phone: string | null
    email: string | null
    address: string | null
    taxId: string | null
    paymentTerms: number
    isActive: boolean
    purchaser: string | null
    createdAt: string
    updatedAt: string
}

export interface CreateSupplierInput {
    code: string
    name: string
    contactName?: string
    phone?: string
    email?: string
    address?: string
    taxId?: string
    paymentTerms?: number
    purchaser?: string
}

export interface UpdateSupplierInput {
    name?: string
    contactName?: string
    phone?: string
    email?: string
    address?: string
    taxId?: string
    paymentTerms?: number
    isActive?: boolean
    purchaser?: string
}

export interface SupplierFilters {
    search: string
    status: 'all' | 'active' | 'inactive'
}
