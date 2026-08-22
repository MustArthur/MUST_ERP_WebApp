// Factory Expense Types

export type ExpenseCategory = 'LOGISTICS' | 'MAINTENANCE' | 'FACTORY_SUPPLIES' | 'PROJECT'

export type ExpenseSubcategory =
    | 'FUEL'                     // Logistics: ค่าน้ำมันรถขนส่ง
    | 'VEHICLE_GENERAL'          // Logistics: ค่าใช้จ่ายทั่วไป (ทางด่วน/บำรุงรักษารถ/ภาษี)
    | 'FRESH_LOGISTICS'          // Logistics: ค่าขนส่ง Fresh Logistics (ระบุจำนวนเงินอย่างเดียว)
    | 'SPARE_PARTS'              // Maintenance: ค่าอะไหล่
    | 'CORRECTIVE_MAINTENANCE'   // Maintenance: ค่าซ่อมเครื่องจักร
    | 'PREVENTIVE_MAINTENANCE'   // Maintenance: ค่าบำรุงรักษาเครื่องจักรตามรอบ
    | 'FACTORY_SUPPLIES'         // Factory Supplies: วัสดุของใช้สิ้นเปลืองในโรงงาน
    | 'MACHINE_INSTALLATION'     // Project: ค่าติดตั้งเครื่องจักร
    | 'STAFF_MEALS'              // Project: ค่าอาหารพนักงาน

export interface FactoryExpense {
    id: string
    code: string
    category: ExpenseCategory
    subcategory: ExpenseSubcategory
    expenseDate: string
    amount: number
    description: string | null
    vehicleId: string | null
    vehicleName?: string
    fuelType: string | null
    fuelQuantityLiters: number | null
    fuelPricePerLiter: number | null
    machineId: string | null
    machineName?: string
    recordedBy: string | null
    createdAt: string
    updatedAt: string
}

export interface CreateFactoryExpenseInput {
    code: string
    category: ExpenseCategory
    subcategory: ExpenseSubcategory
    expenseDate: string
    amount: number
    description?: string
    vehicleId?: string
    fuelType?: string
    fuelQuantityLiters?: number
    fuelPricePerLiter?: number
    machineId?: string
    recordedBy?: string
}

export interface UpdateFactoryExpenseInput {
    category?: ExpenseCategory
    subcategory?: ExpenseSubcategory
    expenseDate?: string
    amount?: number
    description?: string
    vehicleId?: string | null
    fuelType?: string
    fuelQuantityLiters?: number
    fuelPricePerLiter?: number
    machineId?: string | null
    recordedBy?: string
}

export interface FactoryExpenseFilters {
    search: string
    category: 'all' | ExpenseCategory
    subcategory: 'all' | ExpenseSubcategory
}
