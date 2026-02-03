'use client'

import { QCTemplate, TemplateType, TemplateStatus } from '@/types/quality'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  FileText,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react'

interface TemplateTableProps {
  templates: QCTemplate[]
  onView: (template: QCTemplate) => void
  onEdit: (template: QCTemplate) => void
  onDelete: (template: QCTemplate) => void
}

const typeLabels: Record<TemplateType, string> = {
  RAW_MATERIAL: 'วัตถุดิบ',
  SEMI_FINISHED: 'กึ่งสำเร็จรูป',
  FINISHED_GOOD: 'สินค้าสำเร็จรูป',
  PROCESS: 'กระบวนการ',
}

const typeColors: Record<TemplateType, string> = {
  RAW_MATERIAL: 'bg-blue-100 text-blue-800',
  SEMI_FINISHED: 'bg-yellow-100 text-yellow-800',
  FINISHED_GOOD: 'bg-green-100 text-green-800',
  PROCESS: 'bg-purple-100 text-purple-800',
}

const statusConfig: Record<TemplateStatus, { label: string; color: string; icon: any }> = {
  ACTIVE: { label: 'ใช้งาน', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  INACTIVE: { label: 'ปิดใช้งาน', color: 'bg-gray-100 text-gray-800', icon: Clock },
  DRAFT: { label: 'ร่าง', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
}

export function TemplateTable({ templates, onView, onEdit, onDelete }: TemplateTableProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">ไม่พบ QC Template</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[140px]">รหัส</TableHead>
            <TableHead>ชื่อ Template</TableHead>
            <TableHead className="w-[120px]">ประเภท</TableHead>
            <TableHead className="w-[100px] text-center">พารามิเตอร์</TableHead>
            <TableHead className="w-[80px] text-center">CCP</TableHead>
            <TableHead className="w-[100px]">สถานะ</TableHead>
            <TableHead className="w-[80px] text-center">Version</TableHead>
            <TableHead className="w-[140px] text-right">การจัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => {
            const status = statusConfig[template.status]
            const StatusIcon = status.icon
            const ccpCount = template.parameters.filter(p => p.isCritical).length

            return (
              <TableRow
                key={template.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onView(template)}
              >
                <TableCell className="font-mono text-sm">{template.code}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    {template.description && (
                      <p className="text-sm text-gray-500 truncate max-w-[300px]">
                        {template.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={typeColors[template.type]}>
                    {typeLabels[template.type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">{template.parameters.length}</span>
                </TableCell>
                <TableCell className="text-center">
                  {ccpCount > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 font-medium">{ccpCount}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={cn('flex items-center gap-1 w-fit', status.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-gray-600">v{template.version}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onView(template)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(template)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(template)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
