import React, { useState } from 'react';
import {
  BookOpen, Plus, Edit, Copy, Trash2, Eye, Search,
  ChevronDown, ChevronRight, X, Check, Calculator,
  Beaker, Package, AlertTriangle, History, FileText
} from 'lucide-react';

// Sample Data
const recipes = [
  {
    id: 1,
    code: 'RCP-PRO-001',
    name: 'สูตรเครื่องดื่มโปรตีนไก่ Original',
    outputItem: 'เครื่องดื่มโปรตีนไก่ Original 350ml',
    outputItemCode: 'FG-PRO-001',
    outputQty: 100,
    outputUom: 'BTL',
    batchSize: 100,
    expectedYield: 95,
    version: 3,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 240, // minutes
    ingredients: [
      { id: 1, lineNo: 1, item: 'อกไก่สดไม่มีหนัง', code: 'RM-CHICKEN-001', qty: 20, uom: 'KG', scrap: 5, isCritical: true, cost: 120 },
      { id: 2, lineNo: 2, item: 'น้ำบริสุทธิ์ RO', code: 'RM-WATER-001', qty: 25, uom: 'L', scrap: 0, isCritical: true, cost: 5 },
      { id: 3, lineNo: 3, item: 'Whey Protein Isolate', code: 'RM-WHEY-001', qty: 3, uom: 'KG', scrap: 0, isCritical: true, cost: 450 },
      { id: 4, lineNo: 4, item: 'สารให้ความหวาน Sucralose', code: 'RM-ADD-001', qty: 0.05, uom: 'KG', scrap: 0, isCritical: false, cost: 1200 },
      { id: 5, lineNo: 5, item: 'สารกันบูด โซเดียมเบนโซเอต', code: 'RM-ADD-003', qty: 0.02, uom: 'KG', scrap: 0, isCritical: false, cost: 150 },
      { id: 6, lineNo: 6, item: 'ขวด PET 350ml ใส', code: 'PKG-BTL-350', qty: 100, uom: 'PC', scrap: 2, isCritical: true, cost: 3.5 },
      { id: 7, lineNo: 7, item: 'ฝาขวดสีขาว 38mm', code: 'PKG-CAP-001', qty: 100, uom: 'PC', scrap: 2, isCritical: true, cost: 0.8 },
      { id: 8, lineNo: 8, item: 'ฉลากเครื่องดื่มโปรตีน Original', code: 'PKG-LBL-001', qty: 100, uom: 'PC', scrap: 1, isCritical: true, cost: 1.2 },
    ],
    instructions: `1. ต้มอกไก่ที่อุณหภูมิ 85°C เป็นเวลา 45 นาที
2. ปั่นอกไก่กับน้ำส่วนแรก (10L) จนละเอียด
3. เติมน้ำส่วนที่เหลือและ Whey Protein ผสมให้เข้ากัน
4. เติมสารให้ความหวานและสารกันบูด คนให้ละลาย
5. กรองผ่านตะแกรง 100 mesh
6. พาสเจอร์ไรซ์ที่ 72°C 15 วินาที
7. บรรจุขวดร้อนที่อุณหภูมิไม่ต่ำกว่า 65°C
8. ปิดฝาทันทีและพลิกขวดคว่ำ 30 วินาที
9. ติดฉลากและตรวจสอบคุณภาพ`,
    createdAt: '2025-06-15',
    updatedAt: '2026-01-15'
  },
  {
    id: 2,
    code: 'RCP-PRO-002',
    name: 'สูตรเครื่องดื่มโปรตีนไก่ Vanilla',
    outputItem: 'เครื่องดื่มโปรตีนไก่ Vanilla 350ml',
    outputItemCode: 'FG-PRO-002',
    outputQty: 100,
    outputUom: 'BTL',
    batchSize: 100,
    expectedYield: 95,
    version: 2,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 250,
    ingredients: [
      { id: 1, lineNo: 1, item: 'อกไก่สดไม่มีหนัง', code: 'RM-CHICKEN-001', qty: 20, uom: 'KG', scrap: 5, isCritical: true, cost: 120 },
      { id: 2, lineNo: 2, item: 'น้ำบริสุทธิ์ RO', code: 'RM-WATER-001', qty: 25, uom: 'L', scrap: 0, isCritical: true, cost: 5 },
      { id: 3, lineNo: 3, item: 'Whey Protein Isolate', code: 'RM-WHEY-001', qty: 3, uom: 'KG', scrap: 0, isCritical: true, cost: 450 },
      { id: 4, lineNo: 4, item: 'กลิ่นวนิลา Food Grade', code: 'RM-ADD-002', qty: 0.1, uom: 'L', scrap: 0, isCritical: false, cost: 800 },
      { id: 5, lineNo: 5, item: 'สารให้ความหวาน Sucralose', code: 'RM-ADD-001', qty: 0.06, uom: 'KG', scrap: 0, isCritical: false, cost: 1200 },
    ],
    instructions: 'เหมือนสูตร Original แต่เพิ่มกลิ่นวนิลาในขั้นตอนที่ 4',
    createdAt: '2025-08-20',
    updatedAt: '2026-01-10'
  },
  {
    id: 3,
    code: 'RCP-PRO-003',
    name: 'สูตรเครื่องดื่มโปรตีนไก่ Double Protein',
    outputItem: 'เครื่องดื่มโปรตีนไก่ Double Protein 350ml',
    outputItemCode: 'FG-PRO-003',
    outputQty: 100,
    outputUom: 'BTL',
    batchSize: 100,
    expectedYield: 93,
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-15',
    validTo: null,
    estimatedTime: 270,
    ingredients: [
      { id: 1, lineNo: 1, item: 'อกไก่สดไม่มีหนัง', code: 'RM-CHICKEN-001', qty: 30, uom: 'KG', scrap: 5, isCritical: true, cost: 120 },
      { id: 2, lineNo: 2, item: 'น้ำบริสุทธิ์ RO', code: 'RM-WATER-001', qty: 20, uom: 'L', scrap: 0, isCritical: true, cost: 5 },
      { id: 3, lineNo: 3, item: 'Whey Protein Isolate', code: 'RM-WHEY-001', qty: 5, uom: 'KG', scrap: 0, isCritical: true, cost: 450 },
    ],
    instructions: 'เพิ่มปริมาณอกไก่และ Whey Protein',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10'
  },
  {
    id: 4,
    code: 'RCP-PRO-001-V2',
    name: 'สูตรเครื่องดื่มโปรตีนไก่ Original (เก่า)',
    outputItem: 'เครื่องดื่มโปรตีนไก่ Original 350ml',
    outputItemCode: 'FG-PRO-001',
    outputQty: 100,
    outputUom: 'BTL',
    batchSize: 100,
    expectedYield: 92,
    version: 2,
    status: 'OBSOLETE',
    validFrom: '2025-06-01',
    validTo: '2025-12-31',
    estimatedTime: 240,
    ingredients: [],
    instructions: '',
    createdAt: '2025-06-01',
    updatedAt: '2025-12-31'
  }
];

// Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    'DRAFT': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'ร่าง' },
    'ACTIVE': { bg: 'bg-green-100', text: 'text-green-800', label: 'ใช้งาน' },
    'OBSOLETE': { bg: 'bg-red-100', text: 'text-red-800', label: 'ยกเลิก' }
  };
  const { bg, text, label } = config[status] || config['DRAFT'];
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>{label}</span>;
};

// Recipe Detail Modal
const RecipeDetailModal = ({ isOpen, onClose, recipe }) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [batchMultiplier, setBatchMultiplier] = useState(1);

  if (!isOpen || !recipe) return null;

  const calculateTotal = () => {
    return recipe.ingredients.reduce((sum, ing) => {
      const qtyWithScrap = ing.qty * (1 + ing.scrap / 100);
      return sum + (qtyWithScrap * ing.cost * batchMultiplier);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-start bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="text-xl font-bold">{recipe.code}</h3>
                <p className="text-blue-100">{recipe.name}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Bar */}
        <div className="p-4 bg-gray-50 border-b grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-gray-500">ผลผลิต</p>
            <p className="font-medium">{recipe.outputQty} {recipe.outputUom}/Batch</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Yield คาดหวัง</p>
            <p className="font-medium">{recipe.expectedYield}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">เวลาผลิต</p>
            <p className="font-medium">{Math.floor(recipe.estimatedTime / 60)} ชม. {recipe.estimatedTime % 60} นาที</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Version</p>
            <p className="font-medium">v{recipe.version}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">สถานะ</p>
            <StatusBadge status={recipe.status} />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b flex">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-4 py-3 font-medium ${
              activeTab === 'ingredients'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Beaker className="w-4 h-4 inline mr-2" />
            ส่วนประกอบ ({recipe.ingredients.length})
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-3 font-medium ${
              activeTab === 'instructions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            วิธีทำ
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-3 font-medium ${
              activeTab === 'calculator'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calculator className="w-4 h-4 inline mr-2" />
            คำนวณ
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Ingredients Tab */}
          {activeTab === 'ingredients' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">รหัส</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">วัตถุดิบ</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">ปริมาณ/Batch</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">% ของเสีย</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">รวมของเสีย</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">ต้นทุน/หน่วย</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">ต้นทุนรวม</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">หลัก</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recipe.ingredients.map(ing => {
                    const qtyWithScrap = ing.qty * (1 + ing.scrap / 100);
                    const totalCost = qtyWithScrap * ing.cost;
                    return (
                      <tr key={ing.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-500">{ing.lineNo}</td>
                        <td className="px-3 py-2 text-sm font-mono text-blue-600">{ing.code}</td>
                        <td className="px-3 py-2 text-sm">{ing.item}</td>
                        <td className="px-3 py-2 text-sm text-right">{ing.qty} {ing.uom}</td>
                        <td className="px-3 py-2 text-sm text-right text-orange-600">
                          {ing.scrap > 0 ? `${ing.scrap}%` : '-'}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-medium">
                          {qtyWithScrap.toFixed(2)} {ing.uom}
                        </td>
                        <td className="px-3 py-2 text-sm text-right text-gray-500">
                          ฿{ing.cost.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-medium">
                          ฿{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {ing.isCritical && <span className="text-red-500">●</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-blue-50">
                  <tr>
                    <td colSpan="7" className="px-3 py-3 text-right font-medium">
                      ต้นทุนวัตถุดิบรวมต่อ Batch:
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-blue-600">
                      ฿{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="7" className="px-3 py-2 text-right text-sm text-gray-500">
                      ต้นทุนต่อขวด:
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-gray-700">
                      ฿{(calculateTotal() / recipe.outputQty).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Instructions Tab */}
          {activeTab === 'instructions' && (
            <div className="prose max-w-none">
              <h4 className="font-medium text-gray-900 mb-3">ขั้นตอนการผลิต</h4>
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line text-gray-700">
                {recipe.instructions || 'ไม่มีข้อมูล'}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-800 mb-2">⚠️ ข้อควรระวัง</h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• ควบคุมอุณหภูมิให้คงที่ระหว่างการผลิต</li>
                    <li>• ตรวจสอบ Lot วัตถุดิบก่อนใช้งาน</li>
                    <li>• สวมอุปกรณ์ป้องกันตลอดการผลิต</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-2">📝 จุดตรวจสอบ QC</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• ตรวจอุณหภูมิหลังพาสเจอร์ไรซ์</li>
                    <li>• ตรวจค่า pH ก่อนบรรจุ (4.0-4.5)</li>
                    <li>• ตรวจการปิดฝาสุญญากาศ</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">🧮 คำนวณวัตถุดิบตามจำนวน Batch</h4>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-blue-700">จำนวน Batch:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={batchMultiplier}
                    onChange={(e) => setBatchMultiplier(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-2 border rounded-lg text-center font-bold text-lg"
                  />
                  <span className="text-blue-700">
                    = <strong>{recipe.outputQty * batchMultiplier}</strong> {recipe.outputUom}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">วัตถุดิบ</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">ต่อ Batch</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                        รวม {batchMultiplier} Batch
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">ต้นทุนรวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recipe.ingredients.map(ing => {
                      const qtyWithScrap = ing.qty * (1 + ing.scrap / 100);
                      const totalQty = qtyWithScrap * batchMultiplier;
                      const totalCost = totalQty * ing.cost;
                      return (
                        <tr key={ing.id}>
                          <td className="px-3 py-2 text-sm">{ing.item}</td>
                          <td className="px-3 py-2 text-sm text-right">{qtyWithScrap.toFixed(2)} {ing.uom}</td>
                          <td className="px-3 py-2 text-right font-medium text-blue-600">
                            {totalQty.toFixed(2)} {ing.uom}
                          </td>
                          <td className="px-3 py-2 text-right">
                            ฿{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-green-50">
                    <tr>
                      <td colSpan="3" className="px-3 py-3 text-right font-medium">
                        ต้นทุนรวม ({batchMultiplier} Batch):
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-green-600 text-lg">
                        ฿{(calculateTotal() * batchMultiplier).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            สร้าง: {recipe.createdAt} | แก้ไขล่าสุด: {recipe.updatedAt}
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-100 flex items-center gap-2">
              <Copy className="w-4 h-4" />
              คัดลอกสูตร
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-100 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              แก้ไข
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create/Edit Recipe Modal
const CreateRecipeModal = ({ isOpen, onClose }) => {
  const [ingredients, setIngredients] = useState([
    { id: 1, item: '', qty: '', uom: 'KG', scrap: 0, isCritical: true }
  ]);

  if (!isOpen) return null;

  const addIngredient = () => {
    setIngredients([...ingredients, {
      id: ingredients.length + 1,
      item: '',
      qty: '',
      uom: 'KG',
      scrap: 0,
      isCritical: false
    }]);
  };

  const removeIngredient = (id) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(i => i.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">สร้างสูตรใหม่</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสสูตร *</label>
              <input
                type="text"
                className="w-full border rounded-lg p-3"
                placeholder="RCP-XXX-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสูตร *</label>
              <input
                type="text"
                className="w-full border rounded-lg p-3"
                placeholder="สูตรเครื่องดื่มโปรตีน..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สินค้าที่ผลิตได้ *</label>
              <select className="w-full border rounded-lg p-3">
                <option value="">-- เลือกสินค้า --</option>
                <option>FG-PRO-001 - เครื่องดื่มโปรตีนไก่ Original</option>
                <option>FG-PRO-002 - เครื่องดื่มโปรตีนไก่ Vanilla</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนผลิต *</label>
                <input type="number" className="w-full border rounded-lg p-3" placeholder="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หน่วย</label>
                <select className="w-full border rounded-lg p-3">
                  <option>BTL</option>
                  <option>PC</option>
                  <option>KG</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yield ที่คาดหวัง (%)</label>
              <input type="number" className="w-full border rounded-lg p-3" placeholder="95" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เวลาผลิตโดยประมาณ (นาที)</label>
              <input type="number" className="w-full border rounded-lg p-3" placeholder="240" />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">ส่วนประกอบ *</label>
              <button
                onClick={addIngredient}
                className="text-blue-600 text-sm hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> เพิ่มรายการ
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">วัตถุดิบ</th>
                    <th className="px-2 py-2 text-right w-24">ปริมาณ</th>
                    <th className="px-2 py-2 text-center w-20">หน่วย</th>
                    <th className="px-2 py-2 text-center w-20">% เสีย</th>
                    <th className="px-2 py-2 text-center w-16">หลัก</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ingredients.map((ing, idx) => (
                    <tr key={ing.id}>
                      <td className="px-2 py-2 text-gray-500">{idx + 1}</td>
                      <td className="px-2 py-2">
                        <select className="w-full border rounded p-1.5 text-sm">
                          <option value="">-- เลือก --</option>
                          <option>RM-CHICKEN-001 - อกไก่สด</option>
                          <option>RM-WATER-001 - น้ำบริสุทธิ์</option>
                          <option>RM-WHEY-001 - Whey Protein</option>
                          <option>PKG-BTL-350 - ขวด PET</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" className="w-full border rounded p-1.5 text-right" placeholder="0" />
                      </td>
                      <td className="px-2 py-2">
                        <select className="w-full border rounded p-1.5">
                          <option>KG</option>
                          <option>L</option>
                          <option>PC</option>
                          <option>G</option>
                          <option>ML</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" className="w-full border rounded p-1.5 text-center" placeholder="0" />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input type="checkbox" defaultChecked={ing.isCritical} className="w-4 h-4" />
                      </td>
                      <td className="px-2 py-2">
                        <button
                          onClick={() => removeIngredient(ing.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ขั้นตอนการผลิต</label>
            <textarea
              className="w-full border rounded-lg p-3"
              rows={4}
              placeholder="1. ขั้นตอนแรก...&#10;2. ขั้นตอนที่สอง..."
            />
          </div>
        </div>

        <div className="p-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50">
            ยกเลิก
          </button>
          <button className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            บันทึกร่าง
          </button>
          <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            บันทึกและเปิดใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Recipe Component
export default function Recipe() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredRecipes = recipes.filter(recipe => {
    const matchSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       recipe.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || recipe.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleViewDetail = (recipe) => {
    setSelectedRecipe(recipe);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">สูตรการผลิต (BOM)</h1>
              <p className="text-sm text-gray-500">จัดการสูตรและส่วนประกอบการผลิต</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              สร้างสูตรใหม่
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาด้วยรหัสหรือชื่อสูตร..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                ใช้งาน
              </button>
              <button
                onClick={() => setStatusFilter('DRAFT')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'DRAFT' ? 'bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                ร่าง
              </button>
              <button
                onClick={() => setStatusFilter('OBSOLETE')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'OBSOLETE' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>

        {/* Recipe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition cursor-pointer ${
                recipe.status === 'OBSOLETE' ? 'opacity-60' : ''
              }`}
              onClick={() => handleViewDetail(recipe)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-mono text-sm text-blue-600">{recipe.code}</p>
                  <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                </div>
                <StatusBadge status={recipe.status} />
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-500">ผลผลิต</p>
                <p className="font-medium">{recipe.outputItem}</p>
                <p className="text-sm text-gray-600">{recipe.outputQty} {recipe.outputUom} / Batch</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-blue-600 font-medium">{recipe.ingredients.length}</p>
                  <p className="text-gray-500 text-xs">ส่วนประกอบ</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-green-600 font-medium">{recipe.expectedYield}%</p>
                  <p className="text-gray-500 text-xs">Yield</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-purple-600 font-medium">v{recipe.version}</p>
                  <p className="text-gray-500 text-xs">Version</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                <span className="text-xs text-gray-400">อัพเดท: {recipe.updatedAt}</span>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="แก้ไข"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="คัดลอก"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">ไม่พบสูตรที่ค้นหา</p>
          </div>
        )}
      </main>

      {/* Modals */}
      <RecipeDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        recipe={selectedRecipe}
      />
      <CreateRecipeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
