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
    
    // Simulate what the UI sends for ingredients of BOM-CK-STRAWBERRY-001
    // The previous screenshot showed: 
    // อกไก่ปั่น รสสตอเบอร์รี่ CK_Strawberry 30 BTL 13 95% 
    // Wait, the ingredients are inside the modal.
    try {
        await updateRecipe('24e24409-937e-4f79-b8f1-3c09b8d36c45', {
            ingredients: [
                {
                    code: 'SP-CHICKEN',
                    qty: 10,
                    uom: 'KG', // This is what the UI sends!!!
                    scrap: 0,
                    isCritical: true,
                }
            ]
        });
        console.log('Update Success');
    } catch (e) {
        console.log('Update Error:', e);
    }
}

// Since recipes.ts imports supabase from '@/lib/supabase', we need to mock or run it via next.js. 
// A script using `require` for next.js typescript files won't work easily without ts-node or transpilation.
