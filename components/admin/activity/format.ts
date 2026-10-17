import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'

const BANGKOK = 'Asia/Bangkok'
const DAY_MS = 86_400_000
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000

export type RangePreset = 'today' | '7d' | '30d' | '90d' | '180d'

export const RANGE_PRESETS: { value: RangePreset; label: string; days: number }[] = [
    { value: 'today', label: 'วันนี้', days: 1 },
    { value: '7d', label: '7 วัน', days: 7 },
    { value: '30d', label: '30 วัน', days: 30 },
    { value: '90d', label: '90 วัน', days: 90 },
    { value: '180d', label: '180 วัน', days: 180 },
]

// [from, to) covering whole Bangkok days, ending with today
export function rangeFor(preset: RangePreset): { from: string; to: string } {
    const days = RANGE_PRESETS.find((p) => p.value === preset)?.days ?? 7
    const bangkokNow = new Date(Date.now() + BANGKOK_OFFSET_MS)
    const startOfToday =
        Date.UTC(bangkokNow.getUTCFullYear(), bangkokNow.getUTCMonth(), bangkokNow.getUTCDate()) - BANGKOK_OFFSET_MS
    return {
        from: new Date(startOfToday - (days - 1) * DAY_MS).toISOString(),
        to: new Date(startOfToday + DAY_MS).toISOString(),
    }
}

export function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('th-TH', {
        timeZone: BANGKOK,
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// 'YYYY-MM-DD' (already a Bangkok day) → '17 ต.ค.'
export function formatDay(day: string) {
    return new Date(`${day}T00:00:00Z`).toLocaleDateString('th-TH', { timeZone: 'UTC', day: 'numeric', month: 'short' })
}

export function formatRelative(iso: string) {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: th })
}

export function deviceLabel(userAgent: string | null) {
    if (!userAgent) return null
    return /Mobi|Android|iPhone|iPad/i.test(userAgent) ? 'มือถือ' : 'คอมพิวเตอร์'
}

export function displayName(user: { full_name: string | null; email: string | null }) {
    return user.full_name || user.email?.split('@')[0] || 'ไม่ทราบชื่อ'
}
