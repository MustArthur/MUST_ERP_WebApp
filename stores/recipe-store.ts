import { create } from 'zustand'
import { Recipe, RecipeStatus, CreateRecipeInput, UpdateRecipeInput, RecipeFilterState } from '@/types/recipe'
import { mockRecipes } from '@/lib/mock-data/recipes'
import { generateId, delay } from '@/lib/utils'
import * as recipeApi from '@/lib/api/recipes'

// Flag to enable/disable Supabase (set to false to use mock data only)
const USE_SUPABASE = true


interface RecipeState {
  // Data
  recipes: Recipe[]
  selectedRecipe: Recipe | null

  // UI State
  isLoading: boolean
  error: string | null
  filters: RecipeFilterState

  // Actions
  fetchRecipes: () => Promise<void>
  getRecipe: (id: string) => Promise<Recipe | null>
  createRecipe: (input: CreateRecipeInput) => Promise<Recipe>
  updateRecipe: (id: string, input: UpdateRecipeInput) => Promise<Recipe>
  duplicateRecipe: (id: string) => Promise<Recipe>
  deleteRecipe: (id: string) => Promise<void>

  // Filter Actions
  setFilters: (filters: Partial<RecipeFilterState>) => void
  resetFilters: () => void

  // UI Actions
  setSelectedRecipe: (recipe: Recipe | null) => void
  clearError: () => void
}

const defaultFilters: RecipeFilterState = {
  search: '',
  status: 'all',
}

// Simulated in-memory storage
let recipesData = [...mockRecipes]

export const useRecipeStore = create<RecipeState>((set, get) => ({
  // Initial State
  recipes: [],
  selectedRecipe: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,

  // Fetch all recipes - NOW USES SUPABASE WITH MOCK FALLBACK
  fetchRecipes: async () => {
    set({ isLoading: true, error: null })
    try {
      if (USE_SUPABASE) {
        try {
          const recipes = await recipeApi.getRecipes()
          // If no recipes in DB, use mock data
          if (recipes.length === 0) {
            console.log('No recipes in Supabase, using mock data')
            set({ recipes: recipesData, isLoading: false })
          } else {
            set({ recipes, isLoading: false })
          }
          return
        } catch (supabaseError) {
          console.warn('Supabase error, falling back to mock data:', supabaseError)
        }
      }
      // Fallback: use mock data
      await delay(300)
      set({ recipes: recipesData, isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถโหลดข้อมูลสูตรได้', isLoading: false })
    }
  },


  // Get single recipe
  getRecipe: async (id: string) => {
    try {
      await delay(200)
      const recipe = recipesData.find(r => r.id === id)
      if (recipe) {
        set({ selectedRecipe: recipe })
      }
      return recipe || null
    } catch {
      set({ error: 'ไม่พบสูตรที่ต้องการ' })
      return null
    }
  },

  // Create new recipe
  createRecipe: async (input: CreateRecipeInput) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)

      const now = new Date().toISOString().split('T')[0]
      const newRecipe: Recipe = {
        id: generateId(),
        ...input,
        status: input.status || 'DRAFT',
        version: 1,
        validFrom: now,
        validTo: null,
        ingredients: input.ingredients.map((ing, idx) => ({
          ...ing,
          id: generateId(),
          lineNo: idx + 1,
          itemId: ing.itemId || `item-${ing.code}`,
        })),
        createdAt: now,
        updatedAt: now,
      }

      recipesData = [newRecipe, ...recipesData]
      set({ recipes: recipesData, isLoading: false })

      return newRecipe
    } catch {
      set({ error: 'ไม่สามารถสร้างสูตรได้', isLoading: false })
      throw new Error('Failed to create recipe')
    }
  },

  // Update recipe - NOW USES SUPABASE
  updateRecipe: async (id: string, input: UpdateRecipeInput) => {
    set({ isLoading: true, error: null })
    try {
      if (USE_SUPABASE) {
        try {
          const updated = await recipeApi.updateRecipe(id, input)
          // Refresh recipes list
          const recipes = await recipeApi.getRecipes()
          set({ recipes, isLoading: false, selectedRecipe: updated })
          return updated
        } catch (supabaseError) {
          console.warn('Supabase update error, falling back to mock:', supabaseError)
        }
      }

      // Fallback to mock data
      await delay(400)
      const idx = recipesData.findIndex(r => r.id === id)
      if (idx === -1) {
        throw new Error('Recipe not found')
      }

      const now = new Date().toISOString().split('T')[0]
      const updated: Recipe = {
        ...recipesData[idx],
        ...input,
        ingredients: input.ingredients
          ? input.ingredients.map((ing, i) => ({
            ...ing,
            id: generateId(),
            lineNo: i + 1,
            itemId: ing.itemId || `item-${ing.code}`,
          }))
          : recipesData[idx].ingredients,
        updatedAt: now,
      }

      recipesData[idx] = updated
      set({ recipes: [...recipesData], isLoading: false, selectedRecipe: updated })

      return updated
    } catch {
      set({ error: 'ไม่สามารถแก้ไขสูตรได้', isLoading: false })
      throw new Error('Failed to update recipe')
    }
  },


  // Duplicate recipe
  duplicateRecipe: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(400)

      const original = recipesData.find(r => r.id === id)
      if (!original) {
        throw new Error('Recipe not found')
      }

      const now = new Date().toISOString().split('T')[0]
      const newRecipe: Recipe = {
        ...original,
        id: generateId(),
        code: `${original.code}-COPY`,
        name: `${original.name} (สำเนา)`,
        status: 'DRAFT',
        version: 1,
        validFrom: now,
        validTo: null,
        ingredients: original.ingredients.map(ing => ({
          ...ing,
          id: generateId(),
        })),
        createdAt: now,
        updatedAt: now,
      }

      recipesData = [newRecipe, ...recipesData]
      set({ recipes: recipesData, isLoading: false })

      return newRecipe
    } catch {
      set({ error: 'ไม่สามารถคัดลอกสูตรได้', isLoading: false })
      throw new Error('Failed to duplicate recipe')
    }
  },

  // Delete (set to OBSOLETE)
  deleteRecipe: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await delay(300)

      const idx = recipesData.findIndex(r => r.id === id)
      if (idx === -1) {
        throw new Error('Recipe not found')
      }

      const now = new Date().toISOString().split('T')[0]
      recipesData[idx] = {
        ...recipesData[idx],
        status: 'OBSOLETE',
        validTo: now,
        updatedAt: now,
      }

      set({ recipes: [...recipesData], isLoading: false })
    } catch {
      set({ error: 'ไม่สามารถลบสูตรได้', isLoading: false })
    }
  },

  // Set filters
  setFilters: (filters: Partial<RecipeFilterState>) => {
    set(state => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  // Reset filters
  resetFilters: () => {
    set({ filters: defaultFilters })
  },

  // Set selected recipe
  setSelectedRecipe: (recipe: Recipe | null) => {
    set({ selectedRecipe: recipe })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))

// ==========================================
// Selector Hooks
// ==========================================

export const useFilteredRecipes = () => {
  const recipes = useRecipeStore(state => state.recipes)
  const filters = useRecipeStore(state => state.filters)

  return recipes.filter(recipe => {
    // Filter by search
    const searchLower = filters.search.toLowerCase()
    const matchSearch = !filters.search ||
      recipe.name.toLowerCase().includes(searchLower) ||
      recipe.code.toLowerCase().includes(searchLower)

    // Filter by status
    const matchStatus = filters.status === 'all' || recipe.status === filters.status

    return matchSearch && matchStatus
  })
}

// ==========================================
// Cost Calculation Helpers
// ==========================================

export function calculateIngredientCost(qty: number, scrap: number, cost: number): { qtyWithScrap: number; totalCost: number } {
  const qtyWithScrap = qty * (1 + scrap / 100)
  const totalCost = qtyWithScrap * cost
  return { qtyWithScrap, totalCost }
}

export function calculateRecipeCost(recipe: Recipe): { totalMaterialCost: number; costPerUnit: number } {
  const totalMaterialCost = recipe.ingredients.reduce((sum, ing) => {
    const { totalCost } = calculateIngredientCost(ing.qty, ing.scrap, ing.cost)
    return sum + totalCost
  }, 0)

  const costPerUnit = recipe.outputQty > 0 ? totalMaterialCost / recipe.outputQty : 0

  return { totalMaterialCost, costPerUnit }
}
