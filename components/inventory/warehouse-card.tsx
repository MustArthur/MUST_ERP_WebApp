'use client'

import { Warehouse, WarehouseWithStock } from '@/types/inventory'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  Warehouse as WarehouseIcon,
  Thermometer,
  AlertTriangle,
  Package,
  Eye,
  Settings,
} from 'lucide-react'

interface WarehouseCardProps {
  warehouse: WarehouseWithStock
  onView: (warehouse: Warehouse) => void
  onEdit?: (warehouse: Warehouse) => void
}

export function WarehouseCard({ warehouse, onView, onEdit }: WarehouseCardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'RAW_MATERIAL':
        return 'วัตถุดิบ'
      case 'WIP':
        return 'ระหว่างผลิต'
      case 'FINISHED_GOODS':
        return 'สินค้าสำเร็จรูป'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RAW_MATERIAL':
        return 'bg-blue-100 text-blue-800'
      case 'WIP':
        return 'bg-yellow-100 text-yellow-800'
      case 'FINISHED_GOODS':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        warehouse.isQuarantine && 'border-red-300 bg-red-50'
      )}
      onClick={() => onView(warehouse)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'p-2 rounded-lg',
                warehouse.isQuarantine ? 'bg-red-100' : 'bg-blue-100'
              )}
            >
              <WarehouseIcon
                className={cn(
                  'w-5 h-5',
                  warehouse.isQuarantine ? 'text-red-600' : 'text-blue-600'
                )}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
              <p className="text-sm text-gray-500">{warehouse.code}</p>
            </div>
          </div>
          <Badge className={getTypeColor(warehouse.type)}>
            {getTypeLabel(warehouse.type)}
          </Badge>
        </div>

        {/* Quarantine Warning */}
        {warehouse.isQuarantine && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700 font-medium">คลังกักกัน</span>
          </div>
        )}

        {/* Temperature Control */}
        {warehouse.temperatureControlled && (
          <div className="flex items-center gap-2 mb-3 text-sm text-blue-600">
            <Thermometer className="w-4 h-4" />
            <span>
              ควบคุมอุณหภูมิ {warehouse.minTemp}°C - {warehouse.maxTemp}°C
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">รายการสินค้า</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(warehouse.stockCount)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">มูลค่ารวม</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(warehouse.totalValue)}
            </p>
          </div>
        </div>

        {/* Alerts */}
        <div className="flex gap-2 mb-3">
          {warehouse.lowStockItems > 0 && (
            <Badge variant="destructive" className="text-xs">
              สต็อกต่ำ {warehouse.lowStockItems}
            </Badge>
          )}
          {warehouse.expiringItems > 0 && (
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
              ใกล้หมดอายุ {warehouse.expiringItems}
            </Badge>
          )}
        </div>

        {/* Location */}
        {warehouse.location && (
          <p className="text-sm text-gray-500 mb-3">{warehouse.location}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              onView(warehouse)
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            ดูสต็อก
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(warehouse)
              }}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
