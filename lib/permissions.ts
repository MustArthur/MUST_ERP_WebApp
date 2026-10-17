// Page-level access control shared by middleware, the sidebar and the admin page.
// Keep PAGE_KEYS in sync with the CHECK constraint on erp_page_permissions (migration 009)
// and the page_key list in erp_log_activity (migration 013).

export const PAGES = [
    { key: 'dashboard', href: '/dashboard', label: 'แดชบอร์ด' },
    { key: 'items', href: '/items', label: 'สินค้า/วัตถุดิบ' },
    { key: 'suppliers', href: '/suppliers', label: 'ซัพพลายเออร์' },
    { key: 'recipes', href: '/recipes', label: 'สูตรการผลิต' },
    { key: 'receiving', href: '/receiving', label: 'รับวัตถุดิบ' },
    { key: 'quality', href: '/quality', label: 'คุณภาพ (QC)' },
    { key: 'production_planning', href: '/production-planning', label: 'วางแผนการผลิต' },
    { key: 'production', href: '/production', label: 'การผลิต' },
    { key: 'inventory', href: '/inventory', label: 'คลังสินค้า' },
    { key: 'transactions', href: '/transactions', label: 'รายการเคลื่อนไหว' },
    { key: 'finished_goods', href: '/finished-goods', label: 'สินค้าสำเร็จรูป' },
    { key: 'delivery', href: '/delivery', label: 'จัดส่งสินค้า' },
    { key: 'factory_expenses', href: '/factory-expenses', label: 'ค่าใช้จ่าย' },
    { key: 'vehicles', href: '/vehicles', label: 'รถขนส่ง' },
    { key: 'machines', href: '/machines', label: 'เครื่องจักร' },
] as const

export type PageKey = (typeof PAGES)[number]['key']
export const PAGE_KEYS: PageKey[] = PAGES.map((p) => p.key)

export type AccessLevel = 'view' | 'edit'
export type MemberStatus = 'pending' | 'active' | 'rejected' | 'suspended'
export type PermissionMap = Partial<Record<PageKey, AccessLevel>>

// Shape returned by the erp_my_access() RPC
export interface MyAccess {
    status: MemberStatus | 'none'
    is_admin: boolean
    full_name?: string | null
    permissions: PermissionMap
    pending_count?: number | null
}

// Shape returned by the erp_admin_list_members() RPC
export interface ErpMember {
    user_id: string
    email: string
    full_name: string | null
    note: string | null
    status: MemberStatus
    is_admin: boolean
    requested_at: string
    decided_at: string | null
    permissions: PermissionMap
}

// Activity log (migration 013). page_key is a PageKey or 'admin'
export type ActivityEvent = 'page_view' | 'login' | 'logout'

// Shape returned by the erp_admin_activity_summary() RPC
export interface ActivitySummary {
    totals: { views: number; active_users: number; logins: number }
    by_module: { page_key: string; views: number; users: number; last_at: string }[]
    by_day: { day: string; views: number; users: number }[]
    by_user: {
        user_id: string
        email: string | null
        full_name: string | null
        views: number
        logins: number
        last_at: string
        modules: Record<string, number>
    }[]
}

// Row returned by the erp_admin_activity_logs() RPC
export interface ActivityLogRow {
    id: number
    created_at: string
    user_id: string
    email: string | null
    full_name: string | null
    event: ActivityEvent
    page_key: string | null
    path: string | null
    user_agent: string | null
    total_count: number
}

export const ADMIN_PATH = '/admin'

export function pageLabel(key: string | null | undefined): string {
    if (!key) return '—'
    if (key === 'admin') return 'ผู้ดูแลระบบ'
    return PAGES.find((p) => p.key === key)?.label ?? key
}

export function pageKeyForPath(pathname: string): PageKey | null {
    const page = PAGES.find((p) => pathname === p.href || pathname.startsWith(`${p.href}/`))
    return page?.key ?? null
}

export function isActiveMember(access: MyAccess | null | undefined): boolean {
    return access?.status === 'active'
}

export function canView(access: MyAccess | null | undefined, key: PageKey): boolean {
    if (!isActiveMember(access)) return false
    return access!.is_admin || access!.permissions[key] !== undefined
}

export function canEdit(access: MyAccess | null | undefined, key: PageKey): boolean {
    if (!isActiveMember(access)) return false
    return access!.is_admin || access!.permissions[key] === 'edit'
}

// Where to land after login, or when a page is not allowed. null = nothing to show.
export function firstAllowedHref(access: MyAccess | null | undefined): string | null {
    const page = PAGES.find((p) => canView(access, p.key))
    if (page) return page.href
    return access?.is_admin && isActiveMember(access) ? `${ADMIN_PATH}/members` : null
}
