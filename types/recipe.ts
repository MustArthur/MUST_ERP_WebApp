// ==========================================
// Recipe Types
// ==========================================

export type RecipeStatus = 'DRAFT' | 'ACTIVE' | 'OBSOLETE'

export type UnitOfMeasure = 'KG' | 'G' | 'L' | 'ML' | 'PC' | 'BTL' | 'PKG'

export interface Ingredient {
  id: string
  lineNo: number
  item: string          // ชื่อวัตถุดิบ
  code: string          // รหัสวัตถุดิบ (RM-CHICKEN-001)
  qty: number           // ปริมาณ
  uom: UnitOfMeasure    // หน่วยวัด
  scrap: number         // % ของเสีย
  isCritical: boolean   // วัตถุดิบหลัก
  cost: number          // ต้นทุนต่อหน่วย (บาท)
}

export interface Recipe {
  id: string
  code: string                  // RCP-PRO-001
  name: string                  // สูตรเครื่องดื่มโปรตีนไก่ Original
  outputItem: string            // ชื่อสินค้าที่ผลิตได้
  outputItemCode: string        // FG-PRO-001
  outputQty: number             // จำนวนผลผลิต
  outputUom: UnitOfMeasure      // หน่วยผลผลิต
  batchSize: number             // ขนาด Batch
  expectedYield: number         // Yield ที่คาดหวัง (%)
  version: number               // Version
  status: RecipeStatus          // สถานะ
  validFrom: string             // วันที่เริ่มใช้
  validTo: string | null        // วันที่หมดอายุ
  estimatedTime: number         // เวลาผลิตโดยประมาณ (นาที)
  ingredients: Ingredient[]     // รายการส่วนประกอบ
  instructions: string          // ขั้นตอนการผลิต
  createdAt: string
  updatedAt: string
}

// ==========================================
// Input Types (for forms)
// ==========================================

export interface CreateIngredientInput {
  item: string
  code: string
  qty: number
  uom: UnitOfMeasure
  scrap: number
  isCritical: boolean
  cost: number
}

export interface CreateRecipeInput {
  code: string
  name: string
  outputItem: string
  outputItemCode: string
  outputQty: number
  outputUom: UnitOfMeasure
  batchSize: number
  expectedYield: number
  estimatedTime: number
  ingredients: CreateIngredientInput[]
  instructions: string
  status?: RecipeStatus
}

export type UpdateRecipeInput = Partial<CreateRecipeInput>

// ==========================================
// Filter Types
// ==========================================

export interface RecipeFilterState {
  search: string
  status: RecipeStatus | 'all'
}

// ==========================================
// Computed Types
// ==========================================

export interface IngredientWithCost extends Ingredient {
  qtyWithScrap: number    // ปริมาณรวมของเสีย
  totalCost: number       // ต้นทุนรวม
}

export interface RecipeWithCost extends Recipe {
  totalMaterialCost: number   // ต้นทุนวัตถุดิบรวม
  costPerUnit: number         // ต้นทุนต่อหน่วย
}
