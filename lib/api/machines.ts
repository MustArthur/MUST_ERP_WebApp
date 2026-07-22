import { supabase } from '@/lib/supabase'
import { Machine, CreateMachineInput, UpdateMachineInput } from '@/types/machine'

/**
 * Get all machines
 */
export async function getAllMachines(): Promise<Machine[]> {
    const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('code')

    if (error) {
        console.error('Error fetching machines:', error)
        return []
    }

    return (data || []).map(m => ({
        id: m.id,
        code: m.code,
        name: m.name,
        location: m.location,
        isActive: m.is_active ?? true,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
    }))
}

/**
 * Get machine by ID
 */
export async function getMachineById(id: string): Promise<Machine | null> {
    const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching machine:', error)
        return null
    }

    return {
        id: data.id,
        code: data.code,
        name: data.name,
        location: data.location,
        isActive: data.is_active ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    }
}

/**
 * Create a new machine
 */
export async function createMachine(input: CreateMachineInput): Promise<Machine | null> {
    const { data, error } = await supabase
        .from('machines')
        .insert({
            code: input.code,
            name: input.name,
            location: input.location,
            is_active: true,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating machine:', error)
        throw new Error(error.message)
    }

    return getMachineById(data.id)
}

/**
 * Update a machine
 */
export async function updateMachine(id: string, input: UpdateMachineInput): Promise<Machine | null> {
    const updateData: Record<string, any> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.location !== undefined) updateData.location = input.location
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { error } = await supabase
        .from('machines')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating machine:', error)
        throw new Error(error.message)
    }

    return getMachineById(id)
}

/**
 * Delete a machine
 */
export async function deleteMachine(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting machine:', error)
        throw new Error(error.message)
    }

    return true
}

/**
 * Generate next machine code in format: MC-YYYY-NNNN
 * Derived from the highest existing code (not a row count) so it
 * can't collide after a deletion.
 */
export async function generateMachineCode(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `MC-${year}-`

    const { data, error } = await supabase
        .from('machines')
        .select('code')
        .like('code', `${prefix}%`)
        .order('code', { ascending: false })
        .limit(1)

    if (error) {
        console.error('Error generating machine code:', error)
        throw error
    }

    const lastCode = data?.[0]?.code as string | undefined
    const lastNum = lastCode ? parseInt(lastCode.slice(prefix.length), 10) || 0 : 0
    const nextNum = lastNum + 1
    return `${prefix}${nextNum.toString().padStart(4, '0')}`
}
