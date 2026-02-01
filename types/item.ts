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
