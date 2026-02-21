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
    const { data: recipe } = await supabase.from('recipes').select('id, code').eq('code', 'BOM-CK-STRAWBERRY-001').single();
    if (!recipe) return console.log('Recipe not found');
    console.log('Recipe:', recipe);

    const { data: lines } = await supabase.from('recipe_lines').select('*').eq('recipe_id', recipe.id);
    console.log('Lines:', lines);
}
run();
