'use client'

import { useEffect, useState } from 'react'
import { Beef, Snowflake, Fuel, Package, Wallet } from 'lucide-react'
import { StatsCard, StatsGrid } from '@/components/dashboard/stats-card'
import { SimpleAreaChart } from '@/components/dashboard/area-chart'
import { SimpleBarChart } from '@/components/dashboard/bar-chart'
import { MultiLineChart } from '@/components/dashboard/line-chart'
import {
    getFreshChickenDailyTrend,
    getFreshChickenDailyTrendBySupplier,
    getIceBagsDailyTrend,
    getLogisticsFuelDailyTrend,
    getSupplierSeriesColor,
    DailyPricePoint,
    DailyFuelCost,
    SupplierPriceTrend,
} from '@/lib/api/dashboard'
import { formatCurrency, formatNumber } from '@/lib/utils'

function pctChange(current: number, previous: number): number {
    if (previous === 0) return 0
    return Math.round(((current - previous) / previous) * 1000) / 10
}

function EmptyChart({ title }: { title: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
            <p className="text-sm text-gray-400">ยังไม่มีข้อมูล</p>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-64 bg-gray-200 rounded-xl" />
                <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [chicken, setChicken] = useState<DailyPricePoint[]>([])
    const [chickenBySupplier, setChickenBySupplier] = useState<SupplierPriceTrend>({ data: [], series: [] })
    const [ice, setIce] = useState<DailyPricePoint[]>([])
    const [fuel, setFuel] = useState<DailyFuelCost[]>([])

    useEffect(() => {
        async function load() {
            setLoading(true)
            const [chickenData, chickenBySupplierData, iceData, fuelData] = await Promise.all([
                getFreshChickenDailyTrend(30),
                getFreshChickenDailyTrendBySupplier(30),
                getIceBagsDailyTrend(30),
                getLogisticsFuelDailyTrend(30),
            ])
            setChicken(chickenData)
            setChickenBySupplier(chickenBySupplierData)
            setIce(iceData)
            setFuel(fuelData)
            setLoading(false)
        }
        load()
    }, [])

    const latestChicken = chicken[chicken.length - 1]
    const prevChicken = chicken[chicken.length - 2]
    const latestIce = ice[ice.length - 1]

    const currentMonth = new Date().toISOString().slice(0, 7)
    const fuelThisMonth = fuel
        .filter(f => f.date.startsWith(currentMonth))
        .reduce((sum, f) => sum + f.totalAmount, 0)
    const latestFuel = fuel[fuel.length - 1]

    const iceCostTrend = ice.map(d => ({ name: d.label, value: Math.round(d.quantity * d.avgPrice) }))

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
                    <p className="text-sm text-gray-500">ภาพรวมต้นทุนรับวัตถุดิบและค่าใช้จ่าย ย้อนหลัง 30 วัน</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-10">
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <>
                        {/* Section: รับวัตถุดิบ */}
                        <section className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">รับวัตถุดิบ</h2>

                            {/* Fresh Chicken */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-500">Fresh Chicken</h3>
                                <StatsGrid>
                                    <StatsCard
                                        title="ราคาล่าสุด"
                                        value={latestChicken ? formatNumber(latestChicken.avgPrice, 2) : '-'}
                                        unit="บาท/กก."
                                        icon={Beef}
                                        color="text-orange-600"
                                        bgColor="bg-orange-100"
                                        subtitle={latestChicken ? `ข้อมูลวันที่ ${latestChicken.label}` : undefined}
                                        trend={
                                            latestChicken && prevChicken
                                                ? { value: pctChange(latestChicken.avgPrice, prevChicken.avgPrice), isUp: latestChicken.avgPrice >= prevChicken.avgPrice }
                                                : undefined
                                        }
                                    />
                                    <StatsCard
                                        title="ปริมาณรับเข้าล่าสุด"
                                        value={latestChicken ? formatNumber(latestChicken.quantity, 0) : '-'}
                                        unit="กก."
                                        icon={Package}
                                        color="text-blue-600"
                                        bgColor="bg-blue-100"
                                        subtitle={latestChicken ? `ข้อมูลวันที่ ${latestChicken.label}` : undefined}
                                    />
                                </StatsGrid>
                                {chicken.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <MultiLineChart
                                            title="แนวโน้มราคา Fresh Chicken แยกตาม Supplier (บาท/กก.)"
                                            data={chickenBySupplier.data}
                                            series={chickenBySupplier.series.map((s, i) => ({
                                                key: s.key,
                                                name: s.supplierName,
                                                color: getSupplierSeriesColor(i),
                                            }))}
                                            yDomain={[60, 80]}
                                        />
                                        <SimpleBarChart
                                            title="ปริมาณรับเข้า Fresh Chicken รายวัน (กก.)"
                                            data={chicken.map(d => ({ name: d.label, value: d.quantity }))}
                                            color="#3b82f6"
                                        />
                                    </div>
                                ) : (
                                    <EmptyChart title="Fresh Chicken" />
                                )}
                            </div>

                            {/* Ice bags */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-500">น้ำแข็งกระสอบ</h3>
                                <StatsGrid>
                                    <StatsCard
                                        title="ราคาล่าสุด"
                                        value={latestIce ? formatNumber(latestIce.avgPrice, 2) : '-'}
                                        unit="บาท/กระสอบ"
                                        icon={Snowflake}
                                        color="text-cyan-600"
                                        bgColor="bg-cyan-100"
                                        subtitle={latestIce ? `ข้อมูลวันที่ ${latestIce.label}` : undefined}
                                    />
                                    <StatsCard
                                        title="ต้นทุนรวมล่าสุด"
                                        value={latestIce ? formatCurrency(latestIce.quantity * latestIce.avgPrice) : '-'}
                                        icon={Wallet}
                                        color="text-sky-600"
                                        bgColor="bg-sky-100"
                                        subtitle={latestIce ? `${formatNumber(latestIce.quantity, 0)} กระสอบ` : undefined}
                                    />
                                </StatsGrid>
                                {ice.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <SimpleAreaChart
                                            title="ต้นทุนรวมการใช้น้ำแข็งกระสอบรายวัน (บาท)"
                                            data={iceCostTrend}
                                            color="#0ea5e9"
                                        />
                                        <SimpleBarChart
                                            title="จำนวนกระสอบรับเข้ารายวัน"
                                            data={ice.map(d => ({ name: d.label, value: d.quantity }))}
                                            color="#06b6d4"
                                        />
                                    </div>
                                ) : (
                                    <EmptyChart title="น้ำแข็งกระสอบ" />
                                )}
                            </div>
                        </section>

                        {/* Section: ค่าใช้จ่าย */}
                        <section className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">ค่าใช้จ่าย</h2>

                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-500">ค่าน้ำมัน (Logistics)</h3>
                                <StatsGrid>
                                    <StatsCard
                                        title="ค่าน้ำมันเดือนนี้ (รวม)"
                                        value={formatCurrency(fuelThisMonth)}
                                        icon={Fuel}
                                        color="text-purple-600"
                                        bgColor="bg-purple-100"
                                    />
                                    <StatsCard
                                        title="ค่าน้ำมันวันล่าสุด"
                                        value={latestFuel ? formatCurrency(latestFuel.totalAmount) : '-'}
                                        icon={Fuel}
                                        color="text-red-600"
                                        bgColor="bg-red-100"
                                        subtitle={latestFuel ? `ข้อมูลวันที่ ${latestFuel.label}` : undefined}
                                    />
                                </StatsGrid>
                                {fuel.length > 0 ? (
                                    <SimpleAreaChart
                                        title="แนวโน้มค่าน้ำมันรายวัน (บาท)"
                                        data={fuel.map(d => ({ name: d.label, value: Math.round(d.totalAmount) }))}
                                        color="#a855f7"
                                    />
                                ) : (
                                    <EmptyChart title="ค่าน้ำมัน" />
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    )
}
