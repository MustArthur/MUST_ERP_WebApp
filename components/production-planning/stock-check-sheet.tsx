'use client'

import { AggregatedMaterial, PlanningPeriod } from '@/types/production-planning'

interface StockCheckSheetProps {
  materials: AggregatedMaterial[]
  period: PlanningPeriod
  printDate?: string
}

const periodLabel: Record<PlanningPeriod, string> = {
  daily: 'รายวัน',
  weekly: 'รายสัปดาห์',
  monthly: 'รายเดือน',
}

export function StockCheckSheet({ materials, period, printDate }: StockCheckSheetProps) {
  const today = printDate || new Date().toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="print-sheet hidden print:block font-sans text-sm text-gray-900">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-xl font-bold">ใบตรวจเช็ค Stock วัตถุดิบ</h1>
        <p className="text-sm text-gray-600 mt-1">
          รอบการผลิต: {periodLabel[period]} | วันที่พิมพ์: {today}
        </p>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-2 py-1 text-center w-8">ลำดับ</th>
            <th className="border border-gray-400 px-2 py-1 text-left">รหัส</th>
            <th className="border border-gray-400 px-2 py-1 text-left">ชื่อวัตถุดิบ</th>
            <th className="border border-gray-400 px-2 py-1 text-center">หน่วย</th>
            <th className="border border-gray-400 px-2 py-1 text-center w-20">Stock<br />ที่นับได้</th>
            <th className="border border-gray-400 px-2 py-1 text-center w-20">ต้องใช้<br />1 รอบ</th>
            <th className="border border-gray-400 px-2 py-1 text-center w-20">Safety<br />Stock</th>
            <th className="border border-gray-400 px-2 py-1 text-center w-16">พอกี่<br />Batch</th>
            <th className="border border-gray-400 px-2 py-1 text-center w-24">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m, idx) => (
            <tr key={m.itemId} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
              <td className="border border-gray-300 px-2 py-1 font-mono">{m.itemCode}</td>
              <td className="border border-gray-300 px-2 py-1">{m.itemName}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{m.uom}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{/* blank for manual fill */}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {m.totalQty.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {m.safetyStockNeeded.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center">
                {m.coverageBatches >= 999 ? '—' : m.coverageBatches}
              </td>
              <td className="border border-gray-300 px-2 py-1">{/* blank */}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-between text-xs text-gray-500">
        <span>ผู้ตรวจเช็ค: ________________________</span>
        <span>วันที่ตรวจ: ________________________</span>
        <span>ผู้อนุมัติ: ________________________</span>
      </div>
    </div>
  )
}
