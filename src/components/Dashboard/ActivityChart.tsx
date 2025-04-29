'use client';

import { useMemo } from 'react';
import { CheckCircle, Clock, AlertTriangle, BarChart2, PieChart } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isBefore, addDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { TaskService } from '@/services/Task.service';
import { useTaskStore } from '@/stores/taskStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const chartConfig = {
  completed: {
    label: 'Completed',
    color: 'hsl(var(--success))',
  },
  inProgress: {
    label: 'In Progress',
    color: 'hsl(var(--warning))',
  },
  review: {
    label: 'Review',
    color: 'hsl(var(--info))',
  },
  todo: {
    label: 'To Do',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface ChartDataItem {
  month: string;
  completed: number;
  inProgress: number;
  review: number;
  todo: number;
}

export function ActivityChart() {
  const { tasks, setTasks } = useTaskStore();
  const { isLoading } = useQuery({
    queryKey: ['activity-chart-tasks'],
    queryFn: async () => {
      const promises: Promise<any[]>[] = [];

      for (let i = 5; i >= 0; i--) {
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

  const {
    chartData,
    completionRate,
    statusDistribution,
    priorityDistribution,
    timeTrackingData,
    dueDateStats,
  } = useMemo(() => {
    const monthsData: ChartDataItem[] = [];
    let totalTasks = 0;
    let totalCompleted = 0;

    // Status distribution data
    const statusCounts = {
      'To Do': 0,
      'In Progress': 0,
      Review: 0,
      Completed: 0,
    };

    // Priority distribution data
    const priorityCounts = {
      High: 0,
      Medium: 0,
      Low: 0,
    };

    // Time tracking data
    let totalEstimatedTime = 0;
    let totalLoggedTime = 0;

    // Due date analysis
    const today = new Date();
    let overdueCount = 0;
    let dueSoonCount = 0;
    let upcomingCount = 0;
    let completedOnTimeCount = 0;

    // Process all tasks for status and priority distribution
    tasks.forEach(task => {
      // Count by status
      const status = task.status || 'To Do';
      if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
        statusCounts[status]++;
      }

      // Count by priority
      const priority = task.priority || 'Medium';
      if (Object.prototype.hasOwnProperty.call(priorityCounts, priority)) {
        priorityCounts[priority]++;
      }

      // Sum time tracking
      totalEstimatedTime += task.estimatedTime || 0;
      totalLoggedTime += task.loggedTime || 0;

      // Due date analysis
      const dueDate = new Date(task.dueDate);
      if (task.status === 'Completed') {
        totalCompleted++;
        // Assuming completed on time if it's completed
        completedOnTimeCount++;
      } else if (isBefore(dueDate, today)) {
        overdueCount++;
      } else if (isBefore(dueDate, addDays(today, 3))) {
        dueSoonCount++;
      } else {
        upcomingCount++;
      }
    });

    // Group tasks by month for the chart
    for (let i = 5; i >= 0; i--) {
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

      // Add to total tasks count
      totalTasks += monthTasks.length;

      monthsData.push({
        month: format(targetMonth, 'MMMM'),
        completed,
        inProgress,
        review,
        todo,
      });
    }

    // Calculate completion rate
    const rate = totalTasks > 0 ? ((totalCompleted / totalTasks) * 100).toFixed(1) : '0';

    // Format status distribution for pie chart
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Format priority distribution for pie chart
    const priorityDistribution = Object.entries(priorityCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Format time tracking data
    const timeTrackingData = [
      { name: 'Estimated', value: totalEstimatedTime },
      { name: 'Logged', value: totalLoggedTime },
    ];

    // Format due date stats
    const dueDateStats = {
      overdue: overdueCount,
      dueSoon: dueSoonCount,
      upcoming: upcomingCount,
      completedOnTime: completedOnTimeCount,
    };

    return {
      chartData: monthsData,
      completionRate: rate,
      statusDistribution,
      priorityDistribution,
      timeTrackingData,
      dueDateStats,
    };
  }, [tasks]);

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow text-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/50',
        'border border-gray-100 dark:border-gray-800 shadow-lg h-full'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Task Analytics</CardTitle>
            <CardDescription>Detailed task statistics</CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">{completionRate}% Complete</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-1 px-4 pb-3 flex flex-col flex-1 min-h-0">
        {isLoading ? (
          <div className="flex-1 min-h-[300px] overflow-hidden">
            <div className="flex h-full items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <div className="flex-1 max-h-[300px] overflow-hidden">
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="monthly">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Monthly Trends
                </TabsTrigger>
                <TabsTrigger value="status">
                  <PieChart className="h-4 w-4 mr-2" />
                  Status & Priority
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <Clock className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="monthly" className="mt-0">
                <div className="h-[200px]">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      height={200}
                    >
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
                        tickFormatter={value => value.slice(0, 3)}
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
                        dataKey="completed"
                        stackId="a"
                        fill="var(--color-completed)"
                        radius={[0, 0, 0, 0]}
                        barSize={24}
                      />
                      <Bar
                        dataKey="inProgress"
                        stackId="a"
                        fill="var(--color-inProgress)"
                        radius={[0, 0, 0, 0]}
                        barSize={24}
                      />
                      <Bar
                        dataKey="review"
                        stackId="a"
                        fill="var(--color-review)"
                        radius={[0, 0, 0, 0]}
                        barSize={24}
                      />
                      <Bar
                        dataKey="todo"
                        stackId="a"
                        fill="var(--color-todo)"
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </TabsContent>

              <TabsContent value="status" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium mb-2">Status Distribution</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%">
                        <RechartsPieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {statusDistribution.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium mb-2">Priority Distribution</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%">
                        <RechartsPieChart>
                          <Pie
                            data={priorityDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {priorityDistribution.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium mb-4">Due Date Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm">Overdue</span>
                        </div>
                        <Badge variant="destructive">{dueDateStats.overdue}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-sm">Due Soon (3 days)</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                        >
                          {dueDateStats.dueSoon}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm">Upcoming</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                        >
                          {dueDateStats.upcoming}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Completed</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 hover:bg-green-100"
                        >
                          {dueDateStats.completedOnTime}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium mb-2">Time Tracking</h3>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={timeTrackingData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" name="Hours" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
