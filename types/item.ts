// Item Types
export interface Item {
    id: string
    code: string
    name: string
    categoryId: string
    categoryCode: string
    categoryName: string
    baseUomId: string
    baseUomCode: string
    baseUomName: string
    lastPurchaseCost: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface Category {
    id: string
    code: string
    name: string
}

export interface UnitOfMeasure {
    id: string
    code: string
    name: string
}

export interface CreateItemInput {
    code: string
    name: string
    categoryId: string
    baseUomId: string
    lastPurchaseCost?: number
}

export interface UpdateItemInput {
    name?: string
    categoryId?: string
    baseUomId?: string
    lastPurchaseCost?: number
    isActive?: boolean
}

export type ItemType = 'RAW_MATERIAL' | 'FINISHED_GOOD' | 'PACKAGING' | 'ALL'

export interface ItemFilters {
    search: string
    type: ItemType
    categoryId: string
}

// Item Supplier relationship
export interface ItemSupplier {
    id: string
    itemId: string
    supplierId: string
    supplierCode: string
    supplierName: string
    supplierPartNumber: string | null
    purchasePrice: number
    purchaseUomId: string | null
    purchaseUomCode: string | null
    purchaseUomName: string | null
    leadTimeDays: number
    minOrderQty: number
    isPreferred: boolean
    isActive: boolean
}

export interface CreateItemSupplierInput {
    itemId: string
    supplierId: string
    supplierPartNumber?: string
    purchasePrice?: number
    purchaseUomId?: string
    leadTimeDays?: number
    minOrderQty?: number
    isPreferred?: boolean
}

export interface UpdateItemSupplierInput {
    supplierPartNumber?: string
    purchasePrice?: number
    purchaseUomId?: string
    leadTimeDays?: number
    minOrderQty?: number
    isPreferred?: boolean
    isActive?: boolean
}
