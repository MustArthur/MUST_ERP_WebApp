'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { navGroups, type NavItem } from './nav-data'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Factory, User, LogOut, ChevronDown, ChevronsLeft, ChevronsRight, Menu, X } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useUIStore } from '@/stores/ui-store'

function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
    const Icon = item.icon
    const link = (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-3 rounded-md px-2.5 min-h-[44px] text-sm transition-colors',
                collapsed && 'justify-center px-0',
                active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
        >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{item.name}</span>}
        </Link>
    )

    if (!collapsed) return link

    return (
        <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>
    )
}

function SidebarNav({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
    return (
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
            {navGroups.map((group) => (
                <div key={group.id}>
                    {group.label && !collapsed && (
                        <p className="px-2.5 mb-1 text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                            {group.label}
                        </p>
                    )}
                    <div className="space-y-0.5">
                        {group.items.map((item) => (
                            <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(pathname, item.href)} />
                        ))}
                    </div>
                </div>
            ))}
        </nav>
    )
}

function UserFooter({ collapsed }: { collapsed: boolean }) {
    const router = useRouter()
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
            setIsLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const displayName = user?.email?.split('@')[0] || 'User'

    if (isLoading) {
        return <div className={cn('h-10 rounded-md bg-gray-100 animate-pulse', collapsed ? 'w-10 mx-auto' : 'w-full')} />
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className={cn(
                    'flex items-center justify-center h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors',
                    collapsed ? 'w-10 mx-auto' : 'w-full'
                )}
            >
                {collapsed ? <User className="w-4 h-4" /> : 'เข้าสู่ระบบ'}
            </Link>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'flex items-center gap-2 rounded-md p-1.5 w-full hover:bg-gray-100 transition-colors',
                        collapsed && 'justify-center'
                    )}
                >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                    </div>
                    {!collapsed && (
                        <>
                            <span className="text-sm font-medium text-gray-700 truncate flex-1 text-left">{displayName}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-48">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function Sidebar() {
    const pathname = usePathname()
    const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
    const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed)
    const mobileNavOpen = useUIStore((s) => s.mobileNavOpen)
    const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen)

    // Close the mobile drawer whenever the route changes
    useEffect(() => {
        setMobileNavOpen(false)
    }, [pathname, setMobileNavOpen])

    useEffect(() => {
        if (!mobileNavOpen) return
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setMobileNavOpen(false)
        }
        window.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [mobileNavOpen, setMobileNavOpen])

    return (
        <TooltipProvider>
            {/* Mobile edge pull-tab */}
            <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="เปิดเมนูนำทาง"
                className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-7 h-16 rounded-r-lg bg-primary text-primary-foreground shadow-md"
            >
                <Menu className="w-4 h-4" />
            </button>

            {/* Mobile backdrop */}
            <div
                onClick={() => setMobileNavOpen(false)}
                aria-hidden="true"
                className={cn(
                    'lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 motion-reduce:transition-none',
                    mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
            />

            {/* Mobile drawer */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="เมนูนำทาง"
                className={cn(
                    'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-200 ease-out motion-reduce:transition-none',
                    mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex items-center justify-between h-16 px-3 border-b border-gray-200 shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                            <Factory className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-gray-900">MUST ERP</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMobileNavOpen(false)}
                        aria-label="ปิดเมนูนำทาง"
                        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <SidebarNav collapsed={false} pathname={pathname} />
                <div className="border-t border-gray-200 p-2 shrink-0">
                    <UserFooter collapsed={false} />
                </div>
            </aside>

            {/* Desktop persistent rail */}
            <aside
                className={cn(
                    'hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-30 border-r border-gray-200 bg-gray-50 transition-all duration-200 motion-reduce:transition-none',
                    sidebarCollapsed ? 'w-16' : 'w-60'
                )}
            >
                <div className={cn('flex items-center h-16 px-3 border-b border-gray-200 shrink-0', sidebarCollapsed ? 'justify-center' : 'justify-between')}>
                    <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                            <Factory className="w-5 h-5 text-primary-foreground" />
                        </div>
                        {!sidebarCollapsed && <span className="font-semibold text-gray-900 whitespace-nowrap">MUST ERP</span>}
                    </Link>
                    {!sidebarCollapsed && (
                        <button
                            type="button"
                            onClick={toggleSidebarCollapsed}
                            aria-label="ย่อ sidebar"
                            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {sidebarCollapsed && (
                    <button
                        type="button"
                        onClick={toggleSidebarCollapsed}
                        aria-label="ขยาย sidebar"
                        className="flex items-center justify-center h-9 mx-2 mt-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 shrink-0"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                )}
                <SidebarNav collapsed={sidebarCollapsed} pathname={pathname} />
                <div className="border-t border-gray-200 p-2 shrink-0">
                    <UserFooter collapsed={sidebarCollapsed} />
                </div>
            </aside>
        </TooltipProvider>
    )
}
