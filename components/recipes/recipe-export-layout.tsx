'use client'

import { forwardRef } from 'react'
import { Recipe } from '@/types/recipe'
import { StatusBadge } from './status-badge'
import { IngredientTable } from './ingredient-table'
import { formatDuration, formatDateTime } from '@/lib/utils'

interface RecipeExportLayoutProps {
  recipe: Recipe
  bottleCount: number
}

// Static, non-tabbed, non-clipped layout used only as a capture target for
// image/PDF export — the interactive modal is tabbed and scroll-clipped, so
// it can't be screenshotted directly.
export const RecipeExportLayout = forwardRef<HTMLDivElement, RecipeExportLayoutProps>(
  function RecipeExportLayout({ recipe, bottleCount }, ref) {
    return (
      <div
        ref={ref}
        style={{ width: 800 }}
        className="bg-white p-8 font-sans text-gray-900"
      >
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <span className="text-2xl">📋</span>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{recipe.code}</h1>
            <p className="text-muted-foreground">{recipe.name}</p>
          </div>
          <StatusBadge status={recipe.status} />
        </div>

        {/* Info Bar */}
        <div className="py-4 border-b grid grid-cols-5 gap-4 text-sm">
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
            <p className="font-medium">{formatDateTime(recipe.updatedAt)}</p>
          </div>
        </div>

        {/* Ingredients */}
        <div className="py-4">
          <h2 className="font-medium text-gray-900 mb-3">ส่วนประกอบ ({recipe.ingredients.length})</h2>
          <IngredientTable ingredients={recipe.ingredients} bottleCount={bottleCount} yieldPercent={recipe.expectedYield} />
        </div>

        {/* Instructions */}
        {recipe.instructions && (
          <div className="py-4 border-t">
            <h2 className="font-medium text-gray-900 mb-3">ขั้นตอนการผลิต</h2>
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line text-gray-700 text-sm">
              {recipe.instructions}
            </div>
          </div>
        )}

        <div className="pt-4 border-t text-xs text-muted-foreground">
          สร้าง: {formatDateTime(recipe.createdAt)}
        </div>
      </div>
    )
  }
)
