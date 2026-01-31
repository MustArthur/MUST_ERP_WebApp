import React, { useState } from 'react';
import {
  Factory, Plus, Play, Pause, CheckCircle, Clock,
  Package, AlertTriangle, ChevronRight, X,
  FileText, Users, Calendar, Target, Percent
} from 'lucide-react';

// Sample Data
const productionOrders = [
  {
    id: 1,
    orderNo: 'PO-202601-001',
    recipe: 'สูตรเครื่องดื่มโปรตีนไก่ Original',
    recipeCode: 'RCP-PRO-001',
    outputItem: 'เครื่องดื่มโปรตีนไก่ Original 350ml',
    plannedQty: 200,
    actualQty: 130,
    uom: 'BTL',
    batchCount: 2,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    plannedStart: '2026-01-29 08:00',
    actualStart: '2026-01-29 08:15',
    plannedEnd: '2026-01-29 16:00',
    actualEnd: null,
    expectedYield: 95,
    actualYield: 96.3,
    assignedTo: 'สมชาย ใจดี',
    notes: 'ผลิตสำหรับ order ลูกค้า ABC'
  },
  {
    id: 2,
    orderNo: 'PO-202601-002',
    recipe: 'สูตรเครื่องดื่มโปรตีนไก่ Vanilla',
    recipeCode: 'RCP-PRO-002',
    outputItem: 'เครื่องดื่มโปรตีนไก่ Vanilla 350ml',
    plannedQty: 150,
    actualQty: 0,
    uom: 'BTL',
    batchCount: 1,
    status: 'PLANNED',
    priority: 'NORMAL',
    plannedStart: '2026-01-29 14:00',
    actualStart: null,
    plannedEnd: '2026-01-29 18:00',
    actualEnd: null,
    expectedYield: 95,
    actualYield: null,
    assignedTo: 'สมหญิง คลังดี',
    notes: ''
  },
  {
    id: 3,
    orderNo: 'PO-202601-003',
    recipe: 'สูตรเครื่องดื่มโปรตีนไก่ Double',
    recipeCode: 'RCP-PRO-003',
    outputItem: 'เครื่องดื่มโปรตีนไก่ Double Protein 350ml',
    plannedQty: 100,
    actualQty: 0,
    uom: 'BTL',
    batchCount: 1,
    status: 'DRAFT',
    priority: 'LOW',
    plannedStart: '2026-01-30 08:00',
    actualStart: null,
    plannedEnd: '2026-01-30 12:00',
    actualEnd: null,
    expectedYield: 93,
    actualYield: null,
    assignedTo: null,
    notes: ''
  },
  {
    id: 4,
    orderNo: 'PO-202601-000',
    recipe: 'สูตรเครื่องดื่มโปรตีนไก่ Original',
    recipeCode: 'RCP-PRO-001',
    outputItem: 'เครื่องดื่มโปรตีนไก่ Original 350ml',
    plannedQty: 100,
    actualQty: 97,
    uom: 'BTL',
    batchCount: 1,
    status: 'COMPLETED',
    priority: 'NORMAL',
    plannedStart: '2026-01-28 08:00',
    actualStart: '2026-01-28 08:05',
    plannedEnd: '2026-01-28 12:00',
    actualEnd: '2026-01-28 11:45',
    expectedYield: 95,
    actualYield: 97,
    assignedTo: 'สมชาย ใจดี',
    notes: ''
  }
];

const materialsRequired = [
  { item: 'อกไก่สดไม่มีหนัง', required: 40, available: 65.5, uom: 'KG', status: 'OK' },
  { item: 'น้ำบริสุทธิ์ RO', required: 50, available: 1500, uom: 'L', status: 'OK' },
  { item: 'Whey Protein Isolate', required: 6, available: 40, uom: 'KG', status: 'OK' },
  { item: 'สารให้ความหวาน Sucralose', required: 0.1, available: 8.5, uom: 'KG', status: 'OK' },
  { item: 'สารกันบูด', required: 0.04, available: 15, uom: 'KG', status: 'OK' },
  { item: 'ขวด PET 350ml', required: 200, available: 12000, uom: 'PC', status: 'OK' },
  { item: 'ฝาขวดสีขาว', required: 200, available: 11500, uom: 'PC', status: 'OK' },
  { item: 'ฉลากเครื่องดื่มโปรตีน Original', required: 200, available: 8000, uom: 'PC', status: 'OK' }
];

// Status Badge Component
const StatusBadge = ({ status, size = 'normal' }) => {
  const styles = {
    'DRAFT': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'ร่าง', icon: FileText },
    'PLANNED': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'วางแผนแล้ว', icon: Calendar },
    'CONFIRMED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'ยืนยัน', icon: CheckCircle },
    'IN_PROGRESS': { bg: 'bg-green-100', text: 'text-green-800', label: 'กำลังผลิต', icon: Play },
    'COMPLETED': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'เสร็จสิ้น', icon: CheckCircle },
    'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'ยกเลิก', icon: X }
  };
  const config = styles[status] || styles['DRAFT'];
  const Icon = config.icon;

  if (size === 'large') {
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Priority Badge
const PriorityBadge = ({ priority }) => {
  const styles = {
    'URGENT': 'bg-red-600 text-white',
    'HIGH': 'bg-orange-500 text-white',
    'NORMAL': 'bg-blue-100 text-blue-800',
    'LOW': 'bg-gray-100 text-gray-600'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority]}`}>
      {priority}
    </span>
  );
};

// Progress Bar Component
const ProgressBar = ({ current, target, showLabel = true }) => {
  const percent = Math.min(Math.round((current / target) * 100), 100);
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">{current} / {target}</span>
          <span className="font-medium">{percent}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${
            percent >= 100 ? 'bg-green-600' : 'bg-blue-600'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// Create Production Order Modal
const CreateOrderModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-semibold">สร้างใบสั่งผลิต</h3>
            <p className="text-sm text-gray-500">ขั้นตอน {step} / 2</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สูตรการผลิต *</label>
              <select className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
                <option value="">-- เลือกสูตร --</option>
                <option value="RCP-PRO-001">RCP-PRO-001 - สูตรเครื่องดื่มโปรตีนไก่ Original</option>
                <option value="RCP-PRO-002">RCP-PRO-002 - สูตรเครื่องดื่มโปรตีนไก่ Vanilla</option>
                <option value="RCP-PRO-003">RCP-PRO-003 - สูตรเครื่องดื่มโปรตีนไก่ Double Protein</option>
              </select>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">รายละเอียดสูตร</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">ผลผลิต:</span> เครื่องดื่มโปรตีนไก่ Original 350ml</div>
                <div><span className="text-gray-500">ขนาด Batch:</span> 100 ขวด/Batch</div>
                <div><span className="text-gray-500">Yield ที่คาดหวัง:</span> 95%</div>
                <div><span className="text-gray-500">เวลาผลิต:</span> ~4 ชม./Batch</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนที่ต้องการผลิต *</label>
                <input
                  type="number"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จำนวน Batch</label>
                <input
                  type="number"
                  className="w-full border rounded-lg p-3 bg-gray-100"
                  value="2"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันเริ่มผลิต *</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ความสำคัญ</label>
                <select className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
                  <option value="NORMAL">ปกติ</option>
                  <option value="HIGH">สูง</option>
                  <option value="URGENT">เร่งด่วน</option>
                  <option value="LOW">ต่ำ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
              <select className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
                <option value="">-- เลือกผู้รับผิดชอบ --</option>
                <option value="1">สมชาย ใจดี</option>
                <option value="2">สมหญิง คลังดี</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
              <textarea
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
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
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                ต่อไป
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-4 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5" />
                ตรวจสอบวัตถุดิบ - พร้อมผลิต
              </h4>
              <p className="text-sm text-green-700">วัตถุดิบทั้งหมดเพียงพอสำหรับการผลิต 200 ขวด (2 Batch)</p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">วัตถุดิบ</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">ต้องการ</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">คงเหลือ</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-500">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {materialsRequired.map((mat, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{mat.item}</td>
                      <td className="px-3 py-2 text-right">{mat.required} {mat.uom}</td>
                      <td className="px-3 py-2 text-right text-blue-600">{mat.available} {mat.uom}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-green-600">✓</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                สร้างใบสั่งผลิต
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Record Output Modal
const RecordOutputModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">บันทึกผลผลิต</h3>
            <p className="text-sm text-gray-500">{order.orderNo}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">สินค้าที่ผลิต</p>
            <p className="font-medium">{order.outputItem}</p>
            <div className="mt-2">
              <ProgressBar current={order.actualQty} target={order.plannedQty} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนที่ผลิตได้ *</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <span className="flex items-center px-4 bg-gray-100 rounded-lg text-gray-600">
                {order.uom}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนของเสีย</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <span className="flex items-center px-4 bg-gray-100 rounded-lg text-gray-600">
                {order.uom}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สาเหตุของเสีย</label>
            <select className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
              <option value="">-- ถ้ามี --</option>
              <option value="DEFECT">สินค้าชำรุด</option>
              <option value="CONTAMINATION">ปนเปื้อน</option>
              <option value="MACHINE_ERROR">เครื่องจักรขัดข้อง</option>
              <option value="HUMAN_ERROR">ความผิดพลาดจากพนักงาน</option>
              <option value="OTHER">อื่นๆ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <textarea
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="หมายเหตุเพิ่มเติม..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Detail Modal
const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold">{order.orderNo}</h3>
            <StatusBadge status={order.status} size="large" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Product Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">สินค้าที่ผลิต</p>
            <p className="text-xl font-bold text-blue-900">{order.outputItem}</p>
            <p className="text-sm text-blue-700">{order.recipe}</p>
          </div>

          {/* Progress */}
          <div>
            <h4 className="font-medium mb-2">ความคืบหน้า</h4>
            <ProgressBar current={order.actualQty} target={order.plannedQty} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Target className="w-4 h-4" /> เป้าหมาย
              </p>
              <p className="font-medium">{order.plannedQty} {order.uom}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Package className="w-4 h-4" /> ผลิตได้
              </p>
              <p className="font-medium text-green-600">{order.actualQty} {order.uom}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" /> เวลาเริ่ม
              </p>
              <p className="font-medium">{order.actualStart || order.plannedStart}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Percent className="w-4 h-4" /> Yield
              </p>
              <p className={`font-medium ${
                (order.actualYield || 0) >= (order.expectedYield || 0) ? 'text-green-600' : 'text-orange-600'
              }`}>
                {order.actualYield || '-'}% (เป้า {order.expectedYield}%)
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Users className="w-4 h-4" /> ผู้รับผิดชอบ
              </p>
              <p className="font-medium">{order.assignedTo || '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Batch</p>
              <p className="font-medium">{order.batchCount} Batch</p>
            </div>
          </div>

          {/* Materials Used */}
          <div>
            <h4 className="font-medium mb-2">วัตถุดิบที่ใช้</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">วัตถุดิบ</th>
                    <th className="px-3 py-2 text-right">จำนวน</th>
                    <th className="px-3 py-2 text-left">Lot</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {materialsRequired.slice(0, 4).map((mat, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{mat.item}</td>
                      <td className="px-3 py-2 text-right">{mat.required} {mat.uom}</td>
                      <td className="px-3 py-2 text-blue-600 text-xs">SUP-20260128-00{idx + 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {order.notes && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm text-yellow-800">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-3">
          {order.status === 'IN_PROGRESS' && (
            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              บันทึกผลผลิต
            </button>
          )}
          {order.status === 'PLANNED' && (
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              เริ่มผลิต
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Production Component
export default function Production() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = productionOrders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleRecordOutput = (order) => {
    setSelectedOrder(order);
    setShowRecordModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">การผลิต</h1>
              <p className="text-sm text-gray-500">จัดการใบสั่งผลิตและบันทึกผลผลิต</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              สร้างใบสั่งผลิต
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl p-4 text-left transition ${
              statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border hover:border-blue-300'
            }`}
          >
            <p className={`text-sm ${statusFilter === 'all' ? 'text-blue-100' : 'text-gray-500'}`}>ทั้งหมด</p>
            <p className="text-2xl font-bold">{productionOrders.length}</p>
          </button>
          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`rounded-xl p-4 text-left transition ${
              statusFilter === 'DRAFT' ? 'bg-gray-600 text-white' : 'bg-white border hover:border-gray-300'
            }`}
          >
            <p className={`text-sm ${statusFilter === 'DRAFT' ? 'text-gray-200' : 'text-gray-500'}`}>ร่าง</p>
            <p className="text-2xl font-bold">{productionOrders.filter(o => o.status === 'DRAFT').length}</p>
          </button>
          <button
            onClick={() => setStatusFilter('PLANNED')}
            className={`rounded-xl p-4 text-left transition ${
              statusFilter === 'PLANNED' ? 'bg-yellow-500 text-white' : 'bg-white border hover:border-yellow-300'
            }`}
          >
            <p className={`text-sm ${statusFilter === 'PLANNED' ? 'text-yellow-100' : 'text-gray-500'}`}>วางแผนแล้ว</p>
            <p className="text-2xl font-bold">{productionOrders.filter(o => o.status === 'PLANNED').length}</p>
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`rounded-xl p-4 text-left transition ${
              statusFilter === 'IN_PROGRESS' ? 'bg-green-600 text-white' : 'bg-white border hover:border-green-300'
            }`}
          >
            <p className={`text-sm ${statusFilter === 'IN_PROGRESS' ? 'text-green-100' : 'text-gray-500'}`}>กำลังผลิต</p>
            <p className="text-2xl font-bold">{productionOrders.filter(o => o.status === 'IN_PROGRESS').length}</p>
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`rounded-xl p-4 text-left transition ${
              statusFilter === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-white border hover:border-emerald-300'
            }`}
          >
            <p className={`text-sm ${statusFilter === 'COMPLETED' ? 'text-emerald-100' : 'text-gray-500'}`}>เสร็จสิ้น</p>
            <p className="text-2xl font-bold">{productionOrders.filter(o => o.status === 'COMPLETED').length}</p>
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => handleViewDetail(order)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">{order.orderNo}</span>
                    <StatusBadge status={order.status} />
                    <PriorityBadge priority={order.priority} />
                  </div>
                  <p className="text-gray-600">{order.outputItem}</p>
                  <p className="text-sm text-gray-400">{order.recipe}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">เป้าหมาย</p>
                    <p className="font-bold">{order.plannedQty} {order.uom}</p>
                  </div>

                  {order.status === 'IN_PROGRESS' && (
                    <div className="w-32">
                      <p className="text-sm text-gray-500 mb-1">ความคืบหน้า</p>
                      <ProgressBar current={order.actualQty} target={order.plannedQty} showLabel={false} />
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {order.actualQty}/{order.plannedQty}
                      </p>
                    </div>
                  )}

                  {order.status === 'COMPLETED' && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">ผลิตได้</p>
                      <p className="font-bold text-green-600">{order.actualQty} {order.uom}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {order.status === 'PLANNED' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                      >
                        <Play className="w-4 h-4" />
                        เริ่ม
                      </button>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRecordOutput(order); }}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        บันทึก
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {order.status === 'IN_PROGRESS' && (
                <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    เริ่ม: {order.actualStart}
                  </span>
                  <span className="text-gray-500">
                    <Users className="w-4 h-4 inline mr-1" />
                    {order.assignedTo}
                  </span>
                  <span className={`${
                    (order.actualYield || 0) >= (order.expectedYield || 0) ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    <Percent className="w-4 h-4 inline mr-1" />
                    Yield: {order.actualYield}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Factory className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">ไม่พบใบสั่งผลิต</p>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateOrderModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <RecordOutputModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        order={selectedOrder}
      />
      <OrderDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        order={selectedOrder}
      />
    </div>
  );
}
