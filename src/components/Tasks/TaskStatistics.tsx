'use client';

import React, { useMemo } from 'react';
import { Task } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle, Clock, Calendar, AlertCircle, BarChart3 } from 'lucide-react';
import {
  isAfter,
  isBefore,
  isToday,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskStatisticsProps {
  tasks: Task[];
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ tasks }) => {
  // Calculate task statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    const inProgress = tasks.filter(task => task.status === 'In Progress').length;
    const review = tasks.filter(task => task.status === 'Review').length;
    const todo = tasks.filter(task => task.status === 'To Do').length;

    const highPriority = tasks.filter(task => task.priority === 'High').length;
    const mediumPriority = tasks.filter(task => task.priority === 'Medium').length;
    const lowPriority = tasks.filter(task => task.priority === 'Low').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return isBefore(dueDate, today) && task.status !== 'Completed';
    }).length;

    const dueToday = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return isToday(dueDate) && task.status !== 'Completed';
    }).length;

    const dueSoon = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const threeDaysFromNow = addDays(today, 3);
      return (
        isAfter(dueDate, today) &&
        isBefore(dueDate, threeDaysFromNow) &&
        task.status !== 'Completed'
      );
    }).length;

    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    // Calculate tasks by project
    const projects: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.projectId) {
        projects[task.projectId] = (projects[task.projectId] || 0) + 1;
      } else {
        projects['No Project'] = (projects['No Project'] || 0) + 1;
      }
    });

    // Calculate tasks by week
    const thisWeekStart = startOfWeek(today);
    const thisWeekEnd = endOfWeek(today);
    const tasksThisWeek = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return !isBefore(dueDate, thisWeekStart) && !isAfter(dueDate, thisWeekEnd);
    }).length;

    // Calculate tasks by month
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    const tasksThisMonth = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return !isBefore(dueDate, thisMonthStart) && !isAfter(dueDate, thisMonthEnd);
    }).length;

    return {
      total,
      completed,
      inProgress,
      review,
      todo,
      highPriority,
      mediumPriority,
      lowPriority,
      overdue,
      dueToday,
      dueSoon,
      completionRate,
      projects,
      tasksThisWeek,
      tasksThisMonth,
    };
  }, [tasks]);

  // Format data for charts
  const statusData = [
    { name: 'To Do', value: stats.todo, color: 'bg-gray-400' },
    { name: 'In Progress', value: stats.inProgress, color: 'bg-blue-500' },
    { name: 'Review', value: stats.review, color: 'bg-amber-500' },
    { name: 'Completed', value: stats.completed, color: 'bg-green-500' },
  ];

  const priorityData = [
    { name: 'High', value: stats.highPriority, color: 'bg-red-500' },
    { name: 'Medium', value: stats.mediumPriority, color: 'bg-amber-500' },
    { name: 'Low', value: stats.lowPriority, color: 'bg-green-500' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BarChart3 className="h-4 w-4" /> Statistics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Task Statistics & Reports</DialogTitle>
          <DialogDescription>View statistics and reports for your tasks</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 w-[300px] mb-4">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="status">
              <CheckCircle className="h-4 w-4 mr-2" /> Status
            </TabsTrigger>
            <TabsTrigger value="priority">
              <AlertCircle className="h-4 w-4 mr-2" /> Priority
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{stats.completionRate}%</div>
                  <Progress value={stats.completionRate} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overdue
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Due Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold text-amber-500">{stats.dueToday}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks by Status</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {statusData.map(item => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.value}</span>
                          <span className="text-xs text-muted-foreground">
                            ({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks by Priority</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {priorityData.map(item => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.value}</span>
                          <span className="text-xs text-muted-foreground">
                            ({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Time Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">Due Soon (3 days)</span>
                      </div>
                      <span className="text-sm font-medium">{stats.dueSoon}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">This Week</span>
                      </div>
                      <span className="text-sm font-medium">{stats.tasksThisWeek}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">This Month</span>
                      </div>
                      <span className="text-sm font-medium">{stats.tasksThisMonth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
                <CardDescription>
                  Distribution of tasks across different status categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-full max-w-md">
                    {/* Status chart */}
                    <div className="space-y-4">
                      {statusData.map(item => (
                        <div key={item.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full ${item.color} mr-2`}></div>
                              <span>{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.value}</span>
                              <span className="text-xs text-muted-foreground">
                                (
                                {stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}
                                %)
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={stats.total > 0 ? (item.value / stats.total) * 100 : 0}
                            className={cn('h-2', item.color.replace('bg-', 'bg-opacity-80 bg-'))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="priority">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Priority</CardTitle>
                <CardDescription>
                  Distribution of tasks across different priority levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-full max-w-md">
                    {/* Priority chart */}
                    <div className="grid grid-cols-3 gap-4">
                      {priorityData.map(item => (
                        <div key={item.name} className="flex flex-col items-center">
                          <div
                            className={`w-full aspect-square rounded-full ${item.color} bg-opacity-20 flex items-center justify-center relative`}
                          >
                            <div
                              className={`absolute inset-[10%] rounded-full ${item.color} bg-opacity-40 flex items-center justify-center`}
                            >
                              <div
                                className={`absolute inset-[20%] rounded-full ${item.color} flex items-center justify-center text-white font-bold text-xl`}
                              >
                                {item.value}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TaskStatistics;
