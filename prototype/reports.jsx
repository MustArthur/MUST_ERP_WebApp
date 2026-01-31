import React, { useState } from 'react';
import {
  BarChart3, PieChart, TrendingUp, Download, Calendar,
  Filter, RefreshCw, FileText, Package, Factory,
  AlertTriangle, Search, ChevronRight, Printer
} from 'lucide-react';

// Sample Report Data
const productionSummary = {
  period: 'มกราคม 2026',
  totalOrders: 45,
  completedOrders: 38,
  totalProduced: 4250,
  totalPlanned: 4500,
  avgYield: 94.2,
  topProducts: [
    { name: 'โปรตีนไก่ Original', qty: 2100, percent: 49.4 },
    { name: 'โปรตีนไก่ Vanilla', qty: 1350, percent: 31.8 },
    { name: 'โปรตีนไก่ Double', qty: 800, percent: 18.8 },
  ],
  dailyProduction: [
    { date: '2026-01-25', qty: 200 },
    { date: '2026-01-26', qty: 180 },
    { date: '2026-01-27', qty: 150 },
    { date: '2026-01-28', qty: 220 },
    { date: '2026-01-29', qty: 130 },
  ]
};

const inventoryValuation = {
  totalValue: 1543250,
  byCategory: [
    { category: 'วัตถุดิบ - เนื้อสัตว์', value: 425000, percent: 27.5, items: 3 },
    { category: 'วัตถุดิบ - โปรตีน', value: 385000, percent: 24.9, items: 2 },
    { category: 'วัตถุดิบ - สารเติมแต่ง', value: 98250, percent: 6.4, items: 5 },
    { category: 'บรรจุภัณฑ์', value: 235000, percent: 15.2, items: 8 },
    { category: 'สินค้าสำเร็จรูป', value: 400000, percent: 25.9, items: 3 },
  ],
  lowStockItems: [
    { code: 'RM-CHICKEN-001', name: 'อกไก่สดไม่มีหนัง', current: 65.5, min: 100, uom: 'KG' },
    { code: 'RM-WHEY-001', name: 'Whey Protein Isolate', current: 40, min: 50, uom: 'KG' },
  ],
  expiringItems: [
    { lotNumber: 'SUP-20260125-001', item: 'อกไก่สด', expiry: '2026-01-31', daysLeft: 2, qty: 15, value: 1800 },
    { lotNumber: 'SUP-20260120-003', item: 'Whey Protein', expiry: '2026-02-05', daysLeft: 7, qty: 8, value: 3600 },
  ]
};

const yieldAnalysis = [
  { orderNo: 'PO-202601-001', product: 'โปรตีนไก่ Original', planned: 200, actual: 193, yield: 96.5, expected: 95, status: 'ABOVE' },
  { orderNo: 'PO-202601-002', product: 'โปรตีนไก่ Vanilla', planned: 150, actual: 142, yield: 94.7, expected: 95, status: 'BELOW' },
  { orderNo: 'PO-202601-003', product: 'โปรตีนไก่ Double', planned: 100, actual: 97, yield: 97.0, expected: 93, status: 'ABOVE' },
  { orderNo: 'PO-202601-004', product: 'โปรตีนไก่ Original', planned: 200, actual: 188, yield: 94.0, expected: 95, status: 'BELOW' },
  { orderNo: 'PO-202601-005', product: 'โปรตีนไก่ Original', planned: 150, actual: 147, yield: 98.0, expected: 95, status: 'ABOVE' },
];

const lotTraceability = {
  outputLot: {
    lotNumber: 'PRD-20260129-001',
    item: 'เครื่องดื่มโปรตีนไก่ Original 350ml',
    productionOrder: 'PO-202601-001',
    producedDate: '2026-01-29',
    expiryDate: '2026-04-29',
    qty: 193,
    uom: 'BTL'
  },
  inputLots: [
    { lotNumber: 'SUP-20260128-001', item: 'อกไก่สดไม่มีหนัง', supplier: 'ไก่ทองฟาร์ม', usedQty: 20, uom: 'KG' },
    { lotNumber: 'SUP-20260115-002', item: 'Whey Protein Isolate', supplier: 'โปรตีนพลัส', usedQty: 3, uom: 'KG' },
    { lotNumber: 'SUP-20260120-005', item: 'ขวด PET 350ml', supplier: 'แพ็คเก็จจิ้ง ไทย', usedQty: 200, uom: 'PC' },
  ]
};

// Report Card Component
const ReportCard = ({ title, icon: Icon, description, onClick, color = 'blue' }) => (
  <button
    onClick={onClick}
    className={`bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition text-left w-full group`}
  >
    <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
      <Icon className={`w-6 h-6 text-${color}-600`} />
    </div>
    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </button>
);

// Production Summary Report
const ProductionSummaryReport = () => {
  const data = productionSummary;
  const completionRate = ((data.completedOrders / data.totalOrders) * 100).toFixed(1);
  const productionRate = ((data.totalProduced / data.totalPlanned) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-600">ใบสั่งผลิตทั้งหมด</p>
          <p className="text-2xl font-bold text-blue-900">{data.totalOrders}</p>
          <p className="text-sm text-blue-600">เสร็จ {data.completedOrders} ({completionRate}%)</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600">ผลิตได้</p>
          <p className="text-2xl font-bold text-green-900">{data.totalProduced.toLocaleString()}</p>
          <p className="text-sm text-green-600">จากเป้า {data.totalPlanned.toLocaleString()} ({productionRate}%)</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-sm text-purple-600">Yield เฉลี่ย</p>
          <p className="text-2xl font-bold text-purple-900">{data.avgYield}%</p>
          <p className="text-sm text-purple-600">เป้า 95%</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-sm text-orange-600">ช่วงเวลา</p>
          <p className="text-xl font-bold text-orange-900">{data.period}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl p-5 border">
          <h4 className="font-semibold mb-4">🏆 สินค้าที่ผลิตมากที่สุด</h4>
          <div className="space-y-3">
            {data.topProducts.map((product, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{product.name}</span>
                  <span className="font-medium">{product.qty.toLocaleString()} ขวด ({product.percent}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${product.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Production Chart (Simplified) */}
        <div className="bg-white rounded-xl p-5 border">
          <h4 className="font-semibold mb-4">📊 การผลิตรายวัน (5 วันล่าสุด)</h4>
          <div className="flex items-end justify-between h-40 gap-2">
            {data.dailyProduction.map((day, idx) => {
              const maxQty = Math.max(...data.dailyProduction.map(d => d.qty));
              const height = (day.qty / maxQty) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <span className="text-sm font-medium mb-1">{day.qty}</span>
                  <div
                    className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{day.date.slice(8)}/01</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Inventory Valuation Report
const InventoryValuationReport = () => {
  const data = inventoryValuation;

  return (
    <div className="space-y-6">
      {/* Total Value */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <p className="text-green-100">มูลค่าสินค้าคงคลังรวม</p>
        <p className="text-4xl font-bold">฿{data.totalValue.toLocaleString()}</p>
      </div>

      {/* By Category */}
      <div className="bg-white rounded-xl p-5 border">
        <h4 className="font-semibold mb-4">📦 มูลค่าตามหมวดหมู่</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">หมวดหมู่</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">จำนวนรายการ</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">มูลค่า</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">สัดส่วน</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.byCategory.map((cat, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium">{cat.category}</td>
                  <td className="px-4 py-3 text-right">{cat.items}</td>
                  <td className="px-4 py-3 text-right font-medium">฿{cat.value.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{cat.percent}%</td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
          <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            สินค้าต่ำกว่าขั้นต่ำ
          </h4>
          <div className="space-y-3">
            {data.lowStockItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3">
                <p className="font-medium text-red-900">{item.name}</p>
                <p className="text-sm text-red-600">
                  คงเหลือ: {item.current} {item.uom} (ขั้นต่ำ: {item.min} {item.uom})
                </p>
                <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${(item.current / item.min) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring Items */}
        <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
          <h4 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Lot ใกล้หมดอายุ (7 วัน)
          </h4>
          <div className="space-y-3">
            {data.expiringItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3">
                <div className="flex justify-between">
                  <p className="font-medium text-orange-900">{item.item}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    item.daysLeft <= 3 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {item.daysLeft} วัน
                  </span>
                </div>
                <p className="text-sm text-orange-600">Lot: {item.lotNumber}</p>
                <p className="text-sm text-orange-600">
                  จำนวน: {item.qty} | มูลค่า: ฿{item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Yield Analysis Report
const YieldAnalysisReport = () => {
  const avgYield = (yieldAnalysis.reduce((sum, item) => sum + item.yield, 0) / yieldAnalysis.length).toFixed(1);
  const aboveTarget = yieldAnalysis.filter(item => item.status === 'ABOVE').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-600">Yield เฉลี่ย</p>
          <p className="text-3xl font-bold text-blue-900">{avgYield}%</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600">สูงกว่าเป้า</p>
          <p className="text-3xl font-bold text-green-900">{aboveTarget}</p>
          <p className="text-sm text-green-600">จาก {yieldAnalysis.length} รายการ</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-sm text-orange-600">ต่ำกว่าเป้า</p>
          <p className="text-3xl font-bold text-orange-900">{yieldAnalysis.length - aboveTarget}</p>
          <p className="text-sm text-orange-600">ต้องปรับปรุง</p>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ใบสั่งผลิต</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">สินค้า</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">แผน</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">ผลิตได้</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Yield</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">เป้า</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {yieldAnalysis.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-blue-600">{item.orderNo}</td>
                <td className="px-4 py-3">{item.product}</td>
                <td className="px-4 py-3 text-right">{item.planned}</td>
                <td className="px-4 py-3 text-right font-medium">{item.actual}</td>
                <td className={`px-4 py-3 text-right font-bold ${
                  item.status === 'ABOVE' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {item.yield}%
                </td>
                <td className="px-4 py-3 text-right text-gray-500">{item.expected}%</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'ABOVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {item.status === 'ABOVE' ? '✓ ผ่าน' : '⚠ ต่ำกว่าเป้า'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Lot Traceability Report
const LotTraceabilityReport = () => {
  const [searchLot, setSearchLot] = useState('PRD-20260129-001');
  const data = lotTraceability;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-xl p-4 border">
        <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา Lot Number</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchLot}
            onChange={(e) => setSearchLot(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="เช่น PRD-20260129-001"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Search className="w-5 h-5" />
            ค้นหา
          </button>
        </div>
      </div>

      {/* Traceability Result */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h4 className="font-semibold">🔍 ผลการสอบกลับ Lot</h4>
        </div>

        {/* Output Lot */}
        <div className="p-4 bg-green-50 border-b">
          <h5 className="text-sm font-medium text-green-800 mb-2">📦 สินค้าผลิต (Output)</h5>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Lot Number</p>
                <p className="font-bold text-green-600">{data.outputLot.lotNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">สินค้า</p>
                <p className="font-medium">{data.outputLot.item}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">วันที่ผลิต</p>
                <p className="font-medium">{data.outputLot.producedDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">จำนวน</p>
                <p className="font-medium">{data.outputLot.qty} {data.outputLot.uom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">ใบสั่งผลิต</p>
                <p className="font-medium text-blue-600">{data.outputLot.productionOrder}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">วันหมดอายุ</p>
                <p className="font-medium text-orange-600">{data.outputLot.expiryDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center py-2 bg-gray-50">
          <div className="bg-gray-300 rounded-full p-2">
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-90" />
          </div>
        </div>

        {/* Input Lots */}
        <div className="p-4 bg-blue-50">
          <h5 className="text-sm font-medium text-blue-800 mb-2">🧪 วัตถุดิบที่ใช้ (Input)</h5>
          <div className="space-y-2">
            {data.inputLots.map((lot, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-blue-600">{lot.lotNumber}</p>
                    <p className="text-sm text-gray-600">{lot.item}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{lot.usedQty} {lot.uom}</p>
                    <p className="text-xs text-gray-500">จาก {lot.supplier}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>💡 Tip:</strong> ระบบสามารถสอบกลับได้ทั้งสองทิศทาง
          <br />• <strong>Forward:</strong> จากวัตถุดิบ → สินค้าสำเร็จรูป (ดูว่าวัตถุดิบ Lot นี้ไปอยู่ในสินค้าใดบ้าง)
          <br />• <strong>Backward:</strong> จากสินค้าสำเร็จรูป → วัตถุดิบ (ดูว่าสินค้านี้ใช้วัตถุดิบจาก Lot ใดบ้าง)
        </p>
      </div>
    </div>
  );
};

// Main Reports Component
export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-01-31' });

  const reports = [
    {
      id: 'production',
      title: 'สรุปการผลิต',
      description: 'ดูภาพรวมการผลิต จำนวน Yield และสินค้าที่ผลิตมากที่สุด',
      icon: Factory,
      color: 'blue',
      component: ProductionSummaryReport
    },
    {
      id: 'inventory',
      title: 'มูลค่าสินค้าคงคลัง',
      description: 'ดูมูลค่าสต็อก แยกตามหมวดหมู่ และรายการแจ้งเตือน',
      icon: Package,
      color: 'green',
      component: InventoryValuationReport
    },
    {
      id: 'yield',
      title: 'วิเคราะห์ Yield',
      description: 'เปรียบเทียบ Yield จริงกับเป้าหมาย แยกตามใบสั่งผลิต',
      icon: TrendingUp,
      color: 'purple',
      component: YieldAnalysisReport
    },
    {
      id: 'traceability',
      title: 'สอบกลับ Lot (Traceability)',
      description: 'ค้นหาประวัติการใช้วัตถุดิบของแต่ละ Lot',
      icon: Search,
      color: 'orange',
      component: LotTraceabilityReport
    },
  ];

  const ReportComponent = selectedReport
    ? reports.find(r => r.id === selectedReport)?.component
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">รายงาน</h1>
              <p className="text-sm text-gray-500">ดูรายงานและวิเคราะห์ข้อมูลการผลิต</p>
            </div>
            {selectedReport && (
              <div className="flex gap-2">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Printer className="w-5 h-5" />
                  พิมพ์
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!selectedReport ? (
          <>
            {/* Date Range Filter */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                  />
                  <span className="text-gray-500">ถึง</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  อัพเดท
                </button>
              </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map(report => (
                <ReportCard
                  key={report.id}
                  title={report.title}
                  description={report.description}
                  icon={report.icon}
                  color={report.color}
                  onClick={() => setSelectedReport(report.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="mb-4 text-blue-600 hover:underline flex items-center gap-1"
            >
              ← กลับไปเลือกรายงาน
            </button>

            {/* Report Title */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900">
                {reports.find(r => r.id === selectedReport)?.title}
              </h2>
              <p className="text-sm text-gray-500">
                ช่วงเวลา: {dateRange.from} ถึง {dateRange.to}
              </p>
            </div>

            {/* Report Content */}
            {ReportComponent && <ReportComponent />}
          </>
        )}
      </main>
    </div>
  );
}
