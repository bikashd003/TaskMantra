'use client'

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis } from 'recharts'

import {
    Card,
    CardContent,
    CardFooter,
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
        <Card className="shadow-lg rounded-lg w-full bg-white border-none">
            <CardContent className="p-2">
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={8}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                                fontSize={12}
                                fontWeight={500}
                            />
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar
                                dataKey="desktop"
                                stackId="a"
                                fill="var(--color-desktop)"
                                radius={[0, 0, 4, 4]}
                            />
                            <Bar
                                dataKey="mobile"
                                stackId="a"
                                fill="var(--color-mobile)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none text-primary">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground text-xs">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter>
        </Card>
    )
}
