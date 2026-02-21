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
    // Get ALL items and dump exact casing
    const { data: items } = await supabase.from('items').select('code').limit(15);
    console.log('Items codes:', items.map(i => i.code));
    
    // Get UOMs
    const { data: uoms } = await supabase.from('units_of_measure').select('code');
    console.log('UOMs codes:', uoms.map(u => u.code));
}
run();
