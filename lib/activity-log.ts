'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_PATH, pageKeyForPath, type ActivityEvent } from '@/lib/permissions'

const SESSION_KEY = 'erp-activity-session'
const DUPLICATE_WINDOW_MS = 30_000

let lastLogged: { key: string; at: number } | null = null

// One id per browser tab, so the admin view can tell separate sittings apart
function sessionId(): string | null {
    try {
        let id = sessionStorage.getItem(SESSION_KEY)
        if (!id) {
            id = crypto.randomUUID()
            sessionStorage.setItem(SESSION_KEY, id)
        }
        return id
    } catch {
        return null
    }
}

function moduleKeyForPath(pathname: string): string | null {
    if (pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`)) return 'admin'
    return pageKeyForPath(pathname)
}

// Fire-and-forget: a failed log must never break or slow down the page
export async function logActivity(event: ActivityEvent, pathname?: string): Promise<void> {
    const pageKey = pathname ? moduleKeyForPath(pathname) : null
    if (event === 'page_view' && !pageKey) return

    // Skip repeats (StrictMode double effects, quick refreshes)
    const dedupeKey = `${event}:${pathname ?? ''}`
    const now = Date.now()
    if (lastLogged && lastLogged.key === dedupeKey && now - lastLogged.at < DUPLICATE_WINDOW_MS) return
    lastLogged = { key: dedupeKey, at: now }

    try {
        await createClient().rpc('erp_log_activity', {
            p_event: event,
            p_page_key: pageKey,
            p_path: pathname ?? null,
            p_session_id: sessionId(),
            p_user_agent: typeof navigator === 'undefined' ? null : navigator.userAgent,
        })
    } catch {
        // ignore
    }
}

// Logs a page view each time the user lands on a module page
export function useActivityLogger(pathname: string) {
    useEffect(() => {
        logActivity('page_view', pathname)
    }, [pathname])
}
