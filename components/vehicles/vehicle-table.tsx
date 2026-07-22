'use client'

import { Vehicle } from '@/types/vehicle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Edit2,
    Trash2,
    Truck,
} from 'lucide-react'

interface VehicleTableProps {
    vehicles: Vehicle[]
    onEdit: (vehicle: Vehicle) => void
    onDelete: (vehicle: Vehicle) => void
}

export function VehicleTable({ vehicles, onEdit, onDelete }: VehicleTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">รหัส</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ทะเบียนรถ</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ชื่อ/รุ่นรถ</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ประเภทรถ</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">สถานะ</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {vehicles.map((vehicle) => (
                            <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className="font-mono text-sm font-medium text-gray-900">{vehicle.code}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-700">{vehicle.plateNumber || '-'}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-900">{vehicle.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-700">{vehicle.vehicleType || '-'}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {vehicle.isActive ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ใช้งาน</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-gray-500">ไม่ใช้งาน</Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(vehicle)}
                                            title="แก้ไข"
                                            aria-label="แก้ไข"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(vehicle)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            title="ลบ"
                                            aria-label="ลบ"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary */}
            <div className="bg-gray-50 px-4 py-3 border-t">
                <span className="text-sm text-gray-500">
                    แสดง {vehicles.length} รายการ
                </span>
            </div>
        </div>
    )
}
