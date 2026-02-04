'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Loader2, AlertCircle } from 'lucide-react'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = '/' // Always redirect to homepage after login

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const supabase = createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message === 'Invalid login credentials'
                ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
                : error.message
            )
            setIsLoading(false)
            return
        }

        router.push(redirectTo)
        router.refresh()
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">เข้าสู่ระบบ</h2>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 mt-2"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            กำลังเข้าสู่ระบบ...
                        </>
                    ) : (
                        'เข้าสู่ระบบ'
                    )}
                </Button>
            </form>
        </div>
    )
}

function LoginFormFallback() {
    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">เข้าสู่ระบบ</h2>
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    <div className="h-11 bg-slate-100 rounded-md animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                    <div className="h-11 bg-slate-100 rounded-md animate-pulse" />
                </div>
                <div className="h-11 bg-slate-200 rounded-md animate-pulse mt-2" />
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                        <Package className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">MUST ERP</h1>
                    <p className="text-slate-500 mt-1">ระบบจัดการการผลิต</p>
                </div>

                {/* Login Form with Suspense */}
                <Suspense fallback={<LoginFormFallback />}>
                    <LoginForm />
                </Suspense>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    MUST ERP v1.0 - Food Manufacturing
                </p>
            </div>
        </div>
    )
}
