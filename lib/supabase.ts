import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables - using mock data mode')
}

// Create Supabase client (will work even without env vars in dev)
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)

// Helper function to handle Supabase errors
export function handleSupabaseError(error: unknown): never {
    console.error('Supabase error:', error)
    throw error
}
