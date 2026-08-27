'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface SearchableSelectOption {
  value: string
  label: string
  description?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  /** Allow typing a value that isn't in `options` yet and creating it inline */
  creatable?: boolean
  /** Called when the user picks the "+ เพิ่ม..." row for a typed value not in `options` */
  onCreateOption?: (label: string) => void | Promise<void>
  /** Disables the create row and shows a pending state while a create is in flight */
  isCreating?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'เลือก...',
  searchPlaceholder = 'ค้นหา...',
  emptyMessage = 'ไม่พบข้อมูล',
  disabled,
  className,
  creatable = false,
  onCreateOption,
  isCreating = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const lower = search.toLowerCase()
    return options.filter(
      opt =>
        opt.label.toLowerCase().includes(lower) ||
        opt.value.toLowerCase().includes(lower) ||
        opt.description?.toLowerCase().includes(lower)
    )
  }, [options, search])

  const trimmedSearch = search.trim()
  const canCreate =
    creatable &&
    !!onCreateOption &&
    trimmedSearch.length > 0 &&
    !options.some(opt => opt.label.toLowerCase() === trimmedSearch.toLowerCase())

  const handleCreate = async () => {
    if (!onCreateOption || !trimmedSearch) return
    await onCreateOption(trimmedSearch)
    setSearch('')
    setOpen(false)
  }

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 && !canCreate ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm hover:bg-accent',
                    value === option.value && 'bg-accent'
                  )}
                  onClick={() => {
                    onValueChange(option.value)
                    setSearch('')
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {canCreate && (
                <div
                  className={cn(
                    'flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm text-blue-600 hover:bg-accent',
                    isCreating && 'pointer-events-none opacity-50'
                  )}
                  onClick={handleCreate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>{isCreating ? 'กำลังเพิ่ม...' : `เพิ่ม "${trimmedSearch}"`}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
