// ==========================================
// Supabase Database Types
// Generated from schema
// ==========================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            recipes: {
                Row: {
                    id: string
                    code: string
                    name: string
                    description: string | null
                    output_item_id: string
                    output_qty: number
                    output_uom_id: string
                    standard_batch_size: number | null
                    min_batch_size: number | null
                    max_batch_size: number | null
                    expected_yield_percent: number
                    version: number
                    status: 'DRAFT' | 'ACTIVE' | 'OBSOLETE'
                    valid_from: string | null
                    valid_to: string | null
                    estimated_duration_minutes: number | null
                    instructions: string | null
                    notes: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['recipes']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['recipes']['Insert']>
            }
            recipe_lines: {
                Row: {
                    id: string
                    recipe_id: string
                    line_no: number
                    item_id: string
                    qty_per_batch: number
                    uom_id: string
                    scrap_percent: number
                    is_critical: boolean
                    is_optional: boolean
                    substitute_item_id: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['recipe_lines']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['recipe_lines']['Insert']>
            }
            items: {
                Row: {
                    id: string
                    code: string
                    name: string
                    description: string | null
                    category_id: string
                    base_uom_id: string
                    purchase_uom_id: string | null
                    track_lot: boolean
                    track_expiry: boolean
                    shelf_life_days: number | null
                    min_stock_qty: number
                    max_stock_qty: number | null
                    reorder_qty: number | null
                    reorder_point: number | null
                    cost_method: string
                    standard_cost: number | null
                    last_purchase_cost: number | null
                    barcode: string | null
                    sku: string | null
                    brand: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['items']['Insert']>
            }
            warehouses: {
                Row: {
                    id: string
                    code: string
                    name: string
                    type: 'NORMAL' | 'COLD_STORAGE' | 'QUARANTINE' | 'PRODUCTION' | 'SHIPPING'
                    address: string | null
                    temperature_min: number | null
                    temperature_max: number | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['warehouses']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['warehouses']['Insert']>
            }
            stock_on_hand: {
                Row: {
                    id: string
                    item_id: string
                    warehouse_id: string
                    location_id: string | null
                    lot_id: string | null
                    qty_on_hand: number
                    qty_reserved: number
                    qty_available: number
                    uom_id: string
                    last_count_date: string | null
                    last_movement_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['stock_on_hand']['Row'], 'id' | 'created_at' | 'updated_at' | 'qty_available'>
                Update: Partial<Database['public']['Tables']['stock_on_hand']['Insert']>
            }
            lots: {
                Row: {
                    id: string
                    lot_number: string
                    item_id: string
                    supplier_id: string | null
                    production_order_id: string | null
                    purchase_order_id: string | null
                    manufactured_date: string | null
                    expiry_date: string | null
                    received_date: string
                    initial_qty: number
                    uom_id: string
                    cost_per_unit: number | null
                    status: 'AVAILABLE' | 'QUARANTINE' | 'HOLD' | 'EXPIRED' | 'CONSUMED'
                    quality_status: 'PENDING' | 'PASSED' | 'FAILED'
                    supplier_lot_number: string | null
                    certificate_of_analysis: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['lots']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['lots']['Insert']>
            }
            categories: {
                Row: {
                    id: string
                    code: string
                    name: string
                    type: 'RAW_MATERIAL' | 'PACKAGING' | 'SEMI_FINISHED' | 'FINISHED_GOOD'
                    description: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['categories']['Insert']>
            }
            units_of_measure: {
                Row: {
                    id: string
                    code: string
                    name: string
                    type: 'WEIGHT' | 'VOLUME' | 'PIECE' | 'LENGTH' | 'TIME'
                    is_active: boolean
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['units_of_measure']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['units_of_measure']['Insert']>
            }
            suppliers: {
                Row: {
                    id: string
                    code: string
                    name: string
                    contact_name: string | null
                    phone: string | null
                    email: string | null
                    address: string | null
                    tax_id: string | null
                    payment_terms: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['suppliers']['Insert']>
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            item_category_type: 'RAW_MATERIAL' | 'PACKAGING' | 'SEMI_FINISHED' | 'FINISHED_GOOD'
            lot_status: 'AVAILABLE' | 'QUARANTINE' | 'HOLD' | 'EXPIRED' | 'CONSUMED'
            quality_status: 'PENDING' | 'PASSED' | 'FAILED'
            recipe_status: 'DRAFT' | 'ACTIVE' | 'OBSOLETE'
            uom_type: 'WEIGHT' | 'VOLUME' | 'PIECE' | 'LENGTH' | 'TIME'
            warehouse_type: 'NORMAL' | 'COLD_STORAGE' | 'QUARANTINE' | 'PRODUCTION' | 'SHIPPING'
        }
    }
}
