'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthFrame } from '@/components/layout/auth-frame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle } from 'lucide-react'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(
        searchParams.get('error') === 'confirm'
            ? 'ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบหรือสมัครใหม่อีกครั้ง'
            : searchParams.get('error') === 'recovery'
                ? 'ลิงก์ตั้งรหัสผ่านใหม่ใช้ไม่ได้หรือหมดอายุ — ต้องเปิดลิงก์ด้วยเครื่องและเบราว์เซอร์เดียวกับที่กดขอ กรุณาขอลิงก์ใหม่'
                : null
    )

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
            setError(
                error.message === 'Invalid login credentials'
                    ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง — ถ้าจำรหัสผ่านไม่ได้ กด "ลืมรหัสผ่าน?"'
                    : error.message === 'Email not confirmed'
                        ? 'ยังไม่ได้ยืนยันอีเมล กรุณากดลิงก์ในอีเมลที่ระบบส่งไปก่อน'
                        : error.message
            )
            setIsLoading(false)
            return
        }

        // Middleware sends the user to the first page they are allowed to see
        router.push('/')
        router.refresh()
    }

    return (
        <>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">เข้าสู่ระบบ</h2>

            {error && (
                <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
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
                        autoComplete="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">รหัสผ่าน</Label>
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                            ลืมรหัสผ่าน?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
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
        </>
    )
}

export default function LoginPage() {
    return (
        <AuthFrame
            footer={
                <>
                    ยังไม่มีบัญชี?{' '}
                    <Link href="/signup" className="font-medium text-primary hover:underline">
                        สมัครและขอสิทธิ์ใช้งาน
                    </Link>
                </>
            }
        >
            <Suspense>
                <LoginForm />
            </Suspense>
        </AuthFrame>
    )
}
