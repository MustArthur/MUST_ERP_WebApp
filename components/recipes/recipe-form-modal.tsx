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
import { Plus, Trash2, Check, Calculator } from 'lucide-react'
import { getRecipeIngredients, getFinishedGoods, Item } from '@/lib/api/items'

interface RecipeFormModalProps {
  recipe?: Recipe | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateRecipeInput, status: 'DRAFT' | 'ACTIVE') => Promise<void>
}

interface IngredientRow extends CreateIngredientInput {
  tempId: string
}

const UOM_OPTIONS: UnitOfMeasure[] = ['KG', 'G', 'L', 'ML', 'PC', 'BTL', 'PKG']

export function RecipeFormModal({
  recipe,
  isOpen,
  onClose,
  onSave,
}: RecipeFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Items from Supabase
  const [ingredientItems, setIngredientItems] = useState<Item[]>([])
  const [finishedGoods, setFinishedGoods] = useState<Item[]>([])

  // Form state
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

  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    createEmptyIngredient(),
  ])

  // Bottle calculation
  const [bottleSize, setBottleSize] = useState(490)

  // Convert to milliliters for calculation
  const toMilliliters = (qty: number, uom: string): number => {
    switch (uom) {
      case 'L': return qty * 1000
      case 'ML': return qty
      case 'G': return qty  // 1g ≈ 1ml สำหรับของเหลว
      default: return 0     // PC, BTL, PKG ไม่สามารถแปลงได้
    }
  }

  // Calculate total milliliters from ingredients
  const calculateTotalML = (): number => {
    return ingredients
      .filter(ing => ['L', 'ML', 'G'].includes(ing.uom))
      .reduce((sum, ing) => sum + toMilliliters(ing.qty, ing.uom), 0)
  }

  // Calculate number of bottles
  const calculateBottles = (): number => {
    const totalML = calculateTotalML()
    return bottleSize > 0 ? Math.floor(totalML / bottleSize) : 0
  }

  function createEmptyIngredient(): IngredientRow {
    return {
      tempId: `temp-${Date.now()}-${Math.random()}`,
      itemId: '', // จะถูก set เมื่อเลือก material
      item: '',
      code: '',
      qty: 0,
      uom: 'G',
      uomId: '',  // UUID ของ UOM จะถูก set เมื่อเลือก material
      scrap: 0,
      isCritical: true,
      cost: 0,
    }
  }

  // Load items from Supabase on mount
  useEffect(() => {
    async function loadItems() {
      const [ing, fg] = await Promise.all([
        getRecipeIngredients(),
        getFinishedGoods()
      ])
      setIngredientItems(ing)
      setFinishedGoods(fg)
    }
    loadItems()
  }, [])

  // Reset form when recipe changes
  useEffect(() => {
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
      setIngredients(
        recipe.ingredients.map(ing => ({
          ...ing,
          tempId: ing.id,
        }))
      )
    } else {
      // Reset to defaults
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


  const addIngredient = () => {
    setIngredients([...ingredients, createEmptyIngredient()])
  }

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

  const handleMaterialSelect = (tempId: string, materialCode: string) => {
    const material = ingredientItems.find(m => m.code === materialCode)
    if (material) {
      setIngredients(
        ingredients.map(ing =>
          ing.tempId === tempId
            ? {
              ...ing,
              itemId: material.id, // UUID ของ item สำหรับบันทึก
              code: material.code,
              item: material.name,
              uom: material.base_uom_code as UnitOfMeasure || 'G',
              uomId: material.base_uom_id, // UUID ของ UOM สำหรับบันทึก
              cost: material.last_purchase_cost,
            }
            : ing
        )
      )
    }
  }

  const handleFinishedGoodSelect = (productCode: string) => {
    const product = finishedGoods.find(p => p.code === productCode)
    if (product) {
      setOutputItemCode(product.code)
      setOutputItem(product.name)
    }
  }

  const handleSubmit = async (status: 'DRAFT' | 'ACTIVE') => {
    setIsLoading(true)
    try {
      const data: CreateRecipeInput = {
        code,
        name,
        outputItem,
        outputItemCode,
        outputQty,
        outputUom,
        batchSize,
        expectedYield,
        estimatedTime,
        instructions,
        ingredients: ingredients.map(({ tempId, ...ing }) => ing),
        status,
      }
      await onSave(data, status)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {recipe ? 'แก้ไขสูตร' : 'สร้างสูตรใหม่'}
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
              />
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
              <Select value={outputItemCode} onValueChange={handleFinishedGoodSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="-- เลือกสินค้า --" />
                </SelectTrigger>
                <SelectContent>
                  {finishedGoods.map(fg => (
                    <SelectItem key={fg.code} value={fg.code}>
                      {fg.code} - {fg.name}
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
              <Label className="text-blue-800 font-medium">คำนวณจำนวนขวด</Label>
            </div>
            <div className="grid grid-cols-3 gap-4 items-end">
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
                <div className="text-sm text-gray-500">จำนวนขวดที่ผลิตได้</div>
                <div className="text-2xl font-bold text-blue-600">
                  {calculateBottles().toLocaleString()} ขวด
                </div>
              </div>
            </div>
            {ingredients.some(ing => !['L', 'ML', 'G'].includes(ing.uom) && ing.qty > 0) && (
              <p className="text-xs text-amber-600 mt-2">
                * มีวัตถุดิบที่ไม่ใช่หน่วย G/ML/L จึงไม่ถูกนำมาคำนวณ
              </p>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>ส่วนประกอบ *</Label>
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
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">วัตถุดิบ (RM / SP)</th>
                    <th className="px-2 py-2 text-right w-24">ปริมาณ</th>
                    <th className="px-2 py-2 text-center w-20">หน่วย</th>
                    <th className="px-2 py-2 text-center w-20">% เสีย</th>
                    <th className="px-2 py-2 text-center w-16">หลัก</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ingredients.map((ing, idx) => (
                    <tr key={ing.tempId}>
                      <td className="px-2 py-2 text-gray-500">{idx + 1}</td>
                      <td className="px-2 py-2">
                        <Select
                          value={ing.code}
                          onValueChange={(v) => handleMaterialSelect(ing.tempId, v)}
                        >
                          <SelectTrigger className="text-sm w-full text-left">
                            <span className="truncate">
                              {ing.code
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
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={ing.qty || ''}
                          onChange={e => updateIngredient(ing.tempId, 'qty', Number(e.target.value))}
                          className="text-right h-9"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Select
                          value={ing.uom}
                          onValueChange={(v) => updateIngredient(ing.tempId, 'uom', v)}
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
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={ing.scrap || ''}
                          onChange={e => updateIngredient(ing.tempId, 'scrap', Number(e.target.value))}
                          className="text-center h-9"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={ing.isCritical}
                          onChange={e => updateIngredient(ing.tempId, 'isCritical', e.target.checked)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                          onClick={() => removeIngredient(ing.tempId)}
                          disabled={ingredients.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
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
