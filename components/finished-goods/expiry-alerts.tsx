'use client'

import { ExpiryAlert } from '@/types/finished-goods'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface ExpiryAlertsProps {
  alerts: ExpiryAlert[]
  onAcknowledge?: (alertId: string) => void
}

export function ExpiryAlerts({ alerts, onAcknowledge }: ExpiryAlertsProps) {
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged)

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            การแจ้งเตือนหมดอายุ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>ไม่มีสินค้าใกล้หมดอายุ</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={unacknowledgedAlerts.length > 0 ? 'border-amber-300' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle
              className={`h-4 w-4 ${
                unacknowledgedAlerts.length > 0 ? 'text-amber-500' : 'text-muted-foreground'
              }`}
            />
            การแจ้งเตือนหมดอายุ
          </CardTitle>
          {unacknowledgedAlerts.length > 0 && (
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              {unacknowledgedAlerts.length} รายการ
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${
              alert.severity === 'CRITICAL'
                ? 'bg-red-50 border-red-200'
                : alert.severity === 'EXPIRED'
                ? 'bg-gray-100 border-gray-300'
                : 'bg-amber-50 border-amber-200'
            } ${alert.acknowledged ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      alert.severity === 'CRITICAL'
                        ? 'destructive'
                        : alert.severity === 'EXPIRED'
                        ? 'outline'
                        : 'secondary'
                    }
                  >
                    {alert.severity === 'CRITICAL'
                      ? 'ด่วนมาก'
                      : alert.severity === 'EXPIRED'
                      ? 'หมดอายุ'
                      : 'เตือน'}
                  </Badge>
                  <span className="text-sm font-medium">{alert.productName}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lot: {alert.batchNo} | หมดอายุ: {alert.expDate}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">{formatNumber(alert.quantity)}</span> ขวด |{' '}
                  <span
                    className={
                      alert.daysToExpire <= 1
                        ? 'text-red-600 font-medium'
                        : 'text-amber-600'
                    }
                  >
                    เหลือ {alert.daysToExpire} วัน
                  </span>
                </p>
              </div>

              {!alert.acknowledged && onAcknowledge && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAcknowledge(alert.id)}
                >
                  รับทราบ
                </Button>
              )}

              {alert.acknowledged && (
                <div className="text-xs text-muted-foreground text-right">
                  <CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />
                  รับทราบแล้ว
                  <br />
                  <span className="text-[10px]">โดย {alert.acknowledgedBy}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
