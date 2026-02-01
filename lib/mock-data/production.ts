import {
  Workstation,
  WorkstationType,
  Operation,
  WorkOrder,
  JobCard,
  CCPReading,
} from '@/types/production'

// =============================================================================
// Workstations (7 เครื่อง)
// =============================================================================

export const mockWorkstations: Workstation[] = [
  {
    id: 'ws-steamer-01',
    code: 'WS-STEAMER-01',
    name: 'เครื่องนึ่ง 1',
    type: 'STEAMER',
    status: 'AVAILABLE',
    capacity: 50, // kg/hour
    location: 'โซน A - Chicken Prep',
  },
  {
    id: 'ws-shredder-01',
    code: 'WS-SHREDDER-01',
    name: 'เครื่องฉีกไก่ 1',
    type: 'SHREDDER',
    status: 'AVAILABLE',
    capacity: 30, // kg/hour
    location: 'โซน A - Chicken Prep',
  },
  {
    id: 'ws-press-01',
    code: 'WS-PRESS-01',
    name: 'เครื่องบีบอัด 1',
    type: 'PRESS',
    status: 'AVAILABLE',
    capacity: 40, // kg/hour
    location: 'โซน A - Chicken Prep',
  },
  {
    id: 'ws-mixer-01',
    code: 'WS-MIX-01',
    name: 'เครื่องผสม 1',
    type: 'MIXER',
    status: 'IN_USE',
    capacity: 100, // liters
    location: 'โซน B - Mixing',
  },
  {
    id: 'ws-pasteurizer-01',
    code: 'WS-PAS-01',
    name: 'เครื่องพาสเจอร์ไรซ์ 1',
    type: 'PASTEURIZER',
    status: 'AVAILABLE',
    capacity: 200, // liters/hour
    location: 'โซน C - Pasteurization',
  },
  {
    id: 'ws-filler-01',
    code: 'WS-FILL-01',
    name: 'เครื่องบรรจุ 1',
    type: 'FILLER',
    status: 'AVAILABLE',
    capacity: 300, // bottles/hour
    location: 'โซน D - Filling',
  },
  {
    id: 'ws-cooler-01',
    code: 'WS-COOL-01',
    name: 'เครื่อง Shock Cooling 1',
    type: 'COOLER',
    status: 'AVAILABLE',
    capacity: 200, // bottles/hour
    location: 'โซน D - Cooling',
  },
]

// =============================================================================
// Operations (7 ขั้นตอน - including 2 CCP)
// =============================================================================

export const mockOperations: Operation[] = [
  {
    id: 'op-steam',
    code: 'CK-STEAM',
    name: 'นึ่งไก่',
    description: 'นึ่งอกไก่ให้สุก Core temp ≥72°C',
    workstationId: 'ws-steamer-01',
    isCCP: true,
    ccpCriteria: {
      type: 'TEMPERATURE',
      minTemp: 72,
      notes: 'Core temperature ของไก่ต้องถึง 72°C เพื่อฆ่าเชื้อโรค',
    },
    estimatedTime: 45,
    sequence: 1,
  },
  {
    id: 'op-shred',
    code: 'CK-SHRED',
    name: 'ฉีก/บดไก่',
    description: 'ฉีกหรือบดไก่ให้ละเอียด',
    workstationId: 'ws-shredder-01',
    isCCP: false,
    estimatedTime: 20,
    sequence: 2,
  },
  {
    id: 'op-press',
    code: 'CK-PRESS',
    name: 'บีบอัดไก่',
    description: 'บีบอัดไก่เพื่อแยกน้ำออก',
    workstationId: 'ws-press-01',
    isCCP: false,
    estimatedTime: 15,
    sequence: 3,
  },
  {
    id: 'op-mix',
    code: 'MIX',
    name: 'ผสมส่วนผสม',
    description: 'ผสมไก่กับส่วนผสมอื่นๆ ตามสูตร',
    workstationId: 'ws-mixer-01',
    isCCP: false,
    estimatedTime: 30,
    sequence: 4,
  },
  {
    id: 'op-pasteurize',
    code: 'PAS',
    name: 'พาสเจอร์ไรซ์',
    description: 'ฆ่าเชื้อด้วยความร้อน ≥72°C นาน 15 วินาที',
    workstationId: 'ws-pasteurizer-01',
    isCCP: true,
    ccpCriteria: {
      type: 'TEMP_TIME',
      minTemp: 72,
      holdingTime: 15,
      notes: 'รักษาอุณหภูมิ ≥72°C เป็นเวลาอย่างน้อย 15 วินาที',
    },
    estimatedTime: 20,
    sequence: 5,
  },
  {
    id: 'op-fill',
    code: 'FILL',
    name: 'บรรจุขวด',
    description: 'บรรจุลงขวด 200ml',
    workstationId: 'ws-filler-01',
    isCCP: false,
    estimatedTime: 25,
    sequence: 6,
  },
  {
    id: 'op-cool',
    code: 'COOL',
    name: 'Shock Cooling',
    description: 'ลดอุณหภูมิอย่างรวดเร็วลงสู่ 4°C',
    workstationId: 'ws-cooler-01',
    isCCP: false,
    estimatedTime: 15,
    sequence: 7,
  },
]

// =============================================================================
// Helper Functions
// =============================================================================

function getOperation(operationId: string): Operation | undefined {
  return mockOperations.find(op => op.id === operationId)
}

function getWorkstation(workstationId: string): Workstation | undefined {
  return mockWorkstations.find(ws => ws.id === workstationId)
}

// Populate operation with workstation
export const operationsWithWorkstations: Operation[] = mockOperations.map(op => ({
  ...op,
  workstation: getWorkstation(op.workstationId),
}))

// =============================================================================
// Sample Job Cards for WO-2026-0001
// =============================================================================

const jobCardsWO001: JobCard[] = [
  {
    id: 'jc-001-01',
    code: 'JC-2026-0001-01',
    workOrderId: 'wo-001',
    operationId: 'op-steam',
    operation: getOperation('op-steam'),
    status: 'COMPLETED',
    sequence: 1,
    plannedQty: 100,
    completedQty: 100,
    startTime: '2026-01-31T08:00:00',
    endTime: '2026-01-31T08:45:00',
    operator: 'สมชาย ใจดี',
    isCCP: true,
    ccpReadings: [
      {
        id: 'ccp-001-01',
        timestamp: '2026-01-31T08:40:00',
        temperature: 75.5,
        operator: 'สมชาย ใจดี',
        passed: true,
        notes: 'Core temp ตรวจจาก 3 จุด: 75°C, 76°C, 75.5°C',
      },
    ],
    ccpStatus: 'PASSED',
  },
  {
    id: 'jc-001-02',
    code: 'JC-2026-0001-02',
    workOrderId: 'wo-001',
    operationId: 'op-shred',
    operation: getOperation('op-shred'),
    status: 'COMPLETED',
    sequence: 2,
    plannedQty: 100,
    completedQty: 100,
    startTime: '2026-01-31T08:50:00',
    endTime: '2026-01-31T09:10:00',
    operator: 'สมหญิง รักเรียน',
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
  {
    id: 'jc-001-03',
    code: 'JC-2026-0001-03',
    workOrderId: 'wo-001',
    operationId: 'op-press',
    operation: getOperation('op-press'),
    status: 'COMPLETED',
    sequence: 3,
    plannedQty: 100,
    completedQty: 98,
    startTime: '2026-01-31T09:15:00',
    endTime: '2026-01-31T09:30:00',
    operator: 'สมหญิง รักเรียน',
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
  {
    id: 'jc-001-04',
    code: 'JC-2026-0001-04',
    workOrderId: 'wo-001',
    operationId: 'op-mix',
    operation: getOperation('op-mix'),
    status: 'COMPLETED',
    sequence: 4,
    plannedQty: 100,
    completedQty: 98,
    startTime: '2026-01-31T09:35:00',
    endTime: '2026-01-31T10:05:00',
    operator: 'วิชัย สุขสันต์',
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
  {
    id: 'jc-001-05',
    code: 'JC-2026-0001-05',
    workOrderId: 'wo-001',
    operationId: 'op-pasteurize',
    operation: getOperation('op-pasteurize'),
    status: 'IN_PROGRESS',
    sequence: 5,
    plannedQty: 100,
    completedQty: 0,
    startTime: '2026-01-31T10:10:00',
    operator: 'มานะ มั่งมี',
    isCCP: true,
    ccpReadings: [],
    ccpStatus: 'PENDING',
  },
  {
    id: 'jc-001-06',
    code: 'JC-2026-0001-06',
    workOrderId: 'wo-001',
    operationId: 'op-fill',
    operation: getOperation('op-fill'),
    status: 'PENDING',
    sequence: 6,
    plannedQty: 100,
    completedQty: 0,
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
  {
    id: 'jc-001-07',
    code: 'JC-2026-0001-07',
    workOrderId: 'wo-001',
    operationId: 'op-cool',
    operation: getOperation('op-cool'),
    status: 'PENDING',
    sequence: 7,
    plannedQty: 100,
    completedQty: 0,
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
]

// =============================================================================
// Sample Job Cards for WO-2026-0002 (Completed)
// =============================================================================

const jobCardsWO002: JobCard[] = [
  {
    id: 'jc-002-01',
    code: 'JC-2026-0002-01',
    workOrderId: 'wo-002',
    operationId: 'op-mix',
    operation: getOperation('op-mix'),
    status: 'COMPLETED',
    sequence: 1,
    plannedQty: 50,
    completedQty: 50,
    startTime: '2026-01-30T08:00:00',
    endTime: '2026-01-30T08:30:00',
    operator: 'สุภาพร รุ่งเรือง',
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
  {
    id: 'jc-002-02',
    code: 'JC-2026-0002-02',
    workOrderId: 'wo-002',
    operationId: 'op-pasteurize',
    operation: getOperation('op-pasteurize'),
    status: 'COMPLETED',
    sequence: 2,
    plannedQty: 50,
    completedQty: 50,
    startTime: '2026-01-30T08:35:00',
    endTime: '2026-01-30T08:55:00',
    operator: 'มานะ มั่งมี',
    isCCP: true,
    ccpReadings: [
      {
        id: 'ccp-002-01',
        timestamp: '2026-01-30T08:50:00',
        temperature: 74.0,
        holdingTime: 18,
        operator: 'มานะ มั่งมี',
        passed: true,
        notes: 'อุณหภูมิ 74°C เป็นเวลา 18 วินาที - ผ่านเกณฑ์',
      },
    ],
    ccpStatus: 'PASSED',
  },
  {
    id: 'jc-002-03',
    code: 'JC-2026-0002-03',
    workOrderId: 'wo-002',
    operationId: 'op-fill',
    operation: getOperation('op-fill'),
    status: 'COMPLETED',
    sequence: 3,
    plannedQty: 50,
    completedQty: 48,
    startTime: '2026-01-30T09:00:00',
    endTime: '2026-01-30T09:25:00',
    operator: 'สุภาพร รุ่งเรือง',
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
    remarks: 'ขวดแตก 2 ขวด',
  },
  {
    id: 'jc-002-04',
    code: 'JC-2026-0002-04',
    workOrderId: 'wo-002',
    operationId: 'op-cool',
    operation: getOperation('op-cool'),
    status: 'COMPLETED',
    sequence: 4,
    plannedQty: 50,
    completedQty: 48,
    startTime: '2026-01-30T09:30:00',
    endTime: '2026-01-30T09:45:00',
    operator: 'สุภาพร รุ่งเรือง',
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
]

// =============================================================================
// Sample Job Cards for WO-2026-0003 (Draft - no job cards started)
// =============================================================================

const jobCardsWO003: JobCard[] = [
  {
    id: 'jc-003-01',
    code: 'JC-2026-0003-01',
    workOrderId: 'wo-003',
    operationId: 'op-steam',
    operation: getOperation('op-steam'),
    status: 'PENDING',
    sequence: 1,
    plannedQty: 200,
    completedQty: 0,
    isCCP: true,
    ccpReadings: [],
    ccpStatus: 'PENDING',
  },
  {
    id: 'jc-003-02',
    code: 'JC-2026-0003-02',
    workOrderId: 'wo-003',
    operationId: 'op-shred',
    operation: getOperation('op-shred'),
    status: 'PENDING',
    sequence: 2,
    plannedQty: 200,
    completedQty: 0,
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
  {
    id: 'jc-003-03',
    code: 'JC-2026-0003-03',
    workOrderId: 'wo-003',
    operationId: 'op-press',
    operation: getOperation('op-press'),
    status: 'PENDING',
    sequence: 3,
    plannedQty: 200,
    completedQty: 0,
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
  {
    id: 'jc-003-04',
    code: 'JC-2026-0003-04',
    workOrderId: 'wo-003',
    operationId: 'op-mix',
    operation: getOperation('op-mix'),
    status: 'PENDING',
    sequence: 4,
    plannedQty: 200,
    completedQty: 0,
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
  {
    id: 'jc-003-05',
    code: 'JC-2026-0003-05',
    workOrderId: 'wo-003',
    operationId: 'op-pasteurize',
    operation: getOperation('op-pasteurize'),
    status: 'PENDING',
    sequence: 5,
    plannedQty: 200,
    completedQty: 0,
    isCCP: true,
    ccpReadings: [],
    ccpStatus: 'PENDING',
  },
  {
    id: 'jc-003-06',
    code: 'JC-2026-0003-06',
    workOrderId: 'wo-003',
    operationId: 'op-fill',
    operation: getOperation('op-fill'),
    status: 'PENDING',
    sequence: 6,
    plannedQty: 200,
    completedQty: 0,
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
  {
    id: 'jc-003-07',
    code: 'JC-2026-0003-07',
    workOrderId: 'wo-003',
    operationId: 'op-cool',
    operation: getOperation('op-cool'),
    status: 'PENDING',
    sequence: 7,
    plannedQty: 200,
    completedQty: 0,
    isCCP: false,
    ccpReadings: [],
    ccpStatus: 'NOT_REQUIRED',
  },
]

// =============================================================================
// Work Orders (3 ตัวอย่าง)
// =============================================================================

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo-001',
    code: 'WO-2026-0001',
    status: 'IN_PROGRESS',
    recipeId: 'bom-ck-blueberry',
    recipeName: 'โปรตีนไก่ บลูเบอร์รี่',
    recipeCode: 'CK_Blueberry',
    plannedQty: 100,
    completedQty: 0,
    plannedDate: '2026-01-31',
    startDate: '2026-01-31',
    batchNo: 'B2026-0131-001',
    jobCards: jobCardsWO001,
    ccpStatus: 'PENDING',
    progress: 57, // 4/7 operations completed
    createdBy: 'ผู้จัดการฝ่ายผลิต',
    createdAt: '2026-01-30T14:00:00',
    updatedAt: '2026-01-31T10:10:00',
  },
  {
    id: 'wo-002',
    code: 'WO-2026-0002',
    status: 'COMPLETED',
    recipeId: 'bom-pb-strawberry',
    recipeName: 'โปรตีนพืช สตรอว์เบอร์รี่',
    recipeCode: 'PB_Strawberry',
    plannedQty: 50,
    completedQty: 48,
    plannedDate: '2026-01-30',
    startDate: '2026-01-30',
    endDate: '2026-01-30',
    batchNo: 'B2026-0130-002',
    jobCards: jobCardsWO002,
    ccpStatus: 'PASSED',
    progress: 100,
    remarks: 'ผลิตเสร็จตามแผน ขวดแตก 2 ขวด',
    createdBy: 'ผู้จัดการฝ่ายผลิต',
    createdAt: '2026-01-29T16:00:00',
    updatedAt: '2026-01-30T09:45:00',
  },
  {
    id: 'wo-003',
    code: 'WO-2026-0003',
    status: 'DRAFT',
    recipeId: 'bom-ck-mango',
    recipeName: 'โปรตีนไก่ มะม่วง',
    recipeCode: 'CK_Mango',
    plannedQty: 200,
    completedQty: 0,
    plannedDate: '2026-02-01',
    batchNo: 'B2026-0201-001',
    jobCards: jobCardsWO003,
    ccpStatus: 'PENDING',
    progress: 0,
    createdBy: 'ผู้จัดการฝ่ายผลิต',
    createdAt: '2026-01-31T09:00:00',
    updatedAt: '2026-01-31T09:00:00',
  },
]

// =============================================================================
// Operators (สำหรับ dropdown)
// =============================================================================

export const mockOperators = [
  { id: 'op-1', name: 'สมชาย ใจดี', department: 'Chicken Prep' },
  { id: 'op-2', name: 'สมหญิง รักเรียน', department: 'Chicken Prep' },
  { id: 'op-3', name: 'วิชัย สุขสันต์', department: 'Mixing' },
  { id: 'op-4', name: 'มานะ มั่งมี', department: 'Pasteurization' },
  { id: 'op-5', name: 'สุภาพร รุ่งเรือง', department: 'Filling' },
  { id: 'op-6', name: 'ประสิทธิ์ ดีมาก', department: 'Cooling' },
]
