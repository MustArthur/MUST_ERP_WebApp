import { createClient } from '@/lib/supabase/client'
import {
    QCTemplate,
    QCInspection,
    QuarantineRecord,
    QCParameter,
    InspectionReading,
    CreateQCTemplateInput,
    CreateQCInspectionInput,
    InspectionStatus,
    InspectionType,
    TemplateType,
    TemplateStatus,
    QuarantineStatus,
    QuarantineAction,
    QuarantineReason,
} from '@/types/quality'

export interface CreateInspectionForReceiptInput {
    receiptId: string
    receiptCode: string
    itemId: string
    itemName?: string
    itemCode?: string
    batchNo?: string
    lotNo?: string
    qty: number
    warehouseId?: string
}

export class QCService {
    private static supabase = createClient()

    // ==========================================
    // Template Methods
    // ==========================================

    static async getTemplates(): Promise<QCTemplate[]> {
        const { data, error } = await this.supabase
            .from('qc_templates')
            .select(`
                *,
                parameters:qc_template_parameters(*)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map((item) => this.mapTemplateFromDB(item))
    }

    static async getTemplateById(id: string): Promise<QCTemplate | null> {
        const { data, error } = await this.supabase
            .from('qc_templates')
            .select(`
                *,
                parameters:qc_template_parameters(*)
            `)
            .eq('id', id)
            .single()

        if (error) return null

        return this.mapTemplateFromDB(data)
    }

    static async getTemplateByCode(code: string): Promise<QCTemplate | null> {
        const { data, error } = await this.supabase
            .from('qc_templates')
            .select(`
                *,
                parameters:qc_template_parameters(*)
            `)
            .eq('code', code)
            .single()

        if (error) return null

        return this.mapTemplateFromDB(data)
    }

    static async getDefaultTemplateForItem(itemId: string): Promise<QCTemplate | null> {
        // 1. Check if item has a specific template linked
        const { data: itemTemplate } = await this.supabase
            .from('item_qc_templates')
            .select('template_id')
            .eq('item_id', itemId)
            .eq('is_default', true)
            .single()

        if (itemTemplate?.template_id) {
            return this.getTemplateById(itemTemplate.template_id)
        }

        // 2. Fallback to default RAW_MATERIAL template
        const { data } = await this.supabase
            .from('qc_templates')
            .select(`
                *,
                parameters:qc_template_parameters(*)
            `)
            .eq('type', 'RAW_MATERIAL')
            .eq('status', 'ACTIVE')
            .eq('code', 'QIT-RAW-DEFAULT')
            .single()

        if (data) return this.mapTemplateFromDB(data)

        // 3. Any active RAW_MATERIAL template
        const { data: fallback } = await this.supabase
            .from('qc_templates')
            .select(`
                *,
                parameters:qc_template_parameters(*)
            `)
            .eq('type', 'RAW_MATERIAL')
            .eq('status', 'ACTIVE')
            .limit(1)
            .single()

        return fallback ? this.mapTemplateFromDB(fallback) : null
    }

    static async createTemplate(input: CreateQCTemplateInput): Promise<QCTemplate> {
        // 1. Create template
        const { data: template, error: templateError } = await this.supabase
            .from('qc_templates')
            .insert({
                code: input.code,
                name: input.name,
                type: input.type,
                status: 'ACTIVE',
                version: 1,
                description: input.description || null,
                applies_to: input.appliesTo
            })
            .select()
            .single()

        if (templateError) throw templateError

        // 2. Create parameters
        if (input.parameters && input.parameters.length > 0) {
            const paramsData = input.parameters.map((p, idx) => ({
                template_id: template.id,
                line_no: idx + 1,
                name: p.name,
                name_en: p.nameEn || null,
                type: p.type,
                min_value: p.minValue || null,
                max_value: p.maxValue || null,
                uom: p.uom || null,
                acceptable_values: p.acceptableValues || null,
                is_critical: p.isCritical,
                description: p.description || null
            }))

            const { error: paramsError } = await this.supabase
                .from('qc_template_parameters')
                .insert(paramsData)

            if (paramsError) {
                // Cleanup template
                await this.supabase.from('qc_templates').delete().eq('id', template.id)
                throw paramsError
            }
        }

        const result = await this.getTemplateById(template.id)
        if (!result) throw new Error('Failed to retrieve created template')
        return result
    }

    static async updateTemplate(id: string, input: Partial<CreateQCTemplateInput>): Promise<QCTemplate> {
        const existing = await this.getTemplateById(id)
        if (!existing) throw new Error('Template not found')

        // Update template
        const updateData: any = { updated_at: new Date().toISOString() }
        if (input.code) updateData.code = input.code
        if (input.name) updateData.name = input.name
        if (input.type) updateData.type = input.type
        if (input.description !== undefined) updateData.description = input.description
        if (input.appliesTo) updateData.applies_to = input.appliesTo

        // Increment version if parameters changed
        if (input.parameters) {
            updateData.version = existing.version + 1
        }

        const { error: updateError } = await this.supabase
            .from('qc_templates')
            .update(updateData)
            .eq('id', id)

        if (updateError) throw updateError

        // Update parameters if provided
        if (input.parameters) {
            // Delete existing
            await this.supabase
                .from('qc_template_parameters')
                .delete()
                .eq('template_id', id)

            // Insert new
            const paramsData = input.parameters.map((p, idx) => ({
                template_id: id,
                line_no: idx + 1,
                name: p.name,
                name_en: p.nameEn || null,
                type: p.type,
                min_value: p.minValue || null,
                max_value: p.maxValue || null,
                uom: p.uom || null,
                acceptable_values: p.acceptableValues || null,
                is_critical: p.isCritical,
                description: p.description || null
            }))

            await this.supabase
                .from('qc_template_parameters')
                .insert(paramsData)
        }

        return this.getTemplateById(id) as Promise<QCTemplate>
    }

    // ==========================================
    // Inspection Methods
    // ==========================================

    static async getInspections(): Promise<QCInspection[]> {
        console.log('=== QCService.getInspections() called ===')

        const { data, error } = await this.supabase
            .from('qc_inspections')
            .select(`
                *,
                template:qc_templates(*),
                item:items(id, code, name),
                readings:qc_inspection_readings(
                    *,
                    parameter:qc_template_parameters(*)
                )
            `)
            .order('created_at', { ascending: false })

        console.log('Supabase response - data:', data)
        console.log('Supabase response - error:', error)
        console.log('Number of inspections:', data?.length || 0)

        if (error) {
            console.error('Supabase error in getInspections:', error)
            throw error
        }

        const mapped = (data || []).map((item) => this.mapInspectionFromDB(item))
        console.log('Mapped inspections:', mapped)

        return mapped
    }

    static async getInspectionById(id: string): Promise<QCInspection | null> {
        const { data, error } = await this.supabase
            .from('qc_inspections')
            .select(`
                *,
                template:qc_templates(
                    *,
                    parameters:qc_template_parameters(*)
                ),
                item:items(id, code, name),
                readings:qc_inspection_readings(
                    *,
                    parameter:qc_template_parameters(*)
                )
            `)
            .eq('id', id)
            .single()

        if (error) return null

        return this.mapInspectionFromDB(data)
    }

    static async getInspectionsBySource(sourceDocType: string, sourceDocId: string): Promise<QCInspection[]> {
        const { data, error } = await this.supabase
            .from('qc_inspections')
            .select(`
                *,
                template:qc_templates(*),
                item:items(id, code, name),
                readings:qc_inspection_readings(*)
            `)
            .eq('source_doc_type', sourceDocType)
            .eq('source_doc_id', sourceDocId)

        if (error) throw error

        return (data || []).map((item) => this.mapInspectionFromDB(item))
    }

    static async createInspection(input: CreateQCInspectionInput): Promise<QCInspection> {
        const template = input.templateId ? await this.getTemplateById(input.templateId) : null

        // Generate code
        const code = await this.generateInspectionCode()

        // Determine initial status
        const hasReadings = input.readings && input.readings.length > 0
        const status: InspectionStatus = hasReadings ? 'IN_PROGRESS' : 'DRAFT'

        const { data: inspection, error: inspError } = await this.supabase
            .from('qc_inspections')
            .insert({
                code,
                type: input.type,
                status,
                template_id: input.templateId || null,
                source_doc_type: input.sourceDocType,
                source_doc_id: input.sourceDocId,
                item_id: input.itemId,
                batch_no: input.batchNo || null,
                lot_no: input.lotNo || null,
                sample_qty: input.sampleQty,
                inspected_qty: 0,
                accepted_qty: 0,
                rejected_qty: 0,
                inspection_date: new Date().toISOString().split('T')[0],
                inspection_time: new Date().toTimeString().slice(0, 8),
                inspected_by: 'ระบบ',
                is_ccp: template?.parameters.some(p => p.isCritical) || false
            })
            .select()
            .single()

        if (inspError) throw inspError

        // Create readings if provided
        if (input.readings && input.readings.length > 0) {
            const readingsData = input.readings.map(r => {
                const param = template?.parameters.find(p => p.id === r.parameterId)
                let readingStatus = 'PENDING'

                if (param) {
                    if (param.type === 'NUMERIC' && r.numericValue !== undefined) {
                        const minOk = param.minValue === undefined || r.numericValue >= param.minValue
                        const maxOk = param.maxValue === undefined || r.numericValue <= param.maxValue
                        readingStatus = minOk && maxOk ? 'PASS' : 'FAIL'
                    } else if (param.type === 'ACCEPTANCE' && r.acceptanceValue) {
                        readingStatus = param.acceptableValues?.includes(r.acceptanceValue) ? 'PASS' : 'FAIL'
                    }
                }

                return {
                    inspection_id: inspection.id,
                    parameter_id: r.parameterId,
                    numeric_value: r.numericValue || null,
                    acceptance_value: r.acceptanceValue || null,
                    status: readingStatus,
                    remarks: r.remarks || null
                }
            })

            await this.supabase.from('qc_inspection_readings').insert(readingsData)

            // Update inspection status based on readings
            const hasFail = readingsData.some(r => r.status === 'FAIL')
            const allPass = readingsData.every(r => r.status === 'PASS')

            await this.supabase
                .from('qc_inspections')
                .update({
                    status: hasFail ? 'FAILED' : allPass ? 'PASSED' : 'IN_PROGRESS',
                    result: hasFail ? 'REJECTED' : allPass ? 'ACCEPTED' : null,
                    inspected_qty: input.sampleQty,
                    accepted_qty: hasFail ? 0 : input.sampleQty,
                    rejected_qty: hasFail ? input.sampleQty : 0
                })
                .eq('id', inspection.id)
        }

        const result = await this.getInspectionById(inspection.id)
        if (!result) throw new Error('Failed to retrieve created inspection')
        return result
    }

    static async createInspectionForReceipt(input: CreateInspectionForReceiptInput): Promise<QCInspection> {
        // Get default template for item
        const template = await this.getDefaultTemplateForItem(input.itemId)

        // Generate code
        const code = await this.generateInspectionCode()

        const { data: inspection, error: inspError } = await this.supabase
            .from('qc_inspections')
            .insert({
                code,
                type: 'INCOMING' as InspectionType,
                status: 'DRAFT' as InspectionStatus,
                template_id: template?.id || null,
                source_doc_type: 'PURCHASE_RECEIPT',
                source_doc_id: input.receiptId,
                source_doc_code: input.receiptCode,
                item_id: input.itemId,
                batch_no: input.batchNo || null,
                lot_no: input.lotNo || null,
                sample_qty: input.qty,
                inspected_qty: 0,
                accepted_qty: 0,
                rejected_qty: 0,
                inspection_date: new Date().toISOString().split('T')[0],
                inspection_time: new Date().toTimeString().slice(0, 8),
                inspected_by: null, // Will be filled when inspection is done
                is_ccp: template?.parameters.some(p => p.isCritical) || false
            })
            .select()
            .single()

        if (inspError) throw inspError

        // Pre-create empty readings for template parameters
        if (template && template.parameters.length > 0) {
            const readingsData = template.parameters.map(p => ({
                inspection_id: inspection.id,
                parameter_id: p.id,
                parameter_name: p.name,
                numeric_value: null,
                acceptance_value: null,
                status: 'PENDING',
                remarks: null
            }))

            await this.supabase.from('qc_inspection_readings').insert(readingsData)
        }

        const result = await this.getInspectionById(inspection.id)
        if (!result) throw new Error('Failed to retrieve created inspection')
        return result
    }

    static async updateInspectionStatus(
        id: string,
        status: InspectionStatus,
        remarks?: string
    ): Promise<QCInspection> {
        const updateData: any = {
            status,
            updated_at: new Date().toISOString()
        }

        if (remarks) updateData.result_remarks = remarks

        // Set result based on status
        if (status === 'PASSED') {
            updateData.result = 'ACCEPTED'
        } else if (status === 'FAILED') {
            updateData.result = 'REJECTED'
        }

        const { error } = await this.supabase
            .from('qc_inspections')
            .update(updateData)
            .eq('id', id)

        if (error) throw error

        return this.getInspectionById(id) as Promise<QCInspection>
    }

    static async updateInspectionReadings(
        inspectionId: string,
        readings: { parameterId: string; numericValue?: number; acceptanceValue?: string; remarks?: string }[],
        quantities?: {
            acceptedQty: number
            rejectedQty: number
            quarantineAction?: QuarantineAction
        }
    ): Promise<QCInspection> {
        const inspection = await this.getInspectionById(inspectionId)
        if (!inspection) throw new Error('Inspection not found')

        for (const reading of readings) {
            const param = inspection.template?.parameters.find(p => p.id === reading.parameterId)
            let readingStatus = 'PENDING'

            if (param) {
                if (param.type === 'NUMERIC' && reading.numericValue !== undefined) {
                    const minOk = param.minValue === undefined || reading.numericValue >= param.minValue
                    const maxOk = param.maxValue === undefined || reading.numericValue <= param.maxValue
                    readingStatus = minOk && maxOk ? 'PASS' : 'FAIL'
                } else if (param.type === 'ACCEPTANCE' && reading.acceptanceValue) {
                    readingStatus = param.acceptableValues?.includes(reading.acceptanceValue) ? 'PASS' : 'FAIL'
                }
            }

            await this.supabase
                .from('qc_inspection_readings')
                .update({
                    numeric_value: reading.numericValue || null,
                    acceptance_value: reading.acceptanceValue || null,
                    status: readingStatus,
                    remarks: reading.remarks || null
                })
                .eq('inspection_id', inspectionId)
                .eq('parameter_id', reading.parameterId)
        }

        // Recalculate inspection status
        const updatedInspection = await this.getInspectionById(inspectionId)
        if (updatedInspection) {
            const readingsStatuses = updatedInspection.readings.map(r => r.status)
            const hasFail = readingsStatuses.some(s => s === 'FAIL')
            const allPass = readingsStatuses.every(s => s === 'PASS')
            const hasPending = readingsStatuses.some(s => s === 'PENDING')

            // Determine quantities (use provided or calculate from readings)
            let acceptedQty = inspection.sampleQty
            let rejectedQty = 0

            if (quantities) {
                // Use provided quantities (partial pass scenario)
                acceptedQty = quantities.acceptedQty
                rejectedQty = quantities.rejectedQty
            } else if (hasFail && !hasPending) {
                // All-or-nothing: if any fail, reject all
                acceptedQty = 0
                rejectedQty = inspection.sampleQty
            }

            // Determine status and result
            let newStatus: InspectionStatus = 'IN_PROGRESS'
            let result: 'ACCEPTED' | 'REJECTED' | 'CONDITIONAL' | null = null

            if (!hasPending) {
                if (allPass) {
                    newStatus = 'PASSED'
                    result = 'ACCEPTED'
                } else if (acceptedQty > 0 && rejectedQty > 0) {
                    // Partial pass - some accepted, some rejected
                    newStatus = 'PASSED'
                    result = 'CONDITIONAL'
                } else {
                    newStatus = 'FAILED'
                    result = 'REJECTED'
                }
            }

            await this.supabase
                .from('qc_inspections')
                .update({
                    status: newStatus,
                    result,
                    inspected_qty: inspection.sampleQty,
                    accepted_qty: acceptedQty,
                    rejected_qty: rejectedQty,
                    updated_at: new Date().toISOString()
                })
                .eq('id', inspectionId)

            // Auto-create quarantine if there's rejected qty
            if (rejectedQty > 0 && quantities?.quarantineAction) {
                try {
                    // Get warehouse from receipt if available
                    let warehouseId = ''
                    if (inspection.sourceDocType === 'PURCHASE_RECEIPT' && inspection.sourceDocId) {
                        const { data: receiptItem } = await this.supabase
                            .from('purchase_receipt_items')
                            .select('warehouse_id')
                            .eq('qc_inspection_id', inspectionId)
                            .single()
                        warehouseId = receiptItem?.warehouse_id || ''
                    }

                    // Get default warehouse if not found
                    if (!warehouseId) {
                        const { data: warehouse } = await this.supabase
                            .from('warehouses')
                            .select('id')
                            .limit(1)
                            .single()
                        warehouseId = warehouse?.id || ''
                    }

                    if (warehouseId) {
                        await this.createQuarantine({
                            itemId: inspection.itemId,
                            batchNo: inspection.batchNo || undefined,
                            qty: rejectedQty,
                            uom: 'KG', // Default UOM, should be from inspection
                            reason: 'QC_FAILED',
                            reasonDetail: `QC Inspection ${inspection.code} - พบรายการไม่ผ่านการตรวจสอบ`,
                            qcInspectionId: inspectionId,
                            warehouseId
                        })
                    }

                    // Update receipt item QC status if applicable
                    if (inspection.sourceDocType === 'PURCHASE_RECEIPT') {
                        const qcStatus = acceptedQty > 0 ? 'PARTIAL' : 'FAILED'
                        await this.supabase
                            .from('purchase_receipt_items')
                            .update({
                                qc_status: qcStatus,
                                qty_accepted: acceptedQty,
                                qty_rejected: rejectedQty
                            })
                            .eq('qc_inspection_id', inspectionId)

                        // Recalculate receipt header QC status
                        await this.recalculateReceiptHeaderQCStatus(inspectionId)
                    }
                } catch (quarantineError) {
                    console.error('Failed to create quarantine:', quarantineError)
                    // Don't throw - inspection update was successful
                }
            } else if (!hasPending && allPass) {
                // All passed - update receipt item
                if (inspection.sourceDocType === 'PURCHASE_RECEIPT') {
                    await this.supabase
                        .from('purchase_receipt_items')
                        .update({
                            qc_status: 'PASSED',
                            qty_accepted: acceptedQty,
                            qty_rejected: 0
                        })
                        .eq('qc_inspection_id', inspectionId)

                    // Recalculate receipt header QC status
                    await this.recalculateReceiptHeaderQCStatus(inspectionId)
                }
            }
        }

        return this.getInspectionById(inspectionId) as Promise<QCInspection>
    }

    static async approveInspection(id: string, approvedBy: string): Promise<QCInspection> {
        const { error } = await this.supabase
            .from('qc_inspections')
            .update({
                approved_by: approvedBy,
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw error

        return this.getInspectionById(id) as Promise<QCInspection>
    }

    // ==========================================
    // Quarantine Methods
    // ==========================================

    static async getQuarantineRecords(): Promise<QuarantineRecord[]> {
        const { data, error } = await this.supabase
            .from('quarantine_records')
            .select(`
                *,
                item:items(id, code, name),
                warehouse:warehouses(id, code, name)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map((item) => this.mapQuarantineFromDB(item))
    }

    static async getQuarantineById(id: string): Promise<QuarantineRecord | null> {
        const { data, error } = await this.supabase
            .from('quarantine_records')
            .select(`
                *,
                item:items(id, code, name),
                warehouse:warehouses(id, code, name)
            `)
            .eq('id', id)
            .single()

        if (error) return null

        return this.mapQuarantineFromDB(data)
    }

    static async createQuarantine(input: {
        itemId: string
        batchNo?: string
        qty: number
        uom: string
        reason: QuarantineReason
        reasonDetail?: string
        qcInspectionId?: string
        warehouseId: string
    }): Promise<QuarantineRecord> {
        const code = await this.generateQuarantineCode()

        const { data, error } = await this.supabase
            .from('quarantine_records')
            .insert({
                code,
                status: 'PENDING',
                item_id: input.itemId,
                batch_no: input.batchNo || null,
                qty: input.qty,
                uom: input.uom,
                reason: input.reason,
                reason_detail: input.reasonDetail || null,
                qc_inspection_id: input.qcInspectionId || null,
                warehouse_id: input.warehouseId,
                quarantined_by: 'ระบบ'
            })
            .select()
            .single()

        if (error) throw error

        return this.getQuarantineById(data.id) as Promise<QuarantineRecord>
    }

    static async resolveQuarantine(
        id: string,
        action: QuarantineAction,
        actionDetail?: string,
        resolvedBy?: string
    ): Promise<void> {
        const newStatus: QuarantineStatus = action === 'DISPOSE' ? 'DISPOSED' : 'RESOLVED'

        const { error } = await this.supabase
            .from('quarantine_records')
            .update({
                status: newStatus,
                action,
                action_detail: actionDetail || null,
                resolved_by: resolvedBy || 'ผู้จัดการ',
                resolved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw error
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    private static mapTemplateFromDB(data: any): QCTemplate {
        return {
            id: data.id,
            code: data.code,
            name: data.name,
            type: data.type as TemplateType,
            status: data.status as TemplateStatus,
            version: data.version,
            description: data.description,
            parameters: (data.parameters || []).map((p: any) => ({
                id: p.id,
                lineNo: p.line_no,
                name: p.name,
                nameEn: p.name_en,
                type: p.type,
                minValue: p.min_value,
                maxValue: p.max_value,
                uom: p.uom,
                acceptableValues: p.acceptable_values,
                isCritical: p.is_critical,
                description: p.description
            })),
            appliesTo: data.applies_to,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        }
    }

    private static mapInspectionFromDB(data: any): QCInspection {
        return {
            id: data.id,
            code: data.code,
            type: data.type as InspectionType,
            status: data.status as InspectionStatus,
            templateId: data.template_id,
            template: data.template ? this.mapTemplateFromDB(data.template) : undefined,
            sourceDocType: data.source_doc_type,
            sourceDocId: data.source_doc_id,
            sourceDocCode: data.source_doc_code,
            itemId: data.item_id,
            itemCode: data.item?.code,
            itemName: data.item?.name,
            batchNo: data.batch_no,
            lotNo: data.lot_no,
            sampleQty: data.sample_qty,
            inspectedQty: data.inspected_qty,
            acceptedQty: data.accepted_qty,
            rejectedQty: data.rejected_qty,
            readings: (data.readings || []).map((r: any) => ({
                id: r.id,
                parameterId: r.parameter_id,
                parameter: r.parameter ? {
                    id: r.parameter.id,
                    lineNo: r.parameter.line_no,
                    name: r.parameter.name,
                    nameEn: r.parameter.name_en,
                    type: r.parameter.type,
                    minValue: r.parameter.min_value,
                    maxValue: r.parameter.max_value,
                    uom: r.parameter.uom,
                    acceptableValues: r.parameter.acceptable_values,
                    isCritical: r.parameter.is_critical,
                    description: r.parameter.description
                } : undefined,
                numericValue: r.numeric_value,
                acceptanceValue: r.acceptance_value,
                status: r.status,
                remarks: r.remarks
            })),
            result: data.result,
            resultRemarks: data.result_remarks,
            inspectionDate: data.inspection_date,
            inspectionTime: data.inspection_time,
            inspectedBy: data.inspected_by,
            approvedBy: data.approved_by,
            approvedAt: data.approved_at,
            isCCP: data.is_ccp,
            ccpDeviationAction: data.ccp_deviation_action,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        }
    }

    private static mapQuarantineFromDB(data: any): QuarantineRecord {
        return {
            id: data.id,
            code: data.code,
            status: data.status as QuarantineStatus,
            itemId: data.item_id,
            itemCode: data.item?.code,
            itemName: data.item?.name,
            batchNo: data.batch_no,
            qty: data.qty,
            uom: data.uom,
            reason: data.reason as QuarantineReason,
            reasonDetail: data.reason_detail,
            qcInspectionId: data.qc_inspection_id,
            action: data.action as QuarantineAction,
            actionDetail: data.action_detail,
            resolvedBy: data.resolved_by,
            resolvedAt: data.resolved_at,
            warehouseId: data.warehouse_id,
            warehouseName: data.warehouse?.name,
            quarantinedAt: data.quarantined_at,
            quarantinedBy: data.quarantined_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        }
    }

    private static async generateInspectionCode(): Promise<string> {
        const year = new Date().getFullYear()
        const { count, error } = await this.supabase
            .from('qc_inspections')
            .select('*', { count: 'exact', head: true })

        if (error) throw error

        const nextNum = (count || 0) + 1
        return `QI-${year}-${nextNum.toString().padStart(4, '0')}`
    }

    private static async generateQuarantineCode(): Promise<string> {
        const year = new Date().getFullYear()
        const { count, error } = await this.supabase
            .from('quarantine_records')
            .select('*', { count: 'exact', head: true })

        if (error) throw error

        const nextNum = (count || 0) + 1
        return `QR-${year}-${nextNum.toString().padStart(4, '0')}`
    }

    /**
     * Recalculate the receipt header QC status based on all items' QC statuses
     * This should be called after updating any receipt item's QC status
     */
    private static async recalculateReceiptHeaderQCStatus(inspectionId: string): Promise<void> {
        try {
            // 1. Get receipt_id from the receipt item linked to this inspection
            const { data: receiptItem } = await this.supabase
                .from('purchase_receipt_items')
                .select('receipt_id')
                .eq('qc_inspection_id', inspectionId)
                .single()

            if (!receiptItem?.receipt_id) return

            // 2. Get all items for this receipt
            const { data: allItems } = await this.supabase
                .from('purchase_receipt_items')
                .select('qc_status')
                .eq('receipt_id', receiptItem.receipt_id)

            if (!allItems || allItems.length === 0) return

            // 3. Calculate overall QC status
            const pendingCount = allItems.filter(i => i.qc_status === 'PENDING').length
            const passedCount = allItems.filter(i =>
                i.qc_status === 'PASSED' ||
                i.qc_status === 'NOT_REQUIRED' ||
                i.qc_status === 'PARTIAL'
            ).length
            const failedCount = allItems.filter(i => i.qc_status === 'FAILED').length

            let newQCStatus = 'PENDING'
            if (pendingCount === 0) {
                if (failedCount === 0) {
                    newQCStatus = 'PASSED'
                } else if (passedCount === 0) {
                    newQCStatus = 'FAILED'
                } else {
                    newQCStatus = 'PARTIAL'
                }
            }

            // 4. Update receipt header
            await this.supabase
                .from('purchase_receipts')
                .update({
                    qc_status: newQCStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', receiptItem.receipt_id)

            console.log(`Receipt ${receiptItem.receipt_id} QC status updated to: ${newQCStatus}`)
        } catch (error) {
            console.error('Failed to recalculate receipt header QC status:', error)
            // Don't throw - this is a non-critical operation
        }
    }
}
