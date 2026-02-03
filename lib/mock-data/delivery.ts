import {
  Customer,
  CustomerOrder,
  CustomerOrderItem,
  PickList,
  PickListItem,
  PickAllocation,
  DeliveryNote,
  DeliveryNoteItem,
  TemperatureLog,
  TemperatureAlert,
  Driver,
  DeliverySummary,
} from '@/types/delivery'

// =============================================================================
// Customers
// =============================================================================

export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    code: 'C001',
    name: 'ร้านสะดวกซื้อ เซเว่น สาขาอโศก',
    contactPerson: 'คุณสมชาย ใจดี',
    phone: '02-123-4567',
    email: 'somchai@7eleven.co.th',
    address: '123 ถนนอโศก แขวงคลองตันเหนือ',
    district: 'วัฒนา',
    province: 'กรุงเทพฯ',
    postalCode: '10110',
    deliveryNotes: 'ส่งหลังร้าน ใช้ลิฟต์ขนของ',
    creditTermDays: 30,
  },
  {
    id: 'cust-002',
    code: 'C002',
    name: 'ฟิตเนส เฟิร์สท์ สาขาสยาม',
    contactPerson: 'คุณมาลี รักสุขภาพ',
    phone: '02-234-5678',
    email: 'malee@fitnessfirst.co.th',
    address: '456 สยามสแควร์ ซอย 3',
    district: 'ปทุมวัน',
    province: 'กรุงเทพฯ',
    postalCode: '10330',
    deliveryNotes: 'ส่งเช้า 7:00-9:00 น. เท่านั้น',
    creditTermDays: 15,
  },
  {
    id: 'cust-003',
    code: 'C003',
    name: 'โรงพยาบาล กรุงเทพ',
    contactPerson: 'คุณวิภา สุขภาพดี',
    phone: '02-345-6789',
    email: 'vipa@bangkokhospital.com',
    address: '2 ซอยศูนย์วิจัย 7',
    district: 'ห้วยขวาง',
    province: 'กรุงเทพฯ',
    postalCode: '10310',
    deliveryNotes: 'ส่งที่ห้องโภชนาการ ชั้น B1',
    creditTermDays: 45,
  },
  {
    id: 'cust-004',
    code: 'C004',
    name: 'คาเฟ่ ออร์แกนิค สาขาทองหล่อ',
    contactPerson: 'คุณณัฐ ใจสะอาด',
    phone: '089-123-4567',
    email: 'nat@organiccafe.co.th',
    address: '55 ซอยทองหล่อ 13',
    district: 'วัฒนา',
    province: 'กรุงเทพฯ',
    postalCode: '10110',
    creditTermDays: 7,
  },
  {
    id: 'cust-005',
    code: 'C005',
    name: 'ซูเปอร์มาร์เก็ต ท็อปส์ สาขาเซ็นทรัลลาดพร้าว',
    contactPerson: 'คุณประสิทธิ์ มั่นคง',
    phone: '02-456-7890',
    email: 'prasit@tops.co.th',
    address: '1693 ถนนพหลโยธิน',
    district: 'จตุจักร',
    province: 'กรุงเทพฯ',
    postalCode: '10900',
    deliveryNotes: 'รับสินค้าที่ loading dock หลังอาคาร',
    creditTermDays: 30,
  },
]

// =============================================================================
// Drivers
// =============================================================================

export const mockDrivers: Driver[] = [
  {
    id: 'drv-001',
    code: 'DRV-001',
    name: 'สมศักดิ์ ขนส่ง',
    phone: '081-234-5678',
    licenseNo: '12345678',
    vehicleNo: 'กข-1234',
    vehicleType: 'REFRIGERATED_TRUCK',
    status: 'ON_DELIVERY',
  },
  {
    id: 'drv-002',
    code: 'DRV-002',
    name: 'สมหมาย ส่งด่วน',
    phone: '082-345-6789',
    licenseNo: '23456789',
    vehicleNo: 'ขค-2345',
    vehicleType: 'REFRIGERATED_TRUCK',
    status: 'AVAILABLE',
  },
  {
    id: 'drv-003',
    code: 'DRV-003',
    name: 'มานพ รวดเร็ว',
    phone: '083-456-7890',
    licenseNo: '34567890',
    vehicleNo: 'คง-3456',
    vehicleType: 'VAN',
    status: 'AVAILABLE',
  },
]

// =============================================================================
// Customer Orders
// =============================================================================

const orderItems001: CustomerOrderItem[] = [
  {
    id: 'oi-001-01',
    orderId: 'so-001',
    productId: 'bom-ck-blueberry',
    productCode: 'CK-BLUEBERRY',
    productName: 'โปรตีนไก่ บลูเบอร์รี่',
    orderedQty: 24,
    pickedQty: 24,
    deliveredQty: 0,
    uom: 'BTL',
    unitPrice: 89,
    lineTotal: 2136,
    status: 'COMPLETE',
  },
  {
    id: 'oi-001-02',
    orderId: 'so-001',
    productId: 'bom-pb-strawberry',
    productCode: 'PB-STRAWBERRY',
    productName: 'โปรตีนพืช สตรอว์เบอร์รี่',
    orderedQty: 18,
    pickedQty: 18,
    deliveredQty: 0,
    uom: 'BTL',
    unitPrice: 99,
    lineTotal: 1782,
    status: 'COMPLETE',
  },
]

const orderItems002: CustomerOrderItem[] = [
  {
    id: 'oi-002-01',
    orderId: 'so-002',
    productId: 'bom-ck-mango',
    productCode: 'CK-MANGO',
    productName: 'โปรตีนไก่ มะม่วง',
    orderedQty: 30,
    pickedQty: 20,
    deliveredQty: 0,
    uom: 'BTL',
    unitPrice: 89,
    lineTotal: 2670,
    status: 'PARTIAL',
  },
  {
    id: 'oi-002-02',
    orderId: 'so-002',
    productId: 'bom-pb-banana',
    productCode: 'PB-BANANA',
    productName: 'โปรตีนพืช กล้วยหอม',
    orderedQty: 20,
    pickedQty: 0,
    deliveredQty: 0,
    uom: 'BTL',
    unitPrice: 99,
    lineTotal: 1980,
    status: 'PENDING',
  },
]

const orderItems003: CustomerOrderItem[] = [
  {
    id: 'oi-003-01',
    orderId: 'so-003',
    productId: 'bom-pb-mixedberry',
    productCode: 'PB-MIXEDBERRY',
    productName: 'โปรตีนพืช มิกซ์เบอร์รี่',
    orderedQty: 50,
    pickedQty: 50,
    deliveredQty: 50,
    uom: 'BTL',
    unitPrice: 99,
    lineTotal: 4950,
    status: 'COMPLETE',
  },
]

const orderItems004: CustomerOrderItem[] = [
  {
    id: 'oi-004-01',
    orderId: 'so-004',
    productId: 'bom-ck-original',
    productCode: 'CK-ORIGINAL',
    productName: 'โปรตีนไก่ ออริจินอล',
    orderedQty: 25,
    pickedQty: 0,
    deliveredQty: 0,
    uom: 'BTL',
    unitPrice: 79,
    lineTotal: 1975,
    status: 'PENDING',
  },
]

export const mockCustomerOrders: CustomerOrder[] = [
  {
    id: 'so-001',
    code: 'SO-2026-0001',
    customerId: 'cust-001',
    customer: mockCustomers[0],
    orderDate: '2026-01-30',
    requestedDeliveryDate: '2026-02-03',
    status: 'DISPATCHED',
    items: orderItems001,
    totalQuantity: 42,
    totalAmount: 3918,
    priority: 'NORMAL',
    createdBy: 'ฝ่ายขาย',
    createdAt: '2026-01-30T10:00:00',
    updatedAt: '2026-02-03T08:00:00',
  },
  {
    id: 'so-002',
    code: 'SO-2026-0002',
    customerId: 'cust-002',
    customer: mockCustomers[1],
    orderDate: '2026-01-31',
    requestedDeliveryDate: '2026-02-04',
    status: 'PICKING',
    items: orderItems002,
    totalQuantity: 50,
    totalAmount: 4650,
    priority: 'URGENT',
    remarks: 'ลูกค้า VIP ส่งให้ตรงเวลา',
    createdBy: 'ฝ่ายขาย',
    createdAt: '2026-01-31T14:00:00',
    updatedAt: '2026-02-02T09:00:00',
  },
  {
    id: 'so-003',
    code: 'SO-2026-0003',
    customerId: 'cust-003',
    customer: mockCustomers[2],
    orderDate: '2026-01-28',
    requestedDeliveryDate: '2026-02-01',
    status: 'DELIVERED',
    items: orderItems003,
    totalQuantity: 50,
    totalAmount: 4950,
    priority: 'NORMAL',
    createdBy: 'ฝ่ายขาย',
    createdAt: '2026-01-28T11:00:00',
    updatedAt: '2026-02-01T15:00:00',
  },
  {
    id: 'so-004',
    code: 'SO-2026-0004',
    customerId: 'cust-004',
    customer: mockCustomers[3],
    orderDate: '2026-02-02',
    requestedDeliveryDate: '2026-02-05',
    status: 'CONFIRMED',
    items: orderItems004,
    totalQuantity: 25,
    totalAmount: 1975,
    priority: 'EXPRESS',
    remarks: 'ลูกค้าใหม่ - ดูแลพิเศษ',
    createdBy: 'ฝ่ายขาย',
    createdAt: '2026-02-02T09:00:00',
    updatedAt: '2026-02-02T09:00:00',
  },
]

// =============================================================================
// Pick Lists
// =============================================================================

const pickAllocations001: PickAllocation[] = [
  {
    id: 'pa-001-01',
    fgEntryId: 'fg-002',
    batchNo: 'L2026-0125-001',
    expDate: '2026-02-24',
    allocatedQty: 24,
    pickedQty: 24,
    location: 'A-01-02',
    status: 'PICKED',
  },
]

const pickAllocations002: PickAllocation[] = [
  {
    id: 'pa-001-02',
    fgEntryId: 'fg-001',
    batchNo: 'L2026-0130-001',
    expDate: '2026-02-28',
    allocatedQty: 18,
    pickedQty: 18,
    location: 'A-02-01',
    status: 'PICKED',
  },
]

const pickItems001: PickListItem[] = [
  {
    id: 'pi-001-01',
    pickListId: 'pl-001',
    orderItemId: 'oi-001-01',
    productId: 'bom-ck-blueberry',
    productCode: 'CK-BLUEBERRY',
    productName: 'โปรตีนไก่ บลูเบอร์รี่',
    requestedQty: 24,
    allocations: pickAllocations001,
    totalPickedQty: 24,
    status: 'COMPLETE',
  },
  {
    id: 'pi-001-02',
    pickListId: 'pl-001',
    orderItemId: 'oi-001-02',
    productId: 'bom-pb-strawberry',
    productCode: 'PB-STRAWBERRY',
    productName: 'โปรตีนพืช สตรอว์เบอร์รี่',
    requestedQty: 18,
    allocations: pickAllocations002,
    totalPickedQty: 18,
    status: 'COMPLETE',
  },
]

export const mockPickLists: PickList[] = [
  {
    id: 'pl-001',
    code: 'PL-2026-0001',
    orderId: 'so-001',
    order: mockCustomerOrders[0],
    status: 'VERIFIED',
    items: pickItems001,
    assignedTo: 'มานี จัดส่ง',
    pickStartTime: '2026-02-02T14:00:00',
    pickEndTime: '2026-02-02T14:30:00',
    pickedBy: 'มานี จัดส่ง',
    verifiedBy: 'หัวหน้าคลัง',
    createdAt: '2026-02-02T13:00:00',
    updatedAt: '2026-02-02T15:00:00',
  },
  {
    id: 'pl-002',
    code: 'PL-2026-0002',
    orderId: 'so-002',
    order: mockCustomerOrders[1],
    status: 'IN_PROGRESS',
    items: [
      {
        id: 'pi-002-01',
        pickListId: 'pl-002',
        orderItemId: 'oi-002-01',
        productId: 'bom-ck-mango',
        productCode: 'CK-MANGO',
        productName: 'โปรตีนไก่ มะม่วง',
        requestedQty: 30,
        allocations: [
          {
            id: 'pa-002-01',
            fgEntryId: 'fg-003',
            batchNo: 'L2026-0120-001',
            expDate: '2026-02-19',
            allocatedQty: 20,
            pickedQty: 20,
            location: 'A-03-01',
            status: 'PICKED',
          },
        ],
        totalPickedQty: 20,
        status: 'PARTIAL',
      },
    ],
    assignedTo: 'สมหญิง รักเรียน',
    pickStartTime: '2026-02-03T09:00:00',
    pickedBy: 'สมหญิง รักเรียน',
    remarks: 'รอสต็อคเพิ่ม 10 ขวด',
    createdAt: '2026-02-02T16:00:00',
    updatedAt: '2026-02-03T09:30:00',
  },
]

// =============================================================================
// Delivery Notes
// =============================================================================

const temperatureLogs001: TemperatureLog[] = [
  {
    id: 'tl-001-01',
    deliveryNoteId: 'dn-001',
    timestamp: '2026-02-03T08:00:00',
    temperature: 3.5,
    humidity: 65,
    source: 'MANUAL',
    recordedBy: 'สมศักดิ์ ขนส่ง',
  },
  {
    id: 'tl-001-02',
    deliveryNoteId: 'dn-001',
    timestamp: '2026-02-03T08:30:00',
    temperature: 4.0,
    humidity: 62,
    location: '13.7563,100.5018',
    source: 'IOT_SENSOR',
  },
  {
    id: 'tl-001-03',
    deliveryNoteId: 'dn-001',
    timestamp: '2026-02-03T09:00:00',
    temperature: 4.2,
    humidity: 60,
    location: '13.7450,100.5350',
    source: 'IOT_SENSOR',
  },
]

const deliveryItems001: DeliveryNoteItem[] = [
  {
    id: 'di-001-01',
    deliveryNoteId: 'dn-001',
    orderItemId: 'oi-001-01',
    productId: 'bom-ck-blueberry',
    productCode: 'CK-BLUEBERRY',
    productName: 'โปรตีนไก่ บลูเบอร์รี่',
    batchNo: 'L2026-0125-001',
    expDate: '2026-02-24',
    quantity: 24,
    deliveredQty: 0,
    returnedQty: 0,
    uom: 'BTL',
    status: 'PENDING',
  },
  {
    id: 'di-001-02',
    deliveryNoteId: 'dn-001',
    orderItemId: 'oi-001-02',
    productId: 'bom-pb-strawberry',
    productCode: 'PB-STRAWBERRY',
    productName: 'โปรตีนพืช สตรอว์เบอร์รี่',
    batchNo: 'L2026-0130-001',
    expDate: '2026-02-28',
    quantity: 18,
    deliveredQty: 0,
    returnedQty: 0,
    uom: 'BTL',
    status: 'PENDING',
  },
]

export const mockDeliveryNotes: DeliveryNote[] = [
  {
    id: 'dn-001',
    code: 'DN-2026-0001',
    pickListId: 'pl-001',
    pickList: mockPickLists[0],
    orderId: 'so-001',
    order: mockCustomerOrders[0],
    customerId: 'cust-001',
    customer: mockCustomers[0],
    status: 'IN_TRANSIT',
    items: deliveryItems001,
    totalQuantity: 42,
    driverId: 'drv-001',
    driverName: 'สมศักดิ์ ขนส่ง',
    vehicleNo: 'กข-1234',
    vehicleType: 'REFRIGERATED_TRUCK',
    dispatchTime: '2026-02-03T08:00:00',
    estimatedArrival: '2026-02-03T10:00:00',
    temperatureLogs: temperatureLogs001,
    temperatureAlerts: [],
    avgTemperature: 3.9,
    minTemperature: 3.5,
    maxTemperature: 4.2,
    coldChainCompliant: true,
    createdBy: 'ฝ่ายจัดส่ง',
    createdAt: '2026-02-02T16:00:00',
    updatedAt: '2026-02-03T09:00:00',
  },
  {
    id: 'dn-002',
    code: 'DN-2026-0002',
    pickListId: 'pl-prev-001',
    orderId: 'so-003',
    order: mockCustomerOrders[2],
    customerId: 'cust-003',
    customer: mockCustomers[2],
    status: 'DELIVERED',
    items: [
      {
        id: 'di-002-01',
        deliveryNoteId: 'dn-002',
        orderItemId: 'oi-003-01',
        productId: 'bom-pb-mixedberry',
        productCode: 'PB-MIXEDBERRY',
        productName: 'โปรตีนพืช มิกซ์เบอร์รี่',
        batchNo: 'L2026-0127-001',
        expDate: '2026-02-26',
        quantity: 50,
        deliveredQty: 50,
        returnedQty: 0,
        uom: 'BTL',
        status: 'DELIVERED',
      },
    ],
    totalQuantity: 50,
    driverId: 'drv-002',
    driverName: 'สมหมาย ส่งด่วน',
    vehicleNo: 'ขค-2345',
    vehicleType: 'REFRIGERATED_TRUCK',
    dispatchTime: '2026-02-01T08:00:00',
    estimatedArrival: '2026-02-01T10:00:00',
    actualArrival: '2026-02-01T09:45:00',
    deliveryCompletedTime: '2026-02-01T10:00:00',
    temperatureLogs: [
      {
        id: 'tl-002-01',
        deliveryNoteId: 'dn-002',
        timestamp: '2026-02-01T08:00:00',
        temperature: 3.8,
        source: 'MANUAL',
        recordedBy: 'สมหมาย ส่งด่วน',
      },
      {
        id: 'tl-002-02',
        deliveryNoteId: 'dn-002',
        timestamp: '2026-02-01T09:00:00',
        temperature: 4.0,
        source: 'IOT_SENSOR',
      },
      {
        id: 'tl-002-03',
        deliveryNoteId: 'dn-002',
        timestamp: '2026-02-01T09:45:00',
        temperature: 3.9,
        source: 'MANUAL',
        recordedBy: 'สมหมาย ส่งด่วน',
      },
    ],
    temperatureAlerts: [],
    avgTemperature: 3.9,
    minTemperature: 3.8,
    maxTemperature: 4.0,
    coldChainCompliant: true,
    receivedBy: 'คุณวิภา สุขภาพดี',
    createdBy: 'ฝ่ายจัดส่ง',
    createdAt: '2026-01-31T16:00:00',
    updatedAt: '2026-02-01T10:00:00',
  },
]

// =============================================================================
// Temperature Alerts (for a hypothetical problematic delivery)
// =============================================================================

export const mockTemperatureAlerts: TemperatureAlert[] = [
  {
    id: 'ta-001',
    deliveryNoteId: 'dn-prev-problem',
    timestamp: '2026-01-25T11:30:00',
    temperature: 9.5,
    threshold: 8,
    type: 'HIGH',
    severity: 'CRITICAL',
    acknowledged: true,
    acknowledgedBy: 'ผู้จัดการจัดส่ง',
    acknowledgedAt: '2026-01-25T11:35:00',
    action: 'หยุดรถเปิด AC เต็มที่ อุณหภูมิลดลงใน 15 นาที',
  },
]

// =============================================================================
// Dashboard Summary
// =============================================================================

export function getDeliverySummary(): DeliverySummary {
  return {
    totalOrders: mockCustomerOrders.length,
    pendingOrders: mockCustomerOrders.filter(
      (o) => o.status === 'CONFIRMED' || o.status === 'PICKING'
    ).length,
    inTransit: mockDeliveryNotes.filter((d) => d.status === 'IN_TRANSIT').length,
    deliveredToday: 1, // Mock for today
    returnedToday: 0,
    coldChainViolations: 0,
    avgDeliveryTime: 105, // minutes
    onTimeDeliveryRate: 95.5,
  }
}

// =============================================================================
// Order Status Timeline
// =============================================================================

export function getOrderStatusTimeline(orderId: string) {
  // Mock timeline for demonstration
  if (orderId === 'so-001') {
    return [
      { status: 'DRAFT', timestamp: '2026-01-30T09:30:00', by: 'ฝ่ายขาย' },
      { status: 'CONFIRMED', timestamp: '2026-01-30T10:00:00', by: 'ผู้จัดการ' },
      { status: 'PICKING', timestamp: '2026-02-02T13:00:00', by: 'คลังสินค้า' },
      { status: 'PICKED', timestamp: '2026-02-02T15:00:00', by: 'มานี จัดส่ง' },
      { status: 'DISPATCHED', timestamp: '2026-02-03T08:00:00', by: 'สมศักดิ์ ขนส่ง' },
    ]
  }
  return []
}
