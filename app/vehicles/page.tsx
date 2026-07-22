'use client'

import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useVehiclesStore } from '@/stores/vehicles-store'
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@/types/vehicle'
import { VehicleTable, VehicleFormModal } from '@/components/vehicles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Truck,
    Plus,
    RefreshCw,
    Search,
    CheckCircle,
    XCircle,
} from 'lucide-react'

export default function VehiclesPage() {
    const {
        vehicles,
        isLoading,
        filters,
        fetchVehicles,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        setFilters,
    } = useVehiclesStore()

    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

    useEffect(() => {
        fetchVehicles()
    }, [fetchVehicles])

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            const searchLower = filters.search.toLowerCase()
            const matchesSearch = !filters.search ||
                vehicle.code.toLowerCase().includes(searchLower) ||
                vehicle.name.toLowerCase().includes(searchLower) ||
                (vehicle.plateNumber?.toLowerCase().includes(searchLower))

            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'active' && vehicle.isActive) ||
                (filters.status === 'inactive' && !vehicle.isActive)

            return matchesSearch && matchesStatus
        })
    }, [vehicles, filters])

    const stats = useMemo(() => ({
        total: vehicles.length,
        active: vehicles.filter(v => v.isActive).length,
        inactive: vehicles.filter(v => !v.isActive).length,
    }), [vehicles])

    const handleCreateVehicle = () => {
        setSelectedVehicle(null)
        setShowFormModal(true)
    }

    const handleEditVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle)
        setShowFormModal(true)
    }

    const handleDeletePrompt = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedVehicle) return
        try {
            await deleteVehicle(selectedVehicle.id)
            toast.success('ลบรถขนส่งสำเร็จ')
            setShowDeleteModal(false)
            setSelectedVehicle(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'ไม่สามารถลบรถขนส่งได้')
        }
    }

    const handleSaveVehicle = async (data: CreateVehicleInput | UpdateVehicleInput, isNew: boolean) => {
        try {
            if (isNew) {
                await createVehicle(data as CreateVehicleInput)
                toast.success('เพิ่มรถขนส่งสำเร็จ')
            } else if (selectedVehicle) {
                await updateVehicle(selectedVehicle.id, data as UpdateVehicleInput)
                toast.success('แก้ไขรถขนส่งสำเร็จ')
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'ไม่สามารถบันทึกรถขนส่งได้')
            throw error
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">รถขนส่ง</h1>
                            <p className="text-sm text-gray-500">จัดการข้อมูลรถขนส่งของโรงงาน</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => fetchVehicles()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                รีเฟรช
                            </Button>
                            <Button onClick={handleCreateVehicle}>
                                <Plus className="w-5 h-5 mr-2" />
                                เพิ่มรถขนส่ง
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">ทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Truck className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">ใช้งาน</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-100">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">ไม่ใช้งาน</p>
                                <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-100">
                                <XCircle className="w-6 h-6 text-gray-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="ค้นหา รหัส, ชื่อ, ทะเบียนรถ..."
                                value={filters.search}
                                onChange={(e) => setFilters({ search: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={filters.status}
                            onValueChange={(value: 'all' | 'active' | 'inactive') => setFilters({ status: value })}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="active">ใช้งาน</SelectItem>
                                <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-xl shadow-sm border p-8">
                        <div className="animate-pulse space-y-4">
                            <div className="h-10 bg-gray-200 rounded w-full" />
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 bg-gray-100 rounded w-full" />
                            ))}
                        </div>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบรถขนส่ง</h3>
                        <p className="text-gray-500 mb-4">
                            {filters.search || filters.status !== 'all'
                                ? 'ลองปรับเงื่อนไขการค้นหา'
                                : 'ยังไม่มีรถขนส่งในระบบ'}
                        </p>
                        <Button onClick={handleCreateVehicle}>
                            <Plus className="w-5 h-5 mr-2" />
                            เพิ่มรถขนส่งใหม่
                        </Button>
                    </div>
                ) : (
                    <VehicleTable
                        vehicles={filteredVehicles}
                        onEdit={handleEditVehicle}
                        onDelete={handleDeletePrompt}
                    />
                )}
            </main>

            <VehicleFormModal
                vehicle={selectedVehicle}
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false)
                    setSelectedVehicle(null)
                }}
                onSave={handleSaveVehicle}
            />

            <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการลบรถขนส่ง "{selectedVehicle?.name}" หรือไม่?
                            การลบจะไม่สามารถกู้คืนได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            ลบ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
