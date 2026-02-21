const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    // 1. Get a recipe
    const { data: recipe } = await supabase.from('recipes').select('id, code').eq('code', 'BOM-CK-STRAWBERRY-001').single();
    if (!recipe) return console.log('Recipe not found');
    console.log('Recipe:', recipe);

    // 2. Try inserting a line with a string code instead of UUID
    const lines = [{
        recipe_id: recipe.id,
        line_no: 1,
        item_id: 'some-invalid-uuid-or-code', 
        qty_per_batch: 10,
        uom_id: 'KG', // Invalid UUID
        scrap_percent: 0,
        is_critical: true,
        is_optional: false,
    }];
    
    console.log('Inserting invalid lines...');
    const { error: insertError } = await supabase.from('recipe_lines').insert(lines);
    console.log('Insert Error:', insertError);
}
run();
