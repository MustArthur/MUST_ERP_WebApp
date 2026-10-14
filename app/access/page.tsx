'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { firstAllowedHref } from '@/lib/permissions'
import { useAccessStore } from '@/stores/access-store'
import { AuthFrame } from '@/components/layout/auth-frame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Ban, Clock, Loader2, LogOut, RefreshCw, ShieldQuestion } from 'lucide-react'

function StatusBlock({
    icon: Icon,
    tone,
    title,
    children,
}: {
    icon: typeof Clock
    tone: 'amber' | 'red' | 'sky'
    title: string
    children: React.ReactNode
}) {
    const tones = {
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
        sky: 'bg-sky-50 text-sky-600',
    }
    return (
        <div className="text-center space-y-3">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${tones[tone]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <div className="text-sm text-gray-600 space-y-2">{children}</div>
        </div>
    )
}

function RequestAccessForm({ email, onDone }: { email: string; onDone: () => void }) {
    const [fullName, setFullName] = useState('')
    const [note, setNote] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fullName.trim()) {
            setError('กรุณากรอกชื่อ-นามสกุล')
            return
        }
        setIsSaving(true)
        setError(null)
        const { error } = await createClient().rpc('erp_request_access', {
            p_full_name: fullName.trim(),
            p_note: note.trim(),
        })
        setIsSaving(false)
        if (error) {
            setError('ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
            return
        }
        toast.success('ส่งคำขอแล้ว รอผู้ดูแลระบบอนุมัติ')
        onDone()
    }

    return (
        <>
            <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <ShieldQuestion className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">ขอสิทธิ์ใช้ MUST ERP</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        บัญชี <span className="font-medium text-gray-700 break-all">{email}</span> ยังไม่มีสิทธิ์ใช้ระบบนี้
                    </p>
                </div>
            </div>

            {error && (
                <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                    <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="สมชาย ใจดี"
                        maxLength={100}
                        disabled={isSaving}
                        className="h-11"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="note">
                        แผนก / งานที่ต้องใช้ <span className="font-normal text-gray-400">(ไม่บังคับ)</span>
                    </Label>
                    <Textarea
                        id="note"
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="เช่น ฝ่ายคลังสินค้า ต้องดูยอดคงเหลือ"
                        maxLength={300}
                        disabled={isSaving}
                    />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    ส่งคำขอสิทธิ์
                </Button>
            </form>
        </>
    )
}

export default function AccessPage() {
    const router = useRouter()
    const { access, isLoading, error, fetchAccess, clear } = useAccessStore()
    const [email, setEmail] = useState('')
    const [isChecking, setIsChecking] = useState(false)

    useEffect(() => {
        createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
        fetchAccess()
    }, [fetchAccess])

    // Approved with at least one page: nothing to explain, go to work
    const target = firstAllowedHref(access)
    useEffect(() => {
        if (target) router.replace(target)
    }, [target, router])

    const recheck = async () => {
        setIsChecking(true)
        const next = await fetchAccess()
        setIsChecking(false)
        if (next && !firstAllowedHref(next)) toast.info('ยังไม่ได้รับสิทธิ์ ลองใหม่ภายหลัง')
    }

    const signOut = async () => {
        await createClient().auth.signOut()
        clear()
        router.push('/login')
        router.refresh()
    }

    const footer = (
        <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-2 text-gray-500 hover:text-gray-900"
        >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ{email ? ` (${email})` : ''}
        </button>
    )

    const recheckButton = (
        <Button variant="outline" className="w-full h-11 mt-4" onClick={recheck} disabled={isChecking}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            ตรวจสอบสถานะอีกครั้ง
        </Button>
    )

    let content: React.ReactNode
    if ((isLoading && !access) || target) {
        content = (
            <div className="flex justify-center py-10" aria-busy="true">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        )
    } else if (error || !access) {
        content = (
            <StatusBlock icon={AlertCircle} tone="red" title="โหลดสถานะไม่สำเร็จ">
                <p>{error ?? 'กรุณาลองใหม่อีกครั้ง'}</p>
                {recheckButton}
            </StatusBlock>
        )
    } else if (access.status === 'none') {
        content = <RequestAccessForm email={email} onDone={fetchAccess} />
    } else if (access.status === 'pending') {
        content = (
            <StatusBlock icon={Clock} tone="amber" title="รอผู้ดูแลระบบอนุมัติ">
                <p>ส่งคำขอของคุณแล้ว เมื่อผู้ดูแลระบบอนุมัติและกำหนดหน้าที่ใช้ได้ คุณจะเข้าใช้งานได้ทันที</p>
                {recheckButton}
            </StatusBlock>
        )
    } else if (access.status === 'rejected') {
        content = (
            <StatusBlock icon={Ban} tone="red" title="คำขอไม่ได้รับอนุมัติ">
                <p>หากคิดว่าเป็นความผิดพลาด กรุณาติดต่อผู้ดูแลระบบ</p>
            </StatusBlock>
        )
    } else if (access.status === 'suspended') {
        content = (
            <StatusBlock icon={Ban} tone="red" title="บัญชีถูกระงับการใช้งาน">
                <p>กรุณาติดต่อผู้ดูแลระบบเพื่อเปิดใช้งานอีกครั้ง</p>
            </StatusBlock>
        )
    } else {
        content = (
            <StatusBlock icon={ShieldQuestion} tone="sky" title="ยังไม่ได้กำหนดหน้าที่ใช้งานได้">
                <p>บัญชีของคุณได้รับอนุมัติแล้ว แต่ผู้ดูแลระบบยังไม่ได้เปิดสิทธิ์หน้าใดให้</p>
                {recheckButton}
            </StatusBlock>
        )
    }

    return <AuthFrame footer={footer}>{content}</AuthFrame>
}
