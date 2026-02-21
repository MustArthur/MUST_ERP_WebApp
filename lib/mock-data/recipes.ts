import { Recipe, Ingredient, UnitOfMeasure } from '@/types/recipe'

// ==========================================
// Raw Materials (from BOM.csv)
// ==========================================

export const mockRawMaterials: { code: string; name: string; uom: UnitOfMeasure; cost: number }[] = [
  // Proteins
  { code: 'RM-CHICKEN', name: 'Boiled Chicken', uom: 'G', cost: 0.15 },
  { code: 'RM-PLANT-PROTEIN', name: 'Plant Protein', uom: 'G', cost: 0.33 },

  // Amino & Supplements
  { code: 'RM-GLYCINE', name: 'Glycine', uom: 'G', cost: 0.08 },
  { code: 'RM-FIBER-CREAMER', name: 'Fiber Creamer', uom: 'G', cost: 0.16 },
  { code: 'RM-COCONUT-OIL', name: 'Coconut Oil', uom: 'G', cost: 0.07 },

  // Thickeners
  { code: 'RM-CMC', name: 'CMC', uom: 'G', cost: 0.17 },
  { code: 'RM-XANTHAN', name: 'Xanthan', uom: 'G', cost: 0.14 },
  { code: 'RM-GUAR-GUM', name: 'Guar Gum', uom: 'G', cost: 0.18 },

  // Flavors
  { code: 'RM-MIXBERRY-FLAVOR', name: 'Mix berry Flavor', uom: 'G', cost: 1.72 },
  { code: 'RM-STRAWBERRY-FLAVOR', name: 'Strawberry Flavor', uom: 'G', cost: 0.88 },
  { code: 'RM-LYCHEE-FLAVOR', name: 'Lychee Flavor', uom: 'G', cost: 0.75 },
  { code: 'RM-PASSIONFRUIT-FLAVOR', name: 'Passionfruit Flavor', uom: 'G', cost: 0.84 },
  { code: 'RM-PEACH-FLAVOR', name: 'White Peach Flavor', uom: 'G', cost: 0.85 },
  { code: 'RM-VANILLA-FLAVOR', name: 'Vanilla Flavor', uom: 'G', cost: 0.81 },
  { code: 'RM-YOGHURT-FLAVOR', name: 'Yoghurt Flavor', uom: 'G', cost: 0.90 },
  { code: 'RM-THAITEA-FLAVOR', name: 'Thai Tea Flavor', uom: 'G', cost: 1.60 },
  { code: 'RM-CHOCOLATE-FLAVOR', name: 'Chocolate Flavor', uom: 'G', cost: 1.02 },

  // Squash & Fruits
  { code: 'RM-BLUEBERRY-SQUASH', name: 'Blueberry Squash', uom: 'G', cost: 0.09 },
  { code: 'RM-PASSIONFRUIT-SQUASH', name: 'Passionfruit Squash', uom: 'G', cost: 0.09 },
  { code: 'RM-LYCHEE-SQUASH', name: 'Lychee Squash', uom: 'G', cost: 0.09 },
  { code: 'RM-STRAWBERRY-FRUIT', name: 'Strawberry Fruit', uom: 'G', cost: 0.08 },

  // Colors
  { code: 'RM-PURPLE-COLOR', name: 'Purple Color', uom: 'ML', cost: 0.22 },
  { code: 'RM-YELLOW-COLOR', name: 'Yellow Color', uom: 'ML', cost: 0.22 },
  { code: 'RM-PINK-COLOR', name: 'Pink Color', uom: 'ML', cost: 0.22 },
  { code: 'RM-RED-COLOR', name: 'Red Color', uom: 'ML', cost: 0.22 },

  // Acids
  { code: 'RM-MALIC', name: 'Malic Acid', uom: 'G', cost: 0.22 },
  { code: 'RM-CITRIC', name: 'Citric Acid', uom: 'G', cost: 0.08 },
  { code: 'RM-LACTIC', name: 'Lactic Acid', uom: 'G', cost: 0.15 },

  // Sweetener
  { code: 'RM-SUCRALOSE', name: 'Sucralose', uom: 'G', cost: 0.95 },

  // Tea & Coffee
  { code: 'RM-THAITEA-POWDER', name: 'Thai Tea Powder (Triva)', uom: 'G', cost: 2.00 },
  { code: 'RM-BLACKTEA-POWDER', name: 'Black Tea Powder', uom: 'G', cost: 1.80 },
  { code: 'RM-MATCHA-POWDER', name: 'Matcha Powder', uom: 'G', cost: 1.37 },
  { code: 'RM-CACAO-POWDER', name: 'Cacao Powder', uom: 'G', cost: 0.30 },
  { code: 'RM-COFFEE-POWDER', name: 'Coffee Powder', uom: 'G', cost: 0.68 },

  // Milk & Water
  { code: 'RM-WATER', name: 'Water', uom: 'L', cost: 8.00 },
  { code: 'RM-ALMOND-MILK', name: 'Almond Milk', uom: 'ML', cost: 0.03 },

  // Mal
  { code: 'RM-MAL', name: 'Mal', uom: 'G', cost: 0.04 },
]

// ==========================================
// Finished Goods (Products)
// ==========================================

export const mockFinishedGoods = [
  // CK Series (Chicken-based)
  { code: 'CK_Blueberry', name: 'โปรตีนไก่ บลูเบอร์รี่' },
  { code: 'CK_Mango', name: 'โปรตีนไก่ มะม่วง' },
  { code: 'CK_Lychee', name: 'โปรตีนไก่ ลิ้นจี่' },
  { code: 'CK_Peach', name: 'โปรตีนไก่ พีช' },
  { code: 'CK_Strawberry', name: 'โปรตีนไก่ สตรอว์เบอร์รี่' },
  { code: 'CK_ThaiTea', name: 'โปรตีนไก่ ชาไทย' },
  { code: 'CK_Latte', name: 'โปรตีนไก่ ลาเต้' },
  { code: 'CK_Matcha', name: 'โปรตีนไก่ มัทฉะ' },
  { code: 'CK_Cacao', name: 'โปรตีนไก่ โกโก้' },
  // PB Series (Plant-based)
  { code: 'PB_ThaiTea', name: 'โปรตีนพืช ชาไทย' },
  { code: 'PB_Acai', name: 'โปรตีนพืช อาซาอิ' },
  { code: 'PB_Cacao', name: 'โปรตีนพืช โกโก้' },
  { code: 'PB_Natural', name: 'โปรตีนพืช ธรรมชาติ' },
]

// ==========================================
// Helper function to create ingredients
// ==========================================

function createIngredients(items: [string, string, number, UnitOfMeasure, number][]): Ingredient[] {
  return items.map((item, idx) => ({
    id: `ing-${Date.now()}-${idx}`,
    lineNo: idx + 1,
    itemId: `item-${item[1]}`, // Generate itemId from code for mock data
    item: item[0],
    code: item[1],
    qty: item[2],
    uom: item[3],
    scrap: 0,
    isCritical: idx < 3, // First 3 ingredients are critical
    cost: item[4],
  }))
}

// ==========================================
// CK_Blueberry - โปรตีนไก่ บลูเบอร์รี่
// ==========================================

const ckBlueberryIngredients = createIngredients([
  ['Boiled Chicken', 'RM-CHICKEN', 4500, 'G', 0.15],
  ['Glycine', 'RM-GLYCINE', 750, 'G', 0.08],
  ['CMC', 'RM-CMC', 15, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 18, 'G', 0.14],
  ['Guar Gum', 'RM-GUAR-GUM', 15, 'G', 0.18],
  ['Mix berry Flavor', 'RM-MIXBERRY-FLAVOR', 20, 'G', 1.72],
  ['Malic Acid', 'RM-MALIC', 10, 'G', 0.22],
  ['Blueberry Squash', 'RM-BLUEBERRY-SQUASH', 300, 'G', 0.09],
  ['Yoghurt Flavor', 'RM-YOGHURT-FLAVOR', 20, 'G', 0.90],
  ['Lactic Acid', 'RM-LACTIC', 15, 'G', 0.15],
  ['Citric Acid', 'RM-CITRIC', 7, 'G', 0.08],
  ['Sucralose', 'RM-SUCRALOSE', 2.8, 'G', 0.95],
  ['Purple Color', 'RM-PURPLE-COLOR', 1.25, 'ML', 0.22],
  ['Water', 'RM-WATER', 10.5, 'L', 8.00],
])

// ==========================================
// CK_Mango - โปรตีนไก่ มะม่วง
// ==========================================

const ckMangoIngredients = createIngredients([
  ['Boiled Chicken', 'RM-CHICKEN', 4500, 'G', 0.15],
  ['Glycine', 'RM-GLYCINE', 750, 'G', 0.08],
  ['CMC', 'RM-CMC', 15, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 18, 'G', 0.14],
  ['Guar Gum', 'RM-GUAR-GUM', 15, 'G', 0.18],
  ['Malic Acid', 'RM-MALIC', 10, 'G', 0.22],
  ['Yellow Color', 'RM-YELLOW-COLOR', 3.75, 'ML', 0.22],
  ['Passionfruit Flavor', 'RM-PASSIONFRUIT-FLAVOR', 10, 'G', 0.84],
  ['Passionfruit Squash', 'RM-PASSIONFRUIT-SQUASH', 300, 'G', 0.09],
  ['Yoghurt Flavor', 'RM-YOGHURT-FLAVOR', 20, 'G', 0.90],
  ['Lactic Acid', 'RM-LACTIC', 15, 'G', 0.15],
  ['Citric Acid', 'RM-CITRIC', 7, 'G', 0.08],
  ['Sucralose', 'RM-SUCRALOSE', 2.5, 'G', 0.95],
  ['Water', 'RM-WATER', 10.5, 'L', 8.00],
])

// ==========================================
// CK_Lychee - โปรตีนไก่ ลิ้นจี่
// ==========================================

const ckLycheeIngredients = createIngredients([
  ['Boiled Chicken', 'RM-CHICKEN', 4500, 'G', 0.15],
  ['Glycine', 'RM-GLYCINE', 750, 'G', 0.08],
  ['CMC', 'RM-CMC', 15, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 18, 'G', 0.14],
  ['Guar Gum', 'RM-GUAR-GUM', 15, 'G', 0.18],
  ['Lychee Flavor', 'RM-LYCHEE-FLAVOR', 60, 'G', 0.75],
  ['Malic Acid', 'RM-MALIC', 10, 'G', 0.22],
  ['Lychee Squash', 'RM-LYCHEE-SQUASH', 300, 'G', 0.09],
  ['Pink Color', 'RM-PINK-COLOR', 1.25, 'ML', 0.22],
  ['Yoghurt Flavor', 'RM-YOGHURT-FLAVOR', 20, 'G', 0.90],
  ['Lactic Acid', 'RM-LACTIC', 15, 'G', 0.15],
  ['Citric Acid', 'RM-CITRIC', 7, 'G', 0.08],
  ['Sucralose', 'RM-SUCRALOSE', 2.5, 'G', 0.95],
  ['Water', 'RM-WATER', 10.5, 'L', 8.00],
])

// ==========================================
// CK_Peach - โปรตีนไก่ พีช
// ==========================================

const ckPeachIngredients = createIngredients([
  ['Boiled Chicken', 'RM-CHICKEN', 4500, 'G', 0.15],
  ['Glycine', 'RM-GLYCINE', 750, 'G', 0.08],
  ['CMC', 'RM-CMC', 15, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 18, 'G', 0.14],
  ['Guar Gum', 'RM-GUAR-GUM', 15, 'G', 0.18],
  ['Malic Acid', 'RM-MALIC', 5, 'G', 0.22],
  ['White Peach Flavor', 'RM-PEACH-FLAVOR', 40, 'G', 0.85],
  ['Yoghurt Flavor', 'RM-YOGHURT-FLAVOR', 20, 'G', 0.90],
  ['Lactic Acid', 'RM-LACTIC', 15, 'G', 0.15],
  ['Citric Acid', 'RM-CITRIC', 7, 'G', 0.08],
  ['Sucralose', 'RM-SUCRALOSE', 2, 'G', 0.95],
  ['Yellow Color', 'RM-YELLOW-COLOR', 2.5, 'ML', 0.22],
  ['Water', 'RM-WATER', 10.7, 'L', 8.00],
])

// ==========================================
// CK_Strawberry - โปรตีนไก่ สตรอว์เบอร์รี่
// ==========================================

const ckStrawberryIngredients = createIngredients([
  ['Boiled Chicken', 'RM-CHICKEN', 4500, 'G', 0.15],
  ['Glycine', 'RM-GLYCINE', 750, 'G', 0.08],
  ['CMC', 'RM-CMC', 10, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 18, 'G', 0.14],
  ['Guar Gum', 'RM-GUAR-GUM', 10, 'G', 0.18],
  ['Strawberry Flavor', 'RM-STRAWBERRY-FLAVOR', 45, 'G', 0.88],
  ['Strawberry Fruit', 'RM-STRAWBERRY-FRUIT', 300, 'G', 0.08],
  ['Red Color', 'RM-RED-COLOR', 1.25, 'ML', 0.22],
  ['Yoghurt Flavor', 'RM-YOGHURT-FLAVOR', 20, 'G', 0.90],
  ['Lactic Acid', 'RM-LACTIC', 15, 'G', 0.15],
  ['Citric Acid', 'RM-CITRIC', 7, 'G', 0.08],
  ['Sucralose', 'RM-SUCRALOSE', 3, 'G', 0.95],
  ['Water', 'RM-WATER', 10, 'L', 8.00],
])

// ==========================================
// CK_ThaiTea - โปรตีนไก่ ชาไทย
// ==========================================

const ckThaiTeaIngredients = createIngredients([
  ['Boiled Chicken', 'RM-CHICKEN', 4500, 'G', 0.15],
  ['Glycine', 'RM-GLYCINE', 800, 'G', 0.08],
  ['CMC', 'RM-CMC', 20, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 20, 'G', 0.14],
  ['Mal', 'RM-MAL', 8, 'G', 0.04],
  ['Thai Tea Powder (Triva)', 'RM-THAITEA-POWDER', 70, 'G', 2.00],
  ['Black Tea Powder', 'RM-BLACKTEA-POWDER', 100, 'G', 1.80],
  ['Vanilla Flavor', 'RM-VANILLA-FLAVOR', 20, 'G', 0.81],
  ['Thai Tea Flavor', 'RM-THAITEA-FLAVOR', 30, 'G', 1.60],
  ['Sucralose', 'RM-SUCRALOSE', 1.9, 'G', 0.95],
  ['Almond Milk', 'RM-ALMOND-MILK', 1000, 'ML', 0.03],
  ['Water', 'RM-WATER', 10.5, 'L', 8.00],
])

// ==========================================
// CK_Latte - โปรตีนไก่ ลาเต้
// ==========================================

const ckLatteIngredients = createIngredients([
  ['Boiled Chicken', 'RM-CHICKEN', 4500, 'G', 0.15],
  ['Glycine', 'RM-GLYCINE', 800, 'G', 0.08],
  ['CMC', 'RM-CMC', 20, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 20, 'G', 0.14],
  ['Mal', 'RM-MAL', 8, 'G', 0.04],
  ['Coffee Powder', 'RM-COFFEE-POWDER', 130, 'G', 0.68],
  ['Sucralose', 'RM-SUCRALOSE', 1.3, 'G', 0.95],
  ['Almond Milk', 'RM-ALMOND-MILK', 1250, 'ML', 0.03],
  ['Water', 'RM-WATER', 10.5, 'L', 8.00],
])

// ==========================================
// CK_Matcha - โปรตีนไก่ มัทฉะ
// ==========================================

const ckMatchaIngredients = createIngredients([
  ['Boiled Chicken', 'RM-CHICKEN', 4500, 'G', 0.15],
  ['Glycine', 'RM-GLYCINE', 800, 'G', 0.08],
  ['CMC', 'RM-CMC', 20, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 20, 'G', 0.14],
  ['Mal', 'RM-MAL', 8, 'G', 0.04],
  ['Matcha Powder', 'RM-MATCHA-POWDER', 190, 'G', 1.37],
  ['Sucralose', 'RM-SUCRALOSE', 1.3, 'G', 0.95],
  ['Almond Milk', 'RM-ALMOND-MILK', 1000, 'ML', 0.03],
  ['Water', 'RM-WATER', 10.5, 'L', 8.00],
])

// ==========================================
// CK_Cacao - โปรตีนไก่ โกโก้
// ==========================================

const ckCacaoIngredients = createIngredients([
  ['Boiled Chicken', 'RM-CHICKEN', 4500, 'G', 0.15],
  ['Glycine', 'RM-GLYCINE', 800, 'G', 0.08],
  ['CMC', 'RM-CMC', 20, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 20, 'G', 0.14],
  ['Cacao Powder', 'RM-CACAO-POWDER', 300, 'G', 0.30],
  ['Chocolate Flavor', 'RM-CHOCOLATE-FLAVOR', 30, 'G', 1.02],
  ['Vanilla Flavor', 'RM-VANILLA-FLAVOR', 10, 'G', 0.81],
  ['Sucralose', 'RM-SUCRALOSE', 1.2, 'G', 0.95],
  ['Almond Milk', 'RM-ALMOND-MILK', 1000, 'ML', 0.03],
  ['Water', 'RM-WATER', 10.5, 'L', 8.00],
])

// ==========================================
// PB_ThaiTea - โปรตีนพืช ชาไทย
// ==========================================

const pbThaiTeaIngredients = createIngredients([
  ['Plant Protein', 'RM-PLANT-PROTEIN', 1300, 'G', 0.33],
  ['Glycine', 'RM-GLYCINE', 500, 'G', 0.08],
  ['Fiber Creamer', 'RM-FIBER-CREAMER', 100, 'G', 0.16],
  ['Coconut Oil', 'RM-COCONUT-OIL', 200, 'G', 0.07],
  ['CMC', 'RM-CMC', 5, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 12, 'G', 0.14],
  ['Vanilla Flavor', 'RM-VANILLA-FLAVOR', 15, 'G', 0.81],
  ['Sucralose', 'RM-SUCRALOSE', 0.8, 'G', 0.95],
  ['Thai Tea Powder (Triva)', 'RM-THAITEA-POWDER', 100, 'G', 2.00],
  ['Black Tea Powder', 'RM-BLACKTEA-POWDER', 40, 'G', 1.80],
  ['Thai Tea Flavor', 'RM-THAITEA-FLAVOR', 30, 'G', 1.60],
  ['Water', 'RM-WATER', 13.5, 'L', 8.00],
])

// ==========================================
// PB_Acai - โปรตีนพืช อาซาอิ
// ==========================================

const pbAcaiIngredients = createIngredients([
  ['Plant Protein', 'RM-PLANT-PROTEIN', 1300, 'G', 0.33],
  ['Glycine', 'RM-GLYCINE', 500, 'G', 0.08],
  ['Fiber Creamer', 'RM-FIBER-CREAMER', 100, 'G', 0.16],
  ['Coconut Oil', 'RM-COCONUT-OIL', 200, 'G', 0.07],
  ['CMC', 'RM-CMC', 15, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 15, 'G', 0.14],
  ['Strawberry Flavor', 'RM-STRAWBERRY-FLAVOR', 50, 'G', 0.88],
  ['Pink Color', 'RM-PINK-COLOR', 5, 'ML', 0.22],
  ['Blueberry Squash', 'RM-BLUEBERRY-SQUASH', 760, 'ML', 0.09],
  ['Water', 'RM-WATER', 13.5, 'L', 8.00],
  ['Malic Acid', 'RM-MALIC', 10, 'G', 0.22],
  ['Citric Acid', 'RM-CITRIC', 10, 'G', 0.08],
])

// ==========================================
// PB_Cacao - โปรตีนพืช โกโก้
// ==========================================

const pbCacaoIngredients = createIngredients([
  ['Plant Protein', 'RM-PLANT-PROTEIN', 1300, 'G', 0.33],
  ['Glycine', 'RM-GLYCINE', 500, 'G', 0.08],
  ['Fiber Creamer', 'RM-FIBER-CREAMER', 100, 'G', 0.16],
  ['Coconut Oil', 'RM-COCONUT-OIL', 200, 'G', 0.07],
  ['CMC', 'RM-CMC', 5, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 12, 'G', 0.14],
  ['Vanilla Flavor', 'RM-VANILLA-FLAVOR', 15, 'G', 0.81],
  ['Sucralose', 'RM-SUCRALOSE', 0.8, 'G', 0.95],
  ['Cacao Powder', 'RM-CACAO-POWDER', 400, 'G', 0.30],
  ['Chocolate Flavor', 'RM-CHOCOLATE-FLAVOR', 30, 'G', 1.02],
  ['Water', 'RM-WATER', 13.5, 'L', 8.00],
])

// ==========================================
// PB_Natural - โปรตีนพืช ธรรมชาติ
// ==========================================

const pbNaturalIngredients = createIngredients([
  ['Plant Protein', 'RM-PLANT-PROTEIN', 1300, 'G', 0.33],
  ['Glycine', 'RM-GLYCINE', 500, 'G', 0.08],
  ['Fiber Creamer', 'RM-FIBER-CREAMER', 100, 'G', 0.16],
  ['Coconut Oil', 'RM-COCONUT-OIL', 200, 'G', 0.07],
  ['CMC', 'RM-CMC', 5, 'G', 0.17],
  ['Xanthan', 'RM-XANTHAN', 12, 'G', 0.14],
  ['Vanilla Flavor', 'RM-VANILLA-FLAVOR', 15, 'G', 0.81],
  ['Water', 'RM-WATER', 13.5, 'L', 8.00],
])

// ==========================================
// Mock Recipes (13 products from BOM.csv)
// ==========================================

export const mockRecipes: Recipe[] = [
  // CK Series (Chicken-based, 30 units/batch)
  {
    id: 'bom-ck-blueberry',
    code: 'BOM-CK_Blueberry-003',
    name: 'โปรตีนไก่ บลูเบอร์รี่',
    outputItem: 'Chicken Protein Blueberry',
    outputItemCode: 'CK_Blueberry',
    outputQty: 30,
    outputUom: 'BTL',
    batchSize: 30,
    expectedYield: 95,
    version: 3,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 180,
    ingredients: ckBlueberryIngredients,
    instructions: `1. ต้มและปั่นอกไก่กับน้ำ
2. เติม Glycine และสารเพิ่มความหนืด (CMC, Xanthan, Guar Gum)
3. เติมกลิ่น Mix berry และ Yoghurt
4. เติม Blueberry Squash
5. ปรับความเปรี้ยวด้วย Malic, Lactic, Citric Acid
6. เติม Sucralose และสี Purple
7. พาสเจอร์ไรซ์และบรรจุ`,
    createdAt: '2025-06-15',
    updatedAt: '2026-01-15',
  },
  {
    id: 'bom-ck-mango',
    code: 'BOM-CK_Mango-002',
    name: 'โปรตีนไก่ มะม่วง',
    outputItem: 'Chicken Protein Mango',
    outputItemCode: 'CK_Mango',
    outputQty: 30,
    outputUom: 'BTL',
    batchSize: 30,
    expectedYield: 95,
    version: 2,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 180,
    ingredients: ckMangoIngredients,
    instructions: 'เหมือนสูตร Blueberry แต่ใช้กลิ่น Passionfruit และ Squash แทน',
    createdAt: '2025-08-20',
    updatedAt: '2026-01-10',
  },
  {
    id: 'bom-ck-lychee',
    code: 'BOM-CK_Lychee-002',
    name: 'โปรตีนไก่ ลิ้นจี่',
    outputItem: 'Chicken Protein Lychee',
    outputItemCode: 'CK_Lychee',
    outputQty: 30,
    outputUom: 'BTL',
    batchSize: 30,
    expectedYield: 95,
    version: 2,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 180,
    ingredients: ckLycheeIngredients,
    instructions: 'เหมือนสูตร Blueberry แต่ใช้กลิ่น Lychee และ Squash แทน',
    createdAt: '2025-08-20',
    updatedAt: '2026-01-10',
  },
  {
    id: 'bom-ck-peach',
    code: 'BOM-CK_Peach-002',
    name: 'โปรตีนไก่ พีช',
    outputItem: 'Chicken Protein Peach',
    outputItemCode: 'CK_Peach',
    outputQty: 30,
    outputUom: 'BTL',
    batchSize: 30,
    expectedYield: 95,
    version: 2,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 180,
    ingredients: ckPeachIngredients,
    instructions: 'ใช้กลิ่น White Peach และสี Yellow',
    createdAt: '2025-08-20',
    updatedAt: '2026-01-10',
  },
  {
    id: 'bom-ck-strawberry',
    code: 'BOM-CK_Strawberry-003',
    name: 'โปรตีนไก่ สตรอว์เบอร์รี่',
    outputItem: 'Chicken Protein Strawberry',
    outputItemCode: 'CK_Strawberry',
    outputQty: 30,
    outputUom: 'BTL',
    batchSize: 30,
    expectedYield: 95,
    version: 3,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 180,
    ingredients: ckStrawberryIngredients,
    instructions: 'ใช้กลิ่น Strawberry และ Strawberry Fruit',
    createdAt: '2025-06-15',
    updatedAt: '2026-01-15',
  },
  {
    id: 'bom-ck-thaitea',
    code: 'BOM-CK_ThaiTea-001',
    name: 'โปรตีนไก่ ชาไทย',
    outputItem: 'Chicken Protein Thai Tea',
    outputItemCode: 'CK_ThaiTea',
    outputQty: 30,
    outputUom: 'BTL',
    batchSize: 30,
    expectedYield: 95,
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 200,
    ingredients: ckThaiTeaIngredients,
    instructions: 'ใช้ Thai Tea Powder + Black Tea + Almond Milk',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'bom-ck-latte',
    code: 'BOM-CK_Latte-001',
    name: 'โปรตีนไก่ ลาเต้',
    outputItem: 'Chicken Protein Latte',
    outputItemCode: 'CK_Latte',
    outputQty: 30,
    outputUom: 'BTL',
    batchSize: 30,
    expectedYield: 95,
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 200,
    ingredients: ckLatteIngredients,
    instructions: 'ใช้ Coffee Powder + Almond Milk',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'bom-ck-matcha',
    code: 'BOM-CK_Matcha-001',
    name: 'โปรตีนไก่ มัทฉะ',
    outputItem: 'Chicken Protein Matcha',
    outputItemCode: 'CK_Matcha',
    outputQty: 30,
    outputUom: 'BTL',
    batchSize: 30,
    expectedYield: 95,
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 200,
    ingredients: ckMatchaIngredients,
    instructions: 'ใช้ Matcha Powder + Almond Milk',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'bom-ck-cacao',
    code: 'BOM-CK_Cacao-001',
    name: 'โปรตีนไก่ โกโก้',
    outputItem: 'Chicken Protein Cacao',
    outputItemCode: 'CK_Cacao',
    outputQty: 30,
    outputUom: 'BTL',
    batchSize: 30,
    expectedYield: 95,
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 200,
    ingredients: ckCacaoIngredients,
    instructions: 'ใช้ Cacao Powder + Chocolate Flavor + Almond Milk',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },

  // PB Series (Plant-based, 42 units/batch)
  {
    id: 'bom-pb-thaitea',
    code: 'BOM-PB_ThaiTea-001',
    name: 'โปรตีนพืช ชาไทย',
    outputItem: 'Plant Protein Thai Tea',
    outputItemCode: 'PB_ThaiTea',
    outputQty: 42,
    outputUom: 'BTL',
    batchSize: 42,
    expectedYield: 95,
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 180,
    ingredients: pbThaiTeaIngredients,
    instructions: 'ใช้ Plant Protein แทน Chicken + Thai Tea Powder',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'bom-pb-acai',
    code: 'BOM-PB_Acai-001',
    name: 'โปรตีนพืช อาซาอิ',
    outputItem: 'Plant Protein Acai',
    outputItemCode: 'PB_Acai',
    outputQty: 42,
    outputUom: 'BTL',
    batchSize: 42,
    expectedYield: 95,
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 180,
    ingredients: pbAcaiIngredients,
    instructions: 'ใช้ Plant Protein + Blueberry Squash + Strawberry Flavor',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'bom-pb-cacao',
    code: 'BOM-PB_Cacao-001',
    name: 'โปรตีนพืช โกโก้',
    outputItem: 'Plant Protein Cacao',
    outputItemCode: 'PB_Cacao',
    outputQty: 42,
    outputUom: 'BTL',
    batchSize: 42,
    expectedYield: 95,
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 180,
    ingredients: pbCacaoIngredients,
    instructions: 'ใช้ Plant Protein + Cacao Powder',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'bom-pb-natural',
    code: 'BOM-PB_Natural-001',
    name: 'โปรตีนพืช ธรรมชาติ',
    outputItem: 'Plant Protein Natural',
    outputItemCode: 'PB_Natural',
    outputQty: 42,
    outputUom: 'BTL',
    batchSize: 42,
    expectedYield: 95,
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: null,
    estimatedTime: 160,
    ingredients: pbNaturalIngredients,
    instructions: 'สูตรพื้นฐาน ใช้ Plant Protein + Vanilla Flavor เท่านั้น',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
]
