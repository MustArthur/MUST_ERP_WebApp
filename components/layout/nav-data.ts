import {
    LayoutDashboard,
    Package,
    Users,
    BookOpen,
    Truck,
    ClipboardCheck,
    Factory,
    Warehouse,
    ArrowLeftRight,
    Package2,
    Send,
    CalendarDays,
    Receipt,
    Wrench,
    type LucideIcon,
} from 'lucide-react'

export interface NavItem {
    name: string
    href: string
    icon: LucideIcon
}

export interface NavGroup {
    id: string
    label?: string
    items: NavItem[]
}

// Mirrors the production workflow: receive raw material -> QC -> produce -> stock -> deliver
export const navGroups: NavGroup[] = [
    {
        id: 'overview',
        items: [
            { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        id: 'master-data',
        label: 'ข้อมูลหลัก',
        items: [
            { name: 'สินค้า/วัตถุดิบ', href: '/items', icon: Package },
            { name: 'ซัพพลายเออร์', href: '/suppliers', icon: Users },
            { name: 'สูตรการผลิต', href: '/recipes', icon: BookOpen },
        ],
    },
    {
        id: 'procurement',
        label: 'จัดซื้อ/รับเข้า',
        items: [
            { name: 'รับวัตถุดิบ', href: '/receiving', icon: Truck },
            { name: 'คุณภาพ (QC)', href: '/quality', icon: ClipboardCheck },
        ],
    },
    {
        id: 'production',
        label: 'การผลิต',
        items: [
            { name: 'วางแผนการผลิต', href: '/production-planning', icon: CalendarDays },
            { name: 'การผลิต', href: '/production', icon: Factory },
            { name: 'คลังสินค้า', href: '/inventory', icon: Warehouse },
            { name: 'รายการเคลื่อนไหว', href: '/transactions', icon: ArrowLeftRight },
        ],
    },
    {
        id: 'distribution',
        label: 'สินค้าสำเร็จรูป & จัดส่ง',
        items: [
            { name: 'สินค้าสำเร็จรูป', href: '/finished-goods', icon: Package2 },
            { name: 'จัดส่งสินค้า', href: '/delivery', icon: Send },
        ],
    },
    {
        id: 'factory-expenses',
        label: 'ค่าใช้จ่ายโรงงาน',
        items: [
            { name: 'ค่าใช้จ่าย', href: '/factory-expenses', icon: Receipt },
            { name: 'รถขนส่ง', href: '/vehicles', icon: Truck },
            { name: 'เครื่องจักร', href: '/machines', icon: Wrench },
        ],
    },
]
