'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Supplier, UpdateSupplierInput } from '@/types/supplier'
import { getSupplierById, updateSupplier } from '@/lib/api/suppliers'
import { SupplierFormModal, SupplierItemsSection } from '@/components/suppliers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft,
    Edit2,
    Building2,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    RefreshCw,
} from 'lucide-react'

export default function SupplierDetailPage() {
    const params = useParams()
    const router = useRouter()
    const supplierId = params.id as string

    const [supplier, setSupplier] = useState<Supplier | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)

    // Load supplier data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true)
            const data = await getSupplierById(supplierId)
            setSupplier(data)
            setIsLoading(false)
        }
        loadData()
    }, [supplierId])

    const handleSaveSupplier = async (data: UpdateSupplierInput) => {
        if (!supplier) return
        try {
            const updated = await updateSupplier(supplier.id, data)
            if (updated) {
                setSupplier(updated)
            }
        } catch (error) {
            console.error('Error updating supplier:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!supplier) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบ Supplier</h2>
                <p className="text-gray-500 mb-4">Supplier ที่ค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
                <Button onClick={() => router.push('/suppliers')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    กลับไปหน้ารายการ
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => router.push('/suppliers')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                กลับ
                            </Button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
                                    {supplier.isActive ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ใช้งาน</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-gray-500">ไม่ใช้งาน</Badge>
                                    )}
                                </div>
                                <p className="text-gray-500 font-mono">{supplier.code}</p>
                            </div>
                        </div>
                        <Button onClick={() => setShowEditModal(true)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            แก้ไขข้อมูล
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Contact Info */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">ข้อมูลติดต่อ</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">รหัส</p>
                            <p className="font-mono font-medium">{supplier.code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ผู้ติดต่อ</p>
                            <p className="font-medium">{supplier.contactName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> เบอร์โทร
                            </p>
                            <p className="font-medium">{supplier.phone || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> อีเมล
                            </p>
                            <p className="font-medium">{supplier.email || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <CreditCard className="w-3 h-3" /> Credit Term
                            </p>
                            <Badge variant="outline" className="font-mono">{supplier.paymentTerms} วัน</Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">เลขประจำตัวผู้เสียภาษี</p>
                            <p className="font-mono">{supplier.taxId || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> ที่อยู่
                            </p>
                            <p className="text-sm">{supplier.address || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <SupplierItemsSection supplier={supplier} />
            </main>

            {/* Edit Modal */}
            <SupplierFormModal
                supplier={supplier}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={async (data, isNew) => {
                    await handleSaveSupplier(data as UpdateSupplierInput)
                }}
            />
        </div>
    )
}
