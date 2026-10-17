'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ActivityLogRow, ActivitySummary } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ActivityKpis, DailyTrend, ModuleUsage } from '@/components/admin/activity/activity-overview'
import { UserModuleTable } from '@/components/admin/activity/user-module-table'
import { ActivityLogList, LOG_PAGE_SIZE, type LogFilters } from '@/components/admin/activity/activity-log-list'
import { RANGE_PRESETS, rangeFor, type RangePreset } from '@/components/admin/activity/format'
import { RefreshCw } from 'lucide-react'

const NO_FILTERS: LogFilters = { userId: null, pageKey: null, event: null }
const HIDE_TEST_KEY = 'erp-activity-hide-test'

// Per-viewer preference; hidden by default
function readHideTest() {
    try {
        return localStorage.getItem(HIDE_TEST_KEY) !== 'false'
    } catch {
        return true
    }
}

export default function ActivityPage() {
    const [preset, setPreset] = useState<RangePreset>('7d')
    const [hideTest, setHideTest] = useState(true)
    const [prefLoaded, setPrefLoaded] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)
    // Recomputed on refresh too, so "today" keeps moving forward
    const range = useMemo(() => rangeFor(preset), [preset, reloadKey])

    const [summary, setSummary] = useState<ActivitySummary | null>(null)
    const [summaryLoading, setSummaryLoading] = useState(true)
    const [summaryError, setSummaryError] = useState<string | null>(null)

    const [filters, setFilters] = useState<LogFilters>(NO_FILTERS)
    const [page, setPage] = useState(0)
    const [rows, setRows] = useState<ActivityLogRow[]>([])
    const [logsLoading, setLogsLoading] = useState(true)
    const [logsError, setLogsError] = useState<string | null>(null)

    // Ignore responses that arrive after a newer request was made
    const summaryRequest = useRef(0)
    const logsRequest = useRef(0)

    const loadSummary = useCallback(async () => {
        const id = ++summaryRequest.current
        setSummaryLoading(true)
        const { data, error } = await createClient().rpc('erp_admin_activity_summary', {
            p_from: range.from,
            p_to: range.to,
            p_exclude_test: hideTest,
        })
        if (id !== summaryRequest.current) return
        setSummaryLoading(false)
        if (error) {
            setSummaryError('โหลดสรุปการใช้งานไม่สำเร็จ')
            return
        }
        setSummaryError(null)
        setSummary(data as ActivitySummary)
    }, [range, hideTest])

    const loadLogs = useCallback(async () => {
        const id = ++logsRequest.current
        setLogsLoading(true)
        const { data, error } = await createClient().rpc('erp_admin_activity_logs', {
            p_from: range.from,
            p_to: range.to,
            p_user_id: filters.userId,
            p_page_key: filters.pageKey,
            p_event: filters.event,
            p_limit: LOG_PAGE_SIZE,
            p_offset: page * LOG_PAGE_SIZE,
            p_exclude_test: hideTest,
        })
        if (id !== logsRequest.current) return
        setLogsLoading(false)
        if (error) {
            setLogsError('โหลดประวัติการใช้งานไม่สำเร็จ')
            return
        }
        setLogsError(null)
        setRows((data ?? []) as ActivityLogRow[])
    }, [range, filters, page, hideTest])

    useEffect(() => {
        setHideTest(readHideTest())
        setPrefLoaded(true)
    }, [])

    // Wait for the saved preference so we don't load twice on open
    useEffect(() => {
        if (prefLoaded) loadSummary()
    }, [loadSummary, prefLoaded])

    useEffect(() => {
        if (prefLoaded) loadLogs()
    }, [loadLogs, prefLoaded])

    const changeHideTest = (next: boolean) => {
        setHideTest(next)
        // A hidden test account may be the selected user filter
        setFilters((f) => ({ ...f, userId: null }))
        setPage(0)
        try {
            localStorage.setItem(HIDE_TEST_KEY, String(next))
        } catch {
            // ignore
        }
    }

    const changeFilters = (next: LogFilters) => {
        setFilters(next)
        setPage(0)
    }

    const changePreset = (next: RangePreset) => {
        setPreset(next)
        setPage(0)
    }

    const isLoading = summaryLoading || logsLoading

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ประวัติการใช้งาน</h1>
                        <p className="text-sm text-gray-500">ใครเข้าใช้โมดูลไหน บ่อยแค่ไหน และล่าสุดเมื่อไร (เก็บย้อนหลัง 180 วัน)</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        รีเฟรช
                    </Button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Tabs value={preset} onValueChange={(v) => changePreset(v as RangePreset)}>
                        <TabsList className="w-full sm:w-auto overflow-x-auto justify-start" aria-label="ช่วงเวลา">
                            {RANGE_PRESETS.map((p) => (
                                <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-2">
                        <Switch id="hide-test" checked={hideTest} onCheckedChange={changeHideTest} />
                        <Label htmlFor="hide-test" className="text-sm font-normal text-gray-700 cursor-pointer">
                            ซ่อนบัญชีทดสอบ
                            <span className="ml-1 text-xs text-gray-500">(อีเมล .test)</span>
                        </Label>
                    </div>
                </div>

                {summaryError ? (
                    <div role="alert" className="bg-white rounded-xl border p-8 text-center space-y-3">
                        <p className="text-red-600">{summaryError}</p>
                        <Button variant="outline" onClick={loadSummary}>ลองใหม่</Button>
                    </div>
                ) : !summary ? (
                    <div className="space-y-4" aria-busy="true">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-24 rounded-xl bg-white border animate-pulse" />
                            ))}
                        </div>
                        <div className="h-64 rounded-xl bg-white border animate-pulse" />
                    </div>
                ) : (
                    <div className={`space-y-4 transition-opacity ${summaryLoading ? 'opacity-60' : ''}`} aria-busy={summaryLoading}>
                        <ActivityKpis summary={summary} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <ModuleUsage
                                summary={summary}
                                selected={filters.pageKey}
                                onSelect={(pageKey) => changeFilters({ ...filters, pageKey })}
                            />
                            <DailyTrend summary={summary} />
                        </div>
                        <UserModuleTable
                            summary={summary}
                            selectedUserId={filters.userId}
                            onSelectUser={(userId) => changeFilters({ ...filters, userId })}
                        />
                    </div>
                )}

                <ActivityLogList
                    rows={rows}
                    users={summary?.by_user ?? []}
                    filters={filters}
                    onFiltersChange={changeFilters}
                    page={page}
                    onPageChange={setPage}
                    isLoading={logsLoading}
                    error={logsError}
                    onRetry={loadLogs}
                />
            </main>
        </div>
    )
}
