'use client'

import { useEffect, useMemo, useState } from 'react'
import { Beef, Snowflake, Fuel, Package, Wallet, Truck, CreditCard } from 'lucide-react'
import { StatsCard, StatsGrid } from '@/components/dashboard/stats-card'
import { SimpleAreaChart } from '@/components/dashboard/area-chart'
import { SimpleBarChart } from '@/components/dashboard/bar-chart'
import { MultiLineChart } from '@/components/dashboard/line-chart'
import { StackedBarChart } from '@/components/dashboard/stacked-bar-chart'
import {
    getFreshChickenDailyTrend,
    getFreshChickenDailyTrendBySupplier,
    getFreshChickenDailyQuantityBySupplier,
    getIceBagsDailyTrend,
    getLogisticsFuelDailyTrend,
    getEasyPassDailyTrend,
    getFuelCostByVehicle,
    getSupplierSeriesColor,
    DailyPricePoint,
    DailyFuelCost,
    SupplierPriceTrend,
    SupplierQuantityTrend,
    VehicleFuelSummary,
} from '@/lib/api/dashboard'
import { formatCurrency, formatNumber } from '@/lib/utils'

const FRESH_CHICKEN_DAILY_TARGET_KG = 1600

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
    const [chickenQtyBySupplier, setChickenQtyBySupplier] = useState<SupplierQuantityTrend>({ data: [], series: [] })
    const [ice, setIce] = useState<DailyPricePoint[]>([])
    const [fuel, setFuel] = useState<DailyFuelCost[]>([])
    const [fuelByVehicle, setFuelByVehicle] = useState<VehicleFuelSummary[]>([])
    const [easyPass, setEasyPass] = useState<DailyFuelCost[]>([])

    useEffect(() => {
        async function load() {
            setLoading(true)
            const [chickenData, chickenBySupplierData, chickenQtyBySupplierData, iceData, fuelData, fuelByVehicleData, easyPassData] = await Promise.all([
                getFreshChickenDailyTrend(30),
                getFreshChickenDailyTrendBySupplier(30),
                getFreshChickenDailyQuantityBySupplier(30),
                getIceBagsDailyTrend(30),
                getLogisticsFuelDailyTrend(30),
                getFuelCostByVehicle(30),
                getEasyPassDailyTrend(30),
            ])
            setChicken(chickenData)
            setChickenBySupplier(chickenBySupplierData)
            setChickenQtyBySupplier(chickenQtyBySupplierData)
            setIce(iceData)
            setFuel(fuelData)
            setFuelByVehicle(fuelByVehicleData)
            setEasyPass(easyPassData)
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
    const topFuelVehicle = fuelByVehicle[0]

    const easyPassThisMonth = easyPass
        .filter(f => f.date.startsWith(currentMonth))
        .reduce((sum, f) => sum + f.totalAmount, 0)
    const latestEasyPass = easyPass[easyPass.length - 1]

    const iceCostTrend = ice.map(d => ({ name: d.label, value: Math.round(d.quantity * d.avgPrice) }))

    // Assign one color per supplier, shared across both Fresh Chicken charts, so the same
    // supplier always reads as the same color even though each chart sorts its series differently
    // (price chart alphabetically, quantity chart by total volume).
    const chickenSupplierColors = useMemo(() => {
        const nameById = new Map<string, string>()
        chickenBySupplier.series.forEach(s => nameById.set(s.supplierId, s.supplierName))
        chickenQtyBySupplier.series.forEach(s => nameById.set(s.supplierId, s.supplierName))
        const sortedIds = Array.from(nameById.keys()).sort((a, b) => nameById.get(a)!.localeCompare(nameById.get(b)!))
        const colors = new Map<string, string>()
        sortedIds.forEach((id, i) => colors.set(id, getSupplierSeriesColor(i)))
        return colors
    }, [chickenBySupplier, chickenQtyBySupplier])

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
                                            series={chickenBySupplier.series.map(s => ({
                                                key: s.key,
                                                name: s.supplierName,
                                                color: chickenSupplierColors.get(s.supplierId) || '#3b82f6',
                                            }))}
                                            yDomain={[60, 80]}
                                            labelOnChange
                                        />
                                        <StackedBarChart
                                            title="ปริมาณรับเข้า Fresh Chicken รายวัน (กก.)"
                                            data={chickenQtyBySupplier.data}
                                            series={chickenQtyBySupplier.series.map(s => ({
                                                key: s.key,
                                                name: s.supplierName,
                                                color: chickenSupplierColors.get(s.supplierId) || '#3b82f6',
                                            }))}
                                            referenceLine={{ value: FRESH_CHICKEN_DAILY_TARGET_KG, label: `เป้าหมาย ${FRESH_CHICKEN_DAILY_TARGET_KG.toLocaleString()} กก./วัน` }}
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

                            {/* Fuel by vehicle */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-500">ค่าน้ำมันแยกตามคันรถ</h3>
                                <StatsGrid>
                                    <StatsCard
                                        title="คันที่ใช้น้ำมันมากที่สุด (30 วัน)"
                                        value={topFuelVehicle ? formatCurrency(topFuelVehicle.totalCost) : '-'}
                                        icon={Truck}
                                        color="text-indigo-600"
                                        bgColor="bg-indigo-100"
                                        subtitle={topFuelVehicle?.vehicleName}
                                    />
                                    <StatsCard
                                        title="จำนวนคันที่มีข้อมูล"
                                        value={fuelByVehicle.length}
                                        unit="คัน"
                                        icon={Truck}
                                        color="text-blue-600"
                                        bgColor="bg-blue-100"
                                    />
                                </StatsGrid>
                                {fuelByVehicle.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <SimpleBarChart
                                            title="ค่าน้ำมันแยกตามคันรถ (บาท, 30 วัน)"
                                            data={fuelByVehicle.map(v => ({ name: v.vehicleName, value: Math.round(v.totalCost) }))}
                                            showColors
                                        />
                                        <SimpleBarChart
                                            title="ปริมาณน้ำมันแยกตามคันรถ (ลิตร, 30 วัน)"
                                            data={fuelByVehicle.map(v => ({ name: v.vehicleName, value: Math.round(v.totalLiters) }))}
                                            showColors
                                        />
                                    </div>
                                ) : (
                                    <EmptyChart title="ค่าน้ำมันแยกตามคันรถ" />
                                )}
                            </div>

                            {/* EasyPass */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-500">ค่าทางด่วน (EasyPass)</h3>
                                <StatsGrid>
                                    <StatsCard
                                        title="ค่าทางด่วนเดือนนี้ (รวม)"
                                        value={formatCurrency(easyPassThisMonth)}
                                        icon={CreditCard}
                                        color="text-teal-600"
                                        bgColor="bg-teal-100"
                                    />
                                    <StatsCard
                                        title="ค่าทางด่วนล่าสุด"
                                        value={latestEasyPass ? formatCurrency(latestEasyPass.totalAmount) : '-'}
                                        icon={CreditCard}
                                        color="text-emerald-600"
                                        bgColor="bg-emerald-100"
                                        subtitle={latestEasyPass ? `ข้อมูลวันที่ ${latestEasyPass.label}` : undefined}
                                    />
                                </StatsGrid>
                                {easyPass.length > 0 ? (
                                    <SimpleAreaChart
                                        title="แนวโน้มค่าทางด่วนรายวัน (บาท)"
                                        data={easyPass.map(d => ({ name: d.label, value: Math.round(d.totalAmount) }))}
                                        color="#14b8a6"
                                    />
                                ) : (
                                    <EmptyChart title="ค่าทางด่วน (EasyPass)" />
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    )
}
