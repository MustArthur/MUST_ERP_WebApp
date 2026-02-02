// Inventory Transaction Types

export type TransactionType =
    | 'RECEIVE'           // รับเข้าจากซัพพลายเออร์
    | 'ISSUE'             // เบิกออก
    | 'TRANSFER'          // โอนย้าย
    | 'ADJUST_IN'         // ปรับเพิ่ม
    | 'ADJUST_OUT'        // ปรับลด
    | 'PRODUCTION_IN'     // รับจากการผลิต
    | 'PRODUCTION_OUT'    // เบิกไปผลิต
    | 'SCRAP'             // ของเสีย
    | 'RETURN'            // คืนของ

export interface InventoryTransaction {
    id: string
    transactionNo: string
    transactionType: TransactionType
    transactionDate: string
    itemId: string
    itemCode: string
    itemName: string
    lotId?: string
    lotNumber?: string
    fromWarehouseId?: string
    fromWarehouseName?: string
    fromLocationId?: string
    fromLocationName?: string
    toWarehouseId?: string
    toWarehouseName?: string
    toLocationId?: string
    toLocationName?: string
    qty: number
    uomId: string
    uomCode: string
    unitCost: number
    totalCost: number
    referenceType?: string
    referenceId?: string
    referenceNo?: string
    notes?: string
    createdBy?: string
    createdByName?: string
    createdAt: string
}

export interface CreateTransactionInput {
    transactionType: TransactionType
    itemId: string
    lotId?: string
    lotNumber?: string
    expiryDate?: string
    fromWarehouseId?: string
    fromLocationId?: string
    toWarehouseId?: string
    toLocationId?: string
    qty: number
    uomId?: string
    unitCost?: number
    referenceType?: string
    referenceId?: string
    notes?: string
}

export interface TransactionFilters {
    search: string
    transactionType: TransactionType | 'all'
    warehouseId: string | 'all'
    dateFrom: string
    dateTo: string
}

// Transaction type labels (Thai)
export const transactionTypeLabels: Record<TransactionType, string> = {
    RECEIVE: 'รับเข้า',
    ISSUE: 'เบิกออก',
    TRANSFER: 'โอนย้าย',
    ADJUST_IN: 'ปรับเพิ่ม',
    ADJUST_OUT: 'ปรับลด',
    PRODUCTION_IN: 'รับจากผลิต',
    PRODUCTION_OUT: 'เบิกไปผลิต',
    SCRAP: 'ของเสีย',
    RETURN: 'คืนของ',
}

// Transaction type colors
export const transactionTypeColors: Record<TransactionType, { bg: string; text: string }> = {
    RECEIVE: { bg: 'bg-green-100', text: 'text-green-800' },
    ISSUE: { bg: 'bg-red-100', text: 'text-red-800' },
    TRANSFER: { bg: 'bg-blue-100', text: 'text-blue-800' },
    ADJUST_IN: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    ADJUST_OUT: { bg: 'bg-orange-100', text: 'text-orange-800' },
    PRODUCTION_IN: { bg: 'bg-purple-100', text: 'text-purple-800' },
    PRODUCTION_OUT: { bg: 'bg-violet-100', text: 'text-violet-800' },
    SCRAP: { bg: 'bg-gray-100', text: 'text-gray-800' },
    RETURN: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
}
