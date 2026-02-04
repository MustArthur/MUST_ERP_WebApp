import Link from 'next/link'
import { Header } from '@/components/layout'
import {
  Package,
  Package2,
  Factory,
  ClipboardCheck,
  Truck,
  Send,
  BookOpen,
  Users,
  Warehouse,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'

type ModuleStatus = 'ready' | 'partial' | 'planned'

interface Module {
  name: string
  description: string
  href: string
  icon: any
  color: string
  status: ModuleStatus
  features?: string[]
}

const modules: Module[] = [
  {
    name: 'สินค้า/วัตถุดิบ',
    description: 'จัดการข้อมูล Items, Categories, UOM',
    href: '/items',
    icon: Package,
    color: 'from-blue-500 to-blue-600',
    status: 'ready',
    features: ['ดูรายการสินค้า', 'เพิ่ม/แก้ไขสินค้า', 'ตั้งค่า Safety Stock', 'บันทึกรับเข้า']
  },
  {
    name: 'Suppliers',
    description: 'จัดการผู้จำหน่ายและ Part Numbers',
    href: '/suppliers',
    icon: Users,
    color: 'from-emerald-500 to-emerald-600',
    status: 'ready',
    features: ['ดูรายการ Supplier', 'เพิ่ม/แก้ไข Supplier']
  },
  {
    name: 'สูตรการผลิต',
    description: 'Recipe/BOM Management',
    href: '/recipes',
    icon: BookOpen,
    color: 'from-violet-500 to-violet-600',
    status: 'ready',
    features: ['ดูรายการสูตร', 'สร้าง/แก้ไขสูตร', 'คัดลอกสูตร', 'คำนวณ Batch']
  },
  {
    name: 'การผลิต',
    description: 'Work Orders, Job Cards, CCP Gate',
    href: '/production',
    icon: Factory,
    color: 'from-orange-500 to-orange-600',
    status: 'ready',
    features: ['Work Orders', 'Job Cards', 'CCP Gate Logic', 'Progress Tracking']
  },
  {
    name: 'คุณภาพ (CCP)',
    description: 'บันทึกจุดวิกฤต CCP',
    href: '/quality',
    icon: ClipboardCheck,
    color: 'from-red-500 to-red-600',
    status: 'ready',
    features: ['ตรวจสอบ QC', 'จัดการ Templates', 'Quarantine', 'CCP Monitoring']
  },
  {
    name: 'รับวัตถุดิบ',
    description: 'บันทึกการรับสินค้า',
    href: '/receiving',
    icon: Truck,
    color: 'from-cyan-500 to-cyan-600',
    status: 'ready',
    features: ['บันทึกใบรับ', 'QC Integration', 'Supplier Tracking', 'รายงานการรับ']
  },
  {
    name: 'คลังสินค้า',
    description: 'ดูยอดสต็อกคงเหลือ',
    href: '/inventory',
    icon: Warehouse,
    color: 'from-amber-500 to-amber-600',
    status: 'ready',
    features: ['ดูสต็อกตามคลัง', 'ดูสินค้าใกล้หมดอายุ', 'Low Stock Alert']
  },
  {
    name: 'Transactions',
    description: 'รับ-เบิก-โอนย้ายสินค้า',
    href: '/transactions',
    icon: ArrowLeftRight,
    color: 'from-indigo-500 to-indigo-600',
    status: 'ready',
    features: ['บันทึก รับ/เบิก/โอน', 'ดูประวัติ Transactions']
  },
  {
    name: 'สินค้าสำเร็จรูป',
    description: 'FG Stock และ Batch Tracking',
    href: '/finished-goods',
    icon: Package2,
    color: 'from-teal-500 to-teal-600',
    status: 'ready',
    features: ['Batch Tracking', 'FEFO Alerts', 'QC Approval', 'Expiry Monitoring']
  },
  {
    name: 'จัดส่งสินค้า',
    description: 'Pick List & Cold Chain Tracking',
    href: '/delivery',
    icon: Send,
    color: 'from-rose-500 to-rose-600',
    status: 'ready',
    features: ['Customer Orders', 'Pick List', 'Delivery Notes', 'Cold Chain']
  },
]

const statusConfig = {
  ready: { label: 'พร้อมใช้งาน', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  partial: { label: 'UI พร้อม', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  planned: { label: 'กำลังพัฒนา', icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-100' },
}

export default function Home() {
  const readyCount = modules.filter(m => m.status === 'ready').length
  const partialCount = modules.filter(m => m.status === 'partial').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with User Menu */}
      <Header />

      {/* Title Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                <Factory className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MUST ERP</h1>
                <p className="text-gray-500">ระบบจัดการการผลิตอาหารและเครื่องดื่ม</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-gray-600">{readyCount} โมดูลพร้อมใช้</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-gray-600">{partialCount} โมดูล UI พร้อม</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-b bg-white/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-700"><strong>ทุกโมดูลพร้อมใช้งาน</strong> - Items, Suppliers, Recipes, Production, QC, Receiving, Inventory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">เลือกโมดูล</h2>
          <p className="text-gray-500">คลิกที่การ์ดเพื่อเข้าใช้งาน • สีเขียว = พร้อมใช้งานเต็มรูปแบบ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((module) => {
            const Icon = module.icon
            const StatusIcon = statusConfig[module.status].icon
            return (
              <Link
                key={module.href}
                href={module.href}
                className={`group bg-white rounded-xl shadow-sm border p-5 hover:shadow-lg transition-all duration-200 ${module.status === 'ready' ? 'hover:border-green-300 ring-1 ring-green-100' : 'hover:border-blue-200'
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${statusConfig[module.status].bg} ${statusConfig[module.status].color}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusConfig[module.status].label}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {module.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {module.description}
                </p>
                {module.features && (
                  <ul className="text-xs text-gray-400 space-y-1">
                    {module.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </Link>
            )
          })}
        </div>

        {/* Quick Access Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Quick Start - เริ่มลงข้อมูล</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/items" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">1. เพิ่มสินค้า</div>
                <div className="text-sm text-gray-500">สร้างรายการ Items</div>
              </div>
            </Link>
            <Link href="/suppliers" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Users className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="font-medium text-gray-900">2. เพิ่ม Supplier</div>
                <div className="text-sm text-gray-500">ผู้จำหน่ายวัตถุดิบ</div>
              </div>
            </Link>
            <Link href="/transactions" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeftRight className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="font-medium text-gray-900">3. บันทึกรับเข้า</div>
                <div className="text-sm text-gray-500">เพิ่มสต็อกคลัง</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Production Flow Section */}
        <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🏭 Production Flow - กระบวนการผลิต</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/production" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Factory className="w-8 h-8 text-orange-600" />
              <div>
                <div className="font-medium text-gray-900">1. สร้างใบสั่งผลิต</div>
                <div className="text-sm text-gray-500">Work Orders + CCP</div>
              </div>
            </Link>
            <Link href="/finished-goods" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Package2 className="w-8 h-8 text-teal-600" />
              <div>
                <div className="font-medium text-gray-900">2. รับ FG เข้าคลัง</div>
                <div className="text-sm text-gray-500">Batch + FEFO Tracking</div>
              </div>
            </Link>
            <Link href="/delivery" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Send className="w-8 h-8 text-rose-600" />
              <div>
                <div className="font-medium text-gray-900">3. จัดส่งสินค้า</div>
                <div className="text-sm text-gray-500">Cold Chain Tracking</div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          MUST ERP v1.0 • ระบบจัดการการผลิต • <span className="text-green-600 font-medium">Server: localhost:3000</span>
        </div>
      </footer>
    </div>
  )
}
