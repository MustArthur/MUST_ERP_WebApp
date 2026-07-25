'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
} from 'recharts'

export interface BarSeries {
    key: string
    name: string
    color: string
}

interface StackedBarChartProps {
    title: string
    data: Record<string, string | number | undefined>[]
    series: BarSeries[]
    height?: number
    referenceLine?: {
        value: number
        label: string
    }
}

export function StackedBarChart({ title, data, series, height = 200, referenceLine }: StackedBarChartProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
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
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        {series.map((s, index) => (
                            <Bar
                                key={s.key}
                                dataKey={s.key}
                                name={s.name}
                                stackId="stack"
                                fill={s.color}
                                radius={index === series.length - 1 ? [4, 4, 0, 0] : undefined}
                            />
                        ))}
                        {referenceLine && (
                            <ReferenceLine
                                y={referenceLine.value}
                                stroke="#dc2626"
                                strokeDasharray="6 4"
                                strokeWidth={2}
                                label={{
                                    value: referenceLine.label,
                                    position: 'insideTopRight',
                                    fontSize: 11,
                                    fill: '#dc2626',
                                }}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
