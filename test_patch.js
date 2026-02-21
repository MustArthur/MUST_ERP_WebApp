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
    const { updateRecipe } = require('./lib/api/recipes');

    // Test that our new updateRecipe can handle fake string codes without crashing
    // it should just filter them out if they are not UUIDs instead of sending to PG
    const recipeId = '24e24409-937e-4f79-b8f1-3c09b8d36c45'; // BOM-CK-STRAWBERRY-001

    const updateInput = {
        ingredients: [
            {
                code: 'FAKE-CODE-NOT-FOUND', // THIS should fail to find in DB, and fall back to this string
                itemId: 'FAKE-ALSO-NOT-UUID',
                uom: 'BTL', // THIS SHOULD MATCH UUID
                qty: 1
            },
            {
                code: '', // Blank row should be filtered
                qty: 0,
                uom: 'G'
            }
        ]
    };

    try {
        console.log("Calling updateRecipe with faulty data...");
        await updateRecipe(recipeId, updateInput);
        console.log("SUCCESS! updateRecipe did not crash on PG invalid UUID error!");

        const { data: lines } = await supabase.from('recipe_lines').select('*').eq('recipe_id', recipeId);
        console.log("Lines in DB for recipe after update:", lines.length);
    } catch (e) {
        console.error("FAILED! updateRecipe crashed:", e.message);
    }
}
run();
