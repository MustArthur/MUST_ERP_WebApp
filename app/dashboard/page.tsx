'use client'

import { LayoutDashboard } from 'lucide-react'

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
                    <p className="text-sm text-gray-500">ภาพรวมการดำเนินงาน MUST ERP</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                    <LayoutDashboard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">อยู่ระหว่างออกแบบใหม่</h3>
                    <p className="text-gray-500">หน้าแดชบอร์ดกำลังอยู่ระหว่างการวางแผนและออกแบบใหม่</p>
                </div>
            </main>
        </div>
    )
}
