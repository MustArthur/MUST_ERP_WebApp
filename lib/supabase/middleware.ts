import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
    ADMIN_PATH,
    canView,
    firstAllowedHref,
    isActiveMember,
    pageKeyForPath,
    type MyAccess,
} from '@/lib/permissions'

const ACCESS_PATH = '/access'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Redirects must carry the refreshed auth cookies, or the session gets dropped
    const redirectTo = (path: string) => {
        const url = request.nextUrl.clone()
        url.pathname = path
        url.search = ''
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
        return response
    }

    // Every route requires login except these - new pages are protected by default
    const publicPaths = ['/login', '/signup', '/forgot-password', '/auth/']
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

    if (!user) {
        return isPublicPath ? supabaseResponse : redirectTo('/login')
    }

    if (pathname === '/login' || pathname === '/signup') {
        return redirectTo('/')
    }

    // Logged in, but not necessarily an approved ERP member: /access explains where they stand,
    // /reset-password lets anyone with a session (incl. a recovery link) set a new password
    if (isPublicPath || pathname.startsWith(ACCESS_PATH) || pathname.startsWith('/reset-password')) {
        return supabaseResponse
    }

    const { data, error } = await supabase.rpc('erp_my_access')
    const access = error ? null : (data as MyAccess)

    if (!isActiveMember(access)) {
        return redirectTo(ACCESS_PATH)
    }

    if (pathname.startsWith(ADMIN_PATH)) {
        return access!.is_admin ? supabaseResponse : redirectTo('/')
    }

    const pageKey = pageKeyForPath(pathname)
    if (pathname === '/' || (pageKey && !canView(access, pageKey))) {
        const target = firstAllowedHref(access) ?? ACCESS_PATH
        if (target !== pathname) return redirectTo(target)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}
