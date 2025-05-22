'use client';

import { useMemo } from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskService } from '@/services/Task.service';
import { useTaskStore } from '@/stores/taskStore';
import { cn } from '@/lib/utils';

const chartConfig = {
  completed: {
    label: 'Completed',
    color: 'hsl(142 76% 36%)',
  },
  inProgress: {
    label: 'In Progress',
    color: 'hsl(48 96% 53%)',
  },
  review: {
    label: 'Review',
    color: 'hsl(213 94% 68%)',
  },
  todo: {
    label: 'To Do',
    color: 'hsl(215 20% 65%)',
  },
} satisfies ChartConfig;

interface ChartDataItem {
  month: string;
  fullMonth: string;
  completed: number;
  inProgress: number;
  review: number;
  todo: number;
  total: number;
}
const ChartSkeleton = () => (
  <div className="h-[260px] w-full">
    <div className="flex items-end justify-between h-full gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex-1">
          <Skeleton
            className="w-full rounded-md bg-muted/40"
            style={{ height: `${Math.max(50, 150 * Math.random())}px` }}
          />
        </div>
      ))}
    </div>
  </div>
);

export function ActivityChart() {
  const { tasks, setTasks } = useTaskStore();
  const { isLoading } = useQuery({
    queryKey: ['activity-chart-tasks'],
    queryFn: async () => {
      const promises: Promise<any[]>[] = [];

      // Get data for all 12 months
      for (let i = 11; i >= 0; i--) {
        const targetMonth = subMonths(new Date(), i);
        const monthStart = startOfMonth(targetMonth);
        const monthEnd = endOfMonth(targetMonth);

        promises.push(
          TaskService.getAllTasks({
            dateRange: {
              from: format(monthStart, 'yyyy-MM-dd'),
              to: format(monthEnd, 'yyyy-MM-dd'),
            },
          })
        );
      }
      const results = await Promise.all(promises);
      const allTasks = results.flat();
      setTasks(allTasks);

      return allTasks;
    },
  });

  const { chartData, completionRate, trend } = useMemo(() => {
    const monthsData: ChartDataItem[] = [];
    let totalTasksCount = 0;
    let totalCompleted = 0;
    let recentMonthsCompleted = 0;
    let olderMonthsCompleted = 0;

    // Group tasks by month for the chart (12 months)
    for (let i = 11; i >= 0; i--) {
      const targetMonth = subMonths(new Date(), i);
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);

      // Filter tasks for this month
      const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate >= monthStart && taskDate <= monthEnd;
      });

      // Count tasks by status
      const completed = monthTasks.filter(task => task.status === 'Completed').length;
      const inProgress = monthTasks.filter(task => task.status === 'In Progress').length;
      const review = monthTasks.filter(task => task.status === 'Review').length;
      const todo = monthTasks.filter(task => task.status === 'To Do').length;
      const total = monthTasks.length;

      // Add to total tasks count
      totalTasksCount += total;
      totalCompleted += completed;

      // Track trend (last 3 months vs previous 3 months)
      if (i <= 2) {
        recentMonthsCompleted += completed;
      } else if (i >= 9) {
        olderMonthsCompleted += completed;
      }

      monthsData.push({
        month: format(targetMonth, 'MMM'),
        fullMonth: format(targetMonth, 'MMMM yyyy'),
        completed,
        inProgress,
        review,
        todo,
        total,
      });
    }

    // Calculate completion rate and trend
    const rate = totalTasksCount > 0 ? ((totalCompleted / totalTasksCount) * 100).toFixed(1) : '0';
    const trendDirection = recentMonthsCompleted >= olderMonthsCompleted ? 'up' : 'down';

    return {
      chartData: monthsData,
      completionRate: rate,
      totalTasks: totalTasksCount,
      trend: trendDirection,
    };
  }, [tasks]);

  return (
    <Card className={cn('theme-surface-elevated h-full')}>
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CardTitle className="theme-text-primary text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Task Activity Overview
              </CardTitle>
              {!isLoading && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <TrendingUp
                    className={cn(
                      'h-3.5 w-3.5',
                      trend === 'up' ? 'text-green-600' : 'text-orange-500'
                    )}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {trend === 'up' ? 'Trending Up' : 'Mixed Trend'}
                  </span>
                </div>
              )}
            </div>
          </div>
          {!isLoading && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200/60 shadow-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {completionRate}% Complete
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-1 px-4 pb-3 flex flex-col flex-1 min-h-0">
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <div className="space-y-4">
            <div className="h-[260px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(142 76% 36%)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(142 76% 36%)" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="inProgressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(48 96% 53%)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(48 96% 53%)" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(213 94% 68%)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(213 94% 68%)" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="todoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(215 20% 65%)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(215 20% 65%)" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="2 4"
                      stroke="hsl(220 13% 91%)"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={16}
                      axisLine={false}
                      fontSize={11}
                      fontWeight={500}
                      stroke="hsl(215 25% 46%)"
                      opacity={0.8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      fontWeight={500}
                      stroke="hsl(215 25% 46%)"
                      opacity={0.8}
                      width={35}
                    />
                    <ChartTooltip
                      cursor={{
                        fill: 'hsl(220 13% 91%)',
                        opacity: 0.1,
                        radius: 6,
                        stroke: 'hsl(220 13% 91%)',
                        strokeWidth: 1,
                      }}
                      content={
                        <ChartTooltipContent
                          hideLabel={false}
                          labelFormatter={(value, payload) => {
                            const data = payload?.[0]?.payload;
                            return data?.fullMonth || value;
                          }}
                        />
                      }
                    />
                    <ChartLegend
                      content={<ChartLegendContent />}
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '13px',
                      }}
                    />
                    <Bar
                      dataKey="completed"
                      stackId="a"
                      fill="url(#completedGradient)"
                      radius={[0, 0, 0, 0]}
                      barSize={28}
                    />
                    <Bar
                      dataKey="inProgress"
                      stackId="a"
                      fill="url(#inProgressGradient)"
                      radius={[0, 0, 0, 0]}
                      barSize={28}
                    />
                    <Bar
                      dataKey="review"
                      stackId="a"
                      fill="url(#reviewGradient)"
                      radius={[0, 0, 0, 0]}
                      barSize={28}
                    />
                    <Bar
                      dataKey="todo"
                      stackId="a"
                      fill="url(#todoGradient)"
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
