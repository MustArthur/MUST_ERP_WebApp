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
  AlertCircle,
  LayoutDashboard,
  Database,
  ChevronDown,
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

interface WorkflowPhase {
  id: string
  name: string
  description: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
  modules: Module[]
}

const statusConfig = {
  ready: { label: 'พร้อมใช้งาน', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  partial: { label: 'UI พร้อม', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  planned: { label: 'กำลังพัฒนา', icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-100' },
}

// จัดกลุ่ม Modules ตาม Workflow Phases
const workflowPhases: WorkflowPhase[] = [
  {
    id: 'monitoring',
    name: 'ภาพรวม',
    description: 'Dashboard และ KPIs สำหรับผู้บริหาร',
    icon: LayoutDashboard,
    color: 'text-indigo-600',
    bgColor: 'from-indigo-50 to-purple-50',
    borderColor: 'border-indigo-200',
    modules: [
      {
        name: 'Dashboard',
        description: 'ภาพรวม KPIs และ Charts',
        href: '/dashboard',
        icon: LayoutDashboard,
        color: 'from-indigo-500 to-purple-600',
        status: 'ready',
        features: ['Production KPIs', 'QC Pass Rate', 'Delivery Trends', 'Alerts']
      }
    ]
  },
  {
    id: 'master-data',
    name: 'ข้อมูลหลัก',
    description: 'ตั้งค่าข้อมูลพื้นฐานก่อนเริ่มงาน',
    icon: Database,
    color: 'text-blue-600',
    bgColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    modules: [
      {
        name: 'สินค้า/วัตถุดิบ',
        description: 'จัดการข้อมูล Items, Categories, UOM',
        href: '/items',
        icon: Package,
        color: 'from-blue-500 to-blue-600',
        status: 'ready',
        features: ['ดูรายการสินค้า', 'เพิ่ม/แก้ไขสินค้า', 'ตั้งค่า Safety Stock']
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
        features: ['ดูรายการสูตร', 'สร้าง/แก้ไขสูตร', 'คำนวณ Batch']
      }
    ]
  },
  {
    id: 'procurement',
    name: 'จัดซื้อ/รับเข้า',
    description: 'รับวัตถุดิบและตรวจ QC ขาเข้า',
    icon: Truck,
    color: 'text-cyan-600',
    bgColor: 'from-cyan-50 to-teal-50',
    borderColor: 'border-cyan-200',
    modules: [
      {
        name: 'รับวัตถุดิบ',
        description: 'บันทึกการรับสินค้า',
        href: '/receiving',
        icon: Truck,
        color: 'from-cyan-500 to-cyan-600',
        status: 'ready',
        features: ['บันทึกใบรับ', 'QC Integration', 'Supplier Tracking']
      },
      {
        name: 'คุณภาพ (QC)',
        description: 'ตรวจสอบคุณภาพวัตถุดิบ',
        href: '/quality',
        icon: ClipboardCheck,
        color: 'from-red-500 to-red-600',
        status: 'ready',
        features: ['ตรวจสอบ QC', 'Quarantine', 'CCP Monitoring']
      }
    ]
  },
  {
    id: 'production',
    name: 'การผลิต',
    description: 'Work Orders, เบิกวัตถุดิบ, ตรวจ CCP',
    icon: Factory,
    color: 'text-orange-600',
    bgColor: 'from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    modules: [
      {
        name: 'การผลิต',
        description: 'Work Orders, Job Cards, CCP Gate',
        href: '/production',
        icon: Factory,
        color: 'from-orange-500 to-orange-600',
        status: 'ready',
        features: ['Work Orders', 'Job Cards', 'CCP Gate Logic']
      },
      {
        name: 'คลังสินค้า',
        description: 'ดูยอดสต็อกคงเหลือ',
        href: '/inventory',
        icon: Warehouse,
        color: 'from-amber-500 to-amber-600',
        status: 'ready',
        features: ['ดูสต็อกตามคลัง', 'Low Stock Alert']
      },
      {
        name: 'Transactions',
        description: 'รับ-เบิก-โอนย้ายสินค้า',
        href: '/transactions',
        icon: ArrowLeftRight,
        color: 'from-indigo-500 to-indigo-600',
        status: 'ready',
        features: ['บันทึก รับ/เบิก/โอน', 'ดูประวัติ']
      }
    ]
  },
  {
    id: 'distribution',
    name: 'สินค้าสำเร็จรูป & จัดส่ง',
    description: 'รับ FG เข้าคลัง และจัดส่งลูกค้า',
    icon: Package2,
    color: 'text-teal-600',
    bgColor: 'from-teal-50 to-green-50',
    borderColor: 'border-teal-200',
    modules: [
      {
        name: 'สินค้าสำเร็จรูป',
        description: 'FG Stock และ Batch Tracking',
        href: '/finished-goods',
        icon: Package2,
        color: 'from-teal-500 to-teal-600',
        status: 'ready',
        features: ['Batch Tracking', 'FEFO Alerts', 'Expiry Monitoring']
      },
      {
        name: 'จัดส่งสินค้า',
        description: 'Pick List & Cold Chain Tracking',
        href: '/delivery',
        icon: Send,
        color: 'from-rose-500 to-rose-600',
        status: 'ready',
        features: ['Customer Orders', 'Pick List', 'Cold Chain']
      }
    ]
  }
]

// นับจำนวน modules
const allModules = workflowPhases.flatMap(p => p.modules)
const readyCount = allModules.filter(m => m.status === 'ready').length
const partialCount = allModules.filter(m => m.status === 'partial').length

export default function Home() {
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
                {partialCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-gray-600">{partialCount} โมดูล UI พร้อม</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-b bg-white/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/dashboard" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              <span className="text-gray-700 hover:text-indigo-600"><strong>ดู Dashboard</strong> - ภาพรวม KPIs, Charts, Alerts</span>
            </Link>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-700"><strong>{readyCount} โมดูลพร้อมใช้งาน</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Workflow Phases */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Workflow การทำงาน</h2>
          <p className="text-gray-500">เลือกโมดูลตามขั้นตอนการทำงาน • เริ่มจาก Phase 0 ไปจนถึง Phase 4</p>
        </div>

        {/* Phases */}
        <div className="space-y-4">
          {workflowPhases.map((phase, index) => {
            const PhaseIcon = phase.icon
            return (
              <div key={phase.id}>
                {/* Flow Arrow (between phases) */}
                {index > 0 && (
                  <div className="flex justify-center py-2">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-4 bg-gradient-to-b from-gray-200 to-gray-300"></div>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Phase Container */}
                <div className={`rounded-2xl bg-gradient-to-r ${phase.bgColor} border ${phase.borderColor} overflow-hidden`}>
                  {/* Phase Header */}
                  <div className="px-5 py-3 border-b border-white/50 bg-white/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                        <PhaseIcon className={`w-5 h-5 ${phase.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${phase.color} bg-white px-2 py-0.5 rounded-full`}>
                            PHASE {index}
                          </span>
                          <h3 className="font-semibold text-gray-800">{phase.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{phase.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Module Cards */}
                  <div className="p-4">
                    <div className={`grid gap-4 ${
                      phase.modules.length === 1
                        ? 'grid-cols-1 max-w-md'
                        : phase.modules.length === 2
                          ? 'grid-cols-1 sm:grid-cols-2'
                          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    }`}>
                      {phase.modules.map((module) => {
                        const Icon = module.icon
                        const StatusIcon = statusConfig[module.status].icon
                        return (
                          <Link
                            key={module.href}
                            href={module.href}
                            className={`group bg-white rounded-xl shadow-sm border p-4 hover:shadow-lg transition-all duration-200 ${
                              module.status === 'ready'
                                ? 'hover:border-green-300 ring-1 ring-green-100'
                                : 'hover:border-blue-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${statusConfig[module.status].bg} ${statusConfig[module.status].color}`}>
                                <StatusIcon className="w-3 h-3" />
                                <span className="hidden sm:inline">{statusConfig[module.status].label}</span>
                              </div>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                              {module.name}
                            </h4>
                            <p className="text-sm text-gray-500 mb-2">
                              {module.description}
                            </p>
                            {module.features && (
                              <ul className="text-xs text-gray-400 space-y-0.5">
                                {module.features.slice(0, 2).map((f, i) => (
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
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Guide */}
        <div className="mt-10 p-6 bg-gradient-to-r from-slate-100 to-gray-100 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📖 แนะนำการใช้งาน</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</div>
              <div>
                <p className="font-medium text-gray-800">เริ่มต้นใช้งาน</p>
                <p className="text-gray-500">ตั้งค่า ข้อมูลหลัก (สินค้า, Supplier, สูตร) ก่อน</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xs">2</div>
              <div>
                <p className="font-medium text-gray-800">รับวัตถุดิบ</p>
                <p className="text-gray-500">บันทึกใบรับ → ตรวจ QC → รับเข้าคลัง</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">3</div>
              <div>
                <p className="font-medium text-gray-800">เริ่มผลิต</p>
                <p className="text-gray-500">สร้าง Work Order → เบิกวัตถุดิบ → บันทึก CCP</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xs">4</div>
              <div>
                <p className="font-medium text-gray-800">จัดส่งสินค้า</p>
                <p className="text-gray-500">รับ FG เข้าคลัง → สร้าง Pick List → จัดส่ง</p>
              </div>
            </div>
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
