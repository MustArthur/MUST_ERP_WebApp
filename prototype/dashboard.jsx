import React, { useState } from 'react';
import {
  Package, Factory, AlertTriangle, TrendingUp,
  Clock, CheckCircle, XCircle, ArrowRight,
  Thermometer, Droplets, Box, Truck
} from 'lucide-react';

// Sample Data
const dashboardData = {
  kpis: {
    todayProduction: { value: 450, unit: 'ขวด', target: 500, trend: '+12%' },
    inventoryValue: { value: 1250000, unit: 'บาท', trend: '+5%' },
    pendingOrders: { value: 3, unit: 'รายการ' },
    lowStockItems: { value: 5, unit: 'รายการ', alert: true }
  },
  expiringLots: [
    { id: 1, lotNumber: 'SUP-20260125-001', item: 'อกไก่สด', expiry: '2026-01-31', daysLeft: 2, qty: '15 KG' },
    { id: 2, lotNumber: 'SUP-20260120-003', item: 'Whey Protein', expiry: '2026-02-05', daysLeft: 7, qty: '8 KG' },
    { id: 3, lotNumber: 'PRD-20260115-002', item: 'เครื่องดื่มโปรตีน Original', expiry: '2026-04-15', daysLeft: 76, qty: '120 BTL' },
  ],
  productionOrders: [
    { id: 1, orderNo: 'PO-202601-001', product: 'โปรตีนไก่ Original', qty: 200, status: 'IN_PROGRESS', progress: 65, startTime: '08:00' },
    { id: 2, orderNo: 'PO-202601-002', product: 'โปรตีนไก่ Vanilla', qty: 150, status: 'PLANNED', progress: 0, startTime: '14:00' },
    { id: 3, orderNo: 'PO-202601-003', product: 'โปรตีนไก่ Double', qty: 100, status: 'DRAFT', progress: 0, startTime: '-' },
  ],
  recentTransactions: [
    { id: 1, type: 'RECEIVE', item: 'อกไก่สด', qty: '+50 KG', time: '09:30', user: 'สมหญิง' },
    { id: 2, type: 'PRODUCTION_OUT', item: 'อกไก่สด', qty: '-20 KG', time: '09:15', user: 'ระบบ' },
    { id: 3, type: 'PRODUCTION_IN', item: 'โปรตีนไก่ Original', qty: '+100 BTL', time: '08:45', user: 'สมชาย' },
    { id: 4, type: 'ISSUE', item: 'ขวด PET 350ml', qty: '-200 PC', time: '08:30', user: 'ระบบ' },
  ],
  coldStorageTemp: { current: 3.5, min: 0, max: 5, status: 'NORMAL' }
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'PLANNED': 'bg-yellow-100 text-yellow-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'DRAFT': 'bg-gray-100 text-gray-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  };
  const labels = {
    'IN_PROGRESS': 'กำลังผลิต',
    'PLANNED': 'วางแผนแล้ว',
    'COMPLETED': 'เสร็จสิ้น',
    'DRAFT': 'ร่าง',
    'CANCELLED': 'ยกเลิก'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// KPI Card Component
const KPICard = ({ title, value, unit, trend, alert, icon: Icon }) => (
  <div className={`bg-white rounded-xl p-5 shadow-sm border ${alert ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${alert ? 'text-red-600' : 'text-gray-900'}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        </p>
        {trend && (
          <p className={`text-sm mt-1 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend} จากเมื่อวาน
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${alert ? 'bg-red-100' : 'bg-blue-50'}`}>
        <Icon className={`w-6 h-6 ${alert ? 'text-red-600' : 'text-blue-600'}`} />
      </div>
    </div>
  </div>
);

// Transaction Type Badge
const TransactionBadge = ({ type }) => {
  const config = {
    'RECEIVE': { color: 'bg-green-100 text-green-800', label: 'รับเข้า' },
    'ISSUE': { color: 'bg-orange-100 text-orange-800', label: 'เบิกออก' },
    'PRODUCTION_IN': { color: 'bg-blue-100 text-blue-800', label: 'รับจากผลิต' },
    'PRODUCTION_OUT': { color: 'bg-purple-100 text-purple-800', label: 'เบิกผลิต' },
  };
  const { color, label } = config[type] || { color: 'bg-gray-100', label: type };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>;
};

// Main Dashboard Component
export default function Dashboard() {
  const [currentTime] = useState(new Date().toLocaleString('th-TH'));
  const { kpis, expiringLots, productionOrders, recentTransactions, coldStorageTemp } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MUST ERP</h1>
              <p className="text-sm text-gray-500">Manufacturing Dashboard</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{currentTime}</p>
              <p className="text-sm font-medium text-gray-700">สวัสดี, คุณ Arthur</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="ผลิตวันนี้"
            value={kpis.todayProduction.value}
            unit={kpis.todayProduction.unit}
            trend={kpis.todayProduction.trend}
            icon={Factory}
          />
          <KPICard
            title="มูลค่าสต็อก"
            value={kpis.inventoryValue.value}
            unit={kpis.inventoryValue.unit}
            trend={kpis.inventoryValue.trend}
            icon={Package}
          />
          <KPICard
            title="ใบสั่งผลิตรอดำเนินการ"
            value={kpis.pendingOrders.value}
            unit={kpis.pendingOrders.unit}
            icon={Clock}
          />
          <KPICard
            title="สินค้าใกล้หมด"
            value={kpis.lowStockItems.value}
            unit={kpis.lowStockItems.unit}
            alert={kpis.lowStockItems.alert}
            icon={AlertTriangle}
          />
        </div>

        {/* Cold Storage Alert */}
        <div className={`rounded-xl p-4 mb-6 flex items-center justify-between ${
          coldStorageTemp.status === 'NORMAL' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <Thermometer className={`w-8 h-8 ${coldStorageTemp.status === 'NORMAL' ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <p className="font-medium">อุณหภูมิห้องเย็น</p>
              <p className="text-sm text-gray-600">ช่วงปกติ: {coldStorageTemp.min}°C - {coldStorageTemp.max}°C</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${coldStorageTemp.status === 'NORMAL' ? 'text-green-600' : 'text-red-600'}`}>
              {coldStorageTemp.current}°C
            </p>
            <p className={`text-sm ${coldStorageTemp.status === 'NORMAL' ? 'text-green-600' : 'text-red-600'}`}>
              {coldStorageTemp.status === 'NORMAL' ? '✓ ปกติ' : '⚠ ผิดปกติ'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Orders */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">ใบสั่งผลิตวันนี้</h2>
              <button className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                ดูทั้งหมด <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y">
              {productionOrders.map(order => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNo}</p>
                      <p className="text-sm text-gray-500">{order.product}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">เป้า: {order.qty} ขวด</span>
                    <span className="text-gray-500">เริ่ม: {order.startTime}</span>
                  </div>
                  {order.status === 'IN_PROGRESS' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>ความคืบหน้า</span>
                        <span className="font-medium">{order.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expiring Lots */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Lot ใกล้หมดอายุ
              </h2>
              <button className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                ดูทั้งหมด <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y">
              {expiringLots.map(lot => (
                <div key={lot.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{lot.lotNumber}</p>
                      <p className="text-sm text-gray-500">{lot.item}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      lot.daysLeft <= 3 ? 'bg-red-100 text-red-800' :
                      lot.daysLeft <= 7 ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lot.daysLeft <= 3 ? '⚠️' : ''} {lot.daysLeft} วัน
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2 text-gray-500">
                    <span>คงเหลือ: {lot.qty}</span>
                    <span>หมดอายุ: {lot.expiry}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border lg:col-span-2">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">รายการเคลื่อนไหวล่าสุด</h2>
              <button className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                ดูทั้งหมด <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">เวลา</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สินค้า</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{tx.time}</td>
                      <td className="px-4 py-3"><TransactionBadge type={tx.type} /></td>
                      <td className="px-4 py-3 text-sm text-gray-900">{tx.item}</td>
                      <td className={`px-4 py-3 text-sm font-medium ${
                        tx.qty.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>{tx.qty}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{tx.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-blue-700 transition">
            <Factory className="w-8 h-8" />
            <span className="font-medium">สร้างใบสั่งผลิต</span>
          </button>
          <button className="bg-green-600 text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-green-700 transition">
            <Truck className="w-8 h-8" />
            <span className="font-medium">รับวัตถุดิบเข้า</span>
          </button>
          <button className="bg-purple-600 text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-purple-700 transition">
            <Box className="w-8 h-8" />
            <span className="font-medium">ตรวจสอบสต็อก</span>
          </button>
          <button className="bg-orange-600 text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-orange-700 transition">
            <CheckCircle className="w-8 h-8" />
            <span className="font-medium">บันทึกผลผลิต</span>
          </button>
        </div>
      </main>
    </div>
  );
}
