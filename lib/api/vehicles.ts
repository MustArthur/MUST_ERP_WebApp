import { supabase } from '@/lib/supabase'
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@/types/vehicle'

/**
 * Get all vehicles
 */
export async function getAllVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('code')

    if (error) {
        console.error('Error fetching vehicles:', error)
        return []
    }

    return (data || []).map(v => ({
        id: v.id,
        code: v.code,
        plateNumber: v.plate_number,
        name: v.name,
        vehicleType: v.vehicle_type,
        isActive: v.is_active ?? true,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
    }))
}

/**
 * Get vehicle by ID
 */
export async function getVehicleById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching vehicle:', error)
        return null
    }

    return {
        id: data.id,
        code: data.code,
        plateNumber: data.plate_number,
        name: data.name,
        vehicleType: data.vehicle_type,
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    }
}

/**
 * Create a new vehicle
 */
export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle | null> {
    const { data, error } = await supabase
        .from('vehicles')
        .insert({
            code: input.code,
            plate_number: input.plateNumber,
            name: input.name,
            vehicle_type: input.vehicleType,
            is_active: true,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating vehicle:', error)
        throw new Error(error.message)
    }

    return getVehicleById(data.id)
}

/**
 * Update a vehicle
 */
export async function updateVehicle(id: string, input: UpdateVehicleInput): Promise<Vehicle | null> {
    const updateData: Record<string, any> = {}
    if (input.plateNumber !== undefined) updateData.plate_number = input.plateNumber
    if (input.name !== undefined) updateData.name = input.name
    if (input.vehicleType !== undefined) updateData.vehicle_type = input.vehicleType
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating vehicle:', error)
        throw new Error(error.message)
    }

    return getVehicleById(id)
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting vehicle:', error)
        throw new Error(error.message)
    }

    return true
}

/**
 * Generate next vehicle code in format: VH-YYYY-NNNN
 * Derived from the highest existing code (not a row count) so it
 * can't collide after a deletion.
 */
export async function generateVehicleCode(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `VH-${year}-`

    const { data, error } = await supabase
        .from('vehicles')
        .select('code')
        .like('code', `${prefix}%`)
        .order('code', { ascending: false })
        .limit(1)

    if (error) {
        console.error('Error generating vehicle code:', error)
        throw error
    }

    const lastCode = data?.[0]?.code as string | undefined
    const lastNum = lastCode ? parseInt(lastCode.slice(prefix.length), 10) || 0 : 0
    const nextNum = lastNum + 1
    return `${prefix}${nextNum.toString().padStart(4, '0')}`
}
