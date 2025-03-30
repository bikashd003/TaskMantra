'use client'

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis } from 'recharts'

import {
    Card,
    CardContent,
} from '@/components/ui/card'
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'

const chartData = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 },
]

const chartConfig = {
    desktop: {
        label: 'Desktop',
        color: 'hsl(var(--chart-1))',
    },
    mobile: {
        label: 'Mobile',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig

export function ActivityChart() {
    return (
        <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-md overflow-hidden h-[calc(40vh-5.5rem)]">
            <CardContent className="pt-6 px-6 pb-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-semibold text-foreground">Activity Overview</h3>
                        <p className="text-sm text-muted-foreground mt-1">Monthly visitor statistics</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">+5.2%</span>
                    </div>
                </div>

                <div className="h-[300px]">
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    stroke="hsl(var(--muted))"
                                    opacity={0.4}
                                />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                    fontSize={12}
                                    fontWeight={500}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <ChartTooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <ChartLegend
                                    content={<ChartLegendContent />}
                                    wrapperStyle={{ paddingTop: '20px' }}
                                />
                                <Bar
                                    dataKey="desktop"
                                    stackId="a"
                                    fill="var(--color-desktop)"
                                    radius={[4, 4, 0, 0]}
                                    barSize={24}
                                />
                                <Bar
                                    dataKey="mobile"
                                    stackId="a"
                                    fill="var(--color-mobile)"
                                    radius={[0, 0, 4, 4]}
                                    barSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}
