import { supabase } from '@/lib/supabase'
import type { Recipe, CreateRecipeInput, UpdateRecipeInput, Ingredient } from '@/types/recipe'

// ==========================================
// Recipe API Functions
// ==========================================

/**
 * Get all recipes with optional filtering
 * Note: Simplified query to avoid PGRST201 multiple relationship error
 */
export async function getRecipes(status?: string): Promise<Recipe[]> {
    // First, get recipes
    let query = supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

    if (status && status !== 'all') {
        query = query.eq('status', status.toUpperCase())
    }

    const { data: recipes, error } = await query

    if (error) {
        console.error('Error fetching recipes:', error)
        throw error
    }

    if (!recipes || recipes.length === 0) {
        return []
    }

    // Get recipe lines separately
    const recipeIds = recipes.map(r => r.id)
    const { data: lines } = await supabase
        .from('recipe_lines')
        .select('*')
        .in('recipe_id', recipeIds)

    // Get unique item IDs from both recipes (output items) and lines
    const outputItemIds = recipes.map(r => r.output_item_id).filter(Boolean)
    const lineItemIds = (lines || []).map(l => l.item_id).filter(Boolean)
    const allItemIds = Array.from(new Set([...outputItemIds, ...lineItemIds]))

    // Get all items with their costs
    const { data: items } = await supabase
        .from('items')
        .select('id, code, name, last_purchase_cost')
        .in('id', allItemIds)

    // Get all UOMs
    const outputUomIds = recipes.map(r => r.output_uom_id).filter(Boolean)
    const lineUomIds = (lines || []).map(l => l.uom_id).filter(Boolean)
    const allUomIds = Array.from(new Set([...outputUomIds, ...lineUomIds]))

    const { data: uoms } = await supabase
        .from('units_of_measure')
        .select('id, code, name')
        .in('id', allUomIds)

    const itemsMap = new Map((items || []).map(i => [i.id, i]))
    const uomsMap = new Map((uoms || []).map(u => [u.id, u]))
    const linesMap = new Map<string, any[]>()

    for (const line of (lines || [])) {
        const recipeLines = linesMap.get(line.recipe_id) || []
        const item = itemsMap.get(line.item_id)
        const uom = uomsMap.get(line.uom_id)
        recipeLines.push({
            ...line,
            item,
            uom_code: uom?.code || line.uom_id
        })
        linesMap.set(line.recipe_id, recipeLines)
    }

    // Transform to Recipe type
    return recipes.map(recipe => {
        const outputItem = itemsMap.get(recipe.output_item_id)
        const outputUom = uomsMap.get(recipe.output_uom_id)

        return transformRecipeFromDB({
            ...recipe,
            output_item: outputItem,
            output_uom: outputUom,
            recipe_lines: linesMap.get(recipe.id) || []
        })
    })
}


/**
 * Get single recipe by ID
 * Note: Simplified query to avoid PGRST201 multiple relationship error
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
    const { data: recipe, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null // Not found
        console.error('Error fetching recipe:', error)
        throw error
    }

    if (!recipe) return null

    // Get recipe lines separately
    const { data: lines } = await supabase
        .from('recipe_lines')
        .select('*')
        .eq('recipe_id', id)
        .order('line_no')

    // Get unique item IDs from both recipe (output item) and lines
    const outputItemIds = recipe.output_item_id ? [recipe.output_item_id] : []
    const lineItemIds = (lines || []).map(l => l.item_id).filter(Boolean)
    const allItemIds = Array.from(new Set([...outputItemIds, ...lineItemIds]))

    // Get all items with their costs
    const { data: items } = await supabase
        .from('items')
        .select('id, code, name, last_purchase_cost')
        .in('id', allItemIds)

    // Get all UOMs
    const outputUomIds = recipe.output_uom_id ? [recipe.output_uom_id] : []
    const lineUomIds = (lines || []).map(l => l.uom_id).filter(Boolean)
    const allUomIds = Array.from(new Set([...outputUomIds, ...lineUomIds]))

    const { data: uoms } = await supabase
        .from('units_of_measure')
        .select('id, code, name')
        .in('id', allUomIds)

    const itemsMap = new Map((items || []).map(i => [i.id, i]))
    const uomsMap = new Map((uoms || []).map(u => [u.id, u]))

    const enhancedLines = (lines || []).map(line => {
        const item = itemsMap.get(line.item_id)
        const uom = uomsMap.get(line.uom_id)
        return {
            ...line,
            item,
            uom_code: uom?.code || line.uom_id
        }
    })

    // Get output item and UOM
    const outputItem = itemsMap.get(recipe.output_item_id)
    const outputUom = uomsMap.get(recipe.output_uom_id)

    return transformRecipeFromDB({
        ...recipe,
        output_item: outputItem,
        output_uom: outputUom,
        recipe_lines: enhancedLines
    })
}


/**
 * Create new recipe
 */
export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    // First, create the recipe
    const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
            code: input.code,
            name: input.name,
            description: null,
            output_item_id: input.outputItemCode, // Will need actual item ID
            output_qty: input.outputQty,
            output_uom_id: input.outputUom, // Will need actual UOM ID
            standard_batch_size: input.batchSize,
            expected_yield_percent: input.expectedYield,
            estimated_duration_minutes: input.estimatedTime,
            instructions: input.instructions,
            status: (input.status || 'DRAFT').toUpperCase(),
            version: 1,
        })
        .select()
        .single()

    if (recipeError) {
        console.error('Error creating recipe:', recipeError)
        throw recipeError
    }

    // Then, create ingredient lines
    if (input.ingredients && input.ingredients.length > 0) {
        const lines = input.ingredients.map((ing, index) => ({
            recipe_id: recipe.id,
            line_no: index + 1,
            item_id: ing.code, // Will need actual item ID
            qty_per_batch: ing.qty,
            uom_id: ing.uom, // Will need actual UOM ID
            scrap_percent: ing.scrap,
            is_critical: ing.isCritical,
            is_optional: false,
        }))

        const { error: linesError } = await supabase
            .from('recipe_lines')
            .insert(lines)

        if (linesError) {
            console.error('Error creating recipe lines:', linesError)
            // Optionally rollback recipe creation
            throw linesError
        }
    }

    return getRecipeById(recipe.id) as Promise<Recipe>
}

/**
 * Update existing recipe
 */
export async function updateRecipe(id: string, input: UpdateRecipeInput): Promise<Recipe> {
    console.log('updateRecipe called with:', { id, input })

    const updateData: Record<string, unknown> = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.code !== undefined) updateData.code = input.code
    if (input.outputQty !== undefined) updateData.output_qty = input.outputQty
    if (input.batchSize !== undefined) updateData.standard_batch_size = input.batchSize
    if (input.expectedYield !== undefined) updateData.expected_yield_percent = input.expectedYield
    if (input.estimatedTime !== undefined) updateData.estimated_duration_minutes = input.estimatedTime
    if (input.instructions !== undefined) updateData.instructions = input.instructions
    if (input.status !== undefined) updateData.status = input.status.toUpperCase()

    console.log('updateData being sent to Supabase:', updateData)

    // If no fields to update, just refresh and return
    if (Object.keys(updateData).length === 0) {
        console.warn('No fields to update, returning existing recipe')
        return getRecipeById(id) as Promise<Recipe>
    }

    const { data, error } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', id)
        .select()

    if (error) {
        console.error('Error updating recipe:', error)
        throw error
    }

    console.log('Supabase update response:', data)

    return getRecipeById(id) as Promise<Recipe>
}


/**
 * Delete recipe
 */
export async function deleteRecipe(id: string): Promise<void> {
    // Recipe lines will be deleted via CASCADE
    const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting recipe:', error)
        throw error
    }
}

// ==========================================
// Helper Functions
// ==========================================

function transformRecipeFromDB(data: any): Recipe {
    // Calculate ingredient costs
    const ingredients: Ingredient[] = (data.recipe_lines || []).map((line: any) => {
        const itemCost = line.item?.last_purchase_cost || 0
        const qty = line.qty_per_batch || 0
        const totalCost = itemCost * qty

        return {
            id: line.id,
            lineNo: line.line_no,
            item: line.item?.name || 'Unknown',
            code: line.item?.code || line.item_id,
            qty: qty,
            uom: line.uom_code || line.uom_id, // Use resolved UOM code
            scrap: line.scrap_percent || 0,
            isCritical: line.is_critical,
            cost: itemCost, // Cost per unit
        }
    })

    // Get output item info
    const outputItem = data.output_item
    const outputUom = data.output_uom

    return {
        id: data.id,
        code: data.code,
        name: data.name,
        outputItem: outputItem?.name || data.output_item_id,
        outputItemCode: outputItem?.code || data.output_item_id,
        outputQty: data.output_qty,
        outputUom: outputUom?.code || data.output_uom_id,
        batchSize: data.standard_batch_size || data.output_qty,
        expectedYield: data.expected_yield_percent,
        version: data.version,
        status: data.status as any,
        validFrom: data.valid_from || '',
        validTo: data.valid_to,
        estimatedTime: data.estimated_duration_minutes || 0,
        ingredients,
        instructions: data.instructions || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    }
}

