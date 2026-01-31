import {
  QCTemplate,
  QCParameter,
  QCInspection,
  InspectionReading,
  QuarantineRecord,
} from '@/types/quality'

// ==========================================
// QC Templates (from Notion - ERPNext Mapping)
// ==========================================

export const mockQCTemplates: QCTemplate[] = [
  // Raw Material - Chicken
  {
    id: 'qct-raw-chicken',
    code: 'QIT-RAW-CHICKEN',
    name: 'เกณฑ์ตรวจสอบไก่ดิบ',
    type: 'RAW_MATERIAL',
    status: 'ACTIVE',
    version: 1,
    description: 'เกณฑ์ตรวจรับไก่สดจาก Supplier',
    parameters: [
      {
        id: 'param-ck-temp',
        lineNo: 1,
        name: 'อุณหภูมิ',
        nameEn: 'Temperature',
        type: 'NUMERIC',
        minValue: 0,
        maxValue: 4,
        uom: '°C',
        isCritical: true,
        description: 'อุณหภูมิแกนกลาง ต้องไม่เกิน 4°C',
      },
      {
        id: 'param-ck-odor',
        lineNo: 2,
        name: 'กลิ่น',
        nameEn: 'Odor',
        type: 'ACCEPTANCE',
        acceptableValues: ['ปกติ', 'Normal'],
        isCritical: true,
        description: 'ต้องไม่มีกลิ่นผิดปกติหรือกลิ่นเน่าเสีย',
      },
      {
        id: 'param-ck-color',
        lineNo: 3,
        name: 'สี',
        nameEn: 'Color',
        type: 'ACCEPTANCE',
        acceptableValues: ['ชมพู', 'Pink', 'ปกติ'],
        isCritical: false,
        description: 'สีเนื้อไก่ต้องเป็นสีชมพูปกติ',
      },
      {
        id: 'param-ck-packaging',
        lineNo: 4,
        name: 'บรรจุภัณฑ์',
        nameEn: 'Packaging',
        type: 'ACCEPTANCE',
        acceptableValues: ['สมบูรณ์', 'Intact'],
        isCritical: false,
        description: 'บรรจุภัณฑ์ต้องไม่ฉีกขาดหรือเปิดออก',
      },
    ],
    appliesTo: 'PURCHASE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-31T00:00:00Z',
  },
  // Raw Material - General
  {
    id: 'qct-raw-general',
    code: 'QIT-RAW-GENERAL',
    name: 'เกณฑ์ตรวจสอบวัตถุดิบทั่วไป',
    type: 'RAW_MATERIAL',
    status: 'ACTIVE',
    version: 1,
    description: 'เกณฑ์ตรวจรับวัตถุดิบแห้งและสารเติมแต่ง',
    parameters: [
      {
        id: 'param-gen-appearance',
        lineNo: 1,
        name: 'ลักษณะภายนอก',
        nameEn: 'Appearance',
        type: 'ACCEPTANCE',
        acceptableValues: ['ปกติ', 'Normal'],
        isCritical: false,
        description: 'ลักษณะสี กลิ่น ต้องปกติ',
      },
      {
        id: 'param-gen-packaging',
        lineNo: 2,
        name: 'บรรจุภัณฑ์',
        nameEn: 'Packaging',
        type: 'ACCEPTANCE',
        acceptableValues: ['สมบูรณ์', 'Intact'],
        isCritical: false,
        description: 'ไม่มีการฉีกขาด รั่วซึม',
      },
      {
        id: 'param-gen-label',
        lineNo: 3,
        name: 'ฉลาก',
        nameEn: 'Label',
        type: 'ACCEPTANCE',
        acceptableValues: ['ครบถ้วน', 'Complete'],
        isCritical: false,
        description: 'มี Lot, วันผลิต, วันหมดอายุ ครบ',
      },
    ],
    appliesTo: 'PURCHASE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-31T00:00:00Z',
  },
  // Water
  {
    id: 'qct-water',
    code: 'QIT-WATER',
    name: 'เกณฑ์ตรวจสอบน้ำ RO',
    type: 'RAW_MATERIAL',
    status: 'ACTIVE',
    version: 1,
    description: 'เกณฑ์ตรวจน้ำ RO สำหรับการผลิต',
    parameters: [
      {
        id: 'param-water-ph',
        lineNo: 1,
        name: 'pH',
        nameEn: 'pH Level',
        type: 'NUMERIC',
        minValue: 6.5,
        maxValue: 8.5,
        uom: '',
        isCritical: true,
      },
      {
        id: 'param-water-tds',
        lineNo: 2,
        name: 'TDS',
        nameEn: 'Total Dissolved Solids',
        type: 'NUMERIC',
        minValue: 0,
        maxValue: 50,
        uom: 'ppm',
        isCritical: false,
      },
    ],
    appliesTo: 'PURCHASE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-31T00:00:00Z',
  },
  // Packaging
  {
    id: 'qct-packaging',
    code: 'QIT-PACKAGING',
    name: 'เกณฑ์ตรวจสอบบรรจุภัณฑ์',
    type: 'RAW_MATERIAL',
    status: 'ACTIVE',
    version: 1,
    description: 'เกณฑ์ตรวจขวด ฝา สติกเกอร์',
    parameters: [
      {
        id: 'param-pkg-defect',
        lineNo: 1,
        name: 'ข้อบกพร่อง',
        nameEn: 'Defects',
        type: 'ACCEPTANCE',
        acceptableValues: ['ไม่พบ', 'None'],
        isCritical: false,
        description: 'ไม่มีรอยแตก ร้าว บุบ',
      },
      {
        id: 'param-pkg-cleanliness',
        lineNo: 2,
        name: 'ความสะอาด',
        nameEn: 'Cleanliness',
        type: 'ACCEPTANCE',
        acceptableValues: ['สะอาด', 'Clean'],
        isCritical: false,
      },
    ],
    appliesTo: 'PURCHASE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-31T00:00:00Z',
  },
  // Semi-Finished - Cooked Chicken (CCP)
  {
    id: 'qct-semi-chicken',
    code: 'QIT-COOKED-CHICKEN',
    name: 'เกณฑ์ตรวจไก่สุก (CCP)',
    type: 'SEMI_FINISHED',
    status: 'ACTIVE',
    version: 1,
    description: 'CCP - ตรวจอุณหภูมิแกนกลางไก่หลังนึ่ง',
    parameters: [
      {
        id: 'param-ccp-temp',
        lineNo: 1,
        name: 'อุณหภูมิแกนกลาง',
        nameEn: 'Core Temperature',
        type: 'NUMERIC',
        minValue: 72,
        maxValue: 100,
        uom: '°C',
        isCritical: true,
        description: 'CCP: ต้อง ≥ 72°C',
      },
      {
        id: 'param-ccp-color',
        lineNo: 2,
        name: 'สีเนื้อไก่สุก',
        nameEn: 'Cooked Color',
        type: 'ACCEPTANCE',
        acceptableValues: ['ขาว', 'White', 'สุกทั่ว'],
        isCritical: true,
        description: 'ต้องสุกทั่ว ไม่มีส่วนดิบ',
      },
    ],
    appliesTo: 'PRODUCTION',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-31T00:00:00Z',
  },
  // Process - Pasteurization (CCP)
  {
    id: 'qct-pasteurization',
    code: 'QIT-PASTEURIZATION',
    name: 'เกณฑ์พาสเจอร์ไรซ์ (CCP)',
    type: 'PROCESS',
    status: 'ACTIVE',
    version: 1,
    description: 'CCP สูงสุด - ตรวจอุณหภูมิและเวลา Holding',
    parameters: [
      {
        id: 'param-pas-temp',
        lineNo: 1,
        name: 'อุณหภูมิ',
        nameEn: 'Temperature',
        type: 'NUMERIC',
        minValue: 72,
        maxValue: 95,
        uom: '°C',
        isCritical: true,
        description: 'CCP: ต้อง ≥ 72°C',
      },
      {
        id: 'param-pas-time',
        lineNo: 2,
        name: 'Holding Time',
        nameEn: 'Holding Time',
        type: 'NUMERIC',
        minValue: 15,
        maxValue: 600,
        uom: 'วินาที',
        isCritical: true,
        description: 'CCP: ต้อง ≥ 15 วินาที ที่ 72°C',
      },
    ],
    appliesTo: 'PRODUCTION',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-31T00:00:00Z',
  },
  // Finished Good
  {
    id: 'qct-finished-good',
    code: 'QIT-FINISHED-GOOD',
    name: 'เกณฑ์ตรวจสอบสินค้าสำเร็จรูป',
    type: 'FINISHED_GOOD',
    status: 'ACTIVE',
    version: 1,
    description: 'ตรวจก่อนรับเข้าคลัง FG',
    parameters: [
      {
        id: 'param-fg-temp',
        lineNo: 1,
        name: 'อุณหภูมิหลัง Shock Cooling',
        nameEn: 'Post-cooling Temp',
        type: 'NUMERIC',
        minValue: 0,
        maxValue: 4,
        uom: '°C',
        isCritical: true,
        description: 'ต้อง ≤ 4°C ก่อนเข้าห้องเย็น',
      },
      {
        id: 'param-fg-seal',
        lineNo: 2,
        name: 'ความสมบูรณ์ซีล',
        nameEn: 'Seal Integrity',
        type: 'ACCEPTANCE',
        acceptableValues: ['สมบูรณ์', 'Intact'],
        isCritical: true,
        description: 'ฝาปิดสนิท ไม่รั่วซึม',
      },
      {
        id: 'param-fg-label',
        lineNo: 3,
        name: 'ฉลาก',
        nameEn: 'Label',
        type: 'ACCEPTANCE',
        acceptableValues: ['ถูกต้อง', 'Correct'],
        isCritical: false,
        description: 'ฉลากติดตรง ไม่เอียง มีข้อมูลครบ',
      },
    ],
    appliesTo: 'PRODUCTION',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-31T00:00:00Z',
  },
]

// ==========================================
// QC Inspections (Sample Data)
// ==========================================

export const mockQCInspections: QCInspection[] = [
  // Incoming - Raw Chicken PASS
  {
    id: 'qi-001',
    code: 'QI-2026-0001',
    type: 'INCOMING',
    status: 'PASSED',
    templateId: 'qct-raw-chicken',
    sourceDocType: 'PURCHASE_RECEIPT',
    sourceDocId: 'PR-2026-0045',
    sourceDocCode: 'PR-2026-0045',
    itemId: 'item-chicken',
    itemCode: 'RM-CHICKEN',
    itemName: 'อกไก่สด',
    batchNo: 'CK-20260131-001',
    lotNo: 'SUP-A-20260131',
    sampleQty: 5,
    inspectedQty: 60,
    acceptedQty: 60,
    rejectedQty: 0,
    readings: [
      {
        id: 'read-001-1',
        parameterId: 'param-ck-temp',
        numericValue: 2.5,
        status: 'PASS',
      },
      {
        id: 'read-001-2',
        parameterId: 'param-ck-odor',
        acceptanceValue: 'ปกติ',
        status: 'PASS',
      },
      {
        id: 'read-001-3',
        parameterId: 'param-ck-color',
        acceptanceValue: 'ชมพู',
        status: 'PASS',
      },
      {
        id: 'read-001-4',
        parameterId: 'param-ck-packaging',
        acceptanceValue: 'สมบูรณ์',
        status: 'PASS',
      },
    ],
    result: 'ACCEPTED',
    inspectionDate: '2026-01-31',
    inspectionTime: '08:45',
    inspectedBy: 'สมหญิง QC',
    approvedBy: 'วิชัย ผู้จัดการ',
    approvedAt: '2026-01-31T09:00:00Z',
    isCCP: false,
    createdAt: '2026-01-31T08:45:00Z',
    updatedAt: '2026-01-31T09:00:00Z',
  },
  // Incoming - Raw Chicken FAIL (Quarantine)
  {
    id: 'qi-002',
    code: 'QI-2026-0002',
    type: 'INCOMING',
    status: 'FAILED',
    templateId: 'qct-raw-chicken',
    sourceDocType: 'PURCHASE_RECEIPT',
    sourceDocId: 'PR-2026-0044',
    sourceDocCode: 'PR-2026-0044',
    itemId: 'item-chicken',
    itemCode: 'RM-CHICKEN',
    itemName: 'อกไก่สด',
    batchNo: 'CK-20260129-002',
    lotNo: 'SUP-B-20260129',
    sampleQty: 3,
    inspectedQty: 15,
    acceptedQty: 0,
    rejectedQty: 15,
    readings: [
      {
        id: 'read-002-1',
        parameterId: 'param-ck-temp',
        numericValue: 6.2,
        status: 'FAIL',
        remarks: 'อุณหภูมิเกินเกณฑ์ (>4°C)',
      },
      {
        id: 'read-002-2',
        parameterId: 'param-ck-odor',
        acceptanceValue: 'ปกติ',
        status: 'PASS',
      },
      {
        id: 'read-002-3',
        parameterId: 'param-ck-color',
        acceptanceValue: 'ชมพู',
        status: 'PASS',
      },
      {
        id: 'read-002-4',
        parameterId: 'param-ck-packaging',
        acceptanceValue: 'สมบูรณ์',
        status: 'PASS',
      },
    ],
    result: 'REJECTED',
    resultRemarks: 'อุณหภูมิ 6.2°C เกินเกณฑ์ ≤4°C - ย้ายเข้า Quarantine',
    inspectionDate: '2026-01-29',
    inspectionTime: '14:30',
    inspectedBy: 'สมหญิง QC',
    isCCP: false,
    createdAt: '2026-01-29T14:30:00Z',
    updatedAt: '2026-01-29T14:30:00Z',
  },
  // In-Process - Pasteurization CCP PASS
  {
    id: 'qi-003',
    code: 'QI-2026-0003',
    type: 'IN_PROCESS',
    status: 'PASSED',
    templateId: 'qct-pasteurization',
    sourceDocType: 'JOB_CARD',
    sourceDocId: 'JC-PAS-2026-0012',
    sourceDocCode: 'JC-PAS-2026-0012',
    itemId: 'item-fg-ck-thaitea',
    itemCode: 'FG-CK-THAITEA',
    itemName: 'โปรตีนไก่ ชาไทย',
    batchNo: 'FG-CKT-20260131-001',
    sampleQty: 1,
    inspectedQty: 240,
    acceptedQty: 240,
    rejectedQty: 0,
    readings: [
      {
        id: 'read-003-1',
        parameterId: 'param-pas-temp',
        numericValue: 85,
        status: 'PASS',
        remarks: 'อุณหภูมิในเกณฑ์',
      },
      {
        id: 'read-003-2',
        parameterId: 'param-pas-time',
        numericValue: 30,
        status: 'PASS',
        remarks: 'Holding time เพียงพอ',
      },
    ],
    result: 'ACCEPTED',
    inspectionDate: '2026-01-31',
    inspectionTime: '14:00',
    inspectedBy: 'มานะ QC',
    approvedBy: 'วิชัย ผู้จัดการ',
    approvedAt: '2026-01-31T14:15:00Z',
    isCCP: true,
    createdAt: '2026-01-31T14:00:00Z',
    updatedAt: '2026-01-31T14:15:00Z',
  },
  // Final - FG PASS
  {
    id: 'qi-004',
    code: 'QI-2026-0004',
    type: 'FINAL',
    status: 'PASSED',
    templateId: 'qct-finished-good',
    sourceDocType: 'STOCK_ENTRY',
    sourceDocId: 'SE-2026-0003',
    sourceDocCode: 'SE-2026-0003',
    itemId: 'item-fg-ck-thaitea',
    itemCode: 'FG-CK-THAITEA',
    itemName: 'โปรตีนไก่ ชาไทย',
    batchNo: 'FG-CKT-20260131-001',
    sampleQty: 5,
    inspectedQty: 240,
    acceptedQty: 240,
    rejectedQty: 0,
    readings: [
      {
        id: 'read-004-1',
        parameterId: 'param-fg-temp',
        numericValue: 2.8,
        status: 'PASS',
      },
      {
        id: 'read-004-2',
        parameterId: 'param-fg-seal',
        acceptanceValue: 'สมบูรณ์',
        status: 'PASS',
      },
      {
        id: 'read-004-3',
        parameterId: 'param-fg-label',
        acceptanceValue: 'ถูกต้อง',
        status: 'PASS',
      },
    ],
    result: 'ACCEPTED',
    inspectionDate: '2026-01-31',
    inspectionTime: '16:30',
    inspectedBy: 'สมหญิง QC',
    approvedBy: 'วิชัย ผู้จัดการ',
    approvedAt: '2026-01-31T16:45:00Z',
    isCCP: false,
    createdAt: '2026-01-31T16:30:00Z',
    updatedAt: '2026-01-31T16:45:00Z',
  },
]

// ==========================================
// Quarantine Records
// ==========================================

export const mockQuarantineRecords: QuarantineRecord[] = [
  {
    id: 'qr-001',
    code: 'QR-2026-0001',
    status: 'PENDING',
    itemId: 'item-chicken',
    itemCode: 'RM-CHICKEN',
    itemName: 'อกไก่สด',
    batchNo: 'CK-20260129-002',
    qty: 15,
    uom: 'KG',
    reason: 'QC_FAILED',
    reasonDetail: 'อุณหภูมิรับเข้า 6.2°C เกินเกณฑ์ ≤4°C',
    qcInspectionId: 'qi-002',
    warehouseId: 'wh-rm-quarantine',
    warehouseName: 'คลังกักกันวัตถุดิบ',
    quarantinedAt: '2026-01-29T14:30:00Z',
    quarantinedBy: 'สมหญิง QC',
    createdAt: '2026-01-29T14:30:00Z',
    updatedAt: '2026-01-29T14:30:00Z',
  },
]

// ==========================================
// Helper Functions
// ==========================================

export function getTemplateById(id: string): QCTemplate | undefined {
  return mockQCTemplates.find(t => t.id === id)
}

export function getInspectionById(id: string): QCInspection | undefined {
  return mockQCInspections.find(i => i.id === id)
}

export function getInspectionsByItem(itemId: string): QCInspection[] {
  return mockQCInspections.filter(i => i.itemId === itemId)
}

export function getCCPInspections(): QCInspection[] {
  return mockQCInspections.filter(i => i.isCCP)
}

export function getPendingQuarantine(): QuarantineRecord[] {
  return mockQuarantineRecords.filter(q => q.status === 'PENDING')
}

export function calculatePassRate(inspections: QCInspection[]): number {
  if (inspections.length === 0) return 0
  const passed = inspections.filter(i => i.status === 'PASSED').length
  return Math.round((passed / inspections.length) * 100)
}
