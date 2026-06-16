'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { useUIStore } from '@/stores/ui-store'

const ROUTES_WITHOUT_SIDEBAR = ['/login']

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
                {children}
            </div>
        </div>
    )
}
