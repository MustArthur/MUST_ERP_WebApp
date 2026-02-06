'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Package, User, LogOut, Settings, ChevronDown, ArrowLeft } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HeaderProps {
    title?: string
    showBack?: boolean
    backHref?: string
}

export function Header({ title, showBack, backHref = '/' }: HeaderProps) {
    const router = useRouter()
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
            setIsLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    // Extract display name from email
    const displayName = user?.email?.split('@')[0] || 'User'

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Back Button & Logo & Title */}
                    <div className="flex items-center gap-4">
                        {showBack && (
                            <Link href={backHref}>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">หน้าแรก</span>
                                </Button>
                            </Link>
                        )}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-slate-900 hidden sm:inline">
                                MUST ERP
                            </span>
                        </Link>

                        {title && (
                            <>
                                <span className="text-slate-300">/</span>
                                <h1 className="font-medium text-slate-700">{title}</h1>
                            </>
                        )}
                    </div>

                    {/* Right: User Menu */}
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
                        ) : user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 px-2 sm:px-3"
                                    >
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="hidden sm:inline text-sm font-medium text-slate-700">
                                            {displayName}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium text-slate-900">
                                            {displayName}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        ออกจากระบบ
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <Button size="sm">เข้าสู่ระบบ</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
