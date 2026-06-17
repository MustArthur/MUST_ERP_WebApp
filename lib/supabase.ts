import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables - using mock data mode')
}

// Use createBrowserClient so the session cookie set by @supabase/ssr is read correctly
export const supabase = createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)

// Helper function to handle Supabase errors
export function handleSupabaseError(error: unknown): never {
    console.error('Supabase error:', error)
    throw error
}
