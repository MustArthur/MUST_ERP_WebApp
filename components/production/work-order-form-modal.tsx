'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CreateWorkOrderInput } from '@/types/production'
import { Recipe } from '@/types/recipe'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Factory, Calendar, Package, AlertTriangle } from 'lucide-react'

const formSchema = z.object({
  recipeId: z.string().min(1, 'กรุณาเลือกสูตร'),
  plannedQty: z.coerce.number().min(1, 'จำนวนต้องมากกว่า 0'),
  plannedDate: z.string().min(1, 'กรุณาเลือกวันที่'),
  remarks: z.string().optional(),
})

interface WorkOrderFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateWorkOrderInput) => void
  recipes: Recipe[]
}

export function WorkOrderFormModal({
  isOpen,
  onClose,
  onSave,
  recipes,
}: WorkOrderFormModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeId: '',
      plannedQty: 100,
      plannedDate: new Date().toISOString().split('T')[0],
      remarks: '',
    },
  })

  const selectedRecipeId = form.watch('recipeId')
  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId)

  // Determine if recipe is chicken-based (has CCP operations)
  const isChickenRecipe = selectedRecipe?.code.startsWith('BOM-CK')

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onSave(data)
    form.reset()
    onClose()
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            สร้างใบสั่งผลิต
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Recipe Selection */}
            <FormField
              control={form.control}
              name="recipeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สูตร/สินค้า *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสูตรการผลิต" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {recipes
                        .filter((r) => r.status === 'ACTIVE')
                        .map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            <div className="flex items-center gap-2">
                              <span>{recipe.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {recipe.outputItemCode}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recipe Info */}
            {selectedRecipe && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">รหัสสูตร: </span>
                    <span className="font-medium">{selectedRecipe.code}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ขนาด Batch: </span>
                    <span className="font-medium">
                      {selectedRecipe.batchSize} {selectedRecipe.outputUom}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">เวลาโดยประมาณ: </span>
                    <span className="font-medium">{selectedRecipe.estimatedTime} นาที</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Yield: </span>
                    <span className="font-medium">{selectedRecipe.expectedYield}%</span>
                  </div>
                </div>

                {/* CCP Warning for Chicken recipes */}
                {isChickenRecipe && (
                  <div className="mt-3 flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs">
                      สูตรนี้มี CCP 2 จุด: นึ่งไก่ (≥72°C) และ พาสเจอร์ไรซ์ (≥72°C, 15s)
                    </span>
                  </div>
                )}

                {!isChickenRecipe && selectedRecipe && (
                  <div className="mt-3 flex items-center gap-2 text-blue-700 bg-blue-50 p-2 rounded">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs">
                      สูตรนี้มี CCP 1 จุด: พาสเจอร์ไรซ์ (≥72°C, 15s)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Planned Quantity */}
            <FormField
              control={form.control}
              name="plannedQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวนที่ต้องการผลิต (ขวด) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        min={1}
                        className="pl-10"
                        placeholder="100"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {selectedRecipe &&
                      `≈ ${Math.ceil(
                        (field.value || 0) / selectedRecipe.batchSize
                      )} batch ตามสูตร`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Planned Date */}
            <FormField
              control={form.control}
              name="plannedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันที่วางแผนผลิต *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input type="date" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุ</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                ยกเลิก
              </Button>
              <Button type="submit">
                <Factory className="w-4 h-4 mr-2" />
                สร้างใบสั่งผลิต
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
