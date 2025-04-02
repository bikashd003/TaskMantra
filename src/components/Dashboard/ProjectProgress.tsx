'use client'

import * as React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Label, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartTooltip } from '@/components/ui/chart'

const chartData = [
    { name: 'Completed', value: 63, fill: '#22c55e' },
    { name: 'In Progress', value: 27, fill: '#3b82f6' },
    { name: 'Pending', value: 10, fill: '#f59e0b' },
]

export function ProjectProgress() {
    const totalTasks = React.useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), [])

    return (
        <Card className="flex flex-col bg-gradient-to-br from-white to-gray-50 border-none shadow-lg h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-800">Project Overview</CardTitle>
                        <CardDescription className="text-sm text-gray-500">Task Distribution</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                        <span className="text-xs font-semibold text-green-600">+12.5%</span>
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-2 h-full">
                <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip
                                content={({ active, payload }) => active && payload && payload.length ? (
                                    <div className="rounded-md bg-white p-2 shadow-lg border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                                            <span className="font-medium">{payload[0].name}</span>
                                        </div>
                                        <div className="text-base font-semibold">{payload[0].value} Tasks</div>
                                    </div>
                                ) : null}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={3}
                            >
                                <Label
                                    content={({ viewBox }) => viewBox && 'cx' in viewBox && 'cy' in viewBox ? (
                                        <g>
                                            <text x={viewBox.cx} y={(viewBox?.cy ?? 0) - 5} textAnchor="middle" className="fill-gray-900 text-2xl font-bold">{totalTasks}</text>
                                            <text x={viewBox.cx} y={(viewBox?.cy ?? 0) + 15} textAnchor="middle" className="fill-gray-500 text-xs">Total Tasks</text>
                                        </g>
                                    ) : null}
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <div className="flex justify-between w-full">
                    {chartData.map((item) => (
                        <div key={item.name} className="flex flex-col items-center">
                            <div className="flex items-center gap-1 mb-1">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                                <span className="text-xs font-medium text-gray-600">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold">{item.value}</span>
                        </div>
                    ))}
                </div>
            </CardFooter>
        </Card>
    )
}
