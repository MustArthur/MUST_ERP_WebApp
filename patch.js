const fs = require('fs');
const filepath = 'lib/api/recipes.ts';

let content = fs.readFileSync(filepath, 'utf8');

// Helper to add isUUID globally
if (!content.includes('const isUUID = ')) {
    content = content.replace(
        "export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {",
        "const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);\n\nexport async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {"
    );
}

// Fix createRecipe output items
content = content.replace(
    /        if \(outItemData\) outputItemId = outItemData\.id;\n    }/,
    "        if (outItemData) outputItemId = outItemData.id;\n    }\n    if (outputItemId && !isUUID(outputItemId)) outputItemId = null;"
);
content = content.replace(
    /        if \(outUomData\) outputUomId = outUomData\.id;\n    }/,
    "        if (outUomData) outputUomId = outUomData.id;\n    }\n    if (outputUomId && !isUUID(outputUomId)) outputUomId = null;"
);

// Fix updateRecipe output items
content = content.replace(
    /        updateData\.output_item_id = itemData \? itemData\.id : input\.outputItemCode;\n    }/,
    "        const resolvedId = itemData ? itemData.id : input.outputItemCode;\n        updateData.output_item_id = isUUID(resolvedId) ? resolvedId : null;\n    }"
);
content = content.replace(
    /        updateData\.output_uom_id = uomData \? uomData\.id : input\.outputUom;\n    }/,
    "        const resolvedId = uomData ? uomData.id : input.outputUom;\n        updateData.output_uom_id = isUUID(resolvedId) ? resolvedId : null;\n    }"
);

// Fix createRecipe lines
content = content.replace(
    "const lines = input.ingredients.map((ing, index) => ({\n            recipe_id: recipe.id,\n            line_no: index + 1,\n            item_id: itemMap.get(ing.code) || ing.itemId || ing.code, // Use resolved ID, or fallback\n            qty_per_batch: ing.qty,\n            uom_id: uomMap.get(ing.uom) || ing.uom, // Use resolved ID, or fallback\n            scrap_percent: ing.scrap,\n            is_critical: ing.isCritical,\n            is_optional: false,\n        }))",
    "const lines = input.ingredients\n            .filter(ing => ing.code && ing.uom)\n            .map((ing, index) => {\n                const rawItemId = itemMap.get(ing.code) || ing.itemId || ing.code;\n                const rawUomId = uomMap.get(ing.uom) || ing.uom;\n                return {\n                    recipe_id: recipe.id,\n                    line_no: index + 1,\n                    item_id: isUUID(rawItemId) ? rawItemId : null,\n                    qty_per_batch: ing.qty || 0,\n                    uom_id: isUUID(rawUomId) ? rawUomId : null,\n                    scrap_percent: ing.scrap || 0,\n                    is_critical: ing.isCritical || false,\n                    is_optional: false,\n                }\n            }).filter(l => l.item_id && l.uom_id);"
);
// Fix createRecipe lines length check
content = content.replace(
    "        const { error: linesError } = await supabase\n            .from('recipe_lines')",
    "        if (lines.length === 0) return getRecipeById(recipe.id) as Promise<Recipe>;\n\n        const { error: linesError } = await supabase\n            .from('recipe_lines')"
);

// Fix updateRecipe lines
content = content.replace(
    "const lines = input.ingredients.map((ing, index) => ({\n                recipe_id: id,\n                line_no: index + 1,\n                item_id: itemMap.get(ing.code) || ing.itemId || ing.code, // Map to UUID\n                qty_per_batch: ing.qty,\n                uom_id: uomMap.get(ing.uom) || ing.uom, // Map to UUID\n                scrap_percent: ing.scrap,\n                is_critical: ing.isCritical,\n                is_optional: false,\n            }))",
    "const lines = input.ingredients\n                .filter(ing => ing.code && ing.uom)\n                .map((ing, index) => {\n                    const rawItemId = itemMap.get(ing.code) || ing.itemId || ing.code;\n                    const rawUomId = uomMap.get(ing.uom) || ing.uom;\n                    return {\n                        recipe_id: id,\n                        line_no: index + 1,\n                        item_id: isUUID(rawItemId) ? rawItemId : null,\n                        qty_per_batch: ing.qty || 0,\n                        uom_id: isUUID(rawUomId) ? rawUomId : null,\n                        scrap_percent: ing.scrap || 0,\n                        is_critical: ing.isCritical || false,\n                        is_optional: false,\n                    }\n                }).filter(l => l.item_id && l.uom_id);"
);

// Fix updateRecipe lines length check
content = content.replace(
    "            const { error: insertError } = await supabase\n                .from('recipe_lines')",
    "            if (lines.length === 0) return getRecipeById(id) as Promise<Recipe>;\n\n            const { error: insertError } = await supabase\n                .from('recipe_lines')"
);

fs.writeFileSync(filepath, content, 'utf8');
console.log('File patched successfully');
