'use client'

import { Machine } from '@/types/machine'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Edit2,
    Trash2,
    Wrench,
} from 'lucide-react'

interface MachineTableProps {
    machines: Machine[]
    onEdit: (machine: Machine) => void
    onDelete: (machine: Machine) => void
}

export function MachineTable({ machines, onEdit, onDelete }: MachineTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">รหัส</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ชื่อเครื่องจักร</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ตำแหน่ง/แผนก</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">สถานะ</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {machines.map((machine) => (
                            <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className="font-mono text-sm font-medium text-gray-900">{machine.code}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-900">{machine.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-700">{machine.location || '-'}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {machine.isActive ? (
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
                                            onClick={() => onEdit(machine)}
                                            title="แก้ไข"
                                            aria-label="แก้ไข"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(machine)}
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
                    แสดง {machines.length} รายการ
                </span>
            </div>
        </div>
    )
}
