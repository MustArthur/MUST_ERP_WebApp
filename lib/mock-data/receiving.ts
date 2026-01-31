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
  // จาก Item.csv - ไก่
  {
    id: 'sup-betagro',
    code: 'SUP-BETAGRO',
    name: 'เบทาโกรเกษตรอุตสาหกรรม',
    contactPerson: 'คุณสมชาย ใจดี',
    phone: '02-833-8000',
    email: 'sales@betagro.com',
    address: 'อ.เมือง จ.ลพบุรี',
    qualityScore: 96,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  // จาก Item.csv - ผลไม้
  {
    id: 'sup-cpaxtra',
    code: 'SUP-CPAXTRA',
    name: 'ซีพี แอ๊กซ์ตร้า',
    contactPerson: 'คุณมาลี รักผลไม้',
    phone: '02-071-9000',
    email: 'contact@cpaxtra.com',
    address: 'กรุงเทพฯ',
    qualityScore: 92,
    status: 'ACTIVE',
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  // จาก Item.csv - Flavors
  {
    id: 'sup-khroberts',
    code: 'SUP-KHROBERTS',
    name: 'KH ROBERTS',
    contactPerson: 'Mr. Kevin Roberts',
    phone: '02-259-0150',
    email: 'info@khroberts.com',
    address: 'กรุงเทพฯ',
    qualityScore: 94,
    status: 'ACTIVE',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  // จาก Item.csv - สารเคมี
  {
    id: 'sup-bkkchemical',
    code: 'SUP-BKKCHEM',
    name: 'กรุงเทพเคมี',
    contactPerson: 'คุณวิชัย เคมิคอล',
    phone: '02-611-0555',
    email: 'sales@bkkchemical.com',
    address: 'กรุงเทพฯ',
    qualityScore: 90,
    status: 'ACTIVE',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2026-01-25T00:00:00Z',
  },
  // จาก Item.csv - Squash
  {
    id: 'sup-centralfood',
    code: 'SUP-CENTRAL',
    name: 'เซ็นทรัล ฟู้ด รีเทล',
    contactPerson: 'คุณประเสริฐ อาหาร',
    phone: '02-021-9999',
    email: 'contact@centralfood.com',
    address: 'กรุงเทพฯ',
    qualityScore: 88,
    status: 'ACTIVE',
    createdAt: '2025-04-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  // จาก Item.csv - Fiber Creamer
  {
    id: 'sup-primo',
    code: 'SUP-PRIMO',
    name: 'พรีโม เทรดดิ้ง',
    contactPerson: 'คุณสุภาพร ดี',
    phone: '02-123-4567',
    email: 'sales@primotrading.com',
    address: 'กรุงเทพฯ',
    qualityScore: 91,
    status: 'ACTIVE',
    createdAt: '2025-05-01T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
  // จาก Item.csv - Matcha
  {
    id: 'sup-polarbear',
    code: 'SUP-POLARBEAR',
    name: 'โพลาร์ แบร์ มิชชั่น',
    contactPerson: 'คุณนภา ใจดี',
    phone: '02-555-1234',
    email: 'info@polarbear.co.th',
    address: 'กรุงเทพฯ',
    qualityScore: 93,
    status: 'ACTIVE',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
]

// ==========================================
// Purchase Receipts
// ==========================================

export const mockPurchaseReceipts: PurchaseReceipt[] = [
  // รับไก่จาก เบทาโกร
  {
    id: 'pr-001',
    code: 'PR-2026-0001',
    status: 'COMPLETED',
    supplierId: 'sup-betagro',
    supplier: mockSuppliers.find(s => s.id === 'sup-betagro'),
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
    remarks: 'ไก่สดคุณภาพดี จากเบทาโกร',
    receivedBy: 'สมหญิง รับของ',
    createdAt: '2026-01-30T08:00:00Z',
    updatedAt: '2026-01-30T10:00:00Z',
  },
  // รับ Plant Protein จาก พรีโม
  {
    id: 'pr-002',
    code: 'PR-2026-0002',
    status: 'PENDING_QC',
    supplierId: 'sup-primo',
    supplier: mockSuppliers.find(s => s.id === 'sup-primo'),
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
    remarks: 'Plant Protein รอตรวจ QC',
    receivedBy: 'สมหญิง รับของ',
    createdAt: '2026-01-31T09:00:00Z',
    updatedAt: '2026-01-31T09:00:00Z',
  },
  // รับ Packaging
  {
    id: 'pr-003',
    code: 'PR-2026-0003',
    status: 'COMPLETED',
    supplierId: 'sup-centralfood',
    supplier: mockSuppliers.find(s => s.id === 'sup-centralfood'),
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
  // รับ Flavors จาก KH Roberts
  {
    id: 'pr-004',
    code: 'PR-2026-0004',
    status: 'DRAFT',
    supplierId: 'sup-khroberts',
    supplier: mockSuppliers.find(s => s.id === 'sup-khroberts'),
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
        unitPrice: 880,
        totalPrice: 4400,
        warehouseId: 'wh-rm-dry',
        qcStatus: 'NOT_REQUIRED',
      },
    ],
    qcStatus: 'NOT_REQUIRED',
    totalAmount: 4400,
    remarks: 'Strawberry Flavor จาก KH Roberts - รอยืนยัน',
    receivedBy: 'สมหญิง รับของ',
    createdAt: '2026-01-31T10:00:00Z',
    updatedAt: '2026-01-31T10:00:00Z',
  },
  // รับไก่อีกล็อตจาก เบทาโกร (มี reject บางส่วน)
  {
    id: 'pr-005',
    code: 'PR-2026-0005',
    status: 'COMPLETED',
    supplierId: 'sup-betagro',
    supplier: mockSuppliers.find(s => s.id === 'sup-betagro'),
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
  // รับผลไม้จาก ซีพี แอ๊กซ์ตร้า
  {
    id: 'pr-006',
    code: 'PR-2026-0006',
    status: 'COMPLETED',
    supplierId: 'sup-cpaxtra',
    supplier: mockSuppliers.find(s => s.id === 'sup-cpaxtra'),
    receiptDate: '2026-01-28',
    poNumber: 'PO-2026-0040',
    invoiceNumber: 'INV-CP-2026-0055',
    items: [
      {
        id: 'pri-006-1',
        lineNo: 1,
        itemId: 'item-strawberry-fruit',
        qtyOrdered: 20,
        qtyReceived: 20,
        qtyAccepted: 20,
        qtyRejected: 0,
        uom: 'KG',
        batchNo: 'STRFRUIT-20260128-001',
        mfgDate: '2026-01-27',
        expDate: '2026-02-10',
        unitPrice: 180,
        totalPrice: 3600,
        warehouseId: 'wh-rm-cold',
        qcInspectionId: 'qi-pr-006-1',
        qcStatus: 'PASSED',
      },
      {
        id: 'pri-006-2',
        lineNo: 2,
        itemId: 'item-blueberry-fruit',
        qtyOrdered: 10,
        qtyReceived: 10,
        qtyAccepted: 10,
        qtyRejected: 0,
        uom: 'KG',
        batchNo: 'BLUFRUIT-20260128-001',
        mfgDate: '2026-01-27',
        expDate: '2026-02-10',
        unitPrice: 320,
        totalPrice: 3200,
        warehouseId: 'wh-rm-cold',
        qcInspectionId: 'qi-pr-006-2',
        qcStatus: 'PASSED',
      },
    ],
    qcStatus: 'PASSED',
    totalAmount: 6800,
    remarks: 'ผลไม้สดจาก ซีพี แอ๊กซ์ตร้า',
    receivedBy: 'สมศักดิ์ คลัง',
    createdAt: '2026-01-28T08:00:00Z',
    updatedAt: '2026-01-28T11:00:00Z',
  },
  // รับสารเคมีจาก กรุงเทพเคมี
  {
    id: 'pr-007',
    code: 'PR-2026-0007',
    status: 'COMPLETED',
    supplierId: 'sup-bkkchemical',
    supplier: mockSuppliers.find(s => s.id === 'sup-bkkchemical'),
    receiptDate: '2026-01-25',
    poNumber: 'PO-2026-0035',
    invoiceNumber: 'INV-BKK-2026-0022',
    items: [
      {
        id: 'pri-007-1',
        lineNo: 1,
        itemId: 'item-xanthan',
        qtyOrdered: 10,
        qtyReceived: 10,
        qtyAccepted: 10,
        qtyRejected: 0,
        uom: 'KG',
        batchNo: 'XAN-20260125-001',
        mfgDate: '2025-12-01',
        expDate: '2026-12-01',
        unitPrice: 140,
        totalPrice: 1400,
        warehouseId: 'wh-rm-dry',
        qcStatus: 'NOT_REQUIRED',
      },
      {
        id: 'pri-007-2',
        lineNo: 2,
        itemId: 'item-cmc',
        qtyOrdered: 15,
        qtyReceived: 15,
        qtyAccepted: 15,
        qtyRejected: 0,
        uom: 'KG',
        batchNo: 'CMC-20260125-001',
        mfgDate: '2025-12-01',
        expDate: '2026-12-01',
        unitPrice: 170,
        totalPrice: 2550,
        warehouseId: 'wh-rm-dry',
        qcStatus: 'NOT_REQUIRED',
      },
    ],
    qcStatus: 'NOT_REQUIRED',
    totalAmount: 3950,
    remarks: 'สารเคมีจาก กรุงเทพเคมี',
    receivedBy: 'สมหญิง รับของ',
    createdAt: '2026-01-25T09:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
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
