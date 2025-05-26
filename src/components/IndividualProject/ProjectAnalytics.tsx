'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { format, isBefore, addDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart2,
  Users,
  Calendar,
  PieChart as PieChartIcon,
  Percent,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { StatCard, StatCardGrid } from '@/components/Global/StatCard';
import { ChartCard, SectionHeader } from '@/components/Global/ChartCard';

interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
}

interface Task {
  _id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  startDate?: string;
  estimatedTime?: number;
  loggedTime?: number;
  assignedTo: User[];
  createdAt: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS = {
  'To Do': '#f97316',
  'In Progress': '#3b82f6',
  Review: '#8b5cf6',
  Hold: '#f59e0b',
  Discussion: '#64748b',
  Completed: '#22c55e',
};

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#22c55e',
};

const ProjectAnalytics = ({ project }: { project: Project }) => {
  const {
    taskStatusData,
    taskPriorityData,
    completionRate,
    timeTrackingData,
    assigneeWorkloadData,
    dueDateAnalysis,
    totalTasks,
    tasksByMonth,
  } = useMemo(() => {
    const statusCounts: Record<string, number> = {
      'To Do': 0,
      'In Progress': 0,
      Review: 0,
      Hold: 0,
      Discussion: 0,
      Completed: 0,
    };

    const priorityCounts: Record<string, number> = {
      High: 0,
      Medium: 0,
      Low: 0,
    };

    let totalEstimatedTime = 0;
    let totalLoggedTime = 0;

    const assigneeWorkload: Record<
      string,
      {
        name: string;
        image: string;
        taskCount: number;
        estimatedHours: number;
        loggedHours: number;
        completedTasks: number;
        totalTasks: number;
      }
    > = {};

    const today = new Date();
    let overdueTasks = 0;
    let upcomingTasks = 0;
    let completedOnTime = 0;
    let noDeadline = 0;

    const monthlyTaskCounts: Record<string, number> = {};

    project.tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;

      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;

      if (task.estimatedTime) totalEstimatedTime += task.estimatedTime;
      if (task.loggedTime) totalLoggedTime += task.loggedTime;

      task.assignedTo.forEach(user => {
        if (!assigneeWorkload[user._id]) {
          assigneeWorkload[user._id] = {
            name: user.name,
            image: user.image,
            taskCount: 0,
            estimatedHours: 0,
            loggedHours: 0,
            completedTasks: 0,
            totalTasks: 0,
          };
        }

        assigneeWorkload[user._id].taskCount += 1;
        assigneeWorkload[user._id].totalTasks += 1;

        if (task.estimatedTime) {
          assigneeWorkload[user._id].estimatedHours += task.estimatedTime;
        }

        if (task.loggedTime) {
          assigneeWorkload[user._id].loggedHours += task.loggedTime;
        }

        if (task.status === 'Completed') {
          assigneeWorkload[user._id].completedTasks += 1;
        }
      });

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);

        if (task.status === 'Completed') {
          completedOnTime += 1;
        } else if (isBefore(dueDate, today)) {
          overdueTasks += 1;
        } else if (isBefore(dueDate, addDays(today, 7))) {
          upcomingTasks += 1;
        }
      } else {
        noDeadline += 1;
      }

      const creationMonth = format(new Date(task.createdAt), 'MMM yyyy');
      monthlyTaskCounts[creationMonth] = (monthlyTaskCounts[creationMonth] || 0) + 1;
    });

    const taskStatusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#94a3b8',
    }));

    const taskPriorityData = Object.entries(priorityCounts).map(([name, value]) => ({
      name,
      value,
      color: PRIORITY_COLORS[name as keyof typeof PRIORITY_COLORS] || '#94a3b8',
    }));

    const totalTaskCount = project.tasks.length;
    const completedTaskCount = statusCounts['Completed'] || 0;
    const completionRate =
      totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;

    const timeTrackingData = [
      { name: 'Estimated', hours: totalEstimatedTime },
      { name: 'Logged', hours: totalLoggedTime },
    ];

    // Format assignee workload data
    const assigneeWorkloadData = Object.values(assigneeWorkload)
      .sort((a, b) => b.taskCount - a.taskCount)
      .map(assignee => ({
        name: assignee.name,
        image: assignee.image,
        tasks: assignee.taskCount,
        estimatedHours: assignee.estimatedHours,
        loggedHours: assignee.loggedHours,
        completion:
          assignee.totalTasks > 0
            ? Math.round((assignee.completedTasks / assignee.totalTasks) * 100)
            : 0,
      }));

    // Format due date analysis
    const dueDateAnalysis = [
      { name: 'Overdue', value: overdueTasks, color: '#ef4444' },
      { name: 'Due Soon', value: upcomingTasks, color: '#f59e0b' },
      { name: 'Completed', value: completedOnTime, color: '#22c55e' },
      { name: 'No Deadline', value: noDeadline, color: '#94a3b8' },
    ];

    // Format monthly task data
    const tasksByMonth = Object.entries(monthlyTaskCounts)
      .map(([month, count]) => ({
        month,
        tasks: count,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

    return {
      taskStatusData,
      taskPriorityData,
      completionRate,
      timeTrackingData,
      assigneeWorkloadData,
      dueDateAnalysis,
      totalTasks: totalTaskCount,
      tasksByMonth,
    };
  }, [project]);

  // Enhanced custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Get color from payload if available
      const color = payload[0].color || payload[0].fill || '#4f46e5';

      return (
        <div className="chart-tooltip p-4 rounded-lg">
          <p className="font-semibold theme-text-primary mb-1">{label || payload[0].name}</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <p className="text-sm theme-text-secondary">
              {payload[0].name || 'Value'}:{' '}
              <span className="font-medium theme-text-primary">{payload[0].value}</span>
              {payload[0].payload && typeof payload[0].payload.percent === 'number' && (
                <span className="ml-1 theme-text-secondary">
                  ({(payload[0].payload.percent * 100).toFixed(0)}%)
                </span>
              )}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Create stat cards data
  const statCards = [
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: Percent,
      variant: 'primary' as const,
      delay: 0.05,
      trend: completionRate > 70 ? { value: 5, isPositive: true } : undefined,
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: BarChart2,
      variant: 'primary' as const,
      delay: 0,
    },
    {
      title: 'In Progress',
      value: taskStatusData.find(item => item.name === 'In Progress')?.value || 0,
      icon: Clock,
      variant: 'primary' as const,
      delay: 0.1,
    },
    {
      title: 'Completed',
      value: taskStatusData.find(item => item.name === 'Completed')?.value || 0,
      icon: CheckCircle,
      variant: 'success' as const,
      delay: 0.2,
    },
    {
      title: 'Overdue',
      value: dueDateAnalysis.find(item => item.name === 'Overdue')?.value || 0,
      icon: AlertTriangle,
      variant: 'destructive' as const,
      delay: 0.3,
    },
  ];

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-8 theme-surface bg-grid-pattern p-6 rounded-xl theme-shadow-sm">
        {/* Overview Section */}
        <div className="space-y-6">
          <SectionHeader
            title="Overview"
            icon={BarChart2}
            description="Key project metrics and performance indicators"
          />

          {/* Top Stats Cards */}
          <StatCardGrid columns={5}>
            {statCards.map(card => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                variant={card.variant}
                delay={card.delay}
                trend={card.trend}
              />
            ))}
          </StatCardGrid>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Distribution */}
            <ChartCard
              title="Task Status Distribution"
              description="Breakdown of tasks by current status"
              icon={PieChartIcon}
              delay={0.4}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={false}
                    labelLine={false}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ paddingTop: 20 }}
                    className="chart-legend"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Priority Distribution */}
            <ChartCard
              title="Task Priority Distribution"
              description="Breakdown of tasks by priority level"
              icon={TrendingUp}
              delay={0.5}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskPriorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={false}
                    labelLine={false}
                  >
                    {taskPriorityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ paddingTop: 20 }}
                    className="chart-legend"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Time Tracking */}
          <ChartCard
            title="Time Tracking"
            description="Comparison of estimated vs. logged hours"
            icon={Clock}
            height="h-[250px]"
            delay={0.6}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeTrackingData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  className="chart-grid"
                />
                <XAxis type="number" tickLine={false} axisLine={false} className="chart-axis" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  className="chart-axis"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 15 }}
                  iconType="circle"
                  className="chart-legend"
                />
                <Bar
                  dataKey="hours"
                  name="Hours"
                  fill="hsl(var(--primary))"
                  radius={[0, 6, 6, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Team Workload Section */}
        <div className="space-y-6">
          <SectionHeader
            title="Team Workload"
            icon={Users}
            description="Task distribution and team member performance"
          />

          {/* Team Workload Chart */}
          <ChartCard
            title="Team Workload Distribution"
            description="Number of tasks assigned to each team member"
            icon={BarChart2}
            delay={0.7}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assigneeWorkloadData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  className="chart-grid"
                />
                <XAxis type="number" tickLine={false} axisLine={false} className="chart-axis" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tick={props => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={-25}
                          y={0}
                          dy={4}
                          textAnchor="end"
                          className="theme-text-secondary"
                          fontSize={13}
                          fontWeight={500}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 15 }}
                  iconType="circle"
                  className="chart-legend"
                />
                <Bar
                  dataKey="tasks"
                  name="Tasks"
                  fill="hsl(var(--primary))"
                  radius={[0, 6, 6, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
            {assigneeWorkloadData.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="theme-surface-elevated theme-shadow-md overflow-hidden hover-reveal theme-transition">
                  <CardContent className="pt-6 relative">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-14 w-14 border-2 border-border theme-shadow-sm">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold theme-text-primary">{member.name}</h3>
                        <p className="text-sm theme-text-secondary">
                          {member.tasks} tasks assigned
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="theme-text-secondary">Completion Rate</span>
                          <span className="font-medium text-primary">{member.completion}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full theme-transition"
                            style={{ width: `${member.completion}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 theme-surface p-3 rounded-lg">
                        <div className="text-center">
                          <span className="text-xs theme-text-secondary block">Estimated</span>
                          <span className="font-medium theme-text-primary">
                            {member.estimatedHours}h
                          </span>
                        </div>
                        <div className="text-center border-x border-border">
                          <span className="text-xs theme-text-secondary block">Logged</span>
                          <span className="font-medium theme-text-primary">
                            {member.loggedHours}h
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-xs theme-text-secondary block">Efficiency</span>
                          <span className="font-medium theme-text-primary">
                            {member.estimatedHours > 0
                              ? Math.round((member.loggedHours / member.estimatedHours) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="space-y-6">
          <SectionHeader
            title="Timeline"
            icon={Calendar}
            description="Task deadlines and completion timeline analysis"
          />

          {/* Due Date Analysis */}
          <ChartCard
            title="Due Date Analysis"
            description="Status of tasks based on deadlines"
            icon={PieChartIcon}
            height="h-[250px]"
            delay={0.8}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dueDateAnalysis}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {dueDateAnalysis.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ paddingTop: 20 }}
                  className="chart-legend"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Tasks by Month */}
          <ChartCard
            title="Tasks Created by Month"
            description="Task creation trend over time"
            icon={TrendingUp}
            delay={0.9}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tasksByMonth}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="chart-grid" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="chart-axis" />
                <YAxis tickLine={false} axisLine={false} className="chart-axis" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 10 }}
                  className="chart-legend"
                />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  name="Tasks Created"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTasks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ProjectAnalytics;
