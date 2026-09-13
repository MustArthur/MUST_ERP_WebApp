'use client'

import { useEffect, useState } from 'react'
import { Pencil, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatNumber } from '@/lib/utils'

interface TargetLineControlProps {
    /** Current target value */
    value: number
    /** Whether the reference line is shown on the chart */
    enabled: boolean
    /** Unit shown next to the input and in the trigger label, e.g. "กก./วัน" */
    unit: string
    /** Value restored by the "คืนค่าเริ่มต้น" button */
    defaultValue: number
    onChange: (value: number) => void
    onEnabledChange: (enabled: boolean) => void
}

export function TargetLineControl({
    value,
    enabled,
    unit,
    defaultValue,
    onChange,
    onEnabledChange,
}: TargetLineControlProps) {
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState(String(value))
    const [error, setError] = useState<string | null>(null)

    // Reset the draft to the stored value whenever the popover opens, so a cancelled
    // edit never leaks into the next one
    useEffect(() => {
        if (open) {
            setDraft(String(value))
            setError(null)
        }
    }, [open, value])

    function save() {
        const parsed = Number(draft.replace(/,/g, '').trim())
        if (!Number.isFinite(parsed) || parsed <= 0) {
            setError('กรุณากรอกตัวเลขมากกว่า 0')
            return
        }
        onChange(parsed)
        if (!enabled) onEnabledChange(true)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 px-2 text-xs font-normal text-gray-500 hover:text-gray-900"
                    aria-label="ตั้งค่าเส้นเป้าหมาย"
                >
                    <Target className="h-3.5 w-3.5" />
                    {enabled ? `เป้าหมาย ${formatNumber(value, 0)} ${unit}` : 'ตั้งเป้าหมาย'}
                    <Pencil className="h-3 w-3 opacity-60" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="target-enabled" className="text-sm font-medium">
                        แสดงเส้นเป้าหมาย
                    </Label>
                    <Switch
                        id="target-enabled"
                        checked={enabled}
                        onCheckedChange={onEnabledChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="target-value" className="text-sm font-medium">
                        ค่าเป้าหมาย
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="target-value"
                            type="number"
                            inputMode="decimal"
                            min={1}
                            step={50}
                            value={draft}
                            onChange={(e) => {
                                setDraft(e.target.value)
                                setError(null)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    save()
                                }
                            }}
                            className="h-9"
                            autoFocus
                        />
                        <span className="shrink-0 text-xs text-gray-500">{unit}</span>
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 text-xs text-gray-500"
                        onClick={() => {
                            setDraft(String(defaultValue))
                            setError(null)
                        }}
                    >
                        คืนค่าเริ่มต้น ({formatNumber(defaultValue, 0)})
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button size="sm" onClick={save}>
                            บันทึก
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
