// Delivery Types for MUST ERP
// Customer Order → Pick List → Delivery Note with Cold Chain Tracking

import { FinishedGoodsEntry } from './finished-goods'

// Customer (simplified for delivery module)
export interface Customer {
  id: string
  code: string                    // C001, C002
  name: string                    // ร้านสะดวกซื้อ ABC
  contactPerson: string
  phone: string
  email?: string
  address: string
  district: string
  province: string
  postalCode: string
  deliveryNotes?: string          // Special instructions
  creditTermDays: number          // 30, 60, etc.
}

// Customer Order (Sales Order)
export interface CustomerOrder {
  id: string
  code: string                    // SO-2026-0001
  customerId: string
  customer?: Customer
  orderDate: string
  requestedDeliveryDate: string
  status: CustomerOrderStatus
  items: CustomerOrderItem[]
  totalQuantity: number
  totalAmount: number
  priority: 'NORMAL' | 'URGENT' | 'EXPRESS'
  remarks?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type CustomerOrderStatus =
  | 'DRAFT'           // Order being created
  | 'CONFIRMED'       // Order confirmed by customer
  | 'PICKING'         // Pick list created, picking in progress
  | 'PICKED'          // All items picked
  | 'DISPATCHED'      // Delivery in transit
  | 'DELIVERED'       // Delivered to customer
  | 'PARTIAL'         // Partially delivered
  | 'CANCELLED'       // Order cancelled

// Customer Order Item
export interface CustomerOrderItem {
  id: string
  orderId: string
  productId: string
  productCode: string
  productName: string
  orderedQty: number
  pickedQty: number
  deliveredQty: number
  uom: 'BTL'
  unitPrice: number
  lineTotal: number
  status: 'PENDING' | 'PARTIAL' | 'COMPLETE' | 'CANCELLED'
}

// Pick List (for warehouse picking)
export interface PickList {
  id: string
  code: string                    // PL-2026-0001
  orderId: string
  order?: CustomerOrder
  status: PickListStatus
  items: PickListItem[]
  assignedTo: string              // Picker name
  pickStartTime?: string
  pickEndTime?: string
  pickedBy?: string
  verifiedBy?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export type PickListStatus =
  | 'PENDING'         // Waiting to be picked
  | 'IN_PROGRESS'     // Picking in progress
  | 'COMPLETED'       // All items picked
  | 'VERIFIED'        // QC verified
  | 'CANCELLED'

// Pick List Item (with FEFO allocation)
export interface PickListItem {
  id: string
  pickListId: string
  orderItemId: string
  productId: string
  productCode: string
  productName: string
  requestedQty: number
  allocations: PickAllocation[]   // FEFO allocated batches
  totalPickedQty: number
  status: 'PENDING' | 'PARTIAL' | 'COMPLETE'
}

// Pick Allocation (specific batch/FG entry to pick)
export interface PickAllocation {
  id: string
  fgEntryId: string
  fgEntry?: FinishedGoodsEntry
  batchNo: string
  expDate: string
  allocatedQty: number
  pickedQty: number
  location: string                // Rack/shelf location
  status: 'PENDING' | 'PICKED' | 'SHORT'
}

// Delivery Note
export interface DeliveryNote {
  id: string
  code: string                    // DN-2026-0001
  pickListId: string
  pickList?: PickList
  orderId: string
  order?: CustomerOrder
  customerId: string
  customer?: Customer
  status: DeliveryNoteStatus
  items: DeliveryNoteItem[]
  totalQuantity: number

  // Delivery Info
  driverId: string
  driverName: string
  vehicleNo: string
  vehicleType: 'REFRIGERATED_TRUCK' | 'VAN' | 'MOTORCYCLE'

  // Timestamps
  dispatchTime?: string
  estimatedArrival?: string
  actualArrival?: string
  deliveryCompletedTime?: string

  // Cold Chain Tracking
  temperatureLogs: TemperatureLog[]
  temperatureAlerts: TemperatureAlert[]
  avgTemperature?: number
  minTemperature?: number
  maxTemperature?: number
  coldChainCompliant: boolean

  // Proof of Delivery
  receivedBy?: string
  receiverSignature?: string      // Base64 or URL
  deliveryPhotos?: string[]       // URLs

  remarks?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type DeliveryNoteStatus =
  | 'PENDING'         // Waiting for dispatch
  | 'IN_TRANSIT'      // On the way
  | 'DELIVERED'       // Successfully delivered
  | 'PARTIAL'         // Partially delivered
  | 'RETURNED'        // Returned (rejected/failed)
  | 'CANCELLED'

// Delivery Note Item
export interface DeliveryNoteItem {
  id: string
  deliveryNoteId: string
  orderItemId: string
  productId: string
  productCode: string
  productName: string
  batchNo: string
  expDate: string
  quantity: number
  deliveredQty: number
  returnedQty: number
  returnReason?: string
  uom: 'BTL'
  status: 'PENDING' | 'DELIVERED' | 'PARTIAL' | 'RETURNED'
}

// Temperature Log (Cold Chain)
export interface TemperatureLog {
  id: string
  deliveryNoteId: string
  timestamp: string
  temperature: number             // °C
  humidity?: number               // %
  location?: string               // GPS coordinates
  source: 'MANUAL' | 'IOT_SENSOR' | 'GPS_TRACKER'
  recordedBy?: string
}

// Temperature Alert
export interface TemperatureAlert {
  id: string
  deliveryNoteId: string
  timestamp: string
  temperature: number
  threshold: number               // Should be 2-8°C
  type: 'HIGH' | 'LOW'
  severity: 'WARNING' | 'CRITICAL'
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
  action?: string                 // Action taken
}

// Driver
export interface Driver {
  id: string
  code: string                    // DRV-001
  name: string
  phone: string
  licenseNo: string
  vehicleNo: string
  vehicleType: 'REFRIGERATED_TRUCK' | 'VAN' | 'MOTORCYCLE'
  status: 'AVAILABLE' | 'ON_DELIVERY' | 'OFF_DUTY'
}

// Delivery Filters
export interface DeliveryFilters {
  search: string
  status: DeliveryNoteStatus | 'all'
  customerId: string | 'all'
  driverId: string | 'all'
  dateFrom?: string
  dateTo?: string
  coldChainCompliant?: boolean
}

// Order Filters
export interface OrderFilters {
  search: string
  status: CustomerOrderStatus | 'all'
  customerId: string | 'all'
  priority: 'all' | 'NORMAL' | 'URGENT' | 'EXPRESS'
  dateFrom?: string
  dateTo?: string
}

// Create Order Input
export interface CreateOrderInput {
  customerId: string
  requestedDeliveryDate: string
  priority: 'NORMAL' | 'URGENT' | 'EXPRESS'
  items: {
    productId: string
    productCode: string
    productName: string
    quantity: number
    unitPrice: number
  }[]
  remarks?: string
}

// Delivery Summary (Dashboard)
export interface DeliverySummary {
  totalOrders: number
  pendingOrders: number
  inTransit: number
  deliveredToday: number
  returnedToday: number
  coldChainViolations: number
  avgDeliveryTime: number         // minutes
  onTimeDeliveryRate: number      // percentage
}
