'use client'

import { useState } from 'react'
import { UnitOfMeasure } from '@/types/item'
import { createUOM, deleteUOM } from '@/lib/api/items'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Trash2, Plus } from 'lucide-react'

interface UnitManagerModalProps {
    isOpen: boolean
    onClose: () => void
    uoms: UnitOfMeasure[]
    onRefresh: () => void
}

export function UnitManagerModal({
    isOpen,
    onClose,
    uoms,
    onRefresh
}: UnitManagerModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [newCode, setNewCode] = useState('')
    const [newName, setNewName] = useState('')

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCode || !newName) return

        setIsLoading(true)
        try {
            await createUOM(newCode, newName)
            setNewCode('')
            setNewName('')
            onRefresh()
        } catch (error) {
            console.error(error)
            alert('ไม่สามารถเพิ่มหน่วยนับได้')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('ยืนยันลบหน่วยนับนี้?')) return

        setIsLoading(true)
        try {
            await deleteUOM(id)
            onRefresh()
        } catch (error) {
            console.error(error)
            alert('ไม่สามารถลบได้ หน่วยนับนี้อาจถูกใช้งานอยู่')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>จัดการหน่วยนับ</DialogTitle>
                    <DialogDescription>
                        เพิ่มหรือลบรายการหน่วยนับในระบบ
                    </DialogDescription>
                </DialogHeader>

                {/* Add Form */}
                <form onSubmit={handleCreate} className="flex gap-2 items-end mb-4 border-b pb-4">
                    <div className="space-y-1 flex-1">
                        <label className="text-xs font-medium text-gray-500">รหัสหน่วย (เช่น kg)</label>
                        <Input
                            value={newCode}
                            onChange={e => setNewCode(e.target.value)}
                            placeholder="รหัส"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-1 flex-[2]">
                        <label className="text-xs font-medium text-gray-500">ชื่อหน่วย (เช่น กิโลกรัม)</label>
                        <Input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="ชื่อหน่วยนับ"
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading || !newCode || !newName}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                </form>

                {/* List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {uoms.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-4">ยังไม่มีข้อมูล</p>
                    ) : (
                        uoms.map(uom => (
                            <div key={uom.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-100 group">
                                <div>
                                    <span className="font-medium">{uom.name}</span>
                                    <span className="text-gray-500 ml-2 text-sm">({uom.code})</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                                    onClick={() => handleDelete(uom.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
