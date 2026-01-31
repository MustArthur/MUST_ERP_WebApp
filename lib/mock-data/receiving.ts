// ==========================================
// Raw Material Receiving Mock Data
// ==========================================

import {
  Supplier,
  PurchaseReceipt,
  PurchaseReceiptItem,
} from '@/types/receiving'

// ==========================================
// Suppliers
// ==========================================

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-chicken',
    code: 'SUP-CHICKEN',
    name: 'ฟาร์มไก่สุขใจ',
    contactPerson: 'คุณสมชาย ใจดี',
    phone: '081-234-5678',
    email: 'somchai@sukjai-farm.co.th',
    address: 'อ.เมือง จ.ลพบุรี',
    qualityScore: 95,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'sup-fruit',
    code: 'SUP-FRUIT',
    name: 'สวนผลไม้พัทยา',
    contactPerson: 'คุณมาลี รักผลไม้',
    phone: '089-765-4321',
    email: 'malee@pattaya-fruit.com',
    address: 'อ.บางละมุง จ.ชลบุรี',
    qualityScore: 88,
    status: 'ACTIVE',
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'sup-pkg',
    code: 'SUP-PKG',
    name: 'บรรจุภัณฑ์ไทย จำกัด',
    contactPerson: 'คุณวิชัย บรรจุ',
    phone: '02-123-4567',
    email: 'wichai@thaipkg.co.th',
    address: 'อ.บางพลี จ.สมุทรปราการ',
    qualityScore: 92,
    status: 'ACTIVE',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'sup-protein',
    code: 'SUP-PROTEIN',
    name: 'Plant Protein Co., Ltd.',
    contactPerson: 'Mr. James Wong',
    phone: '02-987-6543',
    email: 'james@plantprotein.com',
    address: 'กรุงเทพฯ',
    qualityScore: 90,
    status: 'ACTIVE',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2026-01-25T00:00:00Z',
  },
  {
    id: 'sup-other',
    code: 'SUP-OTHER',
    name: 'ซัพพลายทั่วไป',
    contactPerson: 'คุณประเสริฐ ทั่วไป',
    phone: '086-111-2222',
    address: 'กรุงเทพฯ',
    qualityScore: 85,
    status: 'ACTIVE',
    createdAt: '2025-04-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

// ==========================================
// Purchase Receipts
// ==========================================

export const mockPurchaseReceipts: PurchaseReceipt[] = [
  {
    id: 'pr-001',
    code: 'PR-2026-0001',
    status: 'COMPLETED',
    supplierId: 'sup-chicken',
    supplier: mockSuppliers.find(s => s.id === 'sup-chicken'),
    receiptDate: '2026-01-30',
    poNumber: 'PO-2026-0045',
    invoiceNumber: 'INV-2026-0123',
    items: [
      {
        id: 'pri-001-1',
        lineNo: 1,
        itemId: 'item-chicken',
        qtyOrdered: 60,
        qtyReceived: 60,
        qtyAccepted: 60,
        qtyRejected: 0,
        uom: 'KG',
        batchNo: 'CK-20260130-001',
        mfgDate: '2026-01-30',
        expDate: '2026-02-04',
        unitPrice: 150,
        totalPrice: 9000,
        warehouseId: 'wh-rm-cold',
        qcInspectionId: 'qi-pr-001-1',
        qcStatus: 'PASSED',
      },
    ],
    qcStatus: 'PASSED',
    totalAmount: 9000,
    remarks: 'ไก่สดคุณภาพดี',
    receivedBy: 'สมหญิง รับของ',
    createdAt: '2026-01-30T08:00:00Z',
    updatedAt: '2026-01-30T10:00:00Z',
  },
  {
    id: 'pr-002',
    code: 'PR-2026-0002',
    status: 'PENDING_QC',
    supplierId: 'sup-protein',
    supplier: mockSuppliers.find(s => s.id === 'sup-protein'),
    receiptDate: '2026-01-31',
    poNumber: 'PO-2026-0048',
    items: [
      {
        id: 'pri-002-1',
        lineNo: 1,
        itemId: 'item-plant-protein',
        qtyOrdered: 50,
        qtyReceived: 50,
        qtyAccepted: 0,
        qtyRejected: 0,
        uom: 'KG',
        batchNo: 'PP-20260131-001',
        mfgDate: '2026-01-15',
        expDate: '2026-07-15',
        unitPrice: 330,
        totalPrice: 16500,
        warehouseId: 'wh-rm-quarantine',
        qcStatus: 'PENDING',
      },
    ],
    qcStatus: 'PENDING',
    totalAmount: 16500,
    remarks: 'รอตรวจ QC',
    receivedBy: 'สมหญิง รับของ',
    createdAt: '2026-01-31T09:00:00Z',
    updatedAt: '2026-01-31T09:00:00Z',
  },
  {
    id: 'pr-003',
    code: 'PR-2026-0003',
    status: 'COMPLETED',
    supplierId: 'sup-pkg',
    supplier: mockSuppliers.find(s => s.id === 'sup-pkg'),
    receiptDate: '2026-01-29',
    poNumber: 'PO-2026-0042',
    invoiceNumber: 'INV-PKG-2026-0089',
    items: [
      {
        id: 'pri-003-1',
        lineNo: 1,
        itemId: 'item-bottle-250',
        qtyOrdered: 500,
        qtyReceived: 500,
        qtyAccepted: 500,
        qtyRejected: 0,
        uom: 'PC',
        batchNo: 'BTL-20260129-001',
        unitPrice: 3.5,
        totalPrice: 1750,
        warehouseId: 'wh-rm-pkg',
        qcInspectionId: 'qi-pr-003-1',
        qcStatus: 'PASSED',
      },
      {
        id: 'pri-003-2',
        lineNo: 2,
        itemId: 'item-cap',
        qtyOrdered: 500,
        qtyReceived: 500,
        qtyAccepted: 500,
        qtyRejected: 0,
        uom: 'PC',
        batchNo: 'CAP-20260129-001',
        unitPrice: 1.2,
        totalPrice: 600,
        warehouseId: 'wh-rm-pkg',
        qcInspectionId: 'qi-pr-003-2',
        qcStatus: 'PASSED',
      },
      {
        id: 'pri-003-3',
        lineNo: 3,
        itemId: 'item-label',
        qtyOrdered: 500,
        qtyReceived: 500,
        qtyAccepted: 500,
        qtyRejected: 0,
        uom: 'PC',
        batchNo: 'LBL-20260129-001',
        unitPrice: 0.8,
        totalPrice: 400,
        warehouseId: 'wh-rm-pkg',
        qcInspectionId: 'qi-pr-003-3',
        qcStatus: 'PASSED',
      },
    ],
    qcStatus: 'PASSED',
    totalAmount: 2750,
    receivedBy: 'สมศักดิ์ คลัง',
    createdAt: '2026-01-29T14:00:00Z',
    updatedAt: '2026-01-29T16:00:00Z',
  },
  {
    id: 'pr-004',
    code: 'PR-2026-0004',
    status: 'DRAFT',
    supplierId: 'sup-fruit',
    supplier: mockSuppliers.find(s => s.id === 'sup-fruit'),
    receiptDate: '2026-01-31',
    items: [
      {
        id: 'pri-004-1',
        lineNo: 1,
        itemId: 'item-strawberry-flavor',
        qtyReceived: 5,
        qtyAccepted: 0,
        qtyRejected: 0,
        uom: 'KG',
        batchNo: 'STR-20260131-001',
        mfgDate: '2026-01-20',
        expDate: '2027-01-20',
        unitPrice: 450,
        totalPrice: 2250,
        warehouseId: 'wh-rm-dry',
        qcStatus: 'NOT_REQUIRED',
      },
    ],
    qcStatus: 'NOT_REQUIRED',
    totalAmount: 2250,
    remarks: 'รอยืนยัน',
    receivedBy: 'สมหญิง รับของ',
    createdAt: '2026-01-31T10:00:00Z',
    updatedAt: '2026-01-31T10:00:00Z',
  },
  {
    id: 'pr-005',
    code: 'PR-2026-0005',
    status: 'COMPLETED',
    supplierId: 'sup-chicken',
    supplier: mockSuppliers.find(s => s.id === 'sup-chicken'),
    receiptDate: '2026-01-31',
    poNumber: 'PO-2026-0050',
    invoiceNumber: 'INV-2026-0130',
    items: [
      {
        id: 'pri-005-1',
        lineNo: 1,
        itemId: 'item-chicken',
        qtyOrdered: 80,
        qtyReceived: 80,
        qtyAccepted: 75,
        qtyRejected: 5,
        uom: 'KG',
        batchNo: 'CK-20260131-001',
        mfgDate: '2026-01-31',
        expDate: '2026-02-05',
        unitPrice: 150,
        totalPrice: 12000,
        warehouseId: 'wh-rm-cold',
        qcInspectionId: 'qi-pr-005-1',
        qcStatus: 'PASSED',
        remarks: '5 kg ไม่ผ่าน QC - สีผิดปกติ',
      },
    ],
    qcStatus: 'PARTIAL',
    totalAmount: 12000,
    remarks: 'บางส่วนไม่ผ่าน QC',
    receivedBy: 'สมหญิง รับของ',
    createdAt: '2026-01-31T07:00:00Z',
    updatedAt: '2026-01-31T09:30:00Z',
  },
]

// ==========================================
// Helper Functions
// ==========================================

export function getSupplierById(id: string): Supplier | undefined {
  return mockSuppliers.find(s => s.id === id)
}

export function getReceiptById(id: string): PurchaseReceipt | undefined {
  return mockPurchaseReceipts.find(r => r.id === id)
}

export function getReceiptsByStatus(status: PurchaseReceipt['status']): PurchaseReceipt[] {
  return mockPurchaseReceipts.filter(r => r.status === status)
}

export function getTodayReceipts(): PurchaseReceipt[] {
  const today = new Date().toISOString().split('T')[0]
  return mockPurchaseReceipts.filter(r => r.receiptDate === today)
}

export function getPendingQCReceipts(): PurchaseReceipt[] {
  return mockPurchaseReceipts.filter(r => r.qcStatus === 'PENDING')
}

export function calculateReceiptTotal(items: PurchaseReceiptItem[]): number {
  return items.reduce((sum, item) => sum + item.totalPrice, 0)
}
