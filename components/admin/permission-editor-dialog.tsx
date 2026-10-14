'use client'

import { useEffect, useState } from 'react'
import { navGroups } from '@/components/layout/nav-data'
import { PAGE_KEYS, pageKeyForPath, type AccessLevel, type ErpMember, type PermissionMap } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

type Choice = AccessLevel | 'none'

const CHOICES: { value: Choice; label: string; active: string }[] = [
    { value: 'none', label: 'ไม่เห็น', active: 'bg-white text-gray-700 shadow-sm' },
    { value: 'view', label: 'ดู', active: 'bg-sky-600 text-white shadow-sm' },
    { value: 'edit', label: 'แก้ไข', active: 'bg-primary text-primary-foreground shadow-sm' },
]

function LevelPicker({ label, value, onChange }: { label: string; value: Choice; onChange: (v: Choice) => void }) {
    return (
        <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-gray-100 p-0.5 shrink-0">
            {CHOICES.map((c) => (
                <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={value === c.value}
                    onClick={() => onChange(c.value)}
                    className={cn(
                        'min-w-[52px] h-9 px-2.5 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        value === c.value ? c.active : 'text-gray-500 hover:text-gray-900'
                    )}
                >
                    {c.label}
                </button>
            ))}
        </div>
    )
}

interface PermissionEditorDialogProps {
    member: ErpMember | null
    // Approving a pending request saves permissions and activates the member in one step
    mode: 'edit' | 'approve'
    onOpenChange: (open: boolean) => void
    onSave: (member: ErpMember, permissions: PermissionMap) => Promise<void>
}

export function PermissionEditorDialog({ member, mode, onOpenChange, onSave }: PermissionEditorDialogProps) {
    const [draft, setDraft] = useState<PermissionMap>({})
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (member) setDraft({ ...member.permissions })
    }, [member])

    const setAll = (level: Choice) =>
        setDraft(level === 'none' ? {} : Object.fromEntries(PAGE_KEYS.map((k) => [k, level])))

    const handleSave = async () => {
        if (!member) return
        setIsSaving(true)
        try {
            await onSave(member, draft)
            onOpenChange(false)
        } finally {
            setIsSaving(false)
        }
    }

    const viewCount = Object.values(draft).filter((l) => l === 'view').length
    const editCount = Object.values(draft).filter((l) => l === 'edit').length

    return (
        <Dialog open={!!member} onOpenChange={(open) => !isSaving && onOpenChange(open)}>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col gap-0 p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>{mode === 'approve' ? 'อนุมัติและกำหนดสิทธิ์' : 'กำหนดสิทธิ์การใช้งาน'}</DialogTitle>
                    <DialogDescription className="break-all">
                        {member?.full_name ? `${member.full_name} · ` : ''}
                        {member?.email}
                    </DialogDescription>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setAll('view')}>ดูได้ทุกหน้า</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setAll('edit')}>แก้ไขได้ทุกหน้า</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setAll('none')}>ล้างทั้งหมด</Button>
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto px-6 py-4 space-y-5">
                    {navGroups.map((group) => (
                        <section key={group.id}>
                            <h3 className="text-xs font-medium text-gray-400 mb-2">{group.label ?? 'ภาพรวม'}</h3>
                            <ul className="space-y-1.5">
                                {group.items.map((item) => {
                                    const key = pageKeyForPath(item.href)
                                    if (!key) return null
                                    const Icon = item.icon
                                    return (
                                        <li key={key} className="flex items-center justify-between gap-3">
                                            <span className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                                                <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="truncate">{item.name}</span>
                                            </span>
                                            <LevelPicker
                                                label={item.name}
                                                value={draft[key] ?? 'none'}
                                                onChange={(v) =>
                                                    setDraft((d) => {
                                                        const next = { ...d }
                                                        if (v === 'none') delete next[key]
                                                        else next[key] = v
                                                        return next
                                                    })
                                                }
                                            />
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                    ))}
                </div>

                <DialogFooter className="p-6 pt-4 border-t sm:items-center gap-2">
                    <p className="text-sm text-gray-500 sm:mr-auto">
                        ดู {viewCount} · แก้ไข {editCount} หน้า
                    </p>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        ยกเลิก
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === 'approve' ? 'อนุมัติ' : 'บันทึก'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
