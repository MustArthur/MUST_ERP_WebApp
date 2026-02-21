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
    console.log("Starting debug run");
    // Fetch recipe ID
    const { data: recipeData } = await supabase.from('recipes').select('id, code').eq('code', 'BOM-CK-STRAWBERRY-001').single();
    const recipeId = recipeData.id;
    console.log("Recipe ID:", recipeId);

    // Attempt an insert of recipe_lines to see exact error
    try {
        const { error } = await supabase.from('recipe_lines').insert([
            {
                recipe_id: recipeId,
                line_no: 1,
                item_id: '79c89f06-8c2d-4128-a49b-887a78d8a486', // SP-CHICKEN
                qty_per_batch: 30,
                uom_id: '3e8e53d6-71da-48df-ae49-a9ab3f980d9c', // BTL
                scrap_percent: 0,
                is_critical: true,
                is_optional: false
            }
        ]);
        if (error) {
            console.log("Insert threw an error object:", error);
        } else {
            console.log("Insert success!");
        }
    } catch (e) {
        console.log("Insert caught exception:", e.message);
    }
}
run();
