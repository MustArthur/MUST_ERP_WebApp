'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { PAGES, type ErpMember, type MemberStatus, type PermissionMap } from '@/lib/permissions'
import { useAccessStore } from '@/stores/access-store'
import { PermissionEditorDialog } from '@/components/admin/permission-editor-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Check, Loader2, RefreshCw, ShieldCheck, SlidersHorizontal, UserX, Users, X } from 'lucide-react'

type TabValue = 'pending' | 'active' | 'inactive'

const STATUS_LABEL: Record<MemberStatus, string> = {
    pending: 'รออนุมัติ',
    active: 'ใช้งาน',
    rejected: 'ปฏิเสธ',
    suspended: 'ระงับ',
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

function PermissionChips({ permissions }: { permissions: PermissionMap }) {
    const granted = PAGES.filter((p) => permissions[p.key])
    if (granted.length === 0) {
        return <p className="text-sm text-amber-700">ยังไม่ได้กำหนดหน้าที่ใช้ได้</p>
    }
    return (
        <ul className="flex flex-wrap gap-1.5" aria-label="สิทธิ์ที่ได้รับ">
            {granted.map((p) => (
                <li
                    key={p.key}
                    className={
                        permissions[p.key] === 'edit'
                            ? 'text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary'
                            : 'text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700'
                    }
                >
                    {p.label}
                    <span className="sr-only">{permissions[p.key] === 'edit' ? ' (แก้ไข)' : ' (ดู)'}</span>
                </li>
            ))}
        </ul>
    )
}

type Confirm = { member: ErpMember; status: Extract<MemberStatus, 'rejected' | 'suspended'> } | null

export default function MembersPage() {
    const [members, setMembers] = useState<ErpMember[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [tab, setTab] = useState<TabValue>('pending')
    const [editing, setEditing] = useState<{ member: ErpMember; mode: 'edit' | 'approve' } | null>(null)
    const [confirm, setConfirm] = useState<Confirm>(null)
    const [isConfirming, setIsConfirming] = useState(false)
    const refreshAccess = useAccessStore((s) => s.fetchAccess)

    const load = useCallback(async () => {
        setIsLoading(true)
        const { data, error } = await createClient().rpc('erp_admin_list_members')
        setIsLoading(false)
        if (error) {
            setLoadError('โหลดรายชื่อผู้ใช้ไม่สำเร็จ')
            return
        }
        setLoadError(null)
        setMembers((data ?? []) as ErpMember[])
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const groups = useMemo(
        () => ({
            pending: members.filter((m) => m.status === 'pending'),
            active: members.filter((m) => m.status === 'active'),
            inactive: members.filter((m) => m.status === 'rejected' || m.status === 'suspended'),
        }),
        [members]
    )

    // Open on the pending tab only when there is something to decide
    useEffect(() => {
        if (!isLoading && groups.pending.length === 0) setTab((t) => (t === 'pending' ? 'active' : t))
    }, [isLoading, groups.pending.length])

    const afterChange = async () => {
        await load()
        refreshAccess()
    }

    const savePermissions = async (member: ErpMember, permissions: PermissionMap) => {
        const supabase = createClient()
        const { error } = await supabase.rpc('erp_admin_set_permissions', {
            p_user_id: member.user_id,
            p_permissions: permissions,
        })
        if (error) {
            toast.error('บันทึกสิทธิ์ไม่สำเร็จ')
            throw error
        }
        if (editing?.mode === 'approve') {
            const { error: statusError } = await supabase.rpc('erp_admin_set_status', {
                p_user_id: member.user_id,
                p_status: 'active',
            })
            if (statusError) {
                toast.error('บันทึกสิทธิ์แล้ว แต่เปิดใช้งานไม่สำเร็จ')
                await afterChange()
                throw statusError
            }
            toast.success(`อนุมัติ ${member.full_name || member.email} แล้ว`)
        } else {
            toast.success('บันทึกสิทธิ์แล้ว')
        }
        await afterChange()
    }

    const applyStatus = async () => {
        if (!confirm) return
        setIsConfirming(true)
        const { error } = await createClient().rpc('erp_admin_set_status', {
            p_user_id: confirm.member.user_id,
            p_status: confirm.status,
        })
        setIsConfirming(false)
        if (error) {
            toast.error('เปลี่ยนสถานะไม่สำเร็จ')
            return
        }
        toast.success(confirm.status === 'rejected' ? 'ปฏิเสธคำขอแล้ว' : 'ระงับการใช้งานแล้ว')
        setConfirm(null)
        await afterChange()
    }

    const list = groups[tab]

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ผู้ใช้งาน</h1>
                        <p className="text-sm text-gray-500">อนุมัติคำขอ และกำหนดว่าใครเห็นหรือแก้ไขหน้าไหนได้</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        รีเฟรช
                    </Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
                <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
                    <TabsList className="w-full sm:w-auto overflow-x-auto justify-start">
                        <TabsTrigger value="pending">
                            รออนุมัติ
                            {groups.pending.length > 0 && (
                                <span className="ml-1.5 min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-[11px] font-semibold inline-flex items-center justify-center">
                                    {groups.pending.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="active">ใช้งาน ({groups.active.length})</TabsTrigger>
                        <TabsTrigger value="inactive">ปฏิเสธ/ระงับ ({groups.inactive.length})</TabsTrigger>
                    </TabsList>
                </Tabs>

                {isLoading && members.length === 0 ? (
                    <div className="space-y-3" aria-busy="true">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-28 rounded-xl bg-white border animate-pulse" />
                        ))}
                    </div>
                ) : loadError ? (
                    <div role="alert" className="bg-white rounded-xl border p-8 text-center space-y-3">
                        <p className="text-red-600">{loadError}</p>
                        <Button variant="outline" onClick={load}>ลองใหม่</Button>
                    </div>
                ) : list.length === 0 ? (
                    <div className="bg-white rounded-xl border p-10 text-center">
                        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">
                            {tab === 'pending' ? 'ไม่มีคำขอที่รออนุมัติ' : 'ไม่มีผู้ใช้ในกลุ่มนี้'}
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {list.map((m) => (
                            <li key={m.user_id} className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-gray-900">{m.full_name || m.email.split('@')[0]}</p>
                                            {m.is_admin ? (
                                                <Badge className="gap-1"><ShieldCheck className="w-3 h-3" />ผู้ดูแลระบบ</Badge>
                                            ) : m.status !== 'active' ? (
                                                <Badge variant={m.status === 'pending' ? 'warning' : 'secondary'}>{STATUS_LABEL[m.status]}</Badge>
                                            ) : null}
                                        </div>
                                        <p className="text-sm text-gray-500 break-all">{m.email}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            ขอเมื่อ {formatDate(m.requested_at)}
                                            {m.decided_at && ` · ตัดสินเมื่อ ${formatDate(m.decided_at)}`}
                                        </p>
                                    </div>

                                    {!m.is_admin && (
                                        <div className="flex flex-wrap gap-2">
                                            {m.status === 'pending' && (
                                                <>
                                                    <Button size="sm" variant="outline" onClick={() => setConfirm({ member: m, status: 'rejected' })}>
                                                        <X className="w-4 h-4 mr-1.5" />ปฏิเสธ
                                                    </Button>
                                                    <Button size="sm" onClick={() => setEditing({ member: m, mode: 'approve' })}>
                                                        <Check className="w-4 h-4 mr-1.5" />อนุมัติ
                                                    </Button>
                                                </>
                                            )}
                                            {m.status === 'active' && (
                                                <>
                                                    <Button size="sm" variant="outline" onClick={() => setConfirm({ member: m, status: 'suspended' })}>
                                                        <UserX className="w-4 h-4 mr-1.5" />ระงับ
                                                    </Button>
                                                    <Button size="sm" onClick={() => setEditing({ member: m, mode: 'edit' })}>
                                                        <SlidersHorizontal className="w-4 h-4 mr-1.5" />กำหนดสิทธิ์
                                                    </Button>
                                                </>
                                            )}
                                            {(m.status === 'rejected' || m.status === 'suspended') && (
                                                <Button size="sm" variant="outline" onClick={() => setEditing({ member: m, mode: 'approve' })}>
                                                    <Check className="w-4 h-4 mr-1.5" />เปิดใช้งาน
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {m.note && (
                                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-line">{m.note}</p>
                                )}

                                {m.is_admin ? (
                                    <p className="text-sm text-gray-500">เข้าถึงและแก้ไขได้ทุกหน้า</p>
                                ) : m.status === 'active' ? (
                                    <PermissionChips permissions={m.permissions} />
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <PermissionEditorDialog
                member={editing?.member ?? null}
                mode={editing?.mode ?? 'edit'}
                onOpenChange={(open) => !open && setEditing(null)}
                onSave={savePermissions}
            />

            <AlertDialog open={!!confirm} onOpenChange={(open) => !open && !isConfirming && setConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirm?.status === 'rejected' ? 'ปฏิเสธคำขอนี้?' : 'ระงับการใช้งานผู้ใช้นี้?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirm?.member.full_name || confirm?.member.email} จะเข้าใช้ MUST ERP ไม่ได้
                            จนกว่าคุณจะกดเปิดใช้งานอีกครั้ง
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isConfirming}>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                applyStatus()
                            }}
                            disabled={isConfirming}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {confirm?.status === 'rejected' ? 'ปฏิเสธ' : 'ระงับ'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
