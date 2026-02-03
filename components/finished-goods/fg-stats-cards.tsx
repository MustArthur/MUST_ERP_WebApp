'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Package, AlertTriangle, Thermometer, Warehouse } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface FGStatsCardsProps {
  stats: {
    totalStock: number
    totalBatches: number
    onHoldCount: number
    expiringSoonCount: number
    expiredCount: number
    avgTemperature: number
    coldRoomUtilization: number
  }
}

export function FGStatsCards({ stats }: FGStatsCardsProps) {
  const cards = [
    {
      title: 'สต็อคพร้อมส่ง',
      value: formatNumber(stats.totalStock),
      unit: 'ขวด',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'รอตรวจ QC',
      value: formatNumber(stats.onHoldCount),
      unit: 'ขวด',
      icon: Warehouse,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'ใกล้หมดอายุ (≤7 วัน)',
      value: formatNumber(stats.expiringSoonCount),
      unit: 'ขวด',
      icon: AlertTriangle,
      color: stats.expiringSoonCount > 0 ? 'text-amber-600' : 'text-gray-500',
      bgColor: stats.expiringSoonCount > 0 ? 'bg-amber-50' : 'bg-gray-50',
      alert: stats.expiringSoonCount > 0,
    },
    {
      title: 'อุณหภูมิเฉลี่ย',
      value: stats.avgTemperature.toFixed(1),
      unit: '°C',
      icon: Thermometer,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      subtitle: `ใช้พื้นที่ ${stats.coldRoomUtilization}%`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className={card.alert ? 'border-amber-300' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold">{card.value}</span>
                    <span className="text-sm text-muted-foreground">{card.unit}</span>
                  </div>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
