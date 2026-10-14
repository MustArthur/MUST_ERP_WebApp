'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { AuthFrame } from '@/components/layout/auth-frame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AlertCircle, Loader2, MailCheck } from 'lucide-react'

const signupSchema = z
    .object({
        fullName: z.string().trim().min(1, 'กรุณากรอกชื่อ-นามสกุล').max(100, 'ชื่อยาวเกิน 100 ตัวอักษร'),
        email: z.string().trim().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
        password: z.string().min(8, 'รหัสผ่านอย่างน้อย 8 ตัวอักษร'),
        confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
        note: z.string().trim().max(300, 'ข้อความยาวเกิน 300 ตัวอักษร'),
    })
    .refine((v) => v.password === v.confirmPassword, {
        message: 'รหัสผ่านไม่ตรงกัน',
        path: ['confirmPassword'],
    })

type SignupValues = z.infer<typeof signupSchema>

function signupErrorMessage(message: string): string {
    if (/already registered|already exists/i.test(message)) {
        return 'อีเมลนี้มีบัญชีอยู่แล้ว — เข้าสู่ระบบด้วยบัญชีนั้นแล้วกดขอสิทธิ์ใช้งานได้เลย'
    }
    if (/signups? not allowed|signup is disabled/i.test(message)) {
        return 'ระบบปิดรับสมัครอยู่ กรุณาติดต่อผู้ดูแลระบบ'
    }
    if (/rate limit/i.test(message)) {
        return 'ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่'
    }
    return message
}

export default function SignupPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [sentTo, setSentTo] = useState<string | null>(null)

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', note: '' },
    })
    const isSubmitting = form.formState.isSubmitting

    const onSubmit = async (values: SignupValues) => {
        setError(null)
        const { data, error } = await createClient().auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                // erp_signup tells the database trigger to file an ERP access request
                data: { erp_signup: 'true', full_name: values.fullName, note: values.note },
            },
        })

        if (error) {
            setError(signupErrorMessage(error.message))
            return
        }

        // Supabase hides existing accounts behind a fake success with no identities
        if (data.user && data.user.identities?.length === 0) {
            setError(signupErrorMessage('already registered'))
            return
        }

        // With email confirmation off we are signed in straight away
        if (data.session) {
            router.push('/access')
            router.refresh()
            return
        }
        setSentTo(values.email)
    }

    if (sentTo) {
        return (
            <AuthFrame>
                <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                        <MailCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">ตรวจสอบอีเมลของคุณ</h2>
                    <p className="text-sm text-gray-600">
                        เราส่งลิงก์ยืนยันไปที่ <span className="font-medium text-gray-900 break-all">{sentTo}</span>{' '}
                        กดลิงก์นั้นเพื่อยืนยันอีเมล แล้วรอผู้ดูแลระบบอนุมัติสิทธิ์การใช้งาน
                    </p>
                    <Button asChild variant="outline" className="w-full h-11 mt-2">
                        <Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>
                    </Button>
                </div>
            </AuthFrame>
        )
    }

    return (
        <AuthFrame
            footer={
                <>
                    มีบัญชีอยู่แล้ว?{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        เข้าสู่ระบบ
                    </Link>
                </>
            }
        >
            <h2 className="text-xl font-semibold text-gray-900">สมัครและขอสิทธิ์ใช้งาน</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">
                หลังสมัคร ผู้ดูแลระบบจะตรวจสอบและกำหนดหน้าที่คุณใช้งานได้
            </p>

            {error && (
                <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ชื่อ-นามสกุล</FormLabel>
                                <FormControl>
                                    <Input placeholder="สมชาย ใจดี" autoComplete="name" className="h-11" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>อีเมล</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="somchai@example.com" autoComplete="email" className="h-11" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>รหัสผ่าน</FormLabel>
                                    <FormControl>
                                        <Input type="password" autoComplete="new-password" className="h-11" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                                    <FormControl>
                                        <Input type="password" autoComplete="new-password" className="h-11" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    แผนก / งานที่ต้องใช้ <span className="font-normal text-gray-400">(ไม่บังคับ)</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea rows={2} placeholder="เช่น ฝ่าย QC ต้องบันทึกผลตรวจวัตถุดิบ" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังส่งคำขอ...
                            </>
                        ) : (
                            'สมัครและส่งคำขอ'
                        )}
                    </Button>
                </form>
            </Form>
        </AuthFrame>
    )
}
