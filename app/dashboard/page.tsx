'use client'

import { useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { StatsCard, StatsGrid, SimpleAreaChart, SimpleBarChart, SimplePieChart } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Factory,
    CheckCircle2,
    Truck,
    Thermometer,
    Package,
    AlertTriangle,
    Clock,
    TrendingUp,
} from 'lucide-react'
import { useProductionStore } from '@/stores/production-store'
import { useQualityStore } from '@/stores/quality-store'
import { useDeliveryStore } from '@/stores/delivery-store'
import { useFinishedGoodsStore } from '@/stores/finished-goods-store'

export default function DashboardPage() {
    const { workOrders, fetchWorkOrders } = useProductionStore()
    const { inspections, quarantineRecords, fetchInspections, fetchQuarantine } = useQualityStore()
    const { orders, deliveryNotes, fetchOrders, fetchDeliveryNotes } = useDeliveryStore()
    const { entries, fetchEntries } = useFinishedGoodsStore()

    useEffect(() => {
        fetchWorkOrders()
        fetchInspections()
        fetchQuarantine()
        fetchOrders()
        fetchDeliveryNotes()
        fetchEntries()
    }, [])

    // Calculate Production Stats
    const totalWOs = workOrders.length
    const completedWOs = workOrders.filter(wo => wo.status === 'COMPLETED').length
    const inProgressWOs = workOrders.filter(wo => wo.status === 'IN_PROGRESS').length
    const productionRate = totalWOs > 0 ? Math.round((completedWOs / totalWOs) * 100) : 0

    // Calculate QC Stats
    const totalInspections = inspections.length
    const passedInspections = inspections.filter(i => i.status === 'PASSED').length
    const qcPassRate = totalInspections > 0 ? Math.round((passedInspections / totalInspections) * 100) : 0
    const pendingQuarantine = quarantineRecords.filter(q => q.status === 'PENDING').length

    // Calculate Delivery Stats
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'DRAFT' || o.status === 'CONFIRMED').length
    const deliveredToday = deliveryNotes.filter(d => d.status === 'DELIVERED').length
    const onTimeRate = 95 // Mock value - would calculate from actual data

    // Calculate Cold Chain Stats
    const coldChainCompliant = deliveryNotes.filter(d => d.coldChainCompliant).length
    const totalDeliveries = deliveryNotes.length
    const coldChainRate = totalDeliveries > 0 ? Math.round((coldChainCompliant / totalDeliveries) * 100) : 100

    // Chart Data - Work Order Status
    const woStatusData = [
        { name: 'รอดำเนินการ', value: workOrders.filter(wo => wo.status === 'DRAFT' || wo.status === 'RELEASED').length, color: '#f59e0b' },
        { name: 'กำลังผลิต', value: inProgressWOs, color: '#3b82f6' },
        { name: 'เสร็จสิ้น', value: completedWOs, color: '#22c55e' },
        { name: 'ยกเลิก', value: workOrders.filter(wo => wo.status === 'CANCELLED').length, color: '#ef4444' },
    ]

    // Chart Data - Stock by Category (Mock)
    const stockByCategory = [
        { name: 'วัตถุดิบ', value: 1250, color: '#3b82f6' },
        { name: 'บรรจุภัณฑ์', value: 3400, color: '#22c55e' },
        { name: 'สำเร็จรูป', value: 890, color: '#f59e0b' },
    ]

    // Chart Data - Delivery Trend (7 days mock)
    const deliveryTrend = [
        { name: 'จ.', value: 12 },
        { name: 'อ.', value: 15 },
        { name: 'พ.', value: 18 },
        { name: 'พฤ.', value: 14 },
        { name: 'ศ.', value: 22 },
        { name: 'ส.', value: 8 },
        { name: 'อา.', value: 5 },
    ]

    // Recent Work Orders
    const recentWOs = workOrders.slice(0, 5)

    // Recent QC Inspections
    const recentInspections = inspections.slice(0, 5)

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Dashboard" showBack backHref="/" />

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500">ภาพรวมการดำเนินงาน MUST ERP</p>
                </div>

                {/* Key Metrics */}
                <StatsGrid>
                    <StatsCard
                        title="อัตราการผลิตสำเร็จ"
                        value={`${productionRate}%`}
                        subtitle={`${completedWOs} จาก ${totalWOs} ใบสั่งผลิต`}
                        icon={Factory}
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                        trend={{ value: 5, isUp: true }}
                    />
                    <StatsCard
                        title="QC Pass Rate"
                        value={`${qcPassRate}%`}
                        subtitle={`${passedInspections} จาก ${totalInspections} รายการ`}
                        icon={CheckCircle2}
                        color="text-green-600"
                        bgColor="bg-green-50"
                    />
                    <StatsCard
                        title="On-Time Delivery"
                        value={`${onTimeRate}%`}
                        subtitle={`จัดส่งวันนี้ ${deliveredToday} รายการ`}
                        icon={Truck}
                        color="text-violet-600"
                        bgColor="bg-violet-50"
                    />
                    <StatsCard
                        title="Cold Chain Compliance"
                        value={`${coldChainRate}%`}
                        subtitle="อุณหภูมิตามเกณฑ์"
                        icon={Thermometer}
                        color="text-cyan-600"
                        bgColor="bg-cyan-50"
                    />
                </StatsGrid>

                {/* Alerts Section */}
                {(pendingQuarantine > 0 || pendingOrders > 5) && (
                    <Card className="border-amber-200 bg-amber-50/50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-amber-700">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="font-medium">แจ้งเตือน</span>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-amber-600">
                                {pendingQuarantine > 0 && (
                                    <p>• มีสินค้ากักกัน {pendingQuarantine} รายการ รอการตัดสินใจ</p>
                                )}
                                {pendingOrders > 5 && (
                                    <p>• มี {pendingOrders} คำสั่งซื้อรอจัดส่ง</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SimpleBarChart
                        title="สถานะใบสั่งผลิต"
                        data={woStatusData}
                        showColors
                        height={220}
                    />
                    <SimplePieChart
                        title="สต็อกตามประเภท"
                        data={stockByCategory}
                        height={220}
                    />
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SimpleAreaChart
                        title="จำนวนจัดส่ง (7 วันล่าสุด)"
                        data={deliveryTrend}
                        color="#8b5cf6"
                        height={200}
                    />

                    {/* Quick Stats Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium">สรุปวันนี้</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Factory className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm">กำลังผลิต</span>
                                </div>
                                <span className="font-bold text-blue-600">{inProgressWOs} รายการ</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                    <span className="text-sm">รอจัดส่ง</span>
                                </div>
                                <span className="font-bold text-amber-600">{pendingOrders} รายการ</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-green-600" />
                                    <span className="text-sm">สต็อก FG พร้อมส่ง</span>
                                </div>
                                <span className="font-bold text-green-600">{entries.filter(e => e.status === 'AVAILABLE').length} batch</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Work Orders */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium">ใบสั่งผลิตล่าสุด</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentWOs.length > 0 ? (
                                <div className="space-y-3">
                                    {recentWOs.map((wo) => (
                                        <div key={wo.id} className="flex items-center justify-between p-2 border rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{wo.code}</p>
                                                <p className="text-xs text-muted-foreground">{wo.recipeName}</p>
                                            </div>
                                            <Badge variant={
                                                wo.status === 'COMPLETED' ? 'default' :
                                                    wo.status === 'IN_PROGRESS' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {wo.status === 'COMPLETED' ? 'เสร็จสิ้น' :
                                                    wo.status === 'IN_PROGRESS' ? 'กำลังผลิต' :
                                                        wo.status === 'RELEASED' ? 'รอผลิต' :
                                                            wo.status === 'DRAFT' ? 'ร่าง' : wo.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีข้อมูล</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent QC Inspections */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium">การตรวจ QC ล่าสุด</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentInspections.length > 0 ? (
                                <div className="space-y-3">
                                    {recentInspections.map((inspection) => (
                                        <div key={inspection.id} className="flex items-center justify-between p-2 border rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{inspection.code}</p>
                                                <p className="text-xs text-muted-foreground">{inspection.itemName}</p>
                                            </div>
                                            <Badge variant={
                                                inspection.status === 'PASSED' ? 'default' :
                                                    inspection.status === 'FAILED' ? 'destructive' :
                                                        'secondary'
                                            }>
                                                {inspection.status === 'PASSED' ? 'ผ่าน' :
                                                    inspection.status === 'FAILED' ? 'ไม่ผ่าน' :
                                                        'รอตรวจ'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีข้อมูล</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
