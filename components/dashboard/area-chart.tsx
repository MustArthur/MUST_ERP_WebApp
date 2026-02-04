'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

interface DataPoint {
    name: string
    value: number
    [key: string]: string | number
}

interface SimpleAreaChartProps {
    title: string
    data: DataPoint[]
    dataKey?: string
    color?: string
    height?: number
}

export function SimpleAreaChart({
    title,
    data,
    dataKey = 'value',
    color = '#3b82f6',
    height = 200,
}: SimpleAreaChartProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <AreaChart
                        data={data}
                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#gradient-${dataKey})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
