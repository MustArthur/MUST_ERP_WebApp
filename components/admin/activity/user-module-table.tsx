'use client'

import type { ActivitySummary } from '@/lib/permissions'
import { pageLabel } from '@/lib/permissions'
import { displayName, formatRelative } from './format'

// Cell tint scales with the count, relative to the busiest cell in the table
function cellClass(count: number, max: number) {
    if (!count) return 'text-gray-300'
    const ratio = count / max
    if (ratio > 0.66) return 'bg-primary/25 text-gray-900 font-medium'
    if (ratio > 0.33) return 'bg-primary/15 text-gray-900'
    return 'bg-primary/5 text-gray-700'
}

export function UserModuleTable({
    summary,
    selectedUserId,
    onSelectUser,
}: {
    summary: ActivitySummary
    selectedUserId: string | null
    onSelectUser: (userId: string | null) => void
}) {
    // Only modules someone used in this range, busiest first
    const modules = summary.by_module.map((m) => m.page_key)
    const max = Math.max(1, ...summary.by_user.flatMap((u) => Object.values(u.modules)))

    return (
        <section className="bg-white rounded-xl border" aria-labelledby="user-module-title">
            <div className="flex items-baseline justify-between gap-2 px-4 pt-4 pb-3">
                <h2 id="user-module-title" className="text-base font-medium text-gray-900">ผู้ใช้ × โมดูล</h2>
                <span className="text-xs text-gray-500">จำนวนครั้งที่เปิดหน้า · กดชื่อเพื่อดูประวัติ</span>
            </div>
            {summary.by_user.length === 0 ? (
                <p className="px-4 pb-8 pt-2 text-center text-sm text-gray-500">ยังไม่มีผู้ใช้เข้าใช้งานในช่วงนี้</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-y bg-gray-50 text-gray-600">
                                <th scope="col" className="sticky left-0 z-10 bg-gray-50 text-left font-medium px-4 py-2 min-w-[180px]">ผู้ใช้</th>
                                <th scope="col" className="text-right font-medium px-3 py-2 whitespace-nowrap">รวม</th>
                                {modules.map((key) => (
                                    <th key={key} scope="col" className="text-center font-medium px-2 py-2 whitespace-nowrap text-xs">
                                        {pageLabel(key)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {summary.by_user.map((u) => {
                                const isSelected = selectedUserId === u.user_id
                                return (
                                    <tr key={u.user_id} className={`border-b last:border-0 ${isSelected ? 'bg-primary/5' : ''}`}>
                                        <th scope="row" className={`sticky left-0 z-10 text-left font-normal px-4 py-2 ${isSelected ? 'bg-[#f9f4f2]' : 'bg-white'}`}>
                                            <button
                                                type="button"
                                                onClick={() => onSelectUser(isSelected ? null : u.user_id)}
                                                aria-pressed={isSelected}
                                                className="text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                <span className="block font-medium text-gray-900 hover:text-primary">{displayName(u)}</span>
                                                <span className="block text-xs text-gray-500">
                                                    ล่าสุด {formatRelative(u.last_at)}
                                                    {u.logins > 0 && ` · login ${u.logins} ครั้ง`}
                                                </span>
                                            </button>
                                        </th>
                                        <td className="text-right px-3 py-2 tabular-nums font-medium text-gray-900">
                                            {u.views.toLocaleString('th-TH')}
                                        </td>
                                        {modules.map((key) => {
                                            const count = u.modules[key] ?? 0
                                            return (
                                                <td key={key} className="px-1 py-1 text-center">
                                                    <span className={`block rounded px-2 py-1 tabular-nums ${cellClass(count, max)}`}>
                                                        {count ? count.toLocaleString('th-TH') : '—'}
                                                    </span>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}
