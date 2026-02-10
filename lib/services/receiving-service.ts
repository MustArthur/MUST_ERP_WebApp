import { createClient } from '@/lib/supabase/client'
import {
    PurchaseReceipt,
    PurchaseReceiptItem,
    CreatePurchaseReceiptInput,
    UpdatePurchaseReceiptInput,
    ReceiptStatus,
    QCStatusSummary,
    ItemQCStatus
} from '@/types/receiving'
import { generateId } from '@/lib/utils'

export class ReceivingService {
    private static supabase = createClient()

    // Cache for UOMs to avoid repeated lookups
    private static uomCache: Record<string, string> = {}

    private static async getUomId(code: string): Promise<string> {
        if (this.uomCache[code]) return this.uomCache[code]

        // Check if code is already a UUID (in case we passed ID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (uuidRegex.test(code)) return code

        const { data, error } = await this.supabase
            .from('units_of_measure')
            .select('id')
            .eq('code', code)
            .single()

        if (error || !data) {
            // Fallback or error? For now, throw
            throw new Error(`UOM code ${code} not found in database`)
        }

        this.uomCache[code] = data.id
        return data.id
    }

    // ==========================================
    // Fetch Methods
    // ==========================================

    static async getReceipts(): Promise<PurchaseReceipt[]> {
        const { data: receipts, error } = await this.supabase
            .from('purchase_receipts')
            .select(`
        *,
        supplier:suppliers(*),
        items:purchase_receipt_items(
          *,
          uom:units_of_measure(*)
        )
      `)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Map DB response to PurchaseReceipt type
        return receipts.map(this.mapReceiptFromDB)
    }

    static async getReceiptById(id: string): Promise<PurchaseReceipt | null> {
        const { data, error } = await this.supabase
            .from('purchase_receipts')
            .select(`
        *,
        supplier:suppliers(*),
        items:purchase_receipt_items(
          *,
          uom:units_of_measure(*)
        )
      `)
            .eq('id', id)
            .single()

        if (error) return null

        return this.mapReceiptFromDB(data)
    }

    // ==========================================
    // Mutation Methods
    // ==========================================

    static async createReceipt(input: CreatePurchaseReceiptInput): Promise<PurchaseReceipt> {
        // 1. Create Receipt Header
        const { data: receipt, error: receiptError } = await this.supabase
            .from('purchase_receipts')
            .insert({
                code: await this.generateReceiptCode(),
                supplier_id: input.supplierId,
                receipt_date: input.receiptDate,
                po_number: input.poNumber || null,
                invoice_number: input.invoiceNumber || null,
                remarks: input.remarks || null,
                status: 'DRAFT',
                qc_status: 'NOT_REQUIRED',
                total_amount: 0 // Will Calculate later
            })
            .select()
            .single()

        if (receiptError) throw receiptError

        // 2. Prepare Items
        // We need to resolve UOM IDs first
        const itemsData = []
        for (let i = 0; i < input.items.length; i++) {
            const item = input.items[i]
            // Resolve UOM ID
            let uomId: string
            try {
                uomId = await this.getUomId(item.uom)
            } catch (e) {
                console.error(e)
                await this.supabase.from('purchase_receipts').delete().eq('id', receipt.id)
                throw e
            }

            itemsData.push({
                receipt_id: receipt.id,
                line_no: i + 1,
                item_id: item.itemId,
                qty_received: item.qtyReceived,
                uom_id: uomId,
                batch_no: item.batchNo || null,
                mfg_date: item.mfgDate || null,
                exp_date: item.expDate || null,
                unit_price: item.unitPrice,
                total_price: item.qtyReceived * item.unitPrice,
                warehouse_id: item.warehouseId,
                remarks: item.remarks || null,
                qc_status: 'NOT_REQUIRED'
            })
        }

        const { data: items, error: itemsError } = await this.supabase
            .from('purchase_receipt_items')
            .insert(itemsData)
            .select()

        if (itemsError) {
            // Cleanup receipt if items fail
            await this.supabase.from('purchase_receipts').delete().eq('id', receipt.id)
            throw itemsError
        }

        // Recalculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0)
        await this.supabase
            .from('purchase_receipts')
            .update({ total_amount: totalAmount })
            .eq('id', receipt.id)

        // Return complete object
        const result = await this.getReceiptById(receipt.id)
        if (!result) throw new Error('Failed to retrieve created receipt')
        return result
    }

    static async updateReceipt(id: string, input: UpdatePurchaseReceiptInput): Promise<PurchaseReceipt> {
        // Update Header
        const updateData: any = {
            updated_at: new Date().toISOString()
        }
        if (input.supplierId) updateData.supplier_id = input.supplierId
        if (input.receiptDate) updateData.receipt_date = input.receiptDate
        if (input.poNumber !== undefined) updateData.po_number = input.poNumber
        if (input.invoiceNumber !== undefined) updateData.invoice_number = input.invoiceNumber
        if (input.remarks !== undefined) updateData.remarks = input.remarks

        const { error: headerError } = await this.supabase
            .from('purchase_receipts')
            .update(updateData)
            .eq('id', id)

        if (headerError) throw headerError

        return this.getReceiptById(id) as Promise<PurchaseReceipt>
    }

    static async updateStatus(id: string, status: ReceiptStatus, qcStatus?: QCStatusSummary): Promise<void> {
        const updateData: any = { status, updated_at: new Date().toISOString() }
        if (qcStatus) updateData.qc_status = qcStatus

        const { error } = await this.supabase
            .from('purchase_receipts')
            .update(updateData)
            .eq('id', id)

        if (error) throw error
    }

    static async updateReceiptItemQC(receiptId: string, itemId: string, status: ItemQCStatus, qcInspectionId?: string): Promise<void> {
        const updateData: any = { qc_status: status, updated_at: new Date().toISOString() }
        if (qcInspectionId) updateData.qc_inspection_id = qcInspectionId

        const { error } = await this.supabase
            .from('purchase_receipt_items')
            .update(updateData)
            .eq('id', itemId)
            .eq('receipt_id', receiptId)

        if (error) throw error

        // Recalculate Header QC Status
        const receipt = await this.getReceiptById(receiptId)
        if (!receipt) return

        const items = receipt.items
        const pendingCount = items.filter(i => i.qcStatus === 'PENDING').length
        const passedCount = items.filter(i => i.qcStatus === 'PASSED' || i.qcStatus === 'NOT_REQUIRED').length
        const failedCount = items.filter(i => i.qcStatus === 'FAILED').length

        let newQCStatus: QCStatusSummary = receipt.qcStatus
        if (pendingCount === 0) {
            if (failedCount === 0) {
                newQCStatus = 'PASSED'
            } else if (passedCount === 0) {
                newQCStatus = 'FAILED'
            } else {
                newQCStatus = 'PARTIAL'
            }
        } else {
            newQCStatus = 'PENDING'
        }

        // Update Header Status if changed or if completed
        let newStatus = receipt.status
        if (pendingCount === 0 && receipt.status === 'PENDING_QC') {
            newStatus = 'COMPLETED'
        }

        if (newQCStatus !== receipt.qcStatus || newStatus !== receipt.status) {
            await this.updateStatus(receiptId, newStatus, newQCStatus)
        }
    }

    static async deleteReceipt(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('purchase_receipts')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    private static mapReceiptFromDB(data: any): PurchaseReceipt {
        return {
            id: data.id,
            code: data.code,
            status: data.status,
            supplierId: data.supplier_id,
            supplier: data.supplier ? {
                id: data.supplier.id,
                code: data.supplier.code,
                name: data.supplier.name,
                status: data.supplier.is_active ? 'ACTIVE' : 'INACTIVE',
                createdAt: data.supplier.created_at,
                updatedAt: data.supplier.updated_at
            } : undefined,
            receiptDate: data.receipt_date,
            poNumber: data.po_number,
            invoiceNumber: data.invoice_number,
            items: (data.items || []).map((item: any) => ({
                id: item.id,
                lineNo: item.line_no,
                itemId: item.item_id,
                qtyReceived: item.qty_received,
                qtyAccepted: item.qty_accepted,
                qtyRejected: item.qty_rejected,
                // Map UOM object back to string code to match types
                uom: item.uom?.code as any,
                batchNo: item.batch_no,
                mfgDate: item.mfg_date,
                expDate: item.exp_date,
                unitPrice: item.unit_price,
                totalPrice: item.total_price,
                warehouseId: item.warehouse_id,
                qcStatus: item.qc_status,
                remarks: item.remarks
            })),
            qcStatus: data.qc_status,
            totalAmount: data.total_amount,
            remarks: data.remarks,
            receivedBy: data.received_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        }
    }

    private static async generateReceiptCode(): Promise<string> {
        const year = new Date().getFullYear()
        const { count, error } = await this.supabase
            .from('purchase_receipts')
            .select('*', { count: 'exact', head: true })

        if (error) throw error

        const nextNum = (count || 0) + 1
        return `PR-${year}-${nextNum.toString().padStart(4, '0')}`
    }
}
