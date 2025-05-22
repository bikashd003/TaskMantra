'use client';

import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Label, Pie, PieChart, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartTooltip } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { TaskService } from '@/services/Task.service';
import { TaskStatus } from '../Tasks/types';

// Status color mapping
const statusColors = {
  Completed: '#22c55e',
  'In Progress': '#3b82f6',
  'To Do': '#f59e0b',
  Review: '#8b5cf6',
};

export function ProjectProgress() {
  // Fetch tasks data
  const {
    data: tasksData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['project-progress-tasks'],
    queryFn: async () => {
      return await TaskService.getAllTasks({});
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Process tasks data for the chart
  const chartData = React.useMemo(() => {
    if (!tasksData || tasksData.length === 0) return [];

    // Group tasks by status
    const statusCounts: Record<string, number> = {};

    tasksData.forEach(task => {
      const status = task.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Convert to chart data format
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      fill: statusColors[status as TaskStatus] || '#64748b', // Default color if status not in mapping
    }));
  }, [tasksData]);

  // Calculate total tasks
  const totalTasks = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.value, 0),
    [chartData]
  );

  // Calculate completion percentage
  const completedPercentage = React.useMemo(() => {
    if (totalTasks === 0) return 0;
    const completedTasks = chartData.find(item => item.name === 'Completed')?.value || 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }, [chartData, totalTasks]);

  // Skeleton component for loading state
  const ChartSkeleton = () => (
    <Card className="flex flex-col theme-surface-elevated h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold theme-text-primary">Project Overview</CardTitle>
            <CardDescription className="text-sm theme-text-secondary">
              Task Distribution
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-3 w-3" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2 h-full">
        <div className="h-full w-full flex items-center justify-center">
          {/* Circular chart skeleton */}
          <div className="relative">
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
            {/* Center content skeleton */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full">
          {/* Legend skeleton items */}
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4 w-6" />
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );

  // Handle loading state
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <Card className="flex flex-col theme-surface-elevated h-full">
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-xl font-bold theme-text-primary">Project Overview</CardTitle>
            <CardDescription className="text-sm theme-text-secondary">
              Task Distribution
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2 h-full flex items-center justify-center">
          <div className="text-destructive">Error loading task data</div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty data state
  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col theme-surface-elevated h-full">
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-xl font-bold theme-text-primary">Project Overview</CardTitle>
            <CardDescription className="text-sm theme-text-secondary">
              Task Distribution
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2 h-full flex items-center justify-center">
          <div className="theme-text-secondary">No tasks found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col theme-surface-elevated h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold theme-text-primary">Project Overview</CardTitle>
            <CardDescription className="text-sm theme-text-secondary">
              Task Distribution
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 theme-badge-success">
            <span className="text-xs font-semibold">{completedPercentage}%</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2 h-full">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) =>
                  active && payload && payload.length ? (
                    <div className="rounded-md theme-surface-elevated p-2 theme-shadow-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: payload[0].payload.fill }}
                        />
                        <span className="font-medium theme-text-primary">{payload[0].name}</span>
                      </div>
                      <div className="text-base font-semibold theme-text-primary">
                        {payload[0].value} Tasks
                      </div>
                      <div className="text-sm theme-text-secondary">
                        {Math.round((Number(payload[0].value) / totalTasks) * 100)}% of total
                      </div>
                    </div>
                  ) : null
                }
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
                  content={({ viewBox }) =>
                    viewBox && 'cx' in viewBox && 'cy' in viewBox ? (
                      <g>
                        <text
                          x={viewBox.cx}
                          y={(viewBox?.cy ?? 0) - 5}
                          textAnchor="middle"
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalTasks}
                        </text>
                        <text
                          x={viewBox.cx}
                          y={(viewBox?.cy ?? 0) + 15}
                          textAnchor="middle"
                          className="fill-muted-foreground text-xs"
                        >
                          Total Tasks
                        </text>
                      </g>
                    ) : null
                  }
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full">
          {chartData.map(item => (
            <div key={item.name} className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-xs font-medium theme-text-secondary">{item.name}</span>
              </div>
              <span className="text-sm font-semibold theme-text-primary">{item.value}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
