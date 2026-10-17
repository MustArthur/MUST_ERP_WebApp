'use client'

import type { ActivitySummary } from '@/lib/permissions'
import { pageLabel } from '@/lib/permissions'
import { SimpleAreaChart } from '@/components/dashboard/area-chart'
import { formatDay, formatRelative } from './format'

const PRIMARY = 'hsl(17 58% 35%)'

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
    return (
        <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums truncate">{value}</p>
            {hint && <p className="mt-0.5 text-xs text-gray-500 truncate">{hint}</p>}
        </div>
    )
}

export function ActivityKpis({ summary }: { summary: ActivitySummary }) {
    const top = summary.by_module[0]
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="การเข้าใช้งานทั้งหมด" value={summary.totals.views.toLocaleString('th-TH')} hint="ครั้งที่เปิดหน้า" />
            <Kpi label="ผู้ใช้ที่ใช้งาน" value={summary.totals.active_users.toLocaleString('th-TH')} hint="คน" />
            <Kpi label="เข้าสู่ระบบ" value={summary.totals.logins.toLocaleString('th-TH')} hint="ครั้ง" />
            <Kpi
                label="โมดูลที่ใช้มากที่สุด"
                value={top ? pageLabel(top.page_key) : '—'}
                hint={top ? `${top.views.toLocaleString('th-TH')} ครั้ง · ${top.users} คน` : undefined}
            />
        </div>
    )
}

// Ranked list instead of a vertical bar chart: 15 Thai module names don't fit on an x-axis
export function ModuleUsage({
    summary,
    selected,
    onSelect,
}: {
    summary: ActivitySummary
    selected: string | null
    onSelect: (pageKey: string | null) => void
}) {
    const max = summary.by_module[0]?.views ?? 0
    return (
        <section className="bg-white rounded-xl border p-4" aria-labelledby="module-usage-title">
            <div className="flex items-baseline justify-between gap-2 mb-3">
                <h2 id="module-usage-title" className="text-base font-medium text-gray-900">การใช้งานแต่ละโมดูล</h2>
                <span className="text-xs text-gray-500">กดเพื่อกรองประวัติด้านล่าง</span>
            </div>
            {summary.by_module.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">ยังไม่มีการเข้าใช้งานในช่วงนี้</p>
            ) : (
                <ul className="space-y-1">
                    {summary.by_module.map((m) => {
                        const isSelected = selected === m.page_key
                        return (
                            <li key={m.page_key}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(isSelected ? null : m.page_key)}
                                    aria-pressed={isSelected}
                                    className={`w-full text-left rounded-md px-2 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-baseline justify-between gap-2 text-sm">
                                        <span className="font-medium text-gray-800 truncate">{pageLabel(m.page_key)}</span>
                                        <span className="shrink-0 tabular-nums text-gray-600">
                                            {m.views.toLocaleString('th-TH')} ครั้ง · {m.users} คน
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-primary"
                                                style={{ width: `${max ? Math.max(2, (m.views / max) * 100) : 0}%` }}
                                            />
                                        </div>
                                        <span className="w-24 shrink-0 text-right text-[11px] text-gray-500 truncate">
                                            {formatRelative(m.last_at)}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}

export function DailyTrend({ summary }: { summary: ActivitySummary }) {
    const data = summary.by_day.map((d) => ({ name: formatDay(d.day), value: d.views, users: d.users }))
    return <SimpleAreaChart title="การเข้าใช้งานรายวัน (ครั้ง)" data={data} color={PRIMARY} height={220} />
}
