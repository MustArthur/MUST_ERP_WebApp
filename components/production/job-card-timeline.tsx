'use client'

import { JobCard } from '@/types/production'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  AlertTriangle,
  Thermometer,
  ChevronRight,
} from 'lucide-react'

interface JobCardTimelineProps {
  jobCards: JobCard[]
  onStartJobCard?: (jobCard: JobCard) => void
  onCompleteJobCard?: (jobCard: JobCard) => void
  onRecordCCP?: (jobCard: JobCard) => void
}

export function JobCardTimeline({
  jobCards,
  onStartJobCard,
  onCompleteJobCard,
  onRecordCCP,
}: JobCardTimelineProps) {
  const statusConfig = {
    PENDING: {
      label: 'รอดำเนินการ',
      color: 'bg-gray-100 text-gray-600 border-gray-300',
      icon: Clock,
      iconColor: 'text-gray-400',
    },
    IN_PROGRESS: {
      label: 'กำลังดำเนินการ',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-500',
      icon: PlayCircle,
      iconColor: 'text-yellow-500',
    },
    COMPLETED: {
      label: 'เสร็จสิ้น',
      color: 'bg-green-100 text-green-800 border-green-500',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    FAILED: {
      label: 'ล้มเหลว',
      color: 'bg-red-100 text-red-800 border-red-500',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
  }

  return (
    <div className="space-y-0">
      {jobCards.map((jc, index) => {
        const status = statusConfig[jc.status]
        const StatusIcon = status.icon
        const isLast = index === jobCards.length - 1

        // Check if previous operation allows this one to start
        const prevCard = index > 0 ? jobCards[index - 1] : null
        const canStart =
          jc.status === 'PENDING' &&
          (!prevCard ||
            prevCard.status === 'COMPLETED' ||
            (prevCard.isCCP && prevCard.ccpStatus === 'PASSED'))

        // Check if CCP needs to be recorded before completing
        const needsCCPReading = jc.isCCP && jc.status === 'IN_PROGRESS' && jc.ccpStatus === 'PENDING'

        return (
          <div key={jc.id} className="relative">
            {/* Timeline Line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-4 top-10 w-0.5 h-full -translate-x-1/2',
                  jc.status === 'COMPLETED' ? 'bg-green-300' : 'bg-gray-200'
                )}
              />
            )}

            {/* Job Card Item */}
            <div className="flex gap-4 pb-6">
              {/* Status Icon */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2',
                  status.color
                )}
              >
                <StatusIcon className={cn('w-4 h-4', status.iconColor)} />
              </div>

              {/* Content */}
              <div className="flex-1 bg-white rounded-lg border p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{jc.operation?.name || jc.code}</span>
                      {jc.isCCP && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          <Thermometer className="w-3 h-3 mr-1" />
                          CCP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {jc.operation?.code} • ลำดับที่ {jc.sequence}
                    </p>
                  </div>

                  <Badge className={cn('text-xs', status.color)}>{status.label}</Badge>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">แผน: </span>
                    <span>{jc.plannedQty} ขวด</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ทำได้: </span>
                    <span>{jc.completedQty} ขวด</span>
                  </div>
                  {jc.operator && (
                    <div className="col-span-2">
                      <span className="text-gray-500">ผู้ปฏิบัติ: </span>
                      <span>{jc.operator}</span>
                    </div>
                  )}
                  {jc.startTime && (
                    <div>
                      <span className="text-gray-500">เริ่ม: </span>
                      <span>{new Date(jc.startTime).toLocaleTimeString('th-TH')}</span>
                    </div>
                  )}
                  {jc.endTime && (
                    <div>
                      <span className="text-gray-500">เสร็จ: </span>
                      <span>{new Date(jc.endTime).toLocaleTimeString('th-TH')}</span>
                    </div>
                  )}
                </div>

                {/* CCP Readings */}
                {jc.isCCP && jc.ccpReadings.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">บันทึก CCP:</p>
                    {jc.ccpReadings.map((reading) => (
                      <div
                        key={reading.id}
                        className={cn(
                          'flex items-center gap-2 text-sm',
                          reading.passed ? 'text-green-700' : 'text-red-700'
                        )}
                      >
                        {reading.passed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>
                          {reading.temperature !== undefined && `${reading.temperature}°C`}
                          {reading.holdingTime !== undefined && ` • ${reading.holdingTime}s`}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(reading.timestamp).toLocaleTimeString('th-TH')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CCP Warning */}
                {needsCCPReading && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      ต้องบันทึกค่า CCP ก่อนจึงจะปิด Job Card ได้
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {canStart && onStartJobCard && (
                    <Button size="sm" onClick={() => onStartJobCard(jc)}>
                      <PlayCircle className="w-4 h-4 mr-1" />
                      เริ่ม
                    </Button>
                  )}

                  {jc.status === 'IN_PROGRESS' && jc.isCCP && jc.ccpStatus === 'PENDING' && onRecordCCP && (
                    <Button size="sm" variant="outline" onClick={() => onRecordCCP(jc)}>
                      <Thermometer className="w-4 h-4 mr-1" />
                      บันทึก CCP
                    </Button>
                  )}

                  {jc.status === 'IN_PROGRESS' &&
                    (!jc.isCCP || jc.ccpStatus === 'PASSED') &&
                    onCompleteJobCard && (
                      <Button size="sm" variant="default" onClick={() => onCompleteJobCard(jc)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        เสร็จ
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
