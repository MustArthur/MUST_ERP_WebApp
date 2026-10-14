'use client'

import { usePathname } from 'next/navigation'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { useUIStore } from '@/stores/ui-store'
import { useAccessStore } from '@/stores/access-store'
import { canEdit, canView, pageKeyForPath } from '@/lib/permissions'

const ROUTES_WITHOUT_SIDEBAR = ['/login', '/signup', '/access']

function ViewOnlyBanner({ pathname }: { pathname: string }) {
    const access = useAccessStore((s) => s.access)
    const pageKey = pageKeyForPath(pathname)
    if (!pageKey || !canView(access, pageKey) || canEdit(access, pageKey)) return null

    return (
        <div role="status" className="flex items-center gap-2 px-4 py-2 text-sm bg-sky-50 text-sky-800 border-b border-sky-100">
            <Eye className="w-4 h-4 shrink-0" />
            <span>คุณมีสิทธิ์ดูอย่างเดียวในหน้านี้ — เพิ่ม แก้ไข หรือลบข้อมูลไม่ได้</span>
        </div>
    )
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

    if (ROUTES_WITHOUT_SIDEBAR.includes(pathname)) {
        return <>{children}</>
    }

    return (
        <div className="lg:flex">
            <Sidebar />
            <div
                className={cn(
                    'flex-1 min-w-0 transition-[margin] duration-200 motion-reduce:transition-none',
                    sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
                )}
            >
                <ViewOnlyBanner pathname={pathname} />
                {children}
            </div>
        </div>
    )
}
