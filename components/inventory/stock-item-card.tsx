'use client'

import { StockItemWithBalance } from '@/types/inventory'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  Package,
  AlertTriangle,
  Clock,
  Eye,
  ArrowUpDown,
} from 'lucide-react'

interface StockItemCardProps {
  item: StockItemWithBalance
  onView: (item: StockItemWithBalance) => void
  onTransfer?: (item: StockItemWithBalance) => void
}

export function StockItemCard({ item, onView, onTransfer }: StockItemCardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'RAW_MATERIAL':
        return 'วัตถุดิบ'
      case 'SEMI_FINISHED':
        return 'กึ่งสำเร็จรูป'
      case 'FINISHED_GOOD':
        return 'สินค้าสำเร็จรูป'
      case 'PACKAGING':
        return 'บรรจุภัณฑ์'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RAW_MATERIAL':
        return 'bg-blue-100 text-blue-800'
      case 'SEMI_FINISHED':
        return 'bg-yellow-100 text-yellow-800'
      case 'FINISHED_GOOD':
        return 'bg-green-100 text-green-800'
      case 'PACKAGING':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate stock level percentage
  const stockLevel = item.maxStock
    ? Math.min((item.totalQty / item.maxStock) * 100, 100)
    : 50

  const getStockStatus = () => {
    if (item.isLowStock) return { label: 'สต็อกต่ำ', color: 'text-red-600' }
    if (stockLevel > 80) return { label: 'สต็อกสูง', color: 'text-green-600' }
    return { label: 'ปกติ', color: 'text-gray-600' }
  }

  const stockStatus = getStockStatus()

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        item.isLowStock && 'border-red-300',
        item.isExpiringSoon && !item.isLowStock && 'border-orange-300'
      )}
      onClick={() => onView(item)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'p-2 rounded-lg',
                item.isLowStock ? 'bg-red-100' : 'bg-gray-100'
              )}
            >
              <Package
                className={cn(
                  'w-5 h-5',
                  item.isLowStock ? 'text-red-600' : 'text-gray-600'
                )}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.code}</p>
            </div>
          </div>
          <Badge className={getTypeColor(item.type)}>
            {getTypeLabel(item.type)}
          </Badge>
        </div>

        {/* Alerts */}
        <div className="flex flex-wrap gap-2 mb-3">
          {item.isLowStock && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>สต็อกต่ำกว่า {item.minStock} {item.uom}</span>
            </div>
          )}
          {item.isExpiringSoon && (
            <div className="flex items-center gap-1 text-sm text-orange-600">
              <Clock className="w-4 h-4" />
              <span>มีสินค้าใกล้หมดอายุ</span>
            </div>
          )}
        </div>

        {/* Stock Level */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className={stockStatus.color}>{stockStatus.label}</span>
            <span className="text-gray-600">
              {formatNumber(item.totalQty)} / {formatNumber(item.maxStock || 0)} {item.uom}
            </span>
          </div>
          <Progress
            value={stockLevel}
            className={cn(
              'h-2',
              item.isLowStock && '[&>div]:bg-red-500',
              !item.isLowStock && stockLevel > 80 && '[&>div]:bg-green-500'
            )}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">คงเหลือ</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(item.totalQty)} <span className="text-sm font-normal">{item.uom}</span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">มูลค่า</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(item.totalQty * item.costPerUnit)}
            </p>
          </div>
        </div>

        {/* Batch info */}
        {item.hasBatch && (
          <p className="text-sm text-gray-500 mb-3">
            {item.balances.length} Lot/Batch
          </p>
        )}

        {/* QC Required */}
        {item.requiresQC && (
          <Badge variant="outline" className="text-xs mb-3">
            ต้องตรวจ QC
          </Badge>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              onView(item)
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            รายละเอียด
          </Button>
          {onTransfer && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onTransfer(item)
              }}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
