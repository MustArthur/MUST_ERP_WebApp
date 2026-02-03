'use client'

import { Card, CardContent } from '@/components/ui/card'
import { DeliverySummary } from '@/types/delivery'
import { ShoppingCart, Truck, CheckCircle, Thermometer, Clock } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface DeliveryStatsCardsProps {
  summary: DeliverySummary
}

export function DeliveryStatsCards({ summary }: DeliveryStatsCardsProps) {
  const cards = [
    {
      title: 'คำสั่งซื้อรอดำเนินการ',
      value: formatNumber(summary.pendingOrders),
      unit: 'รายการ',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'กำลังจัดส่ง',
      value: formatNumber(summary.inTransit),
      unit: 'รายการ',
      icon: Truck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'ส่งสำเร็จวันนี้',
      value: formatNumber(summary.deliveredToday),
      unit: 'รายการ',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Cold Chain Compliant',
      value: summary.onTimeDeliveryRate.toFixed(1),
      unit: '%',
      icon: Thermometer,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      subtitle: `${summary.coldChainViolations} การละเมิด`,
      alert: summary.coldChainViolations > 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className={card.alert ? 'border-red-300' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold">{card.value}</span>
                    <span className="text-sm text-muted-foreground">{card.unit}</span>
                  </div>
                  {card.subtitle && (
                    <p className={`text-xs mt-1 ${card.alert ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {card.subtitle}
                    </p>
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
