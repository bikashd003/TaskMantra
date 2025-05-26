import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { connectDB } from '@/Utility/db';
import { Task } from '@/models/Task';
import { Teamlogger } from '@/models/Teamlogger';
import { User } from '@/models/User';
import { Project } from '@/models/Project';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    organizationId?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/analytics');

app.use('*', logger());

app.use('*', async (c, next) => {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user) {
      const userData = {
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
        organizationId: session.user.organizationId || '',
      };
      c.set('user', userData);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
  await next();
});

app.get('/overview', async c => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    const organizationId = user.organizationId;

    const users = await User.find({ organizationId }).select('name email image');

    const tasks = await Task.find({ organizationId })
      .populate('assignedTo', 'name email image')
      .populate('createdBy', 'name email');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const overdueTasks = tasks.filter(
      task => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed'
    ).length;

    const totalLoggedTime = tasks.reduce((sum, task) => sum + (task.loggedTime || 0), 0);
    const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const productivityRate =
      totalEstimatedTime > 0 ? Math.round((totalLoggedTime / totalEstimatedTime) * 100) : 0;

    return c.json({
      overview: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        totalLoggedTime: Math.round(totalLoggedTime * 100) / 100,
        totalEstimatedTime: Math.round(totalEstimatedTime * 100) / 100,
        completionRate,
        productivityRate,
        totalUsers: users.length,
        activeProjects: await Project.countDocuments({
          organizationId,
          status: { $ne: 'Completed' },
        }),
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/team-performance', async c => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    const organizationId = user.organizationId;

    const users = await User.find({ organizationId }).select('name email image');

    const teamPerformance = await Promise.all(
      users.map(async teamMember => {
        const userTasks = await Task.find({
          organizationId,
          assignedTo: teamMember._id,
        });

        const completedTasks = userTasks.filter(task => task.status === 'Completed').length;
        const totalTasks = userTasks.length;
        const totalLoggedTime = userTasks.reduce((sum, task) => sum + (task.loggedTime || 0), 0);
        const totalEstimatedTime = userTasks.reduce(
          (sum, task) => sum + (task.estimatedTime || 0),
          0
        );

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const efficiency =
          totalEstimatedTime > 0 ? Math.round((totalLoggedTime / totalEstimatedTime) * 100) : 0;

        const recentLogs = await Teamlogger.find({
          userId: teamMember._id,
          checkOut: { $exists: true },
          date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        });

        const weeklyHours = recentLogs.reduce((sum, log) => {
          if (log.checkIn && log.checkOut) {
            const hours =
              (new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) /
              (1000 * 60 * 60);
            return sum + hours;
          }
          return sum;
        }, 0);

        return {
          user: {
            id: teamMember._id,
            name: teamMember.name,
            email: teamMember.email,
            image: teamMember.image,
          },
          metrics: {
            totalTasks,
            completedTasks,
            completionRate,
            totalLoggedTime: Math.round(totalLoggedTime * 100) / 100,
            totalEstimatedTime: Math.round(totalEstimatedTime * 100) / 100,
            efficiency,
            weeklyHours: Math.round(weeklyHours * 100) / 100,
            averageTasksPerWeek: Math.round((totalTasks / 4) * 100) / 100, // Assuming 4 weeks
          },
        };
      })
    );

    return c.json({ teamPerformance });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/time-tracking', async c => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    const organizationId = user.organizationId;
    const users = await User.find({ organizationId }).select('name');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const timeLogs = await Teamlogger.find({
      userId: { $in: users.map(u => u._id) },
      checkOut: { $exists: true },
      date: { $gte: thirtyDaysAgo },
    })
      .populate('userId', 'name')
      .populate('task', 'name status priority');

    const dailyTracking: Record<string, number> = {};
    const userTracking: Record<string, number> = {};

    timeLogs.forEach(log => {
      if (log.checkIn && log.checkOut) {
        const date = new Date(log.date).toISOString().split('T')[0];
        const hours =
          (new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60);

        if (!dailyTracking[date]) {
          dailyTracking[date] = 0;
        }
        dailyTracking[date] += hours;

        const userName = log.userId?.name || 'Unknown';
        if (!userTracking[userName]) {
          userTracking[userName] = 0;
        }
        userTracking[userName] += hours;
      }
    });

    const dailyData = Object.entries(dailyTracking)
      .map(([date, hours]) => ({
        date,
        hours: Math.round((hours as number) * 100) / 100,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const userData = Object.entries(userTracking)
      .map(([name, hours]) => ({
        name,
        hours: Math.round((hours as number) * 100) / 100,
      }))
      .sort((a, b) => b.hours - a.hours);

    return c.json({
      dailyTracking: dailyData,
      userTracking: userData,
      totalHours:
        Math.round(
          Object.values(userTracking).reduce((sum: number, hours: number) => sum + hours, 0) * 100
        ) / 100,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/projects', async c => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    const organizationId = user.organizationId;

    const projects = await Project.find({ organizationId })
      .populate('tasks')
      .populate('createdBy', 'name');

    const projectAnalytics = projects.map(project => {
      const tasks = project.tasks || [];
      const completedTasks = tasks.filter(task => task.status === 'Completed').length;
      const totalTasks = tasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const totalLoggedTime = tasks.reduce((sum, task) => sum + (task.loggedTime || 0), 0);
      const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);

      return {
        id: project._id,
        name: project.name,
        status: project.status,
        priority: project.priority,
        createdBy: project.createdBy?.name,
        totalTasks,
        completedTasks,
        completionRate,
        totalLoggedTime: Math.round(totalLoggedTime * 100) / 100,
        totalEstimatedTime: Math.round(totalEstimatedTime * 100) / 100,
        createdAt: project.createdAt,
      };
    });

    return c.json({ projects: projectAnalytics });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
