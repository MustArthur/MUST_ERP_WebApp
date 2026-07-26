'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

export interface LineSeries {
    key: string
    name: string
    color: string
}

interface MultiLineChartProps {
    title: string
    data: Record<string, string | number | undefined>[]
    series: LineSeries[]
    height?: number
    yDomain?: [number, number]
    /** Show the value as a text label only at points where it changed from the previous point of that series. */
    labelOnChange?: boolean
}

/**
 * Indices (per series) where the value first appears or differs from the prior data point.
 * Recharts strips non-SVG fields like `payload` before a custom label function sees its props,
 * so matching has to go through the point's `index` rather than the underlying data row.
 */
function computeChangeIndices(data: Record<string, string | number | undefined>[], key: string): Set<number> {
    const indices = new Set<number>()
    let lastValue: string | number | undefined
    data.forEach((row, i) => {
        const value = row[key]
        if (value === undefined || value === null) return
        if (lastValue === undefined || value !== lastValue) {
            indices.add(i)
        }
        lastValue = value
    })
    return indices
}

export function MultiLineChart({ title, data, series, height = 200, yDomain, labelOnChange = false }: MultiLineChartProps) {
    const changeIndicesBySeries = useMemo(() => {
        if (!labelOnChange) return {}
        const map: Record<string, Set<number>> = {}
        for (const s of series) {
            map[s.key] = computeChangeIndices(data, s.key)
        }
        return map
    }, [data, series, labelOnChange])

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
                            domain={yDomain}
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
                        {series.map(s => (
                            <Line
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.name}
                                stroke={s.color}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                connectNulls={false}
                                label={
                                    labelOnChange
                                        ? (props: any) => {
                                            const { x, y, value, index } = props
                                            if (value === undefined || value === null) return null
                                            if (!changeIndicesBySeries[s.key]?.has(index)) return null
                                            return (
                                                <text
                                                    x={x}
                                                    y={y - 10}
                                                    fill={s.color}
                                                    fontSize={11}
                                                    fontWeight={600}
                                                    textAnchor="middle"
                                                >
                                                    {value}
                                                </text>
                                            )
                                        }
                                        : undefined
                                }
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
