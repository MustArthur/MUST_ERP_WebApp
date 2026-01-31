'use client'

import { RecipeStatus } from '@/types/recipe'
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: RecipeStatus
}

const statusConfig: Record<RecipeStatus, { label: string; variant: 'default' | 'success' | 'destructive' | 'secondary' }> = {
  DRAFT: { label: 'ร่าง', variant: 'secondary' },
  ACTIVE: { label: 'ใช้งาน', variant: 'success' },
  OBSOLETE: { label: 'ยกเลิก', variant: 'destructive' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}
