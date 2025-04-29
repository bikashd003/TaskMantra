'use client';

import * as React from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';
import { TaskService } from '@/services/Task.service';
import { TaskStatus } from '@/types/task';

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

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="flex flex-col bg-gradient-to-br from-white to-gray-50 border-none shadow-lg h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Project Overview</CardTitle>
              <CardDescription className="text-sm text-gray-500">Task Distribution</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2 h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="flex flex-col bg-gradient-to-br from-white to-gray-50 border-none shadow-lg h-full">
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">Project Overview</CardTitle>
            <CardDescription className="text-sm text-gray-500">Task Distribution</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2 h-full flex items-center justify-center">
          <div className="text-red-500">Error loading task data</div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty data state
  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col bg-gradient-to-br from-white to-gray-50 border-none shadow-lg h-full">
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">Project Overview</CardTitle>
            <CardDescription className="text-sm text-gray-500">Task Distribution</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2 h-full flex items-center justify-center">
          <div className="text-gray-500">No tasks found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col bg-gradient-to-br from-white to-gray-50 border-none shadow-lg h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">Project Overview</CardTitle>
            <CardDescription className="text-sm text-gray-500">Task Distribution</CardDescription>
          </div>
          <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
            <span className="text-xs font-semibold text-green-600">{completedPercentage}%</span>
            <ArrowUpRight className="h-3 w-3 text-green-600" />
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
                    <div className="rounded-md bg-white p-2 shadow-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: payload[0].payload.fill }}
                        />
                        <span className="font-medium">{payload[0].name}</span>
                      </div>
                      <div className="text-base font-semibold">{payload[0].value} Tasks</div>
                      <div className="text-sm text-gray-500">
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
                          className="fill-gray-900 text-2xl font-bold"
                        >
                          {totalTasks}
                        </text>
                        <text
                          x={viewBox.cx}
                          y={(viewBox?.cy ?? 0) + 15}
                          textAnchor="middle"
                          className="fill-gray-500 text-xs"
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
                <span className="text-xs font-medium text-gray-600">{item.name}</span>
              </div>
              <span className="text-sm font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
