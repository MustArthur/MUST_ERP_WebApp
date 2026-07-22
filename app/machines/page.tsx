'use client'

import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useMachinesStore } from '@/stores/machines-store'
import { Machine, CreateMachineInput, UpdateMachineInput } from '@/types/machine'
import { MachineTable, MachineFormModal } from '@/components/machines'
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
    Wrench,
    Plus,
    RefreshCw,
    Search,
    CheckCircle,
    XCircle,
} from 'lucide-react'

export default function MachinesPage() {
    const {
        machines,
        isLoading,
        filters,
        fetchMachines,
        createMachine,
        updateMachine,
        deleteMachine,
        setFilters,
    } = useMachinesStore()

    const [showFormModal, setShowFormModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)

    useEffect(() => {
        fetchMachines()
    }, [fetchMachines])

    const filteredMachines = useMemo(() => {
        return machines.filter(machine => {
            const searchLower = filters.search.toLowerCase()
            const matchesSearch = !filters.search ||
                machine.code.toLowerCase().includes(searchLower) ||
                machine.name.toLowerCase().includes(searchLower) ||
                (machine.location?.toLowerCase().includes(searchLower))

            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'active' && machine.isActive) ||
                (filters.status === 'inactive' && !machine.isActive)

            return matchesSearch && matchesStatus
        })
    }, [machines, filters])

    const stats = useMemo(() => ({
        total: machines.length,
        active: machines.filter(m => m.isActive).length,
        inactive: machines.filter(m => !m.isActive).length,
    }), [machines])

    const handleCreateMachine = () => {
        setSelectedMachine(null)
        setShowFormModal(true)
    }

    const handleEditMachine = (machine: Machine) => {
        setSelectedMachine(machine)
        setShowFormModal(true)
    }

    const handleDeletePrompt = (machine: Machine) => {
        setSelectedMachine(machine)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedMachine) return
        try {
            await deleteMachine(selectedMachine.id)
            toast.success('ลบเครื่องจักรสำเร็จ')
            setShowDeleteModal(false)
            setSelectedMachine(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'ไม่สามารถลบเครื่องจักรได้')
        }
    }

    const handleSaveMachine = async (data: CreateMachineInput | UpdateMachineInput, isNew: boolean) => {
        try {
            if (isNew) {
                await createMachine(data as CreateMachineInput)
                toast.success('เพิ่มเครื่องจักรสำเร็จ')
            } else if (selectedMachine) {
                await updateMachine(selectedMachine.id, data as UpdateMachineInput)
                toast.success('แก้ไขเครื่องจักรสำเร็จ')
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'ไม่สามารถบันทึกเครื่องจักรได้')
            throw error
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">เครื่องจักร</h1>
                            <p className="text-sm text-gray-500">จัดการข้อมูลเครื่องจักรของโรงงาน</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => fetchMachines()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                รีเฟรช
                            </Button>
                            <Button onClick={handleCreateMachine}>
                                <Plus className="w-5 h-5 mr-2" />
                                เพิ่มเครื่องจักร
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
                                <Wrench className="w-6 h-6 text-blue-600" />
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
                                placeholder="ค้นหา รหัส, ชื่อ, ตำแหน่ง..."
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
                ) : filteredMachines.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                        <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบเครื่องจักร</h3>
                        <p className="text-gray-500 mb-4">
                            {filters.search || filters.status !== 'all'
                                ? 'ลองปรับเงื่อนไขการค้นหา'
                                : 'ยังไม่มีเครื่องจักรในระบบ'}
                        </p>
                        <Button onClick={handleCreateMachine}>
                            <Plus className="w-5 h-5 mr-2" />
                            เพิ่มเครื่องจักรใหม่
                        </Button>
                    </div>
                ) : (
                    <MachineTable
                        machines={filteredMachines}
                        onEdit={handleEditMachine}
                        onDelete={handleDeletePrompt}
                    />
                )}
            </main>

            <MachineFormModal
                machine={selectedMachine}
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false)
                    setSelectedMachine(null)
                }}
                onSave={handleSaveMachine}
            />

            <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการลบเครื่องจักร "{selectedMachine?.name}" หรือไม่?
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
