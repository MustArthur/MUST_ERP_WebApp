'use client'

import { Recipe } from '@/types/recipe'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { Edit, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RecipeCardProps {
  recipe: Recipe
  onView: (recipe: Recipe) => void
  onEdit?: (recipe: Recipe) => void
  onDuplicate?: (recipe: Recipe) => void
}

export function RecipeCard({ recipe, onView, onEdit, onDuplicate }: RecipeCardProps) {
  const handleClick = () => {
    onView(recipe)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(recipe)
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDuplicate?.(recipe)
  }

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        recipe.status === 'OBSOLETE' && "opacity-60"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-mono text-sm text-blue-600">{recipe.code}</p>
            <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
          </div>
          <StatusBadge status={recipe.status} />
        </div>

        {/* Output Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-500">ผลผลิต</p>
          <p className="font-medium">{recipe.outputItem}</p>
          <p className="text-sm text-gray-600">{recipe.outputQty} {recipe.outputUom} / Batch</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-blue-600 font-medium">{recipe.ingredients.length}</p>
            <p className="text-gray-500 text-xs">ส่วนประกอบ</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-green-600 font-medium">{recipe.expectedYield}%</p>
            <p className="text-gray-500 text-xs">Yield</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <p className="text-purple-600 font-medium">v{recipe.version}</p>
            <p className="text-gray-500 text-xs">Version</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t flex justify-between items-center">
          <span className="text-xs text-gray-400">อัพเดท: {recipe.updatedAt}</span>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleEdit}
                title="แก้ไข"
              >
                <Edit className="w-4 h-4 text-gray-500" />
              </Button>
            )}
            {onDuplicate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDuplicate}
                title="คัดลอก"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
