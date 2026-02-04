'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'

interface DataPoint {
    name: string
    value: number
    color?: string
}

interface SimpleBarChartProps {
    title: string
    data: DataPoint[]
    dataKey?: string
    color?: string
    height?: number
    showColors?: boolean
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function SimpleBarChart({
    title,
    data,
    dataKey = 'value',
    color = '#3b82f6',
    height = 200,
    showColors = false,
}: SimpleBarChartProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                    >
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
                        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
                            {showColors
                                ? data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color || COLORS[index % COLORS.length]}
                                    />
                                ))
                                : data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
                                ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
