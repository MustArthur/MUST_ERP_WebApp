'use client'

import { Recipe } from '@/types/recipe'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './status-badge'
import { IngredientTable } from './ingredient-table'
import { BatchCalculator } from './batch-calculator'
import { Beaker, FileText, Calculator, Copy, Edit } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface RecipeDetailModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (recipe: Recipe) => void
  onDuplicate?: (recipe: Recipe) => void
}

export function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
}: RecipeDetailModalProps) {
  if (!recipe) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div className="flex-1">
              <DialogTitle className="text-xl">{recipe.code}</DialogTitle>
              <p className="text-muted-foreground">{recipe.name}</p>
            </div>
            <StatusBadge status={recipe.status} />
          </div>
        </DialogHeader>

        {/* Info Bar */}
        <div className="py-3 border-y grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">ผลผลิต</p>
            <p className="font-medium">{recipe.outputQty} {recipe.outputUom}/Batch</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Yield คาดหวัง</p>
            <p className="font-medium">{recipe.expectedYield}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">เวลาผลิต</p>
            <p className="font-medium">{formatDuration(recipe.estimatedTime)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Version</p>
            <p className="font-medium">v{recipe.version}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">อัพเดทล่าสุด</p>
            <p className="font-medium">{recipe.updatedAt}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ingredients" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-fit">
            <TabsTrigger value="ingredients" className="gap-2">
              <Beaker className="w-4 h-4" />
              ส่วนประกอบ ({recipe.ingredients.length})
            </TabsTrigger>
            <TabsTrigger value="instructions" className="gap-2">
              <FileText className="w-4 h-4" />
              วิธีทำ
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="w-4 h-4" />
              คำนวณ
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* Ingredients Tab */}
            <TabsContent value="ingredients" className="m-0">
              <IngredientTable ingredients={recipe.ingredients} />
            </TabsContent>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="m-0 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ขั้นตอนการผลิต</h4>
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line text-gray-700">
                  {recipe.instructions || 'ไม่มีข้อมูล'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-800 mb-2">⚠️ ข้อควรระวัง</h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• ควบคุมอุณหภูมิให้คงที่ระหว่างการผลิต</li>
                    <li>• ตรวจสอบ Lot วัตถุดิบก่อนใช้งาน</li>
                    <li>• สวมอุปกรณ์ป้องกันตลอดการผลิต</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-2">📝 จุดตรวจสอบ QC</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• ตรวจอุณหภูมิหลังพาสเจอร์ไรซ์</li>
                    <li>• ตรวจค่า pH ก่อนบรรจุ (4.0-4.5)</li>
                    <li>• ตรวจการปิดฝาสุญญากาศ</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="m-0">
              <BatchCalculator recipe={recipe} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            สร้าง: {recipe.createdAt}
          </div>
          <div className="flex gap-2">
            {onDuplicate && (
              <Button variant="outline" onClick={() => onDuplicate(recipe)}>
                <Copy className="w-4 h-4 mr-2" />
                คัดลอกสูตร
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(recipe)}>
                <Edit className="w-4 h-4 mr-2" />
                แก้ไข
              </Button>
            )}
            <Button onClick={onClose}>ปิด</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
