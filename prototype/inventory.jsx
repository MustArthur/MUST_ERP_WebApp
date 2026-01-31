import React, { useState } from 'react';
import {
  Package, Search, Filter, Plus, ArrowDownToLine,
  ArrowUpFromLine, Eye, AlertTriangle, Calendar,
  ChevronDown, X, Check, MapPin
} from 'lucide-react';

// Sample Data
const inventoryData = [
  {
    id: 1,
    code: 'RM-CHICKEN-001',
    name: 'อกไก่สดไม่มีหนัง',
    category: 'วัตถุดิบ - เนื้อสัตว์',
    categoryType: 'RAW_MATERIAL',
    warehouse: 'ห้องเย็น',
    qtyOnHand: 85.5,
    qtyReserved: 20,
    qtyAvailable: 65.5,
    uom: 'KG',
    minStock: 100,
    status: 'LOW',
    lotCount: 3,
    nearestExpiry: '2026-01-31'
  },
  {
    id: 2,
    code: 'RM-WHEY-001',
    name: 'Whey Protein Isolate',
    category: 'วัตถุดิบ - โปรตีน',
    categoryType: 'RAW_MATERIAL',
    warehouse: 'คลังวัตถุดิบ',
    qtyOnHand: 45,
    qtyReserved: 5,
    qtyAvailable: 40,
    uom: 'KG',
    minStock: 50,
    status: 'LOW',
    lotCount: 2,
    nearestExpiry: '2026-06-15'
  },
  {
    id: 3,
    code: 'PKG-BTL-350',
    name: 'ขวด PET 350ml ใส',
    category: 'บรรจุภัณฑ์ - ขวด',
    categoryType: 'PACKAGING',
    warehouse: 'คลังวัตถุดิบ',
    qtyOnHand: 12500,
    qtyReserved: 500,
    qtyAvailable: 12000,
    uom: 'PC',
    minStock: 5000,
    status: 'OK',
    lotCount: 5,
    nearestExpiry: null
  },
  {
    id: 4,
    code: 'FG-PRO-001',
    name: 'เครื่องดื่มโปรตีนไก่ Original 350ml',
    category: 'สินค้าสำเร็จรูป',
    categoryType: 'FINISHED_GOOD',
    warehouse: 'คลังสินค้าสำเร็จรูป',
    qtyOnHand: 850,
    qtyReserved: 200,
    qtyAvailable: 650,
    uom: 'BTL',
    minStock: 500,
    status: 'OK',
    lotCount: 4,
    nearestExpiry: '2026-04-15'
  },
  {
    id: 5,
    code: 'RM-ADD-001',
    name: 'สารให้ความหวาน Sucralose',
    category: 'วัตถุดิบ - สารเติมแต่ง',
    categoryType: 'RAW_MATERIAL',
    warehouse: 'คลังวัตถุดิบ',
    qtyOnHand: 8.5,
    qtyReserved: 0,
    qtyAvailable: 8.5,
    uom: 'KG',
    minStock: 5,
    status: 'OK',
    lotCount: 1,
    nearestExpiry: '2027-12-31'
  }
];

const lotData = [
  {
    id: 1,
    lotNumber: 'SUP-20260125-001',
    item: 'อกไก่สดไม่มีหนัง',
    supplier: 'ไก่ทองฟาร์ม',
    receivedDate: '2026-01-25',
    expiryDate: '2026-01-31',
    daysLeft: 2,
    initialQty: 50,
    currentQty: 35.5,
    uom: 'KG',
    warehouse: 'ห้องเย็น',
    location: 'COLD-A-01',
    qualityStatus: 'PASSED',
    costPerUnit: 120
  },
  {
    id: 2,
    lotNumber: 'SUP-20260122-003',
    item: 'อกไก่สดไม่มีหนัง',
    supplier: 'ไก่ทองฟาร์ม',
    receivedDate: '2026-01-22',
    expiryDate: '2026-01-28',
    daysLeft: -1,
    initialQty: 30,
    currentQty: 0,
    uom: 'KG',
    warehouse: 'ห้องเย็น',
    location: 'COLD-A-01',
    qualityStatus: 'EXPIRED',
    costPerUnit: 120
  },
  {
    id: 3,
    lotNumber: 'SUP-20260128-001',
    item: 'อกไก่สดไม่มีหนัง',
    supplier: 'ไก่ทองฟาร์ม',
    receivedDate: '2026-01-28',
    expiryDate: '2026-02-03',
    daysLeft: 5,
    initialQty: 50,
    currentQty: 50,
    uom: 'KG',
    warehouse: 'ห้องเย็น',
    location: 'COLD-B-01',
    qualityStatus: 'PASSED',
    costPerUnit: 122
  }
];

// Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    'OK': { color: 'bg-green-100 text-green-800', label: 'ปกติ' },
    'LOW': { color: 'bg-red-100 text-red-800', label: 'ต่ำกว่าขั้นต่ำ' },
    'PASSED': { color: 'bg-green-100 text-green-800', label: 'ผ่าน QC' },
    'PENDING': { color: 'bg-yellow-100 text-yellow-800', label: 'รอ QC' },
    'FAILED': { color: 'bg-red-100 text-red-800', label: 'ไม่ผ่าน' },
    'EXPIRED': { color: 'bg-gray-100 text-gray-800', label: 'หมดอายุ' }
  };
  const { color, label } = config[status] || { color: 'bg-gray-100', label: status };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

// Category Badge
const CategoryBadge = ({ type }) => {
  const config = {
    'RAW_MATERIAL': { color: 'bg-blue-100 text-blue-800', label: 'วัตถุดิบ' },
    'PACKAGING': { color: 'bg-purple-100 text-purple-800', label: 'บรรจุภัณฑ์' },
    'FINISHED_GOOD': { color: 'bg-green-100 text-green-800', label: 'สำเร็จรูป' },
    'SEMI_FINISHED': { color: 'bg-orange-100 text-orange-800', label: 'กึ่งสำเร็จรูป' }
  };
  const { color, label } = config[type] || { color: 'bg-gray-100', label: type };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>;
};

// Receive Modal Component
const ReceiveModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">รับวัตถุดิบเข้าคลัง</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สินค้า *</label>
            <select className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">-- เลือกสินค้า --</option>
              <option value="RM-CHICKEN-001">RM-CHICKEN-001 - อกไก่สดไม่มีหนัง</option>
              <option value="RM-WHEY-001">RM-WHEY-001 - Whey Protein Isolate</option>
              <option value="PKG-BTL-350">PKG-BTL-350 - ขวด PET 350ml</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้จำหน่าย *</label>
            <select className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">-- เลือกผู้จำหน่าย --</option>
              <option value="SUP-001">ไก่ทองฟาร์ม</option>
              <option value="SUP-002">โปรตีนพลัส</option>
              <option value="SUP-003">แพ็คเก็จจิ้ง ไทย</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จำนวน *</label>
              <input
                type="number"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หน่วย</label>
              <input
                type="text"
                className="w-full border rounded-lg p-3 bg-gray-100"
                value="KG"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ผลิต</label>
              <input
                type="date"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันหมดอายุ *</label>
              <input
                type="date"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เลข Lot ของผู้จำหน่าย</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="เช่น BATCH-2026-001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">คลังปลายทาง *</label>
              <select className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">-- เลือกคลัง --</option>
                <option value="WH-COLD">ห้องเย็น</option>
                <option value="WH-RM">คลังวัตถุดิบ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
              <select className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">-- เลือกตำแหน่ง --</option>
                <option value="COLD-A-01">COLD-A-01</option>
                <option value="COLD-B-01">COLD-B-01</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคาต่อหน่วย (บาท)</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <textarea
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="หมายเหตุเพิ่มเติม..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              บันทึกรับเข้า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Lot Detail Modal
const LotDetailModal = ({ isOpen, onClose, lot }) => {
  if (!isOpen || !lot) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">รายละเอียด Lot</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-900">{lot.lotNumber}</p>
            <p className="text-gray-600">{lot.item}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">ผู้จำหน่าย</p>
              <p className="font-medium">{lot.supplier}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">สถานะ QC</p>
              <StatusBadge status={lot.qualityStatus} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">วันที่รับ</p>
              <p className="font-medium">{lot.receivedDate}</p>
            </div>
            <div className={`rounded-lg p-3 ${
              lot.daysLeft <= 3 ? 'bg-red-50' : lot.daysLeft <= 7 ? 'bg-orange-50' : 'bg-gray-50'
            }`}>
              <p className="text-sm text-gray-500">วันหมดอายุ</p>
              <p className={`font-medium ${
                lot.daysLeft <= 3 ? 'text-red-600' : lot.daysLeft <= 7 ? 'text-orange-600' : ''
              }`}>
                {lot.expiryDate}
                {lot.daysLeft > 0 && ` (${lot.daysLeft} วัน)`}
                {lot.daysLeft <= 0 && ' (หมดอายุแล้ว)'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">จำนวนเริ่มต้น</p>
              <p className="font-medium">{lot.initialQty} {lot.uom}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">คงเหลือ</p>
              <p className="font-medium text-blue-600">{lot.currentQty} {lot.uom}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">ใช้ไป</p>
              <p className="font-medium">{lot.initialQty - lot.currentQty} {lot.uom}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">ตำแหน่งจัดเก็บ</p>
            <p className="font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {lot.warehouse} / {lot.location}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">ต้นทุนต่อหน่วย</p>
            <p className="font-medium">{lot.costPerUnit.toLocaleString()} บาท/{lot.uom}</p>
          </div>
        </div>

        <div className="p-4 border-t flex gap-3">
          <button className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
            ดูประวัติการใช้งาน
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Inventory Component
export default function Inventory() {
  const [activeTab, setActiveTab] = useState('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  const filteredInventory = inventoryData.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || item.categoryType === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">คลังสินค้า</h1>
              <p className="text-sm text-gray-500">จัดการวัตถุดิบ บรรจุภัณฑ์ และสินค้าสำเร็จรูป</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReceiveModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <ArrowDownToLine className="w-5 h-5" />
                รับเข้า
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2">
                <ArrowUpFromLine className="w-5 h-5" />
                เบิกออก
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-3 px-1 font-medium ${
              activeTab === 'stock'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            สต็อกสินค้า
          </button>
          <button
            onClick={() => setActiveTab('lots')}
            className={`pb-3 px-1 font-medium ${
              activeTab === 'lots'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Lot / Batch
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่อหรือรหัสสินค้า..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">ทุกหมวดหมู่</option>
              <option value="RAW_MATERIAL">วัตถุดิบ</option>
              <option value="PACKAGING">บรรจุภัณฑ์</option>
              <option value="FINISHED_GOOD">สินค้าสำเร็จรูป</option>
            </select>
          </div>
        </div>

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สินค้า</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมวดหมู่</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">คลัง</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">คงเหลือ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">จอง</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">พร้อมใช้</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lot</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">หมดอายุใกล้สุด</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInventory.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.code}</p>
                        <p className="text-sm text-gray-500">{item.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <CategoryBadge type={item.categoryType} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.warehouse}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {item.qtyOnHand.toLocaleString()} {item.uom}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-600">
                        {item.qtyReserved > 0 ? `-${item.qtyReserved}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-blue-600">
                        {item.qtyAvailable.toLocaleString()} {item.uom}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600">{item.lotCount} Lot</span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {item.nearestExpiry ? (
                          <span className="text-orange-600">{item.nearestExpiry}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lots Tab */}
        {activeTab === 'lots' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lot Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สินค้า</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้จำหน่าย</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">วันที่รับ</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">วันหมดอายุ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">คงเหลือ</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">QC</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lotData.map(lot => (
                    <tr key={lot.id} className={`hover:bg-gray-50 ${lot.daysLeft <= 0 ? 'bg-gray-50 opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-blue-600">{lot.lotNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{lot.item}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{lot.supplier}</td>
                      <td className="px-4 py-3 text-center text-sm">{lot.receivedDate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-medium ${
                          lot.daysLeft <= 0 ? 'text-gray-500' :
                          lot.daysLeft <= 3 ? 'text-red-600' :
                          lot.daysLeft <= 7 ? 'text-orange-600' : 'text-gray-900'
                        }`}>
                          {lot.expiryDate}
                          {lot.daysLeft > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                              lot.daysLeft <= 3 ? 'bg-red-100' : lot.daysLeft <= 7 ? 'bg-orange-100' : 'bg-gray-100'
                            }`}>
                              {lot.daysLeft}d
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {lot.currentQty} {lot.uom}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {lot.location}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={lot.qualityStatus} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedLot(lot)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">รายการสินค้าทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{inventoryData.length}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <p className="text-sm text-red-600">สินค้าต่ำกว่าขั้นต่ำ</p>
            <p className="text-2xl font-bold text-red-600">
              {inventoryData.filter(i => i.status === 'LOW').length}
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <p className="text-sm text-orange-600">Lot ใกล้หมดอายุ (7 วัน)</p>
            <p className="text-2xl font-bold text-orange-600">
              {lotData.filter(l => l.daysLeft > 0 && l.daysLeft <= 7).length}
            </p>
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-500">Lot หมดอายุแล้ว</p>
            <p className="text-2xl font-bold text-gray-600">
              {lotData.filter(l => l.daysLeft <= 0).length}
            </p>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ReceiveModal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} />
      <LotDetailModal isOpen={!!selectedLot} onClose={() => setSelectedLot(null)} lot={selectedLot} />
    </div>
  );
}
