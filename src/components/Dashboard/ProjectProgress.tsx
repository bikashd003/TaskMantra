'use client'

import * as React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Label, Pie, PieChart, ResponsiveContainer } from 'recharts'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartTooltip,
} from '@/components/ui/chart'

const chartData = [
    { name: 'Completed', value: 63, fill: '#22c55e' },
    { name: 'In Progress', value: 27, fill: '#3b82f6' },
    { name: 'Pending', value: 10, fill: '#f59e0b' },
]


export function ProjectProgress() {
    const totalTasks = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.value, 0)
    }, [])

    return (
        <Card className="flex flex-col bg-gradient-to-br from-white to-gray-50 border-none shadow-md">
            <CardHeader className="space-y-1 pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Project Overview
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            Task Distribution
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-green-600">+12.5%</span>
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg bg-white p-2 shadow-md border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                                                    <span className="font-medium">{payload[0].name}</span>
                                                </div>
                                                <div className="text-lg font-semibold">
                                                    {payload[0].value} Tasks
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={2}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                            return (
                                                <g>
                                                    <text
                                                        x={viewBox.cx}
                                                        y={(viewBox?.cy ?? 0) - 10}
                                                        textAnchor="middle"
                                                        className="fill-gray-900 text-3xl font-bold"
                                                    >
                                                        {totalTasks}
                                                    </text>
                                                    <text
                                                        x={viewBox.cx}
                                                        y={(viewBox?.cy ?? 0) + 20}
                                                        textAnchor="middle"
                                                        className="fill-gray-500 text-sm"
                                                    >
                                                        Total Tasks
                                                    </text>
                                                </g>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <div className="grid grid-cols-3 gap-4 w-full">
                    {chartData.map((item) => (
                        <div key={item.name} className="flex flex-col items-center p-2 rounded-lg bg-white shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                <span className="text-sm font-medium text-gray-600">{item.name}</span>
                            </div>
                            <span className="text-lg font-semibold">{item.value}</span>
                        </div>
                    ))}
                </div>
            </CardFooter>
        </Card>
    )
}

