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
        .order('updated_at', { ascending: false })

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
const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    // Validate required UUIDs before hitting the database
    if (!input.outputItemId || !isUUID(input.outputItemId)) {
        throw new Error('ไม่พบ ID ของสินค้าที่ผลิตได้ กรุณาเลือกสินค้าใหม่จาก dropdown')
    }
    if (!input.outputUomId || !isUUID(input.outputUomId)) {
        throw new Error('ไม่พบ ID ของหน่วยผลผลิต กรุณาเลือกหน่วยใหม่')
    }

    // First, create the recipe
    const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
            code: input.code,
            name: input.name,
            description: null,
            output_item_id: input.outputItemId, // UUID ของสินค้าที่ผลิตได้
            output_qty: input.outputQty,
            output_uom_id: input.outputUomId, // UUID ของหน่วยผลผลิต
            standard_batch_size: input.batchSize,
            expected_yield_percent: input.expectedYield,
            estimated_duration_minutes: input.estimatedTime,
            instructions: input.instructions,
            status: (input.status || 'DRAFT').toUpperCase(),
            version: 1,
            bottle_size: input.bottleSize || 490, // ขนาดขวด (ml) default 490
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
            item_id: ing.itemId, // UUID ของ item
            qty_per_batch: ing.qty,
            uom_id: ing.uomId, // UUID ของ UOM
            scrap_percent: ing.scrap,
            is_critical: ing.isCritical,
            is_optional: false,
        }))

        if (lines.length === 0) return getRecipeById(recipe.id) as Promise<Recipe>;

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
    const updateData: Record<string, unknown> = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.code !== undefined) updateData.code = input.code
    if (input.outputQty !== undefined) updateData.output_qty = input.outputQty
    if (input.batchSize !== undefined) updateData.standard_batch_size = input.batchSize
    if (input.expectedYield !== undefined) updateData.expected_yield_percent = input.expectedYield
    if (input.estimatedTime !== undefined) updateData.estimated_duration_minutes = input.estimatedTime
    if (input.instructions !== undefined) updateData.instructions = input.instructions
    if (input.status !== undefined) updateData.status = input.status.toUpperCase()
    if (input.bottleSize !== undefined) updateData.bottle_size = input.bottleSize

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
        .single()

    if (error) {
        console.error('Error updating recipe:', error)
        throw error
    }

    // Update ingredients if provided
    if (input.ingredients) {
        // 1. Delete existing lines
        const { error: deleteError } = await supabase
            .from('recipe_lines')
            .delete()
            .eq('recipe_id', id)

        if (deleteError) {
            console.error('Error deleting old recipe lines:', deleteError)
            throw deleteError
        }

        // 2. Insert new lines
        if (input.ingredients.length > 0) {
            const lines = input.ingredients.map((ing, index) => ({
                recipe_id: id,
                line_no: index + 1,
                item_id: ing.itemId, // UUID ของ item
                qty_per_batch: ing.qty,
                uom_id: ing.uomId, // UUID ของ UOM
                scrap_percent: ing.scrap,
                is_critical: ing.isCritical,
                is_optional: false,
            }))

            if (lines.length === 0) return getRecipeById(id) as Promise<Recipe>;

            const { error: insertError } = await supabase
                .from('recipe_lines')
                .insert(lines)

            if (insertError) {
                console.error('Error inserting new recipe lines:', insertError)
                throw insertError
            }
        }
    }

    return getRecipeById(id) as Promise<Recipe>
}


/**
 * Duplicate recipe — clones raw DB rows to avoid UUID resolution issues
 */
export async function duplicateRecipe(id: string): Promise<Recipe> {
    // Fetch original recipe raw row (with UUIDs intact)
    const { data: original, error: origError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single()

    if (origError || !original) throw new Error('ไม่พบสูตรที่ต้องการคัดลอก')

    // Fetch original recipe_lines
    const { data: lines } = await supabase
        .from('recipe_lines')
        .select('*')
        .eq('recipe_id', id)
        .order('line_no')

    // Generate unique code to avoid collisions on multiple duplicates
    const suffix = Date.now().toString(36).toUpperCase().slice(-4)
    const copyCode = `${original.code}-COPY-${suffix}`

    // Insert new recipe header
    const { data: newRecipe, error: insertError } = await supabase
        .from('recipes')
        .insert({
            code: copyCode,
            name: `${original.name} (สำเนา)`,
            output_item_id: original.output_item_id,
            output_qty: original.output_qty,
            output_uom_id: original.output_uom_id,
            standard_batch_size: original.standard_batch_size,
            expected_yield_percent: original.expected_yield_percent,
            estimated_duration_minutes: original.estimated_duration_minutes,
            instructions: original.instructions,
            status: 'DRAFT',
            version: 1,
            bottle_size: original.bottle_size,
        })
        .select()
        .single()

    if (insertError) {
        console.error('Error duplicating recipe:', insertError)
        throw insertError
    }

    // Copy recipe_lines, rollback if that fails
    if (lines && lines.length > 0) {
        const newLines = lines.map((line: any) => ({
            recipe_id: newRecipe.id,
            line_no: line.line_no,
            item_id: line.item_id,
            qty_per_batch: line.qty_per_batch,
            uom_id: line.uom_id,
            scrap_percent: line.scrap_percent,
            is_critical: line.is_critical,
            is_optional: line.is_optional,
        }))

        const { error: linesError } = await supabase
            .from('recipe_lines')
            .insert(newLines)

        if (linesError) {
            // Best-effort rollback
            await supabase.from('recipes').delete().eq('id', newRecipe.id)
            console.error('Error copying recipe lines, rolled back:', linesError)
            throw linesError
        }
    }

    return getRecipeById(newRecipe.id) as Promise<Recipe>
}


// ==========================================
// Recipe Versioning
// ==========================================

/**
 * Create a new version of an existing recipe.
 * Inserts a new row with the same `code` (recipe family key) and
 * version = source.version + 1. Never mutates the source row, so
 * Work Orders referencing the old row's id keep resolving to the
 * immutable historical snapshot forever.
 */
export async function createRecipeVersion(sourceId: string, input: CreateRecipeInput): Promise<Recipe> {
    // Fetch only what we need from the source row
    const { data: source, error: srcError } = await supabase
        .from('recipes')
        .select('code, version')
        .eq('id', sourceId)
        .single()

    if (srcError || !source) throw new Error('ไม่พบสูตรต้นทางที่ต้องการสร้างเวอร์ชันใหม่')

    // Validate UUIDs — same guards as createRecipe; don't skip even
    // though values were pre-filled from an existing recipe
    if (!input.outputItemId || !isUUID(input.outputItemId)) {
        throw new Error('ไม่พบ ID ของสินค้าที่ผลิตได้ กรุณาเลือกสินค้าใหม่จาก dropdown')
    }
    if (!input.outputUomId || !isUUID(input.outputUomId)) {
        throw new Error('ไม่พบ ID ของหน่วยผลผลิต กรุณาเลือกหน่วยใหม่')
    }

    const newStatus = (input.status || 'DRAFT').toUpperCase()
    const newVersion = source.version + 1

    // Insert the new version row — force code = source.code regardless of
    // input.code to protect the family key from UI state drift
    const { data: newRecipe, error: insertError } = await supabase
        .from('recipes')
        .insert({
            code: source.code,
            name: input.name,
            description: null,
            output_item_id: input.outputItemId,
            output_qty: input.outputQty,
            output_uom_id: input.outputUomId,
            standard_batch_size: input.batchSize,
            expected_yield_percent: input.expectedYield,
            estimated_duration_minutes: input.estimatedTime,
            instructions: input.instructions,
            status: newStatus,
            version: newVersion,
            bottle_size: input.bottleSize || 490,
        })
        .select()
        .single()

    if (insertError) {
        console.error('Error creating recipe version:', insertError)
        throw insertError
    }

    // Insert ingredient lines (same mapping as createRecipe)
    if (input.ingredients && input.ingredients.length > 0) {
        const lines = input.ingredients.map((ing, index) => ({
            recipe_id: newRecipe.id,
            line_no: index + 1,
            item_id: ing.itemId,
            qty_per_batch: ing.qty,
            uom_id: ing.uomId,
            scrap_percent: ing.scrap,
            is_critical: ing.isCritical,
            is_optional: false,
        }))

        const { error: linesError } = await supabase
            .from('recipe_lines')
            .insert(lines)

        if (linesError) {
            // Best-effort rollback — same pattern as duplicateRecipe
            await supabase.from('recipes').delete().eq('id', newRecipe.id)
            console.error('Error creating recipe version lines, rolled back:', linesError)
            throw linesError
        }
    }

    // Demote-on-activate: when new version goes ACTIVE, mark all other
    // ACTIVE rows in the same family as OBSOLETE in one bulk UPDATE.
    // If this step fails, log it but keep the new version — don't roll back.
    if (newStatus === 'ACTIVE') {
        const { error: demoteError } = await supabase
            .from('recipes')
            .update({ status: 'OBSOLETE' })
            .eq('code', source.code)
            .eq('status', 'ACTIVE')
            .neq('id', newRecipe.id)

        if (demoteError) {
            console.error('Error demoting previous recipe version — new version created but old version not demoted:', demoteError)
        }
    }

    return getRecipeById(newRecipe.id) as Promise<Recipe>
}

/**
 * Get all version-rows for a recipe family (same `code`), newest first.
 * Used by the version-history strip in RecipeDetailModal.
 */
export async function getRecipeVersions(code: string): Promise<Recipe[]> {
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('code', code)
        .order('version', { ascending: false })

    if (error) {
        console.error('Error fetching recipe versions:', error)
        throw error
    }

    if (!recipes || recipes.length === 0) return []

    // Hydrate each version row the same way getRecipes does
    const recipeIds = recipes.map(r => r.id)
    const { data: lines } = await supabase
        .from('recipe_lines')
        .select('*')
        .in('recipe_id', recipeIds)

    const outputItemIds = recipes.map(r => r.output_item_id).filter(Boolean)
    const lineItemIds = (lines || []).map(l => l.item_id).filter(Boolean)
    const allItemIds = Array.from(new Set([...outputItemIds, ...lineItemIds]))

    const { data: items } = await supabase
        .from('items')
        .select('id, code, name, last_purchase_cost')
        .in('id', allItemIds)

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
        recipeLines.push({ ...line, item, uom_code: uom?.code || line.uom_id })
        linesMap.set(line.recipe_id, recipeLines)
    }

    return recipes.map(recipe => {
        const outputItem = itemsMap.get(recipe.output_item_id)
        const outputUom = uomsMap.get(recipe.output_uom_id)
        return transformRecipeFromDB({
            ...recipe,
            output_item: outputItem,
            output_uom: outputUom,
            recipe_lines: linesMap.get(recipe.id) || [],
        })
    })
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
// Item Usage Lookup
// ==========================================

export interface RecipeUsage {
    recipeId: string
    recipeCode: string
    recipeName: string
    qtyPerBatch: number   // base UOM ของวัตถุดิบ
    uom: string             // UOM code ของ ingredient line
    scrapPercent: number
}

/**
 * Get ACTIVE recipes that use a given item as an ingredient,
 * with the per-batch quantity used in that recipe.
 */
export async function getActiveRecipeUsagesByItemId(itemId: string): Promise<RecipeUsage[]> {
    const { data: lines, error: linesError } = await supabase
        .from('recipe_lines')
        .select('recipe_id, qty_per_batch, uom_id, scrap_percent')
        .eq('item_id', itemId)

    if (linesError) {
        console.error('Error fetching recipe lines for item:', linesError)
        throw linesError
    }
    if (!lines || lines.length === 0) return []

    const recipeIds = Array.from(new Set(lines.map(l => l.recipe_id)))
    const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('id, code, name')
        .in('id', recipeIds)
        .eq('status', 'ACTIVE')

    if (recipesError) {
        console.error('Error fetching recipes for item usage:', recipesError)
        throw recipesError
    }
    if (!recipes || recipes.length === 0) return []

    const uomIds = Array.from(new Set(lines.map(l => l.uom_id).filter(Boolean)))
    const { data: uoms } = await supabase
        .from('units_of_measure')
        .select('id, code')
        .in('id', uomIds)

    const uomMap = new Map((uoms || []).map(u => [u.id, u.code]))
    const recipeMap = new Map(recipes.map(r => [r.id, r]))

    return lines
        .filter(l => recipeMap.has(l.recipe_id))
        .map(l => {
            const r = recipeMap.get(l.recipe_id)!
            return {
                recipeId: r.id,
                recipeCode: r.code,
                recipeName: r.name,
                qtyPerBatch: l.qty_per_batch || 0,
                uom: uomMap.get(l.uom_id) || '',
                scrapPercent: l.scrap_percent || 0,
            }
        })
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
            itemId: line.item_id, // ID ของ item สำหรับ link
            item: line.item?.name || 'Unknown',
            code: line.item?.code || line.item_id,
            qty: qty,
            uom: line.uom_code || line.uom_id, // Use resolved UOM code
            uomId: line.uom_id, // UUID ของ UOM สำหรับบันทึก
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
        bottleSize: data.bottle_size || 490, // ขนาดขวด (ml) default 490
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    }
}

