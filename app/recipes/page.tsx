'use client'

import { useEffect, useState } from 'react'
import { useRecipeStore, useFilteredRecipes } from '@/stores/recipe-store'
import { Recipe, RecipeStatus, CreateRecipeInput } from '@/types/recipe'
import { RecipeCard, RecipeDetailModal, RecipeFormModal } from '@/components/recipes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RecipesPage() {
  const {
    fetchRecipes,
    createRecipe,
    updateRecipe,
    duplicateRecipe,
    isLoading,
    filters,
    setFilters,
  } = useRecipeStore()

  const filteredRecipes = useFilteredRecipes()

  // Modal state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)

  // Load recipes on mount
  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  // Handlers
  const handleViewDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setShowDetailModal(true)
  }

  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedRecipe(null)
  }

  const handleCreate = () => {
    setEditingRecipe(null)
    setShowFormModal(true)
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setShowFormModal(true)
    setShowDetailModal(false)
  }

  const handleDuplicate = async (recipe: Recipe) => {
    await duplicateRecipe(recipe.id)
    setShowDetailModal(false)
  }

  const handleCloseForm = () => {
    setShowFormModal(false)
    setEditingRecipe(null)
  }

  const handleSave = async (data: CreateRecipeInput, status: 'DRAFT' | 'ACTIVE') => {
    const input = { ...data, status }
    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, input)
    } else {
      await createRecipe(input)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value })
  }

  const handleStatusFilter = (status: RecipeStatus | 'all') => {
    setFilters({ status })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">สูตรการผลิต (BOM)</h1>
              <p className="text-sm text-gray-500">จัดการสูตรและส่วนประกอบการผลิต</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-5 h-5 mr-2" />
              สร้างสูตรใหม่
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหาด้วยรหัสหรือชื่อสูตร..."
                className="pl-10"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={filters.status === 'all' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('all')}
              >
                ทั้งหมด
              </Button>
              <Button
                variant={filters.status === 'ACTIVE' ? 'default' : 'outline'}
                className={cn(
                  filters.status === 'ACTIVE' && "bg-green-600 hover:bg-green-700"
                )}
                onClick={() => handleStatusFilter('ACTIVE')}
              >
                ใช้งาน
              </Button>
              <Button
                variant={filters.status === 'DRAFT' ? 'default' : 'outline'}
                className={cn(
                  filters.status === 'DRAFT' && "bg-gray-600 hover:bg-gray-700"
                )}
                onClick={() => handleStatusFilter('DRAFT')}
              >
                ร่าง
              </Button>
              <Button
                variant={filters.status === 'OBSOLETE' ? 'default' : 'outline'}
                className={cn(
                  filters.status === 'OBSOLETE' && "bg-red-600 hover:bg-red-700"
                )}
                onClick={() => handleStatusFilter('OBSOLETE')}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-500">กำลังโหลด...</p>
          </div>
        )}

        {/* Recipe Cards Grid */}
        {!isLoading && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={handleViewDetail}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRecipes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">ไม่พบสูตรที่ค้นหา</p>
            <Button variant="outline" className="mt-4" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              สร้างสูตรใหม่
            </Button>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
      />

      {/* Form Modal */}
      <RecipeFormModal
        recipe={editingRecipe}
        isOpen={showFormModal}
        onClose={handleCloseForm}
        onSave={handleSave}
      />
    </div>
  )
}
