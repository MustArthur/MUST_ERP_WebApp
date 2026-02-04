'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    unit?: string
    icon: LucideIcon
    color: string
    bgColor: string
    subtitle?: string
    trend?: {
        value: number
        isUp: boolean
    }
    alert?: boolean
}

export function StatsCard({
    title,
    value,
    unit,
    icon: Icon,
    color,
    bgColor,
    subtitle,
    trend,
    alert
}: StatsCardProps) {
    return (
        <Card className={alert ? 'border-amber-300 bg-amber-50/30' : ''}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold">{value}</span>
                            {unit && (
                                <span className="text-sm text-muted-foreground">{unit}</span>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                        )}
                        {trend && (
                            <div className={`flex items-center gap-1 mt-1 text-xs ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.isUp ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                <span>{trend.isUp ? '+' : ''}{trend.value}%</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

interface StatsGridProps {
    children: React.ReactNode
}

export function StatsGrid({ children }: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
        </div>
    )
}
