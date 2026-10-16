import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Only same-site paths, so the link cannot bounce people to another domain
function safeNext(next: string | null): string {
    return next && next.startsWith('/') && !next.startsWith('//') ? next : '/access'
}

// Landing point for email links: sign-up confirmation and password recovery (PKCE code exchange)
export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl
    const code = searchParams.get('code')
    const next = safeNext(searchParams.get('next'))

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
        console.error('Auth callback code exchange failed:', error.message)
    }

    return NextResponse.redirect(`${origin}/login?error=${next === '/reset-password' ? 'recovery' : 'confirm'}`)
}
