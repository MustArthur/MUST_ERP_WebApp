'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthFrame } from '@/components/layout/auth-frame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sentTo, setSentTo] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSending(true)
        setError(null)
        const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        })
        setIsSending(false)
        if (error) {
            setError(/rate limit/i.test(error.message) ? 'ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่' : error.message)
            return
        }
        // Same message whether or not the account exists, so emails cannot be probed
        setSentTo(email.trim())
    }

    const footer = (
        <Link href="/login" className="font-medium text-primary hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
        </Link>
    )

    if (sentTo) {
        return (
            <AuthFrame footer={footer}>
                <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                        <MailCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">ตรวจสอบอีเมลของคุณ</h2>
                    <p className="text-sm text-gray-600">
                        ถ้ามีบัญชีของ <span className="font-medium text-gray-900 break-all">{sentTo}</span>{' '}
                        ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้
                    </p>
                    <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                        เปิดลิงก์ในอีเมลด้วย<strong>เครื่องและเบราว์เซอร์นี้</strong>เท่านั้น
                        ถ้าเปิดจากเครื่องอื่นลิงก์จะใช้ไม่ได้
                    </p>
                </div>
            </AuthFrame>
        )
    }

    return (
        <AuthFrame footer={footer}>
            <h2 className="text-xl font-semibold text-gray-900">ลืมรหัสผ่าน</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">กรอกอีเมลที่ใช้สมัคร ระบบจะส่งลิงก์ให้ตั้งรหัสผ่านใหม่</p>

            {error && (
                <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="somchai@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSending}
                        className="h-11"
                    />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isSending}>
                    {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    ส่งลิงก์ตั้งรหัสผ่านใหม่
                </Button>
            </form>
        </AuthFrame>
    )
}
