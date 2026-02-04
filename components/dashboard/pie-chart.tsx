'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

interface DataPoint {
    name: string
    value: number
    color?: string
}

interface SimplePieChartProps {
    title: string
    data: DataPoint[]
    height?: number
    showLegend?: boolean
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export function SimplePieChart({
    title,
    data,
    height = 200,
    showLegend = true,
}: SimplePieChartProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color || COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                            formatter={(value) => [`${Number(value).toLocaleString()}`, '']}
                        />
                        {showLegend && (
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
