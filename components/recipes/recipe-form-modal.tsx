'use client'

import { useState, useEffect } from 'react'
import { Recipe, CreateRecipeInput, CreateIngredientInput, UnitOfMeasure } from '@/types/recipe'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Check, Calculator, GripVertical, Eye, EyeOff } from 'lucide-react'
import { getRecipeIngredients, getOutputProducts, getUnitsOfMeasure, Item } from '@/lib/api/items'
import type { UnitOfMeasure as UOMType } from '@/types/item'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface RecipeFormModalProps {
  recipe?: Recipe | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateRecipeInput, status: 'DRAFT' | 'ACTIVE') => Promise<void>
  mode: 'create' | 'edit' | 'new-version'
}

interface IngredientRow extends CreateIngredientInput {
  tempId: string
  isExcluded?: boolean
}

const UOM_OPTIONS: UnitOfMeasure[] = ['KG', 'G', 'L', 'ML', 'PC', 'BTL', 'PKG']

// ─────────────────────────────────────────────
// Sortable ingredient row
// ─────────────────────────────────────────────
interface SortableRowProps {
  ing: IngredientRow
  idx: number
  ingredientItems: Item[]
  itemsLoading: boolean
  uomCodeToId: Map<string, string>
  onUpdate: (tempId: string, field: keyof IngredientRow, value: unknown) => void
  onMaterialSelect: (tempId: string, code: string) => void
  onRemove: (tempId: string) => void
  onToggleExclude: (tempId: string) => void
  canRemove: boolean
}

function SortableIngredientRow({
  ing,
  idx,
  ingredientItems,
  itemsLoading,
  uomCodeToId,
  onUpdate,
  onMaterialSelect,
  onRemove,
  onToggleExclude,
  canRemove,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ing.tempId })

  const excluded = !!ing.isExcluded

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : excluded ? 0.45 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={excluded ? 'bg-gray-50' : 'hover:bg-gray-50'}
    >
      {/* Drag handle */}
      <td
        className="px-2 py-2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        aria-label="ลากเพื่อเปลี่ยนลำดับ"
      >
        <GripVertical className="w-4 h-4" />
      </td>

      {/* Line number */}
      <td className="px-2 py-2 text-gray-500 text-sm select-none">{idx + 1}</td>

      {/* Material select */}
      <td className="px-2 py-2">
        <Select
          value={ing.code}
          onValueChange={(v) => onMaterialSelect(ing.tempId, v)}
          disabled={itemsLoading || excluded}
        >
          <SelectTrigger className={`text-sm w-full text-left ${excluded ? 'line-through text-gray-400' : ''}`}>
            <span className="truncate">
              {itemsLoading
                ? <span className="text-muted-foreground">กำลังโหลด...</span>
                : ing.code
                  ? ingredientItems.find(i => i.code === ing.code)
                    ? `${ing.code} - ${ingredientItems.find(i => i.code === ing.code)?.name}`
                    : ing.code
                  : <span className="text-muted-foreground">-- เลือก --</span>
              }
            </span>
          </SelectTrigger>
          <SelectContent>
            {ingredientItems.map(mat => (
              <SelectItem key={mat.code} value={mat.code}>
                {mat.code} - {mat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* Qty */}
      <td className="px-2 py-2">
        <Input
          type="number"
          value={ing.qty || ''}
          onChange={e => onUpdate(ing.tempId, 'qty', Number(e.target.value))}
          className={`text-right h-9 w-full min-w-[7rem] ${excluded ? 'line-through text-gray-400' : ''}`}
          disabled={excluded}
        />
      </td>

      {/* UOM */}
      <td className="px-2 py-2">
        <Select
          value={ing.uom}
          disabled={excluded}
          onValueChange={(v) => {
            onUpdate(ing.tempId, 'uom', v)
            const resolvedId = uomCodeToId.get(v)
            if (resolvedId) onUpdate(ing.tempId, 'uomId', resolvedId)
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UOM_OPTIONS.map(uom => (
              <SelectItem key={uom} value={uom}>{uom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* Scrap % */}
      <td className="px-2 py-2">
        <Input
          type="number"
          value={ing.scrap || ''}
          onChange={e => onUpdate(ing.tempId, 'scrap', Number(e.target.value))}
          className="text-center h-9"
          disabled={excluded}
        />
      </td>

      {/* isCritical */}
      <td className="px-2 py-2 text-center">
        <input
          type="checkbox"
          checked={ing.isCritical}
          onChange={e => onUpdate(ing.tempId, 'isCritical', e.target.checked)}
          className="w-4 h-4"
          disabled={excluded}
        />
      </td>

      {/* Toggle exclude */}
      <td className="px-1 py-2 text-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${excluded ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}
          onClick={() => onToggleExclude(ing.tempId)}
          aria-label={excluded ? 'นำกลับเข้าสูตร' : 'ตัดออกจากสูตร'}
          title={excluded ? 'นำกลับเข้าสูตร' : 'ตัดออกจากสูตร'}
        >
          {excluded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </td>

      {/* Delete */}
      <td className="px-1 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:bg-red-50"
          onClick={() => onRemove(ing.tempId)}
          disabled={!canRemove}
          aria-label="ลบวัตถุดิบนี้"
          title="ลบวัตถุดิบนี้"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  )
}

// ─────────────────────────────────────────────
// Main form modal
// ─────────────────────────────────────────────
export function RecipeFormModal({
  recipe,
  isOpen,
  onClose,
  onSave,
  mode,
}: RecipeFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [itemsLoading, setItemsLoading] = useState(true)
  const [ingredientItems, setIngredientItems] = useState<Item[]>([])
  const [outputProducts, setOutputProducts] = useState<Item[]>([])
  const [uomCodeToId, setUomCodeToId] = useState<Map<string, string>>(new Map())
  const [saveError, setSaveError] = useState<string | null>(null)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [outputItemCode, setOutputItemCode] = useState('')
  const [outputItem, setOutputItem] = useState('')
  const [outputQty, setOutputQty] = useState(100)
  const [outputUom, setOutputUom] = useState<UnitOfMeasure>('BTL')
  const [batchSize, setBatchSize] = useState(100)
  const [expectedYield, setExpectedYield] = useState(95)
  const [estimatedTime, setEstimatedTime] = useState(240)
  const [instructions, setInstructions] = useState('')
  const [ingredients, setIngredients] = useState<IngredientRow[]>([createEmptyIngredient()])
  const [bottleSize, setBottleSize] = useState(490)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setIngredients((prev) => {
        const from = prev.findIndex(i => i.tempId === active.id)
        const to   = prev.findIndex(i => i.tempId === over.id)
        return arrayMove(prev, from, to)
      })
    }
  }

  const toMilliliters = (qty: number, uom: string): number => {
    switch (uom) {
      case 'L': return qty * 1000
      case 'ML': return qty
      case 'G': return qty
      default: return 0
    }
  }

  // Only count non-excluded ingredients in calculations
  const activeIngredients = ingredients.filter(i => !i.isExcluded)

  const calculateTotalML = (): number =>
    activeIngredients
      .filter(ing => ['L', 'ML', 'G'].includes(ing.uom))
      .reduce((sum, ing) => sum + toMilliliters(ing.qty, ing.uom), 0)

  const calculateBottles = (): number => {
    const totalML = calculateTotalML()
    return bottleSize > 0 ? Math.floor(totalML / bottleSize) : 0
  }

  const calculateTotalCost = (): number =>
    activeIngredients.reduce((sum, ing) => {
      const qtyWithScrap = ing.qty * (1 + ing.scrap / 100)
      return sum + qtyWithScrap * ing.cost
    }, 0)

  const calculateCostPerBottle = (): number => {
    const bottles = calculateBottles()
    const totalCost = calculateTotalCost()
    return bottles > 0 ? totalCost / bottles : 0
  }

  useEffect(() => {
    async function loadItems() {
      setItemsLoading(true)
      try {
        const [ing, outputs, uoms] = await Promise.all([
          getRecipeIngredients(),
          getOutputProducts(),
          getUnitsOfMeasure(),
        ])
        setIngredientItems(ing)
        setOutputProducts(outputs)
        setUomCodeToId(new Map((uoms as UOMType[]).map(u => [u.code, u.id])))
      } finally {
        setItemsLoading(false)
      }
    }
    loadItems()
  }, [])

  useEffect(() => {
    setSaveError(null)
    if (recipe) {
      setCode(recipe.code)
      setName(recipe.name)
      setOutputItemCode(recipe.outputItemCode)
      setOutputItem(recipe.outputItem)
      setOutputQty(recipe.outputQty)
      setOutputUom(recipe.outputUom)
      setBatchSize(recipe.batchSize)
      setExpectedYield(recipe.expectedYield)
      setEstimatedTime(recipe.estimatedTime)
      setInstructions(recipe.instructions)
      setBottleSize(recipe.bottleSize || 490)
      setIngredients(
        recipe.ingredients.map(ing => ({ ...ing, tempId: ing.id, isExcluded: false }))
      )
    } else {
      setCode('')
      setName('')
      setOutputItemCode('')
      setOutputItem('')
      setOutputQty(100)
      setOutputUom('BTL')
      setBatchSize(100)
      setExpectedYield(95)
      setEstimatedTime(240)
      setInstructions('')
      setIngredients([createEmptyIngredient()])
    }
  }, [recipe, isOpen])

  const addIngredient = () => setIngredients(prev => [...prev, createEmptyIngredient()])

  const removeIngredient = (tempId: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(i => i.tempId !== tempId))
    }
  }

  const updateIngredient = (tempId: string, field: keyof IngredientRow, value: unknown) => {
    setIngredients(
      ingredients.map(ing =>
        ing.tempId === tempId ? { ...ing, [field]: value } : ing
      )
    )
  }

  const handleToggleExclude = (tempId: string) => {
    setIngredients(
      ingredients.map(ing =>
        ing.tempId === tempId ? { ...ing, isExcluded: !ing.isExcluded } : ing
      )
    )
  }

  const handleMaterialSelect = (tempId: string, materialCode: string) => {
    const material = ingredientItems.find(m => m.code === materialCode)
    if (material) {
      setIngredients(
        ingredients.map(ing =>
          ing.tempId === tempId
            ? {
                ...ing,
                itemId: material.id,
                code: material.code,
                item: material.name,
                uom: material.base_uom_code as UnitOfMeasure || 'G',
                uomId: material.base_uom_id,
                cost: material.last_purchase_cost,
              }
            : ing
        )
      )
    }
  }

  const handleOutputProductSelect = (productCode: string) => {
    const product = outputProducts.find(p => p.code === productCode)
    if (product) {
      setOutputItemCode(product.code)
      setOutputItem(product.name)
    }
  }

  const handleSubmit = async (status: 'DRAFT' | 'ACTIVE') => {
    setSaveError(null)

    if (!code.trim() || !name.trim()) {
      setSaveError('กรุณากรอกรหัสสูตรและชื่อสูตร')
      return
    }
    if (!outputItemCode) {
      setSaveError('กรุณาเลือกสินค้าที่ผลิตได้')
      return
    }

    // Only validate non-excluded ingredients
    for (const ing of activeIngredients) {
      if (!ing.itemId) {
        setSaveError('กรุณาเลือกวัตถุดิบจาก dropdown สำหรับทุกรายการ')
        return
      }
      if (!ing.uomId) {
        setSaveError('วัตถุดิบบางรายการไม่มีข้อมูล UOM ID — กรุณาเลือกวัตถุดิบใหม่จาก dropdown')
        return
      }
    }

    const outputItemId = outputProducts.find(p => p.code === outputItemCode)?.id
    const outputUomId = uomCodeToId.get(outputUom)

    if (!outputUomId) {
      setSaveError(`ไม่พบ UUID ของหน่วย "${outputUom}" ในระบบ — กรุณาตรวจสอบข้อมูลหน่วยใน Supabase`)
      return
    }

    setIsLoading(true)
    try {
      const data: CreateRecipeInput = {
        code,
        name,
        outputItem,
        outputItemCode,
        outputItemId,
        outputQty,
        outputUom,
        outputUomId,
        batchSize,
        expectedYield,
        estimatedTime,
        instructions,
        // Only save non-excluded rows; strip form-only fields
        ingredients: activeIngredients.map(({ tempId, isExcluded, ...ing }) => ing),
        status,
        bottleSize,
      }
      await onSave(data, status)
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'
      setSaveError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const excludedCount = ingredients.filter(i => i.isExcluded).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'new-version'
              ? `สร้างเวอร์ชันใหม่ — ${recipe?.code} (v${(recipe?.version ?? 1) + 1})`
              : recipe
              ? 'แก้ไขสูตร'
              : 'สร้างสูตรใหม่'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">รหัสสูตร *</Label>
              <Input
                id="code"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="RCP-XXX-001"
                disabled={mode === 'new-version'}
              />
              {mode === 'new-version' && (
                <p className="text-xs text-muted-foreground">รหัสสูตรไม่สามารถเปลี่ยนแปลงได้เมื่อสร้างเวอร์ชันใหม่</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อสูตร *</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="สูตรเครื่องดื่มโปรตีน..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>สินค้าที่ผลิตได้ *</Label>
              <Select value={outputItemCode} onValueChange={handleOutputProductSelect} disabled={itemsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={itemsLoading ? 'กำลังโหลด...' : '-- เลือกสินค้า --'} />
                </SelectTrigger>
                <SelectContent>
                  {outputProducts.map(product => (
                    <SelectItem key={product.code} value={product.code}>
                      <div className="flex items-center gap-2">
                        {product.code.startsWith('SP-') ? (
                          <span className="px-1.5 py-0.5 text-xs rounded bg-orange-100 text-orange-700">SP</span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-700">FG</span>
                        )}
                        <span>{product.code} - {product.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="outputQty">จำนวนผลิต *</Label>
                <Input
                  id="outputQty"
                  type="number"
                  value={outputQty}
                  onChange={e => setOutputQty(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>หน่วย</Label>
                <Select value={outputUom} onValueChange={(v) => setOutputUom(v as UnitOfMeasure)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UOM_OPTIONS.map(uom => (
                      <SelectItem key={uom} value={uom}>{uom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedYield">Yield ที่คาดหวัง (%)</Label>
              <Input
                id="expectedYield"
                type="number"
                value={expectedYield}
                onChange={e => setExpectedYield(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">เวลาผลิตโดยประมาณ (นาที)</Label>
              <Input
                id="estimatedTime"
                type="number"
                value={estimatedTime}
                onChange={e => setEstimatedTime(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Bottle Calculation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-blue-600" />
              <Label className="text-blue-800 font-medium">คำนวณจำนวนขวด และต้นทุน</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="bottleSize" className="text-sm text-gray-600">ขนาดขวด (ML)</Label>
                <Input
                  id="bottleSize"
                  type="number"
                  value={bottleSize}
                  onChange={e => setBottleSize(Number(e.target.value))}
                  className="bg-white"
                />
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">ปริมาณรวม</div>
                <div className="text-lg font-semibold text-gray-700">
                  {calculateTotalML().toLocaleString()} ML
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">จำนวนขวด</div>
                <div className="text-2xl font-bold text-blue-600">
                  {calculateBottles().toLocaleString()} ขวด
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">ต้นทุนต่อขวด</div>
                <div className="text-2xl font-bold text-green-600">
                  ฿{calculateCostPerBottle().toFixed(2)}
                </div>
              </div>
            </div>
            {activeIngredients.some(ing => !['L', 'ML', 'G'].includes(ing.uom) && ing.qty > 0) && (
              <p className="text-xs text-amber-600 mt-2">
                * มีวัตถุดิบที่ไม่ใช่หน่วย G/ML/L จึงไม่ถูกนำมาคำนวณปริมาณ
              </p>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Label>ส่วนประกอบ *</Label>
                {excludedCount > 0 && (
                  <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    ตัดออก {excludedCount} รายการ
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addIngredient}
                className="text-blue-600"
              >
                <Plus className="w-4 h-4 mr-1" /> เพิ่มรายการ
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 w-8"></th>
                    <th className="px-2 py-2 text-left w-8">#</th>
                    <th className="px-2 py-2 text-left">วัตถุดิบ (RM / SP)</th>
                    <th className="px-2 py-2 text-right w-36">ปริมาณ</th>
                    <th className="px-2 py-2 text-center w-20">หน่วย</th>
                    <th className="px-2 py-2 text-center w-20">% เสีย</th>
                    <th className="px-2 py-2 text-center w-16">หลัก</th>
                    <th className="px-2 py-2 w-8" title="ตัดออก/รวม"></th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={ingredients.map(i => i.tempId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody className="divide-y">
                      {ingredients.map((ing, idx) => (
                        <SortableIngredientRow
                          key={ing.tempId}
                          ing={ing}
                          idx={idx}
                          ingredientItems={ingredientItems}
                          itemsLoading={itemsLoading}
                          uomCodeToId={uomCodeToId}
                          onUpdate={updateIngredient}
                          onMaterialSelect={handleMaterialSelect}
                          onRemove={removeIngredient}
                          onToggleExclude={handleToggleExclude}
                          canRemove={ingredients.length > 1}
                        />
                      ))}
                    </tbody>
                  </SortableContext>
                </DndContext>
              </table>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">ขั้นตอนการผลิต</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="1. ขั้นตอนแรก...&#10;2. ขั้นตอนที่สอง..."
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        {mode === 'new-version' && (
          <div className="px-3 py-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
            ⚠️ การบันทึกแบบ &quot;เปิดใช้งาน&quot; จะเปลี่ยนสูตรเวอร์ชันก่อนหน้า (v{recipe?.version}) เป็น &quot;ยกเลิก&quot; โดยอัตโนมัติ
          </div>
        )}
        {saveError && (
          <div className="px-1 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            ⚠️ {saveError}
          </div>
        )}
        <div className="pt-4 border-t flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
            ยกเลิก
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit('DRAFT')}
            className="flex-1"
            disabled={isLoading}
          >
            บันทึกร่าง
          </Button>
          <Button
            onClick={() => handleSubmit('ACTIVE')}
            className="flex-1"
            disabled={isLoading}
          >
            <Check className="w-4 h-4 mr-2" />
            บันทึกและเปิดใช้งาน
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function createEmptyIngredient(): IngredientRow {
  return {
    tempId: `temp-${Date.now()}-${Math.random()}`,
    itemId: '',
    item: '',
    code: '',
    qty: 0,
    uom: 'G',
    uomId: '',
    scrap: 0,
    isCritical: true,
    cost: 0,
    isExcluded: false,
  }
}
