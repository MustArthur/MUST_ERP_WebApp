'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { AuthFrame } from '@/components/layout/auth-frame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'

// Reached from the recovery email link (via /auth/callback), which leaves the user signed in
export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 8) {
            setError('รหัสผ่านอย่างน้อย 8 ตัวอักษร')
            return
        }
        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน')
            return
        }
        setIsSaving(true)
        setError(null)
        const { error } = await createClient().auth.updateUser({ password })
        setIsSaving(false)
        if (error) {
            setError(
                /same/i.test(error.message)
                    ? 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม'
                    : 'ตั้งรหัสผ่านไม่สำเร็จ กรุณาขอลิงก์ใหม่อีกครั้ง'
            )
            return
        }
        toast.success('ตั้งรหัสผ่านใหม่แล้ว')
        router.push('/')
        router.refresh()
    }

    return (
        <AuthFrame>
            <h2 className="text-xl font-semibold text-gray-900">ตั้งรหัสผ่านใหม่</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">ใช้รหัสผ่านนี้เข้าสู่ระบบได้จากทุกเครื่อง</p>

            {error && (
                <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">รหัสผ่านใหม่</Label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSaving}
                        className="h-11"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isSaving}
                        className="h-11"
                    />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    บันทึกรหัสผ่าน
                </Button>
            </form>
        </AuthFrame>
    )
}
