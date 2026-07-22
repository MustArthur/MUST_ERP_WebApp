import { supabase } from '@/lib/supabase'
import { FactoryExpense, CreateFactoryExpenseInput, UpdateFactoryExpenseInput } from '@/types/factory-expense'

function mapExpense(e: any): FactoryExpense {
    return {
        id: e.id,
        code: e.code,
        category: e.category,
        subcategory: e.subcategory,
        expenseDate: e.expense_date,
        amount: e.amount || 0,
        description: e.description,
        vehicleId: e.vehicle_id,
        vehicleName: e.vehicles?.name,
        fuelType: e.fuel_type,
        fuelQuantityLiters: e.fuel_quantity_liters,
        fuelPricePerLiter: e.fuel_price_per_liter,
        machineId: e.machine_id,
        machineName: e.machines?.name,
        recordedBy: e.recorded_by,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
    }
}

const SELECT_WITH_RELATIONS = `
    *,
    vehicles:vehicle_id (name),
    machines:machine_id (name)
`

/**
 * Get all factory expenses
 */
export async function getAllExpenses(): Promise<FactoryExpense[]> {
    const { data, error } = await supabase
        .from('factory_expenses')
        .select(SELECT_WITH_RELATIONS)
        .order('expense_date', { ascending: false })

    if (error) {
        console.error('Error fetching factory expenses:', error)
        return []
    }

    return (data || []).map(mapExpense)
}

/**
 * Get expense by ID
 */
export async function getExpenseById(id: string): Promise<FactoryExpense | null> {
    const { data, error } = await supabase
        .from('factory_expenses')
        .select(SELECT_WITH_RELATIONS)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching factory expense:', error)
        return null
    }

    return mapExpense(data)
}

/**
 * Create a new factory expense
 */
export async function createExpense(input: CreateFactoryExpenseInput): Promise<FactoryExpense | null> {
    const { data, error } = await supabase
        .from('factory_expenses')
        .insert({
            code: input.code,
            category: input.category,
            subcategory: input.subcategory,
            expense_date: input.expenseDate,
            amount: input.amount,
            description: input.description || null,
            vehicle_id: input.vehicleId || null,
            fuel_type: input.fuelType || null,
            fuel_quantity_liters: input.fuelQuantityLiters ?? null,
            fuel_price_per_liter: input.fuelPricePerLiter ?? null,
            machine_id: input.machineId || null,
            recorded_by: input.recordedBy || null,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating factory expense:', error)
        throw new Error(error.message)
    }

    return getExpenseById(data.id)
}

/**
 * Update a factory expense
 */
export async function updateExpense(id: string, input: UpdateFactoryExpenseInput): Promise<FactoryExpense | null> {
    const updateData: Record<string, any> = {}
    if (input.category !== undefined) updateData.category = input.category
    if (input.subcategory !== undefined) updateData.subcategory = input.subcategory
    if (input.expenseDate !== undefined) updateData.expense_date = input.expenseDate
    if (input.amount !== undefined) updateData.amount = input.amount
    if (input.description !== undefined) updateData.description = input.description
    if (input.vehicleId !== undefined) updateData.vehicle_id = input.vehicleId
    if (input.fuelType !== undefined) updateData.fuel_type = input.fuelType
    if (input.fuelQuantityLiters !== undefined) updateData.fuel_quantity_liters = input.fuelQuantityLiters
    if (input.fuelPricePerLiter !== undefined) updateData.fuel_price_per_liter = input.fuelPricePerLiter
    if (input.machineId !== undefined) updateData.machine_id = input.machineId
    if (input.recordedBy !== undefined) updateData.recorded_by = input.recordedBy

    const { error } = await supabase
        .from('factory_expenses')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating factory expense:', error)
        throw new Error(error.message)
    }

    return getExpenseById(id)
}

/**
 * Delete a factory expense
 */
export async function deleteExpense(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('factory_expenses')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting factory expense:', error)
        throw new Error(error.message)
    }

    return true
}

/**
 * Generate next expense code in format: EXP-YYYY-NNNN
 * Derived from the highest existing code (not a row count) so it
 * can't collide after a deletion.
 */
export async function generateExpenseCode(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `EXP-${year}-`

    const { data, error } = await supabase
        .from('factory_expenses')
        .select('code')
        .like('code', `${prefix}%`)
        .order('code', { ascending: false })
        .limit(1)

    if (error) {
        console.error('Error generating expense code:', error)
        throw error
    }

    const lastCode = data?.[0]?.code as string | undefined
    const lastNum = lastCode ? parseInt(lastCode.slice(prefix.length), 10) || 0 : 0
    const nextNum = lastNum + 1
    return `${prefix}${nextNum.toString().padStart(4, '0')}`
}
