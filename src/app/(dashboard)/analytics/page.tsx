'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/Analytics.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Activity,
  Zap,
  Award,
  Timer,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Image from 'next/image';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  variant?: 'primary' | 'success' | 'warning' | 'destructive';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'primary',
  trend,
  delay = 0,
}) => {
  const variantClasses = {
    primary: 'theme-surface-elevated theme-border hover:theme-border-primary/50',
    success: 'theme-surface-elevated theme-border hover:border-green-500/30',
    warning: 'theme-surface-elevated theme-border hover:border-yellow-500/30',
    destructive: 'theme-surface-elevated theme-border hover:border-red-500/30',
  };

  const iconClasses = {
    primary: 'text-primary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    destructive: 'text-red-500',
  };

  const iconBgClasses = {
    primary: 'bg-primary/10',
    success: 'bg-green-500/10',
    warning: 'bg-yellow-500/10',
    destructive: 'bg-red-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={`${variantClasses[variant]} theme-transition group cursor-default`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium theme-text-secondary">{title}</p>
              <div className="flex items-center space-x-3">
                <p className="text-3xl font-bold theme-text-primary">{value}</p>
                {trend && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      trend.isPositive
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {trend.isPositive ? '+' : '-'}
                    {Math.abs(trend.value)}%
                  </span>
                )}
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${iconBgClasses[variant]} ${iconClasses[variant]} group-hover:scale-110 transition-transform duration-200`}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AnalyticsLoading = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="theme-surface-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="theme-surface-elevated">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const AnalyticsPage = () => {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: AnalyticsService.getOverview,
    staleTime: 1000 * 60 * 5,
  });

  const { data: teamPerformance, isLoading: teamLoading } = useQuery({
    queryKey: ['analytics-team-performance'],
    queryFn: AnalyticsService.getTeamPerformance,
    staleTime: 1000 * 60 * 5,
  });

  const { data: timeTracking, isLoading: timeLoading } = useQuery({
    queryKey: ['analytics-time-tracking'],
    queryFn: AnalyticsService.getTimeTracking,
    staleTime: 1000 * 60 * 5,
  });

  const { isLoading: projectLoading } = useQuery({
    queryKey: ['analytics-projects'],
    queryFn: AnalyticsService.getProjectAnalytics,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = overviewLoading || teamLoading || timeLoading || projectLoading;

  if (isLoading) {
    return (
      <div className="p-6 theme-surface min-h-screen">
        <div>
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <AnalyticsLoading />
        </div>
      </div>
    );
  }

  // Create stat cards data
  const statCards = [
    {
      title: 'Total Tasks',
      value: overview?.totalTasks || 0,
      icon: BarChart3,
      variant: 'primary' as const,
      delay: 0,
    },
    {
      title: 'Completed Tasks',
      value: overview?.completedTasks || 0,
      icon: CheckCircle,
      variant: 'success' as const,
      delay: 0.1,
    },
    {
      title: 'In Progress',
      value: overview?.inProgressTasks || 0,
      icon: Activity,
      variant: 'primary' as const,
      delay: 0.2,
    },
    {
      title: 'Overdue Tasks',
      value: overview?.overdueTasks || 0,
      icon: AlertTriangle,
      variant: 'destructive' as const,
      delay: 0.3,
    },
    {
      title: 'Completion Rate',
      value: `${overview?.completionRate || 0}%`,
      icon: Target,
      variant: 'success' as const,
      delay: 0.4,
      trend:
        overview?.completionRate && overview.completionRate > 70
          ? { value: 5, isPositive: true }
          : undefined,
    },
    {
      title: 'Team Members',
      value: overview?.totalUsers || 0,
      icon: Users,
      variant: 'primary' as const,
      delay: 0.5,
    },
    {
      title: 'Total Logged Time',
      value: `${overview?.totalLoggedTime || 0}h`,
      icon: Clock,
      variant: 'primary' as const,
      delay: 0.6,
    },
    {
      title: 'Productivity Rate',
      value: `${overview?.productivityRate || 0}%`,
      icon: Zap,
      variant: overview?.productivityRate && overview.productivityRate > 90 ? 'success' : 'warning',
      delay: 0.7,
    },
  ];

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="p-6 theme-surface min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <h2 className="text-xl font-bold flex items-center gap-3 theme-text-primary">
                <BarChart3 className="h-8 w-8 text-primary" />
                Team Analytics
              </h2>
              <p className="text-lg theme-text-secondary">
                Comprehensive insights into your team's performance, productivity, and project
                progress
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map(card => (
                <StatCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  variant={card.variant as 'primary' | 'success' | 'warning' | 'destructive'}
                  trend={card.trend}
                  delay={card.delay}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Card className="theme-surface-elevated theme-border hover:theme-border-primary/30 theme-transition">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 theme-text-primary text-lg font-semibold">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Timer className="h-5 w-5 text-blue-500" />
                      </div>
                      Daily Time Tracking
                    </CardTitle>
                    <p className="text-sm theme-text-secondary mt-1">
                      Last 30 days activity overview
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={timeTracking?.dailyTracking || []}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow
                                dx="0"
                                dy="2"
                                stdDeviation="3"
                                floodColor="#3b82f6"
                                floodOpacity="0.3"
                              />
                            </filter>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="2 4"
                            stroke="#374151"
                            strokeOpacity={0.2}
                            horizontal={true}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={15}
                            tickFormatter={value =>
                              new Date(value).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            }
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            domain={['dataMin - 1', 'dataMax + 1']}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '12px',
                              boxShadow:
                                '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
                              color: '#f9fafb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              fontWeight: '500',
                            }}
                            labelStyle={{
                              color: '#e5e7eb',
                              fontWeight: '600',
                              marginBottom: '4px',
                            }}
                            itemStyle={{
                              color: '#3b82f6',
                              fontWeight: '600',
                            }}
                            labelFormatter={value =>
                              new Date(value).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })
                            }
                            formatter={(value: any) => [`${value} hours`, 'Time Logged']}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeOpacity: 0.5 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="hours"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#colorHours)"
                            fillOpacity={1}
                            dot={false}
                            activeDot={{
                              r: 6,
                              fill: '#3b82f6',
                              stroke: '#1f2937',
                              strokeWidth: 3,
                              filter: 'url(#shadow)',
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Card className="theme-surface-elevated theme-border hover:theme-border-primary/30 theme-transition">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 theme-text-primary text-lg font-semibold">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Users className="h-5 w-5 text-green-500" />
                      </div>
                      Team Time Distribution
                    </CardTitle>
                    <p className="text-sm theme-text-secondary mt-1">
                      Individual team member contributions
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={timeTracking?.userTracking?.slice(0, 8) || []}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <defs>
                            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                            </linearGradient>
                            <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow
                                dx="0"
                                dy="4"
                                stdDeviation="4"
                                floodColor="#10b981"
                                floodOpacity="0.2"
                              />
                            </filter>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="2 4"
                            stroke="#374151"
                            strokeOpacity={0.2}
                            horizontal={true}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tickMargin={10}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            domain={['dataMin - 1', 'dataMax + 1']}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '12px',
                              boxShadow:
                                '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
                              color: '#f9fafb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              fontWeight: '500',
                            }}
                            labelStyle={{
                              color: '#e5e7eb',
                              fontWeight: '600',
                              marginBottom: '4px',
                            }}
                            itemStyle={{
                              color: '#10b981',
                              fontWeight: '600',
                            }}
                            formatter={(value: any) => [`${value} hours`, 'Time Logged']}
                            cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                          />
                          <Bar
                            dataKey="hours"
                            fill="url(#colorBar)"
                            radius={[8, 8, 0, 0]}
                            filter="url(#barShadow)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <Card className="theme-surface-elevated theme-border hover:theme-border-primary/30 theme-transition">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 theme-text-primary text-lg font-semibold">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Award className="h-5 w-5 text-purple-500" />
                    </div>
                    Team Member Performance
                  </CardTitle>
                  <p className="text-sm theme-text-secondary mt-1">
                    Detailed performance metrics for each team member
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b theme-border">
                          <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                            Member
                          </th>
                          <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                            Tasks
                          </th>
                          <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                            Completion Rate
                          </th>
                          <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                            Logged Time
                          </th>
                          <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                            Efficiency
                          </th>
                          <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                            Weekly Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamPerformance?.map((member, index) => (
                          <motion.tr
                            key={member.user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 1.1 + index * 0.1 }}
                            className="border-b theme-border theme-hover-surface"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full theme-surface flex items-center justify-center">
                                  {member?.user?.image ? (
                                    <Image
                                      width={32}
                                      height={32}
                                      src={member?.user?.image}
                                      alt={member.user.name}
                                      className="w-8 h-8 rounded-full"
                                    />
                                  ) : (
                                    <span className="text-sm font-medium theme-text-primary">
                                      {member.user.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium theme-text-primary">
                                    {member.user.name}
                                  </p>
                                  <p className="text-sm theme-text-secondary">
                                    {member.user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="theme-text-primary">
                                {member.metrics.completedTasks}/{member.metrics.totalTasks}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    member.metrics.completionRate >= 80
                                      ? 'bg-green-500/10 text-green-500'
                                      : member.metrics.completionRate >= 60
                                        ? 'bg-yellow-500/10 text-yellow-500'
                                        : 'bg-red-500/10 text-red-500'
                                  }`}
                                >
                                  {member.metrics.completionRate}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 theme-text-primary">
                              {member.metrics.totalLoggedTime}h
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.metrics.efficiency >= 90
                                    ? 'bg-green-500/10 text-green-500'
                                    : member.metrics.efficiency >= 70
                                      ? 'bg-yellow-500/10 text-yellow-500'
                                      : 'bg-red-500/10 text-red-500'
                                }`}
                              >
                                {member.metrics.efficiency}%
                              </span>
                            </td>
                            <td className="py-3 px-4 theme-text-primary">
                              {member.metrics.weeklyHours}h
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </ScrollArea>
  );
};

export default AnalyticsPage;
