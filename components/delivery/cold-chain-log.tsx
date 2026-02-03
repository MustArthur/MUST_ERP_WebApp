'use client'

import { TemperatureLog, TemperatureAlert } from '@/types/delivery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Thermometer, AlertTriangle, CheckCircle } from 'lucide-react'

interface ColdChainLogProps {
  logs: TemperatureLog[]
  alerts: TemperatureAlert[]
  avgTemperature?: number
  minTemperature?: number
  maxTemperature?: number
  compliant: boolean
}

export function ColdChainLog({
  logs,
  alerts,
  avgTemperature,
  minTemperature,
  maxTemperature,
  compliant,
}: ColdChainLogProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTempColor = (temp: number) => {
    if (temp < 2) return 'text-blue-600'
    if (temp > 8) return 'text-red-600'
    return 'text-cyan-600'
  }

  const getTempBgColor = (temp: number) => {
    if (temp < 2) return 'bg-blue-100'
    if (temp > 8) return 'bg-red-100'
    return 'bg-cyan-100'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Thermometer className="h-4 w-4" />
            Cold Chain Tracking
          </CardTitle>
          <Badge
            variant={compliant ? 'default' : 'destructive'}
            className="gap-1"
          >
            {compliant ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Compliant
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                Violation
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Temperature Summary */}
        <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">ต่ำสุด</p>
            <p className={`text-lg font-bold ${getTempColor(minTemperature || 0)}`}>
              {minTemperature?.toFixed(1) || '-'}°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">เฉลี่ย</p>
            <p className={`text-lg font-bold ${getTempColor(avgTemperature || 0)}`}>
              {avgTemperature?.toFixed(1) || '-'}°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">สูงสุด</p>
            <p className={`text-lg font-bold ${getTempColor(maxTemperature || 0)}`}>
              {maxTemperature?.toFixed(1) || '-'}°C
            </p>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              การแจ้งเตือนอุณหภูมิ
            </p>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-2 rounded-lg ${
                  alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                } border`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Badge
                      variant={alert.severity === 'CRITICAL' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.type === 'HIGH' ? 'อุณหภูมิสูง' : 'อุณหภูมิต่ำ'}
                    </Badge>
                    <p className="text-sm mt-1">
                      วัดได้ <span className="font-bold">{alert.temperature}°C</span>
                      {' '}(เกณฑ์: {alert.type === 'HIGH' ? '≤8°C' : '≥2°C'})
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
                {alert.action && (
                  <p className="text-xs text-muted-foreground mt-1">
                    การแก้ไข: {alert.action}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Temperature Log Timeline */}
        <div className="space-y-2">
          <p className="text-sm font-medium">บันทึกอุณหภูมิ</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                ยังไม่มีการบันทึกอุณหภูมิ
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${getTempBgColor(log.temperature)}`}>
                      <Thermometer className={`h-3 w-3 ${getTempColor(log.temperature)}`} />
                    </div>
                    <span className={`font-medium ${getTempColor(log.temperature)}`}>
                      {log.temperature.toFixed(1)}°C
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {log.source === 'MANUAL' ? 'Manual' : 'IoT'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-sm">{formatTime(log.timestamp)}</span>
                    {log.recordedBy && (
                      <p className="text-xs text-muted-foreground">{log.recordedBy}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
