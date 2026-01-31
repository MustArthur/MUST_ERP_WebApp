# MUST ERP - Database Schema Documentation
## Manufacturing Module for Process Manufacturing (Food & Beverage)

---

## Overview

Schema นี้ออกแบบมาสำหรับ **Process Manufacturing** โดยเฉพาะ **โรงงานเครื่องดื่มโปรตีน**
รองรับ:
- ✅ Lot/Batch Traceability
- ✅ Expiry Date Management (FEFO)
- ✅ Recipe/BOM with Yield %
- ✅ Real-time Inventory Control
- ✅ Production Recording

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MASTER DATA                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐             │
│   │   suppliers  │      │    items     │──────│  categories  │             │
│   └──────┬───────┘      └──────┬───────┘      └──────────────┘             │
│          │                     │                                            │
│          │              ┌──────┴───────┐                                    │
│          │              │              │                                    │
│   ┌──────▼───────┐     ▼              ▼      ┌──────────────┐             │
│   │  purchases   │  ┌──────┐    ┌──────────┐ │    units     │             │
│   └──────────────┘  │ lots │    │ recipes  │ └──────────────┘             │
│                     └──┬───┘    └────┬─────┘                               │
└────────────────────────┼─────────────┼──────────────────────────────────────┘
                         │             │
┌────────────────────────┼─────────────┼──────────────────────────────────────┐
│                   INVENTORY          │                                       │
├────────────────────────┼─────────────┼──────────────────────────────────────┤
│                        │             │                                       │
│   ┌──────────────┐     │             │     ┌──────────────┐                 │
│   │  warehouses  │     │             │     │  recipe_     │                 │
│   └──────┬───────┘     │             └────▶│  lines       │                 │
│          │             │                   └──────────────┘                 │
│          ▼             │                                                    │
│   ┌──────────────┐     │                                                    │
│   │  locations   │     │                                                    │
│   └──────┬───────┘     │                                                    │
│          │             │                                                    │
│          ▼             ▼                                                    │
│   ┌──────────────────────────┐                                             │
│   │     stock_on_hand        │◀─────────────────────┐                      │
│   └──────────────────────────┘                      │                      │
│          │                                          │                      │
│          ▼                                          │                      │
│   ┌──────────────────────────┐              ┌───────┴──────┐               │
│   │  inventory_transactions  │◀─────────────│  production  │               │
│   └──────────────────────────┘              │   _orders    │               │
│                                             └──────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tables Detail

### 1. Master Data

#### 1.1 `categories` - หมวดหมู่สินค้า

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| code | VARCHAR(20) | รหัสหมวดหมู่ (RM, PKG, FG) |
| name | VARCHAR(100) | ชื่อหมวดหมู่ |
| type | ENUM | ประเภท: RAW_MATERIAL, PACKAGING, FINISHED_GOOD, SEMI_FINISHED |
| description | TEXT | รายละเอียด |

**ตัวอย่างข้อมูล:**
```
RM-MEAT    | วัตถุดิบ - เนื้อสัตว์     | RAW_MATERIAL
RM-PROTEIN | วัตถุดิบ - โปรตีน        | RAW_MATERIAL
PKG-BOTTLE | บรรจุภัณฑ์ - ขวด        | PACKAGING
FG-DRINK   | สินค้าสำเร็จรูป - เครื่องดื่ม | FINISHED_GOOD
```

---

#### 1.2 `units_of_measure` - หน่วยวัด

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| code | VARCHAR(10) | รหัสหน่วย (KG, L, PC, BTL) |
| name | VARCHAR(50) | ชื่อหน่วย |
| type | ENUM | ประเภท: WEIGHT, VOLUME, PIECE, LENGTH |

**ตัวอย่างข้อมูล:**
```
KG  | กิโลกรัม  | WEIGHT
G   | กรัม     | WEIGHT
L   | ลิตร     | VOLUME
ML  | มิลลิลิตร | VOLUME
BTL | ขวด      | PIECE
```

---

#### 1.3 `uom_conversions` - การแปลงหน่วย

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| from_uom_id | UUID | FK → units_of_measure |
| to_uom_id | UUID | FK → units_of_measure |
| conversion_factor | DECIMAL(18,6) | ตัวคูณแปลงหน่วย |

**ตัวอย่าง:** 1 KG = 1000 G → conversion_factor = 1000

---

#### 1.4 `items` - รายการสินค้า/วัตถุดิบ

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| code | VARCHAR(50) | รหัสสินค้า (UNIQUE) |
| name | VARCHAR(200) | ชื่อสินค้า |
| category_id | UUID | FK → categories |
| base_uom_id | UUID | FK → units_of_measure (หน่วยหลัก) |
| purchase_uom_id | UUID | FK → units_of_measure (หน่วยสั่งซื้อ) |
| track_lot | BOOLEAN | ต้องติดตาม Lot หรือไม่ |
| track_expiry | BOOLEAN | ต้องติดตามวันหมดอายุหรือไม่ |
| shelf_life_days | INTEGER | อายุสินค้า (วัน) |
| min_stock_qty | DECIMAL | จำนวนสต็อกต่ำสุด |
| reorder_qty | DECIMAL | จำนวนสั่งซื้อเติม |
| cost_price | DECIMAL(18,4) | ราคาต้นทุน |
| is_active | BOOLEAN | สถานะใช้งาน |
| created_at | TIMESTAMP | วันที่สร้าง |
| updated_at | TIMESTAMP | วันที่แก้ไขล่าสุด |

**สำคัญสำหรับ Food Manufacturing:**
- `track_lot = TRUE` สำหรับวัตถุดิบทั้งหมด → Traceability
- `track_expiry = TRUE` สำหรับสินค้าที่มีอายุ
- `shelf_life_days` ช่วยคำนวณ Expiry Date อัตโนมัติ

---

#### 1.5 `suppliers` - ผู้จำหน่าย

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| code | VARCHAR(20) | รหัสผู้จำหน่าย |
| name | VARCHAR(200) | ชื่อผู้จำหน่าย |
| contact_name | VARCHAR(100) | ชื่อผู้ติดต่อ |
| phone | VARCHAR(20) | เบอร์โทร |
| email | VARCHAR(100) | อีเมล |
| address | TEXT | ที่อยู่ |
| tax_id | VARCHAR(20) | เลขประจำตัวผู้เสียภาษี |
| is_active | BOOLEAN | สถานะใช้งาน |

---

### 2. Warehouse & Location

#### 2.1 `warehouses` - คลังสินค้า

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| code | VARCHAR(20) | รหัสคลัง |
| name | VARCHAR(100) | ชื่อคลัง |
| type | ENUM | ประเภท: NORMAL, COLD_STORAGE, QUARANTINE, PRODUCTION |
| temperature_min | DECIMAL | อุณหภูมิต่ำสุด (°C) |
| temperature_max | DECIMAL | อุณหภูมิสูงสุด (°C) |
| is_active | BOOLEAN | สถานะใช้งาน |

**ตัวอย่างคลังสำหรับโรงงานเครื่องดื่ม:**
```
WH-RM   | คลังวัตถุดิบ      | NORMAL
WH-COLD | ห้องเย็น         | COLD_STORAGE (0-5°C)
WH-PROD | คลังระหว่างผลิต   | PRODUCTION
WH-FG   | คลังสินค้าสำเร็จรูป | NORMAL
WH-QC   | คลังกักกัน        | QUARANTINE
```

---

#### 2.2 `locations` - ตำแหน่งจัดเก็บ

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| warehouse_id | UUID | FK → warehouses |
| code | VARCHAR(20) | รหัสตำแหน่ง |
| name | VARCHAR(100) | ชื่อตำแหน่ง |
| zone | VARCHAR(20) | โซน (A, B, C) |
| rack | VARCHAR(10) | ชั้นวาง |
| level | VARCHAR(10) | ระดับ |
| is_active | BOOLEAN | สถานะใช้งาน |

---

### 3. Recipe / BOM (สูตรการผลิต)

#### 3.1 `recipes` - สูตรการผลิต

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| code | VARCHAR(50) | รหัสสูตร |
| name | VARCHAR(200) | ชื่อสูตร |
| output_item_id | UUID | FK → items (สินค้าที่ผลิตได้) |
| output_qty | DECIMAL(18,4) | จำนวนที่ผลิตได้ต่อ Batch |
| output_uom_id | UUID | FK → units_of_measure |
| standard_batch_size | DECIMAL | ขนาด Batch มาตรฐาน |
| expected_yield_percent | DECIMAL(5,2) | % Yield ที่คาดหวัง |
| version | INTEGER | เวอร์ชันปัจจุบัน |
| status | ENUM | สถานะ: DRAFT, ACTIVE, OBSOLETE |
| valid_from | DATE | ใช้ได้ตั้งแต่วันที่ |
| valid_to | DATE | ใช้ได้ถึงวันที่ |
| notes | TEXT | หมายเหตุ/วิธีทำ |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

#### 3.2 `recipe_lines` - ส่วนประกอบของสูตร

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| recipe_id | UUID | FK → recipes |
| line_no | INTEGER | ลำดับ |
| item_id | UUID | FK → items (วัตถุดิบ) |
| qty_per_batch | DECIMAL(18,6) | จำนวนต่อ Batch |
| uom_id | UUID | FK → units_of_measure |
| scrap_percent | DECIMAL(5,2) | % ของเสียที่คาดหวัง |
| is_critical | BOOLEAN | เป็นส่วนประกอบหลักหรือไม่ |
| substitute_item_id | UUID | FK → items (วัตถุดิบทดแทน) |
| notes | TEXT | หมายเหตุ |

**ตัวอย่างสูตรเครื่องดื่มโปรตีน (1 Batch = 100 ขวด):**
```
Line 1: อกไก่สด         - 20 KG   (หลัก)
Line 2: น้ำบริสุทธิ์      - 50 L
Line 3: Whey Protein    - 5 KG    (หลัก)
Line 4: สารให้ความหวาน   - 0.5 KG
Line 5: สารกันบูด       - 0.1 KG
Line 6: ขวด PET 350ml   - 100 PC
Line 7: ฝาขวด          - 100 PC
Line 8: ฉลาก           - 100 PC
```

---

### 4. Inventory (คลังสินค้า)

#### 4.1 `lots` - Lot/Batch สินค้า

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| lot_number | VARCHAR(50) | เลข Lot (UNIQUE) |
| item_id | UUID | FK → items |
| supplier_id | UUID | FK → suppliers (ถ้ามี) |
| production_order_id | UUID | FK → production_orders (ถ้าผลิตเอง) |
| manufactured_date | DATE | วันที่ผลิต |
| expiry_date | DATE | วันหมดอายุ |
| received_date | DATE | วันที่รับเข้า |
| initial_qty | DECIMAL | จำนวนเริ่มต้น |
| uom_id | UUID | FK → units_of_measure |
| cost_per_unit | DECIMAL(18,4) | ต้นทุนต่อหน่วย |
| status | ENUM | สถานะ: AVAILABLE, QUARANTINE, HOLD, EXPIRED, CONSUMED |
| quality_status | ENUM | QC: PENDING, PASSED, FAILED |
| notes | TEXT | หมายเหตุ |
| created_at | TIMESTAMP | |

**การตั้งเลข Lot:**
- วัตถุดิบ: `SUP-YYYYMMDD-XXX` (เช่น SUP-20260129-001)
- สินค้าผลิต: `PRD-YYYYMMDD-XXX` (เช่น PRD-20260129-001)

---

#### 4.2 `stock_on_hand` - สต็อกปัจจุบัน

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| item_id | UUID | FK → items |
| warehouse_id | UUID | FK → warehouses |
| location_id | UUID | FK → locations |
| lot_id | UUID | FK → lots (nullable ถ้าไม่ track lot) |
| qty_on_hand | DECIMAL(18,4) | จำนวนคงเหลือ |
| qty_reserved | DECIMAL(18,4) | จำนวนจอง (สำหรับ Production Order) |
| qty_available | DECIMAL(18,4) | จำนวนพร้อมใช้ (on_hand - reserved) |
| uom_id | UUID | FK → units_of_measure |
| last_updated | TIMESTAMP | |

**Unique Constraint:** (item_id, warehouse_id, location_id, lot_id)

---

#### 4.3 `inventory_transactions` - การเคลื่อนไหวสินค้า

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| transaction_no | VARCHAR(50) | เลขที่รายการ |
| transaction_type | ENUM | ประเภท (ดูด้านล่าง) |
| transaction_date | TIMESTAMP | วันที่ทำรายการ |
| item_id | UUID | FK → items |
| lot_id | UUID | FK → lots |
| from_warehouse_id | UUID | FK → warehouses |
| from_location_id | UUID | FK → locations |
| to_warehouse_id | UUID | FK → warehouses |
| to_location_id | UUID | FK → locations |
| qty | DECIMAL(18,4) | จำนวน |
| uom_id | UUID | FK → units_of_measure |
| unit_cost | DECIMAL(18,4) | ต้นทุนต่อหน่วย |
| total_cost | DECIMAL(18,4) | ต้นทุนรวม |
| reference_type | VARCHAR(50) | ประเภทเอกสารอ้างอิง |
| reference_id | UUID | ID เอกสารอ้างอิง |
| notes | TEXT | หมายเหตุ |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |

**Transaction Types:**
```
RECEIVE        - รับเข้าจากซัพพลายเออร์
ISSUE          - เบิกออก
TRANSFER       - โอนย้าย
ADJUST_IN      - ปรับเพิ่ม
ADJUST_OUT     - ปรับลด
PRODUCTION_IN  - รับจากการผลิต
PRODUCTION_OUT - เบิกไปผลิต
SCRAP          - ของเสีย
RETURN         - คืนของ
```

---

### 5. Production (การผลิต)

#### 5.1 `production_orders` - ใบสั่งผลิต

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| order_no | VARCHAR(50) | เลขที่ใบสั่งผลิต |
| recipe_id | UUID | FK → recipes |
| output_item_id | UUID | FK → items |
| planned_qty | DECIMAL(18,4) | จำนวนที่วางแผนผลิต |
| actual_qty | DECIMAL(18,4) | จำนวนที่ผลิตได้จริง |
| uom_id | UUID | FK → units_of_measure |
| batch_count | INTEGER | จำนวน Batch |
| planned_start | TIMESTAMP | วันเริ่มผลิตที่วางแผน |
| planned_end | TIMESTAMP | วันสิ้นสุดที่วางแผน |
| actual_start | TIMESTAMP | วันเริ่มผลิตจริง |
| actual_end | TIMESTAMP | วันสิ้นสุดจริง |
| status | ENUM | สถานะ (ดูด้านล่าง) |
| priority | ENUM | ความสำคัญ: LOW, NORMAL, HIGH, URGENT |
| production_warehouse_id | UUID | FK → warehouses (คลังผลิต) |
| output_warehouse_id | UUID | FK → warehouses (คลังรับของ) |
| notes | TEXT | หมายเหตุ |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Production Order Status:**
```
DRAFT      - ร่าง
PLANNED    - วางแผนแล้ว
CONFIRMED  - ยืนยัน
IN_PROGRESS - กำลังผลิต
COMPLETED  - เสร็จสิ้น
CANCELLED  - ยกเลิก
```

---

#### 5.2 `production_consumptions` - วัตถุดิบที่ใช้ในการผลิต

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| production_order_id | UUID | FK → production_orders |
| recipe_line_id | UUID | FK → recipe_lines |
| item_id | UUID | FK → items |
| lot_id | UUID | FK → lots |
| planned_qty | DECIMAL(18,4) | จำนวนที่วางแผน |
| actual_qty | DECIMAL(18,4) | จำนวนที่ใช้จริง |
| uom_id | UUID | FK → units_of_measure |
| warehouse_id | UUID | FK → warehouses |
| location_id | UUID | FK → locations |
| issued_at | TIMESTAMP | วันที่เบิก |
| issued_by | UUID | FK → users |

**สำคัญ:** ตาราง consumptions จะเก็บ Lot ของวัตถุดิบที่ใช้ → **Full Traceability**

---

#### 5.3 `production_outputs` - ผลผลิตจากการผลิต

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| production_order_id | UUID | FK → production_orders |
| item_id | UUID | FK → items |
| lot_id | UUID | FK → lots (Lot ใหม่ที่สร้าง) |
| qty | DECIMAL(18,4) | จำนวนที่ผลิตได้ |
| uom_id | UUID | FK → units_of_measure |
| quality_status | ENUM | QC: PENDING, PASSED, FAILED |
| warehouse_id | UUID | FK → warehouses |
| location_id | UUID | FK → locations |
| produced_at | TIMESTAMP | วันที่บันทึกผลผลิต |
| produced_by | UUID | FK → users |
| notes | TEXT | หมายเหตุ |

---

#### 5.4 `production_scrap` - ของเสียจากการผลิต

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| production_order_id | UUID | FK → production_orders |
| item_id | UUID | FK → items |
| qty | DECIMAL(18,4) | จำนวนของเสีย |
| uom_id | UUID | FK → units_of_measure |
| scrap_reason | ENUM | สาเหตุ: DEFECT, EXPIRED, CONTAMINATION, MACHINE_ERROR, OTHER |
| description | TEXT | รายละเอียด |
| recorded_at | TIMESTAMP | |
| recorded_by | UUID | FK → users |

---

### 6. System Tables

#### 6.1 `users` - ผู้ใช้งาน

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| username | VARCHAR(50) | ชื่อผู้ใช้ |
| email | VARCHAR(100) | อีเมล |
| password_hash | VARCHAR(255) | รหัสผ่าน (hashed) |
| full_name | VARCHAR(100) | ชื่อ-นามสกุล |
| role | ENUM | บทบาท: ADMIN, MANAGER, OPERATOR, VIEWER |
| department | VARCHAR(50) | แผนก |
| is_active | BOOLEAN | สถานะใช้งาน |
| last_login | TIMESTAMP | เข้าสู่ระบบล่าสุด |
| created_at | TIMESTAMP | |

---

#### 6.2 `audit_logs` - บันทึกการเปลี่ยนแปลง

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| table_name | VARCHAR(50) | ชื่อตาราง |
| record_id | UUID | ID ของ record |
| action | ENUM | การกระทำ: INSERT, UPDATE, DELETE |
| old_values | JSONB | ค่าเดิม |
| new_values | JSONB | ค่าใหม่ |
| user_id | UUID | FK → users |
| timestamp | TIMESTAMP | |
| ip_address | VARCHAR(50) | IP Address |

---

## Key Relationships

### Traceability Chain (การสอบกลับ)

```
Supplier (ผู้จำหน่าย)
    ↓
Lot (วัตถุดิบ) ← tracked by lot_number
    ↓
Production Order (ใบสั่งผลิต)
    ↓
Production Consumption ← บันทึก lot ที่ใช้
    ↓
Production Output
    ↓
Lot (สินค้าสำเร็จรูป) ← lot ใหม่ที่สร้าง
    ↓
Customer (ลูกค้า)
```

**เมื่อมีปัญหาคุณภาพ:**
1. หา Lot สินค้าที่มีปัญหา
2. ดู Production Order จาก `lots.production_order_id`
3. ดู Lot วัตถุดิบที่ใช้จาก `production_consumptions`
4. ดู Supplier จาก `lots.supplier_id`

---

## Indexes Recommendations

```sql
-- Items
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_code ON items(code);

-- Lots
CREATE INDEX idx_lots_item ON lots(item_id);
CREATE INDEX idx_lots_expiry ON lots(expiry_date);
CREATE INDEX idx_lots_number ON lots(lot_number);

-- Stock
CREATE INDEX idx_stock_item_warehouse ON stock_on_hand(item_id, warehouse_id);
CREATE INDEX idx_stock_lot ON stock_on_hand(lot_id);

-- Transactions
CREATE INDEX idx_inv_trans_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_inv_trans_item ON inventory_transactions(item_id);
CREATE INDEX idx_inv_trans_type ON inventory_transactions(transaction_type);

-- Production
CREATE INDEX idx_prod_order_status ON production_orders(status);
CREATE INDEX idx_prod_order_date ON production_orders(planned_start);
```

---

## Next Steps

1. **Review Schema** - ตรวจสอบว่าครอบคลุม workflow ของโรงงานหรือไม่
2. **Create SQL Script** - สร้างไฟล์ SQL สำหรับ PostgreSQL
3. **Add Sample Data** - ข้อมูลตัวอย่างสำหรับทดสอบ
4. **Design API** - ออกแบบ API Endpoints
5. **Build UI** - สร้างหน้าจอการใช้งาน
