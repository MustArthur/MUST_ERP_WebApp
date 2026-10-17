'use client'

import type { ActivityEvent, ActivityLogRow, ActivitySummary } from '@/lib/permissions'
import { PAGES, pageLabel } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, History } from 'lucide-react'
import { deviceLabel, displayName, formatDateTime } from './format'

export const LOG_PAGE_SIZE = 50

export interface LogFilters {
    userId: string | null
    pageKey: string | null
    event: ActivityEvent | null
}

const EVENT_LABEL: Record<ActivityEvent, string> = {
    page_view: 'เข้าหน้า',
    login: 'เข้าสู่ระบบ',
    logout: 'ออกจากระบบ',
}

const EVENT_CLASS: Record<ActivityEvent, string> = {
    page_view: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    login: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
    logout: 'bg-amber-50 text-amber-800 hover:bg-amber-50',
}

const MODULE_OPTIONS = [...PAGES.map((p) => ({ key: p.key as string, label: p.label })), { key: 'admin', label: pageLabel('admin') }]

export function ActivityLogList({
    rows,
    users,
    filters,
    onFiltersChange,
    page,
    onPageChange,
    isLoading,
    error,
    onRetry,
}: {
    rows: ActivityLogRow[]
    users: ActivitySummary['by_user']
    filters: LogFilters
    onFiltersChange: (filters: LogFilters) => void
    page: number
    onPageChange: (page: number) => void
    isLoading: boolean
    error: string | null
    onRetry: () => void
}) {
    const total = rows[0]?.total_count ?? 0
    const pageCount = Math.max(1, Math.ceil(total / LOG_PAGE_SIZE))
    const hasFilters = filters.userId || filters.pageKey || filters.event

    return (
        <section className="bg-white rounded-xl border" aria-labelledby="activity-log-title">
            <div className="px-4 pt-4 pb-3 space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                    <h2 id="activity-log-title" className="text-base font-medium text-gray-900">ประวัติการใช้งาน</h2>
                    <span className="text-xs text-gray-500 tabular-nums">{total.toLocaleString('th-TH')} รายการ</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Select
                        value={filters.userId ?? 'all'}
                        onValueChange={(v) => onFiltersChange({ ...filters, userId: v === 'all' ? null : v })}
                    >
                        <SelectTrigger aria-label="กรองตามผู้ใช้"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ผู้ใช้ทั้งหมด</SelectItem>
                            {users.map((u) => (
                                <SelectItem key={u.user_id} value={u.user_id}>{displayName(u)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.pageKey ?? 'all'}
                        onValueChange={(v) => onFiltersChange({ ...filters, pageKey: v === 'all' ? null : v })}
                    >
                        <SelectTrigger aria-label="กรองตามโมดูล"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกโมดูล</SelectItem>
                            {MODULE_OPTIONS.map((m) => (
                                <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.event ?? 'all'}
                        onValueChange={(v) => onFiltersChange({ ...filters, event: v === 'all' ? null : (v as ActivityEvent) })}
                    >
                        <SelectTrigger aria-label="กรองตามประเภท"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกประเภท</SelectItem>
                            {(Object.keys(EVENT_LABEL) as ActivityEvent[]).map((e) => (
                                <SelectItem key={e} value={e}>{EVENT_LABEL[e]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {hasFilters && (
                    <button
                        type="button"
                        onClick={() => onFiltersChange({ userId: null, pageKey: null, event: null })}
                        className="text-sm text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        ล้างตัวกรอง
                    </button>
                )}
            </div>

            {error ? (
                <div role="alert" className="border-t px-4 py-8 text-center space-y-3">
                    <p className="text-red-600">{error}</p>
                    <Button variant="outline" onClick={onRetry}>ลองใหม่</Button>
                </div>
            ) : isLoading && rows.length === 0 ? (
                <div className="border-t divide-y" aria-busy="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="px-4 py-3"><div className="h-9 rounded bg-gray-100 animate-pulse" /></div>
                    ))}
                </div>
            ) : rows.length === 0 ? (
                <div className="border-t px-4 py-10 text-center">
                    <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">{hasFilters ? 'ไม่พบรายการตามตัวกรองนี้' : 'ยังไม่มีประวัติในช่วงนี้'}</p>
                </div>
            ) : (
                <ul className={`border-t divide-y transition-opacity ${isLoading ? 'opacity-60' : ''}`} aria-busy={isLoading}>
                    {rows.map((r) => {
                        const device = deviceLabel(r.user_agent)
                        return (
                            <li key={r.id} className="px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                <time dateTime={r.created_at} className="w-28 shrink-0 tabular-nums text-gray-500">
                                    {formatDateTime(r.created_at)}
                                </time>
                                <span className="min-w-0 flex-1 basis-40">
                                    <span className="font-medium text-gray-900">{displayName(r)}</span>
                                    {r.email && r.full_name && <span className="ml-1.5 text-xs text-gray-500">{r.email}</span>}
                                </span>
                                <Badge className={EVENT_CLASS[r.event]}>{EVENT_LABEL[r.event]}</Badge>
                                {r.page_key && (
                                    <span className="text-gray-700">
                                        {pageLabel(r.page_key)}
                                        {r.path && r.path !== PAGES.find((p) => p.key === r.page_key)?.href && (
                                            <span className="ml-1 text-xs text-gray-400">{r.path}</span>
                                        )}
                                    </span>
                                )}
                                {device && <span className="text-xs text-gray-400">{device}</span>}
                            </li>
                        )
                    })}
                </ul>
            )}

            {total > LOG_PAGE_SIZE && !error && (
                <div className="border-t px-4 py-3 flex items-center justify-between gap-2">
                    <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 0 || isLoading}>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        ก่อนหน้า
                    </Button>
                    <span className="text-sm text-gray-500 tabular-nums">หน้า {page + 1} / {pageCount}</span>
                    <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page + 1 >= pageCount || isLoading}>
                        ถัดไป
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}
        </section>
    )
}
