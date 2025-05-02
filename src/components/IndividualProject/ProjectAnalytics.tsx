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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Clock, AlertTriangle, BarChart2, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

// Define types for our project data
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

// Status and priority colors
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
  // Calculate analytics data from project
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
    // Initialize counters
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

    // Assignee workload tracking
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

    // Due date analysis
    const today = new Date();
    let overdueTasks = 0;
    let upcomingTasks = 0;
    let completedOnTime = 0;
    let noDeadline = 0;

    // Monthly task creation tracking
    const monthlyTaskCounts: Record<string, number> = {};

    // Process each task
    project.tasks.forEach(task => {
      // Update status counts
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;

      // Update priority counts
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;

      // Update time tracking
      if (task.estimatedTime) totalEstimatedTime += task.estimatedTime;
      if (task.loggedTime) totalLoggedTime += task.loggedTime;

      // Process assignees
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

      // Due date analysis
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

      // Monthly task tracking
      const creationMonth = format(new Date(task.createdAt), 'MMM yyyy');
      monthlyTaskCounts[creationMonth] = (monthlyTaskCounts[creationMonth] || 0) + 1;
    });

    // Format data for charts
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

    // Calculate completion rate
    const totalTaskCount = project.tasks.length;
    const completedTaskCount = statusCounts['Completed'] || 0;
    const completionRate =
      totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;

    // Format time tracking data
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

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{label || payload[0].name}</p>
          <p className="text-sm">
            {payload[0].name}: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl shadow-sm">
      {/* Project Overview Header */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            {project.name} Analytics
          </h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-100">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-base font-medium text-green-600">{completionRate}% Complete</span>
        </div>
      </div>

      {/* Main Analytics Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 bg-slate-100/80 p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Team Workload
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border border-blue-100 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                      <p className="text-3xl font-bold mt-1">{totalTasks}</p>
                    </div>
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                      <BarChart2 className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="overflow-hidden border border-blue-100 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-600">In Progress</p>
                      <p className="text-3xl font-bold mt-1">
                        {taskStatusData.find(item => item.name === 'In Progress')?.value || 0}
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                      <Clock className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="overflow-hidden border border-green-100 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50" />
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-green-600">Completed</p>
                      <p className="text-3xl font-bold mt-1">
                        {taskStatusData.find(item => item.name === 'Completed')?.value || 0}
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="overflow-hidden border border-red-100 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-50" />
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-red-600">Overdue</p>
                      <p className="text-3xl font-bold mt-1">
                        {dueDateAnalysis.find(item => item.name === 'Overdue')?.value || 0}
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md">
                      <AlertTriangle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Distribution */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white shadow-md h-full border border-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    Task Status Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of tasks by current status</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[300px]">
                    <div className="h-[300px] w-full">
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
                            // Fix label conflicts by using a custom label renderer
                            label={({
                              name,
                              percent,
                              cx,
                              cy,
                              midAngle,
                              innerRadius,
                              outerRadius,
                            }) => {
                              const RADIAN = Math.PI / 180;
                              const radius = 25 + innerRadius + (outerRadius - innerRadius);
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);

                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill={STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#666'}
                                  textAnchor={x > cx ? 'start' : 'end'}
                                  dominantBaseline="central"
                                  className="text-xs font-medium"
                                >
                                  {`${name}: ${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                            labelLine={true}
                          >
                            {taskStatusData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Priority Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-white shadow-md h-full border border-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    Task Priority Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of tasks by priority level</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[300px]">
                    <div className="h-[300px] w-full">
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
                            // Fix label conflicts by using a custom label renderer
                            label={({
                              name,
                              percent,
                              cx,
                              cy,
                              midAngle,
                              innerRadius,
                              outerRadius,
                            }) => {
                              const RADIAN = Math.PI / 180;
                              const radius = 25 + innerRadius + (outerRadius - innerRadius);
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);

                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill={
                                    PRIORITY_COLORS[name as keyof typeof PRIORITY_COLORS] || '#666'
                                  }
                                  textAnchor={x > cx ? 'start' : 'end'}
                                  dominantBaseline="central"
                                  className="text-xs font-medium"
                                >
                                  {`${name}: ${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                            labelLine={true}
                          >
                            {taskPriorityData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Time Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white shadow-md border border-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Time Tracking
                </CardTitle>
                <CardDescription>Comparison of estimated vs. logged hours</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[250px]">
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeTrackingData} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={true}
                          vertical={false}
                          opacity={0.3}
                        />
                        <XAxis type="number" tickLine={false} axisLine={false} />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#64748b', fontSize: 13 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: 15 }} iconType="circle" />
                        <Bar
                          dataKey="hours"
                          name="Hours"
                          fill="url(#timeGradient)"
                          radius={[0, 6, 6, 0]}
                          barSize={30}
                        />
                        <defs>
                          <linearGradient id="timeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Team Workload Tab */}
        <TabsContent value="team" className="space-y-4">
          {/* Team Workload Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white shadow-md border border-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Team Workload Distribution
                </CardTitle>
                <CardDescription>Number of tasks assigned to each team member</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[300px]">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assigneeWorkloadData} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={true}
                          vertical={false}
                          opacity={0.3}
                        />
                        <XAxis type="number" tickLine={false} axisLine={false} />
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
                                  fill="#64748b"
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
                        <Legend wrapperStyle={{ paddingTop: 15 }} iconType="circle" />
                        <Bar
                          dataKey="tasks"
                          name="Tasks"
                          fill="url(#teamGradient)"
                          radius={[0, 6, 6, 0]}
                          barSize={30}
                        />
                        <defs>
                          <linearGradient id="teamGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#d946ef" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Member Cards */}
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
              {assigneeWorkloadData.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-white shadow-md border border-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-50" />
                    <CardContent className="pt-6 relative">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-14 w-14 border-2 border-purple-100 shadow-sm">
                          <AvatarImage src={member.image} alt={member.name} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-slate-800">{member.name}</h3>
                          <p className="text-sm text-slate-500">{member.tasks} tasks assigned</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Completion Rate</span>
                            <span className="font-medium text-purple-600">
                              {member.completion}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                              style={{ width: `${member.completion}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg">
                          <div className="text-center">
                            <span className="text-xs text-slate-500 block">Estimated</span>
                            <span className="font-medium text-slate-800">
                              {member.estimatedHours}h
                            </span>
                          </div>
                          <div className="text-center border-x border-slate-200">
                            <span className="text-xs text-slate-500 block">Logged</span>
                            <span className="font-medium text-slate-800">
                              {member.loggedHours}h
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-xs text-slate-500 block">Efficiency</span>
                            <span className="font-medium text-slate-800">
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
          </ScrollArea>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          {/* Due Date Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white shadow-md border border-slate-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 opacity-30" />
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Due Date Analysis
                </CardTitle>
                <CardDescription>Status of tasks based on deadlines</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 relative">
                <ScrollArea className="h-[250px]">
                  <div className="h-[250px] w-full">
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
                          // Fix label conflicts by using a custom label renderer
                          label={({
                            name,
                            percent,
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                          }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = 25 + innerRadius + (outerRadius - innerRadius);
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill={
                                  dueDateAnalysis.find(item => item.name === name)?.color || '#666'
                                }
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                className="text-xs font-medium"
                              >
                                {`${name}: ${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                          labelLine={true}
                        >
                          {dueDateAnalysis.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks by Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-white shadow-md border border-slate-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-indigo-50 opacity-30" />
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Tasks Created by Month
                </CardTitle>
                <CardDescription>Task creation trend over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 relative">
                <ScrollArea className="h-[300px]">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tasksByMonth}>
                        <defs>
                          <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="tasks"
                          name="Tasks"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorTasks)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectAnalytics;
