// ==========================================
// Inventory Types (Phase 1)
// ==========================================

// Warehouse Types
export type WarehouseType = 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS'

export type WarehouseStatus = 'ACTIVE' | 'INACTIVE'

export interface Warehouse {
  id: string
  code: string                    // e.g., "RM-COLD-ROOM"
  name: string                    // e.g., "ห้องเย็นวัตถุดิบ"
  type: WarehouseType
  status: WarehouseStatus
  isQuarantine: boolean           // Quarantine warehouse flag
  isDefault: boolean              // Default warehouse for type
  temperatureControlled: boolean  // Cold storage
  minTemp?: number                // Min temperature (°C)
  maxTemp?: number                // Max temperature (°C)
  location?: string               // Physical location
  capacity?: number               // Max capacity (units)
  currentStock?: number           // Current stock level
  createdAt: string
  updatedAt: string
}

// Item Types
export type ItemType = 'RAW_MATERIAL' | 'SEMI_FINISHED' | 'FINISHED_GOOD' | 'PACKAGING'

export type UnitOfMeasure = 'KG' | 'G' | 'L' | 'ML' | 'PC' | 'BTL' | 'PKG' | 'BOX'

export interface StockItem {
  id: string
  code: string                    // e.g., "RM-CHICKEN-001"
  name: string                    // e.g., "อกไก่สด"
  type: ItemType
  uom: UnitOfMeasure
  defaultWarehouseId: string      // Default warehouse
  hasBatch: boolean               // Track batch numbers
  hasExpiry: boolean              // Track expiry dates
  shelfLifeDays?: number          // Shelf life in days
  minStock?: number               // Minimum stock level
  maxStock?: number               // Maximum stock level
  reorderPoint?: number           // Reorder point
  requiresQC: boolean             // Requires QC before use
  qcTemplateId?: string           // QC template reference
  costPerUnit: number             // Cost per unit (THB)
  createdAt: string
  updatedAt: string
}

// Stock Balance (per warehouse)
export interface StockBalance {
  id: string
  itemId: string
  item?: StockItem
  warehouseId: string
  warehouse?: Warehouse
  batchNo?: string                // Batch number
  qty: number                     // Current quantity
  uom: UnitOfMeasure
  mfgDate?: string                // Manufacturing date
  expDate?: string                // Expiry date
  status: 'AVAILABLE' | 'RESERVED' | 'ON_HOLD' | 'QUARANTINE'
  lastUpdated: string
}

// Stock Entry Types
export type StockEntryType =
  | 'RECEIVE'                     // Purchase Receipt
  | 'ISSUE'                       // Issue for production
  | 'TRANSFER'                    // Warehouse transfer
  | 'MANUFACTURE'                 // Production output
  | 'ADJUSTMENT'                  // Stock adjustment
  | 'RETURN'                      // Return to supplier
  | 'SCRAP'                       // Scrap/disposal

export type StockEntryStatus = 'DRAFT' | 'SUBMITTED' | 'CANCELLED'

export interface StockEntryItem {
  id: string
  lineNo: number
  itemId: string
  item?: StockItem
  qty: number
  uom: UnitOfMeasure
  batchNo?: string
  fromWarehouseId?: string        // Source warehouse (for transfer/issue)
  toWarehouseId?: string          // Target warehouse (for receive/transfer)
  fromWarehouse?: Warehouse
  toWarehouse?: Warehouse
  mfgDate?: string
  expDate?: string
  unitCost?: number
  totalCost?: number
}

export interface StockEntry {
  id: string
  code: string                    // e.g., "SE-2026-0001"
  type: StockEntryType
  status: StockEntryStatus
  postingDate: string
  postingTime: string
  sourceDocType?: string          // e.g., "Purchase Receipt", "Work Order"
  sourceDocId?: string
  items: StockEntryItem[]
  remarks?: string
  qcInspectionId?: string         // Link to QC inspection
  isQCRequired: boolean
  isQCPassed?: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ==========================================
// Input Types (for forms)
// ==========================================

export interface CreateWarehouseInput {
  code: string
  name: string
  type: WarehouseType
  isQuarantine?: boolean
  isDefault?: boolean
  temperatureControlled?: boolean
  minTemp?: number
  maxTemp?: number
  location?: string
  capacity?: number
}

export interface CreateStockItemInput {
  code: string
  name: string
  type: ItemType
  uom: UnitOfMeasure
  defaultWarehouseId: string
  hasBatch?: boolean
  hasExpiry?: boolean
  shelfLifeDays?: number
  minStock?: number
  maxStock?: number
  reorderPoint?: number
  requiresQC?: boolean
  qcTemplateId?: string
  costPerUnit: number
}

export interface CreateStockEntryInput {
  type: StockEntryType
  postingDate: string
  items: {
    itemId: string
    qty: number
    uom: UnitOfMeasure
    batchNo?: string
    fromWarehouseId?: string
    toWarehouseId?: string
    mfgDate?: string
    expDate?: string
    unitCost?: number
  }[]
  sourceDocType?: string
  sourceDocId?: string
  remarks?: string
}

// ==========================================
// Filter Types
// ==========================================

export interface InventoryFilterState {
  search: string
  warehouseId: string | 'all'
  itemType: ItemType | 'all'
  status: 'all' | 'low_stock' | 'expiring'
}

export interface StockEntryFilterState {
  search: string
  type: StockEntryType | 'all'
  status: StockEntryStatus | 'all'
  dateFrom?: string
  dateTo?: string
}

// ==========================================
// Computed Types
// ==========================================

export interface StockItemWithBalance extends StockItem {
  totalQty: number                // Total across all warehouses
  balances: StockBalance[]        // Per-warehouse balances
  isLowStock: boolean             // Below min stock
  isExpiringSoon: boolean         // Expiring within 7 days
}

export interface WarehouseWithStock extends Warehouse {
  stockCount: number              // Number of items
  totalValue: number              // Total stock value (THB)
  lowStockItems: number           // Items below min
  expiringItems: number           // Items expiring soon
}
