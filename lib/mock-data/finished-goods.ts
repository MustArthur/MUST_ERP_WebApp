import {
  FinishedGoodsEntry,
  FGBatch,
  FGProductSummary,
  FGWarehouse,
  FGMovement,
  ExpiryAlert,
} from '@/types/finished-goods'

// =============================================================================
// FG Warehouses
// =============================================================================

export const mockFGWarehouses: FGWarehouse[] = [
  {
    id: 'wh-fg-cold',
    code: 'FG-COLD',
    name: 'ห้องเย็น FG',
    type: 'COLD_STORAGE',
    temperature: 4,
    capacity: 5000,
    currentStock: 1248,
    utilizationPercent: 25,
  },
  {
    id: 'wh-fg-hold',
    code: 'FG-HOLD',
    name: 'พื้นที่รอตรวจ QC',
    type: 'HOLD',
    temperature: 4,
    capacity: 500,
    currentStock: 100,
    utilizationPercent: 20,
  },
  {
    id: 'wh-fg-quarantine',
    code: 'FG-QUAR',
    name: 'พื้นที่กักกัน',
    type: 'QUARANTINE',
    temperature: 4,
    capacity: 200,
    currentStock: 0,
    utilizationPercent: 0,
  },
]

// =============================================================================
// Finished Goods Entries
// =============================================================================

export const mockFinishedGoodsEntries: FinishedGoodsEntry[] = [
  // From WO-2026-0002 (Completed - Plant-Based Strawberry)
  {
    id: 'fg-001',
    code: 'FG-2026-0001',
    workOrderId: 'wo-002',
    productId: 'bom-pb-strawberry',
    productCode: 'PB-STRAWBERRY',
    productName: 'โปรตีนพืช สตรอว์เบอร์รี่',
    batchNo: 'L2026-0130-001',
    mfgDate: '2026-01-30',
    expDate: '2026-02-28', // 30 days shelf life
    quantity: 48,
    availableQty: 30,
    reservedQty: 18,
    deliveredQty: 0,
    uom: 'BTL',
    warehouseId: 'wh-fg-cold',
    warehouseName: 'ห้องเย็น FG',
    status: 'AVAILABLE',
    temperature: 3.5,
    qcStatus: 'PASSED',
    qcInspectionId: 'qc-001',
    createdBy: 'สุภาพร รุ่งเรือง',
    createdAt: '2026-01-30T10:00:00',
    updatedAt: '2026-01-30T10:00:00',
  },

  // From previous production (Chicken Blueberry)
  {
    id: 'fg-002',
    code: 'FG-2026-0002',
    workOrderId: 'wo-prev-001',
    productId: 'bom-ck-blueberry',
    productCode: 'CK-BLUEBERRY',
    productName: 'โปรตีนไก่ บลูเบอร์รี่',
    batchNo: 'L2026-0125-001',
    mfgDate: '2026-01-25',
    expDate: '2026-02-24',
    quantity: 100,
    availableQty: 45,
    reservedQty: 0,
    deliveredQty: 55,
    uom: 'BTL',
    warehouseId: 'wh-fg-cold',
    warehouseName: 'ห้องเย็น FG',
    status: 'AVAILABLE',
    temperature: 3.8,
    qcStatus: 'PASSED',
    createdBy: 'สมชาย ใจดี',
    createdAt: '2026-01-25T14:00:00',
    updatedAt: '2026-01-28T09:00:00',
  },

  // Chicken Mango - older batch
  {
    id: 'fg-003',
    code: 'FG-2026-0003',
    workOrderId: 'wo-prev-002',
    productId: 'bom-ck-mango',
    productCode: 'CK-MANGO',
    productName: 'โปรตีนไก่ มะม่วง',
    batchNo: 'L2026-0120-001',
    mfgDate: '2026-01-20',
    expDate: '2026-02-19',
    quantity: 150,
    availableQty: 80,
    reservedQty: 20,
    deliveredQty: 50,
    uom: 'BTL',
    warehouseId: 'wh-fg-cold',
    warehouseName: 'ห้องเย็น FG',
    status: 'AVAILABLE',
    temperature: 4.0,
    qcStatus: 'PASSED',
    createdBy: 'วิชัย สุขสันต์',
    createdAt: '2026-01-20T15:00:00',
    updatedAt: '2026-01-29T11:00:00',
  },

  // Plant-Based Banana
  {
    id: 'fg-004',
    code: 'FG-2026-0004',
    workOrderId: 'wo-prev-003',
    productId: 'bom-pb-banana',
    productCode: 'PB-BANANA',
    productName: 'โปรตีนพืช กล้วยหอม',
    batchNo: 'L2026-0128-001',
    mfgDate: '2026-01-28',
    expDate: '2026-02-27',
    quantity: 200,
    availableQty: 200,
    reservedQty: 0,
    deliveredQty: 0,
    uom: 'BTL',
    warehouseId: 'wh-fg-cold',
    warehouseName: 'ห้องเย็น FG',
    status: 'AVAILABLE',
    temperature: 3.6,
    qcStatus: 'PASSED',
    createdBy: 'มานะ มั่งมี',
    createdAt: '2026-01-28T16:00:00',
    updatedAt: '2026-01-28T16:00:00',
  },

  // Expiring soon - Chicken Original
  {
    id: 'fg-005',
    code: 'FG-2026-0005',
    workOrderId: 'wo-prev-004',
    productId: 'bom-ck-original',
    productCode: 'CK-ORIGINAL',
    productName: 'โปรตีนไก่ ออริจินอล',
    batchNo: 'L2026-0105-001',
    mfgDate: '2026-01-05',
    expDate: '2026-02-04', // Expiring tomorrow!
    quantity: 75,
    availableQty: 25,
    reservedQty: 0,
    deliveredQty: 50,
    uom: 'BTL',
    warehouseId: 'wh-fg-cold',
    warehouseName: 'ห้องเย็น FG',
    status: 'AVAILABLE',
    temperature: 4.1,
    qcStatus: 'PASSED',
    remarks: '⚠️ ใกล้หมดอายุ - ควรจัดส่งด่วน',
    createdBy: 'สมหญิง รักเรียน',
    createdAt: '2026-01-05T12:00:00',
    updatedAt: '2026-01-31T08:00:00',
  },

  // On Hold - waiting QC
  {
    id: 'fg-006',
    code: 'FG-2026-0006',
    workOrderId: 'wo-001',
    productId: 'bom-ck-blueberry',
    productCode: 'CK-BLUEBERRY',
    productName: 'โปรตีนไก่ บลูเบอร์รี่',
    batchNo: 'L2026-0131-001',
    mfgDate: '2026-01-31',
    expDate: '2026-03-02',
    quantity: 100,
    availableQty: 0,
    reservedQty: 0,
    deliveredQty: 0,
    uom: 'BTL',
    warehouseId: 'wh-fg-hold',
    warehouseName: 'พื้นที่รอตรวจ QC',
    status: 'ON_HOLD',
    temperature: 4.0,
    qcStatus: 'PENDING',
    remarks: 'รอผลตรวจ QC จาก WO-2026-0001',
    createdBy: 'สุภาพร รุ่งเรือง',
    createdAt: '2026-01-31T12:00:00',
    updatedAt: '2026-01-31T12:00:00',
  },

  // Another Chicken Blueberry batch (newer)
  {
    id: 'fg-007',
    code: 'FG-2026-0007',
    workOrderId: 'wo-prev-005',
    productId: 'bom-ck-blueberry',
    productCode: 'CK-BLUEBERRY',
    productName: 'โปรตีนไก่ บลูเบอร์รี่',
    batchNo: 'L2026-0129-001',
    mfgDate: '2026-01-29',
    expDate: '2026-02-28',
    quantity: 120,
    availableQty: 120,
    reservedQty: 0,
    deliveredQty: 0,
    uom: 'BTL',
    warehouseId: 'wh-fg-cold',
    warehouseName: 'ห้องเย็น FG',
    status: 'AVAILABLE',
    temperature: 3.7,
    qcStatus: 'PASSED',
    createdBy: 'สมชาย ใจดี',
    createdAt: '2026-01-29T14:30:00',
    updatedAt: '2026-01-29T14:30:00',
  },

  // Plant-Based Mixed Berry
  {
    id: 'fg-008',
    code: 'FG-2026-0008',
    workOrderId: 'wo-prev-006',
    productId: 'bom-pb-mixedberry',
    productCode: 'PB-MIXEDBERRY',
    productName: 'โปรตีนพืช มิกซ์เบอร์รี่',
    batchNo: 'L2026-0127-001',
    mfgDate: '2026-01-27',
    expDate: '2026-02-26',
    quantity: 180,
    availableQty: 130,
    reservedQty: 50,
    deliveredQty: 0,
    uom: 'BTL',
    warehouseId: 'wh-fg-cold',
    warehouseName: 'ห้องเย็น FG',
    status: 'AVAILABLE',
    temperature: 3.9,
    qcStatus: 'PASSED',
    createdBy: 'มานะ มั่งมี',
    createdAt: '2026-01-27T11:00:00',
    updatedAt: '2026-01-30T15:00:00',
  },
]

// =============================================================================
// Helper: Calculate days to expiry
// =============================================================================

export function calculateDaysToExpiry(expDate: string): number {
  const today = new Date('2026-02-03') // Mock current date
  const exp = new Date(expDate)
  const diffTime = exp.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// =============================================================================
// FG Batches (grouped by batch number)
// =============================================================================

export function getFGBatches(): FGBatch[] {
  const batchMap = new Map<string, FinishedGoodsEntry[]>()

  mockFinishedGoodsEntries.forEach((entry) => {
    const existing = batchMap.get(entry.batchNo) || []
    existing.push(entry)
    batchMap.set(entry.batchNo, existing)
  })

  const batches: FGBatch[] = []

  batchMap.forEach((entries, batchNo) => {
    const first = entries[0]
    const daysToExpire = calculateDaysToExpiry(first.expDate)

    batches.push({
      batchNo,
      productId: first.productId,
      productCode: first.productCode,
      productName: first.productName,
      totalQuantity: entries.reduce((sum, e) => sum + e.quantity, 0),
      availableQty: entries.reduce((sum, e) => sum + e.availableQty, 0),
      reservedQty: entries.reduce((sum, e) => sum + e.reservedQty, 0),
      deliveredQty: entries.reduce((sum, e) => sum + e.deliveredQty, 0),
      mfgDate: first.mfgDate,
      expDate: first.expDate,
      daysToExpire,
      isExpiringSoon: daysToExpire <= 7 && daysToExpire > 0,
      isExpired: daysToExpire <= 0,
      warehouseId: first.warehouseId,
      entries,
    })
  })

  // Sort by expiry date (FEFO)
  return batches.sort(
    (a, b) => new Date(a.expDate).getTime() - new Date(b.expDate).getTime()
  )
}

// =============================================================================
// FG Product Summary
// =============================================================================

export function getFGProductSummary(): FGProductSummary[] {
  const productMap = new Map<string, FinishedGoodsEntry[]>()

  mockFinishedGoodsEntries
    .filter((e) => e.status === 'AVAILABLE')
    .forEach((entry) => {
      const existing = productMap.get(entry.productId) || []
      existing.push(entry)
      productMap.set(entry.productId, existing)
    })

  const summaries: FGProductSummary[] = []

  productMap.forEach((entries, productId) => {
    const first = entries[0]
    const batches = getFGBatches().filter((b) => b.productId === productId)

    const oldestExpiry = entries.reduce((oldest, e) => {
      return new Date(e.expDate) < new Date(oldest) ? e.expDate : oldest
    }, entries[0].expDate)

    summaries.push({
      productId,
      productCode: first.productCode,
      productName: first.productName,
      totalQuantity: entries.reduce((sum, e) => sum + e.quantity, 0),
      availableQty: entries.reduce((sum, e) => sum + e.availableQty, 0),
      reservedQty: entries.reduce((sum, e) => sum + e.reservedQty, 0),
      batches,
      oldestExpiry,
      daysToOldestExpiry: calculateDaysToExpiry(oldestExpiry),
    })
  })

  return summaries.sort((a, b) => a.daysToOldestExpiry - b.daysToOldestExpiry)
}

// =============================================================================
// Expiry Alerts
// =============================================================================

export const mockExpiryAlerts: ExpiryAlert[] = [
  {
    id: 'alert-001',
    fgEntryId: 'fg-005',
    batchNo: 'L2026-0105-001',
    productName: 'โปรตีนไก่ ออริจินอล',
    expDate: '2026-02-04',
    daysToExpire: 1,
    quantity: 25,
    severity: 'CRITICAL',
    acknowledged: false,
  },
  {
    id: 'alert-002',
    fgEntryId: 'fg-003',
    batchNo: 'L2026-0120-001',
    productName: 'โปรตีนไก่ มะม่วง',
    expDate: '2026-02-19',
    daysToExpire: 16,
    quantity: 80,
    severity: 'WARNING',
    acknowledged: true,
    acknowledgedBy: 'ผู้จัดการคลัง',
    acknowledgedAt: '2026-02-01T09:00:00',
  },
]

// =============================================================================
// FG Movements Log
// =============================================================================

export const mockFGMovements: FGMovement[] = [
  {
    id: 'mov-001',
    fgEntryId: 'fg-001',
    type: 'PRODUCTION',
    quantity: 48,
    fromStatus: 'ON_HOLD',
    toStatus: 'AVAILABLE',
    referenceDocType: 'WORK_ORDER',
    referenceDocId: 'wo-002',
    operator: 'สุภาพร รุ่งเรือง',
    timestamp: '2026-01-30T10:00:00',
    remarks: 'รับเข้าจากผลิต WO-2026-0002',
  },
  {
    id: 'mov-002',
    fgEntryId: 'fg-001',
    type: 'PICK',
    quantity: 18,
    fromStatus: 'AVAILABLE',
    toStatus: 'RESERVED',
    referenceDocType: 'PICK_LIST',
    referenceDocId: 'pl-001',
    operator: 'มานี จัดส่ง',
    timestamp: '2026-01-31T08:00:00',
    remarks: 'จอง Pick List PL-2026-0001',
  },
  {
    id: 'mov-003',
    fgEntryId: 'fg-002',
    type: 'DELIVER',
    quantity: 55,
    fromStatus: 'RESERVED',
    toStatus: 'DELIVERED',
    referenceDocType: 'DELIVERY_NOTE',
    referenceDocId: 'dn-prev-001',
    operator: 'สมศักดิ์ ขนส่ง',
    timestamp: '2026-01-28T14:00:00',
    remarks: 'ส่งให้ลูกค้า ร้าน ABC',
  },
]

// =============================================================================
// Dashboard Stats
// =============================================================================

export function getFGDashboardStats() {
  const available = mockFinishedGoodsEntries.filter(
    (e) => e.status === 'AVAILABLE'
  )
  const onHold = mockFinishedGoodsEntries.filter((e) => e.status === 'ON_HOLD')
  const expiringSoon = available.filter(
    (e) => calculateDaysToExpiry(e.expDate) <= 7
  )
  const expired = mockFinishedGoodsEntries.filter(
    (e) => calculateDaysToExpiry(e.expDate) <= 0
  )

  return {
    totalStock: available.reduce((sum, e) => sum + e.availableQty, 0),
    totalBatches: new Set(available.map((e) => e.batchNo)).size,
    onHoldCount: onHold.reduce((sum, e) => sum + e.quantity, 0),
    expiringSoonCount: expiringSoon.reduce((sum, e) => sum + e.availableQty, 0),
    expiredCount: expired.length,
    avgTemperature: 3.8,
    coldRoomUtilization: 25,
  }
}
