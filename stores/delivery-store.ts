import { create } from 'zustand'
import {
  Customer,
  CustomerOrder,
  CustomerOrderStatus,
  PickList,
  PickListStatus,
  DeliveryNote,
  DeliveryNoteStatus,
  Driver,
  TemperatureLog,
  TemperatureAlert,
  OrderFilters,
  DeliveryFilters,
  CreateOrderInput,
  DeliverySummary,
} from '@/types/delivery'
import {
  mockCustomers,
  mockCustomerOrders,
  mockPickLists,
  mockDeliveryNotes,
  mockDrivers,
  getDeliverySummary,
} from '@/lib/mock-data/delivery'

// =============================================================================
// Store State Interface
// =============================================================================

interface DeliveryState {
  // Data
  customers: Customer[]
  orders: CustomerOrder[]
  pickLists: PickList[]
  deliveryNotes: DeliveryNote[]
  drivers: Driver[]

  // Computed
  summary: DeliverySummary

  // UI State
  isLoading: boolean
  error: string | null
  selectedOrder: CustomerOrder | null
  selectedDeliveryNote: DeliveryNote | null

  // Filters
  orderFilters: OrderFilters
  deliveryFilters: DeliveryFilters

  // Actions - Data Fetching
  fetchCustomers: () => Promise<void>
  fetchOrders: () => Promise<void>
  fetchPickLists: () => Promise<void>
  fetchDeliveryNotes: () => Promise<void>
  fetchDrivers: () => Promise<void>
  refreshData: () => Promise<void>

  // Actions - Orders
  createOrder: (input: CreateOrderInput) => Promise<CustomerOrder>
  confirmOrder: (id: string) => Promise<void>
  cancelOrder: (id: string) => Promise<void>

  // Actions - Pick Lists
  createPickList: (orderId: string, assignedTo: string) => Promise<PickList>
  startPicking: (pickListId: string) => Promise<void>
  completePicking: (pickListId: string) => Promise<void>
  verifyPickList: (pickListId: string, verifiedBy: string) => Promise<void>

  // Actions - Delivery Notes
  createDeliveryNote: (
    pickListId: string,
    driverId: string,
    vehicleNo: string
  ) => Promise<DeliveryNote>
  dispatchDelivery: (deliveryNoteId: string) => Promise<void>
  recordTemperature: (
    deliveryNoteId: string,
    temperature: number,
    recordedBy?: string
  ) => Promise<void>
  completeDelivery: (
    deliveryNoteId: string,
    receivedBy: string
  ) => Promise<void>
  returnDelivery: (deliveryNoteId: string, reason: string) => Promise<void>

  // Actions - Cold Chain
  checkColdChainCompliance: (deliveryNoteId: string) => {
    compliant: boolean
    avgTemp: number
    violations: TemperatureAlert[]
  }

  // Actions - Selection
  selectOrder: (order: CustomerOrder | null) => void
  selectDeliveryNote: (note: DeliveryNote | null) => void

  // Actions - Filters
  setOrderFilters: (filters: Partial<OrderFilters>) => void
  setDeliveryFilters: (filters: Partial<DeliveryFilters>) => void
  resetFilters: () => void

  // Computed Getters
  getFilteredOrders: () => CustomerOrder[]
  getFilteredDeliveryNotes: () => DeliveryNote[]
  getOrdersByStatus: (status: CustomerOrderStatus) => CustomerOrder[]
  getDeliveryNotesByStatus: (status: DeliveryNoteStatus) => DeliveryNote[]
  getPendingPickLists: () => PickList[]
}

// =============================================================================
// Initial State
// =============================================================================

const initialOrderFilters: OrderFilters = {
  search: '',
  status: 'all',
  customerId: 'all',
  priority: 'all',
}

const initialDeliveryFilters: DeliveryFilters = {
  search: '',
  status: 'all',
  customerId: 'all',
  driverId: 'all',
}

// =============================================================================
// Helper Functions
// =============================================================================

function generateOrderCode(): string {
  const year = new Date().getFullYear()
  const sequence = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')
  return `SO-${year}-${sequence}`
}

function generatePickListCode(): string {
  const year = new Date().getFullYear()
  const sequence = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')
  return `PL-${year}-${sequence}`
}

function generateDeliveryNoteCode(): string {
  const year = new Date().getFullYear()
  const sequence = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')
  return `DN-${year}-${sequence}`
}

// Cold chain thresholds
const COLD_CHAIN_MIN = 2
const COLD_CHAIN_MAX = 8

// =============================================================================
// Store Implementation
// =============================================================================

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  // Initial State
  customers: [],
  orders: [],
  pickLists: [],
  deliveryNotes: [],
  drivers: [],
  summary: getDeliverySummary(),
  isLoading: false,
  error: null,
  selectedOrder: null,
  selectedDeliveryNote: null,
  orderFilters: initialOrderFilters,
  deliveryFilters: initialDeliveryFilters,

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  fetchCustomers: async () => {
    set({ isLoading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      set({ customers: [...mockCustomers], isLoading: false })
    } catch (error) {
      set({ error: 'ไม่สามารถโหลดข้อมูลลูกค้าได้', isLoading: false })
    }
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      set({
        orders: [...mockCustomerOrders],
        summary: getDeliverySummary(),
        isLoading: false,
      })
    } catch (error) {
      set({ error: 'ไม่สามารถโหลดคำสั่งซื้อได้', isLoading: false })
    }
  },

  fetchPickLists: async () => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      set({ pickLists: [...mockPickLists], isLoading: false })
    } catch (error) {
      set({ error: 'ไม่สามารถโหลด Pick Lists ได้', isLoading: false })
    }
  },

  fetchDeliveryNotes: async () => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      set({ deliveryNotes: [...mockDeliveryNotes], isLoading: false })
    } catch (error) {
      set({ error: 'ไม่สามารถโหลดใบส่งสินค้าได้', isLoading: false })
    }
  },

  fetchDrivers: async () => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      set({ drivers: [...mockDrivers], isLoading: false })
    } catch (error) {
      set({ error: 'ไม่สามารถโหลดข้อมูลคนขับได้', isLoading: false })
    }
  },

  refreshData: async () => {
    const {
      fetchCustomers,
      fetchOrders,
      fetchPickLists,
      fetchDeliveryNotes,
      fetchDrivers,
    } = get()
    await Promise.all([
      fetchCustomers(),
      fetchOrders(),
      fetchPickLists(),
      fetchDeliveryNotes(),
      fetchDrivers(),
    ])
  },

  // ==========================================================================
  // Orders
  // ==========================================================================

  createOrder: async (input: CreateOrderInput) => {
    set({ isLoading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const { customers } = get()
      const customer = customers.find(c => c.id === input.customerId)

      const orderItems = input.items.map((item, idx) => ({
        id: `oi-new-${Date.now()}-${idx}`,
        orderId: `so-new-${Date.now()}`,
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        orderedQty: item.quantity,
        pickedQty: 0,
        deliveredQty: 0,
        uom: 'BTL' as const,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice,
        status: 'PENDING' as const,
      }))

      const newOrder: CustomerOrder = {
        id: `so-new-${Date.now()}`,
        code: generateOrderCode(),
        customerId: input.customerId,
        customer,
        orderDate: new Date().toISOString().split('T')[0],
        requestedDeliveryDate: input.requestedDeliveryDate,
        status: 'DRAFT',
        items: orderItems,
        totalQuantity: orderItems.reduce((sum, i) => sum + i.orderedQty, 0),
        totalAmount: orderItems.reduce((sum, i) => sum + i.lineTotal, 0),
        priority: input.priority,
        remarks: input.remarks,
        createdBy: 'ผู้ใช้ปัจจุบัน',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      set(state => ({
        orders: [newOrder, ...state.orders],
        isLoading: false,
      }))

      return newOrder
    } catch (error) {
      set({ error: 'ไม่สามารถสร้างคำสั่งซื้อได้', isLoading: false })
      throw error
    }
  },

  confirmOrder: async (id: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        orders: state.orders.map(order =>
          order.id === id
            ? {
                ...order,
                status: 'CONFIRMED' as CustomerOrderStatus,
                updatedAt: new Date().toISOString(),
              }
            : order
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถยืนยันคำสั่งซื้อได้', isLoading: false })
    }
  },

  cancelOrder: async (id: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        orders: state.orders.map(order =>
          order.id === id
            ? {
                ...order,
                status: 'CANCELLED' as CustomerOrderStatus,
                updatedAt: new Date().toISOString(),
              }
            : order
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถยกเลิกคำสั่งซื้อได้', isLoading: false })
    }
  },

  // ==========================================================================
  // Pick Lists
  // ==========================================================================

  createPickList: async (orderId: string, assignedTo: string) => {
    set({ isLoading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const { orders } = get()
      const order = orders.find(o => o.id === orderId)

      if (!order) {
        throw new Error('ไม่พบคำสั่งซื้อ')
      }

      const pickItems = order.items.map((item, idx) => ({
        id: `pi-new-${Date.now()}-${idx}`,
        pickListId: `pl-new-${Date.now()}`,
        orderItemId: item.id,
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        requestedQty: item.orderedQty,
        allocations: [], // Will be filled during picking (FEFO)
        totalPickedQty: 0,
        status: 'PENDING' as const,
      }))

      const newPickList: PickList = {
        id: `pl-new-${Date.now()}`,
        code: generatePickListCode(),
        orderId,
        order,
        status: 'PENDING',
        items: pickItems,
        assignedTo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Update order status
      set(state => ({
        pickLists: [newPickList, ...state.pickLists],
        orders: state.orders.map(o =>
          o.id === orderId
            ? {
                ...o,
                status: 'PICKING' as CustomerOrderStatus,
                updatedAt: new Date().toISOString(),
              }
            : o
        ),
        isLoading: false,
      }))

      return newPickList
    } catch (error) {
      set({ error: 'ไม่สามารถสร้าง Pick List ได้', isLoading: false })
      throw error
    }
  },

  startPicking: async (pickListId: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        pickLists: state.pickLists.map(pl =>
          pl.id === pickListId
            ? {
                ...pl,
                status: 'IN_PROGRESS' as PickListStatus,
                pickStartTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : pl
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถเริ่ม Picking ได้', isLoading: false })
    }
  },

  completePicking: async (pickListId: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      set(state => ({
        pickLists: state.pickLists.map(pl =>
          pl.id === pickListId
            ? {
                ...pl,
                status: 'COMPLETED' as PickListStatus,
                pickEndTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : pl
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถจบ Picking ได้', isLoading: false })
    }
  },

  verifyPickList: async (pickListId: string, verifiedBy: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      const { pickLists, orders } = get()
      const pickList = pickLists.find(pl => pl.id === pickListId)

      set(state => ({
        pickLists: state.pickLists.map(pl =>
          pl.id === pickListId
            ? {
                ...pl,
                status: 'VERIFIED' as PickListStatus,
                verifiedBy,
                updatedAt: new Date().toISOString(),
              }
            : pl
        ),
        orders: pickList
          ? state.orders.map(o =>
              o.id === pickList.orderId
                ? {
                    ...o,
                    status: 'PICKED' as CustomerOrderStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : o
            )
          : state.orders,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถยืนยัน Pick List ได้', isLoading: false })
    }
  },

  // ==========================================================================
  // Delivery Notes
  // ==========================================================================

  createDeliveryNote: async (pickListId: string, driverId: string, vehicleNo: string) => {
    set({ isLoading: true, error: null })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const { pickLists, drivers, customers } = get()
      const pickList = pickLists.find(pl => pl.id === pickListId)

      if (!pickList) {
        throw new Error('ไม่พบ Pick List')
      }

      if (pickList.status !== 'VERIFIED') {
        throw new Error('Pick List ยังไม่ได้รับการยืนยัน')
      }

      const driver = drivers.find(d => d.id === driverId)
      const order = pickList.order
      const customer = order?.customer || customers.find(c => c.id === order?.customerId)

      const deliveryItems = pickList.items.map((item, idx) => ({
        id: `di-new-${Date.now()}-${idx}`,
        deliveryNoteId: `dn-new-${Date.now()}`,
        orderItemId: item.orderItemId,
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        batchNo: item.allocations[0]?.batchNo || 'N/A',
        expDate: item.allocations[0]?.expDate || 'N/A',
        quantity: item.totalPickedQty,
        deliveredQty: 0,
        returnedQty: 0,
        uom: 'BTL' as const,
        status: 'PENDING' as const,
      }))

      const newDeliveryNote: DeliveryNote = {
        id: `dn-new-${Date.now()}`,
        code: generateDeliveryNoteCode(),
        pickListId,
        pickList,
        orderId: pickList.orderId,
        order,
        customerId: order?.customerId || '',
        customer,
        status: 'PENDING',
        items: deliveryItems,
        totalQuantity: deliveryItems.reduce((sum, i) => sum + i.quantity, 0),
        driverId,
        driverName: driver?.name || '',
        vehicleNo,
        vehicleType: driver?.vehicleType || 'REFRIGERATED_TRUCK',
        temperatureLogs: [],
        temperatureAlerts: [],
        coldChainCompliant: true,
        createdBy: 'ผู้ใช้ปัจจุบัน',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Update driver status
      set(state => ({
        deliveryNotes: [newDeliveryNote, ...state.deliveryNotes],
        drivers: state.drivers.map(d =>
          d.id === driverId ? { ...d, status: 'ON_DELIVERY' as const } : d
        ),
        isLoading: false,
      }))

      return newDeliveryNote
    } catch (error) {
      set({ error: 'ไม่สามารถสร้างใบส่งสินค้าได้', isLoading: false })
      throw error
    }
  },

  dispatchDelivery: async (deliveryNoteId: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      const { deliveryNotes, orders } = get()
      const dn = deliveryNotes.find(d => d.id === deliveryNoteId)

      set(state => ({
        deliveryNotes: state.deliveryNotes.map(note =>
          note.id === deliveryNoteId
            ? {
                ...note,
                status: 'IN_TRANSIT' as DeliveryNoteStatus,
                dispatchTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : note
        ),
        orders: dn
          ? state.orders.map(o =>
              o.id === dn.orderId
                ? {
                    ...o,
                    status: 'DISPATCHED' as CustomerOrderStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : o
            )
          : state.orders,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถออกจัดส่งได้', isLoading: false })
    }
  },

  recordTemperature: async (
    deliveryNoteId: string,
    temperature: number,
    recordedBy?: string
  ) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 100))

      const newLog: TemperatureLog = {
        id: `tl-${Date.now()}`,
        deliveryNoteId,
        timestamp: new Date().toISOString(),
        temperature,
        source: recordedBy ? 'MANUAL' : 'IOT_SENSOR',
        recordedBy,
      }

      // Check for temperature alerts
      let newAlert: TemperatureAlert | undefined
      if (temperature < COLD_CHAIN_MIN || temperature > COLD_CHAIN_MAX) {
        newAlert = {
          id: `ta-${Date.now()}`,
          deliveryNoteId,
          timestamp: new Date().toISOString(),
          temperature,
          threshold: temperature < COLD_CHAIN_MIN ? COLD_CHAIN_MIN : COLD_CHAIN_MAX,
          type: temperature < COLD_CHAIN_MIN ? 'LOW' : 'HIGH',
          severity: Math.abs(temperature - (temperature < COLD_CHAIN_MIN ? COLD_CHAIN_MIN : COLD_CHAIN_MAX)) > 3 ? 'CRITICAL' : 'WARNING',
          acknowledged: false,
        }
      }

      set(state => ({
        deliveryNotes: state.deliveryNotes.map(note => {
          if (note.id === deliveryNoteId) {
            const updatedLogs = [...note.temperatureLogs, newLog]
            const updatedAlerts = newAlert
              ? [...note.temperatureAlerts, newAlert]
              : note.temperatureAlerts

            // Calculate stats
            const temps = updatedLogs.map(l => l.temperature)
            const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
            const minTemp = Math.min(...temps)
            const maxTemp = Math.max(...temps)
            const compliant = minTemp >= COLD_CHAIN_MIN && maxTemp <= COLD_CHAIN_MAX

            return {
              ...note,
              temperatureLogs: updatedLogs,
              temperatureAlerts: updatedAlerts,
              avgTemperature: Math.round(avgTemp * 10) / 10,
              minTemperature: minTemp,
              maxTemperature: maxTemp,
              coldChainCompliant: compliant,
              updatedAt: new Date().toISOString(),
            }
          }
          return note
        }),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถบันทึกอุณหภูมิได้', isLoading: false })
    }
  },

  completeDelivery: async (deliveryNoteId: string, receivedBy: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const { deliveryNotes, orders } = get()
      const dn = deliveryNotes.find(d => d.id === deliveryNoteId)

      set(state => ({
        deliveryNotes: state.deliveryNotes.map(note =>
          note.id === deliveryNoteId
            ? {
                ...note,
                status: 'DELIVERED' as DeliveryNoteStatus,
                actualArrival: new Date().toISOString(),
                deliveryCompletedTime: new Date().toISOString(),
                receivedBy,
                items: note.items.map(item => ({
                  ...item,
                  deliveredQty: item.quantity,
                  status: 'DELIVERED' as const,
                })),
                updatedAt: new Date().toISOString(),
              }
            : note
        ),
        orders: dn
          ? state.orders.map(o =>
              o.id === dn.orderId
                ? {
                    ...o,
                    status: 'DELIVERED' as CustomerOrderStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : o
            )
          : state.orders,
        drivers: dn
          ? state.drivers.map(d =>
              d.id === dn.driverId ? { ...d, status: 'AVAILABLE' as const } : d
            )
          : state.drivers,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถปิดการส่งได้', isLoading: false })
    }
  },

  returnDelivery: async (deliveryNoteId: string, reason: string) => {
    set({ isLoading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      const { deliveryNotes } = get()
      const dn = deliveryNotes.find(d => d.id === deliveryNoteId)

      set(state => ({
        deliveryNotes: state.deliveryNotes.map(note =>
          note.id === deliveryNoteId
            ? {
                ...note,
                status: 'RETURNED' as DeliveryNoteStatus,
                remarks: reason,
                items: note.items.map(item => ({
                  ...item,
                  returnedQty: item.quantity,
                  returnReason: reason,
                  status: 'RETURNED' as const,
                })),
                updatedAt: new Date().toISOString(),
              }
            : note
        ),
        drivers: dn
          ? state.drivers.map(d =>
              d.id === dn.driverId ? { ...d, status: 'AVAILABLE' as const } : d
            )
          : state.drivers,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'ไม่สามารถบันทึกการคืนได้', isLoading: false })
    }
  },

  // ==========================================================================
  // Cold Chain
  // ==========================================================================

  checkColdChainCompliance: (deliveryNoteId: string) => {
    const { deliveryNotes } = get()
    const note = deliveryNotes.find(dn => dn.id === deliveryNoteId)

    if (!note) {
      return { compliant: false, avgTemp: 0, violations: [] }
    }

    return {
      compliant: note.coldChainCompliant,
      avgTemp: note.avgTemperature || 0,
      violations: note.temperatureAlerts.filter(a => !a.acknowledged),
    }
  },

  // ==========================================================================
  // Selection
  // ==========================================================================

  selectOrder: (order: CustomerOrder | null) => {
    set({ selectedOrder: order })
  },

  selectDeliveryNote: (note: DeliveryNote | null) => {
    set({ selectedDeliveryNote: note })
  },

  // ==========================================================================
  // Filters
  // ==========================================================================

  setOrderFilters: (filters: Partial<OrderFilters>) => {
    set(state => ({
      orderFilters: { ...state.orderFilters, ...filters },
    }))
  },

  setDeliveryFilters: (filters: Partial<DeliveryFilters>) => {
    set(state => ({
      deliveryFilters: { ...state.deliveryFilters, ...filters },
    }))
  },

  resetFilters: () => {
    set({
      orderFilters: initialOrderFilters,
      deliveryFilters: initialDeliveryFilters,
    })
  },

  // ==========================================================================
  // Computed Getters
  // ==========================================================================

  getFilteredOrders: () => {
    const { orders, orderFilters } = get()

    return orders.filter(order => {
      if (orderFilters.search) {
        const searchLower = orderFilters.search.toLowerCase()
        const matchesSearch =
          order.code.toLowerCase().includes(searchLower) ||
          order.customer?.name.toLowerCase().includes(searchLower) ||
          false
        if (!matchesSearch) return false
      }

      if (orderFilters.status !== 'all' && order.status !== orderFilters.status) {
        return false
      }

      if (orderFilters.customerId !== 'all' && order.customerId !== orderFilters.customerId) {
        return false
      }

      if (orderFilters.priority !== 'all' && order.priority !== orderFilters.priority) {
        return false
      }

      return true
    })
  },

  getFilteredDeliveryNotes: () => {
    const { deliveryNotes, deliveryFilters } = get()

    return deliveryNotes.filter(note => {
      if (deliveryFilters.search) {
        const searchLower = deliveryFilters.search.toLowerCase()
        const matchesSearch =
          note.code.toLowerCase().includes(searchLower) ||
          note.customer?.name.toLowerCase().includes(searchLower) ||
          note.driverName.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (deliveryFilters.status !== 'all' && note.status !== deliveryFilters.status) {
        return false
      }

      if (deliveryFilters.customerId !== 'all' && note.customerId !== deliveryFilters.customerId) {
        return false
      }

      if (deliveryFilters.driverId !== 'all' && note.driverId !== deliveryFilters.driverId) {
        return false
      }

      return true
    })
  },

  getOrdersByStatus: (status: CustomerOrderStatus) => {
    const { orders } = get()
    return orders.filter(o => o.status === status)
  },

  getDeliveryNotesByStatus: (status: DeliveryNoteStatus) => {
    const { deliveryNotes } = get()
    return deliveryNotes.filter(dn => dn.status === status)
  },

  getPendingPickLists: () => {
    const { pickLists } = get()
    return pickLists.filter(pl => pl.status === 'PENDING' || pl.status === 'IN_PROGRESS')
  },
}))
