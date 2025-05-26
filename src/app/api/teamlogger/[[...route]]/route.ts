import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { Teamlogger } from '@/models/Teamlogger';
import { Task } from '@/models/Task';
import { connectDB } from '@/Utility/db';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    organizationId?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/teamlogger');

app.use('*', logger());

// Utility function to calculate time difference in hours
const calculateTimeInHours = (checkIn: Date, checkOut: Date): number => {
  const timeDifferenceMs = checkOut.getTime() - checkIn.getTime();
  const timeInHours = timeDifferenceMs / (1000 * 60 * 60); // Convert milliseconds to hours
  return Math.round(timeInHours * 100) / 100; // Round to 2 decimal places
};

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

app.get('/', async c => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    const date = c.req.query('date');
    const query: any = { userId: user.id };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const logs = await Teamlogger.find(query)
      .populate('task', 'name')
      .sort({ date: -1, checkIn: -1 });

    return c.json({ logs });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get active log (if any)
app.get('/active', async c => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    // Find the most recent log that doesn't have a checkout time
    const log = await Teamlogger.findOne({
      userId: user.id,
      checkOut: { $exists: false },
    }).populate('task', 'name');

    return c.json({ log });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Check in
app.post('/check-in', async c => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    const { taskIds } = await c.req.json();

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return c.json({ error: 'At least one task ID is required' }, 400);
    }

    // Check if user already has an active log
    const activeLog = await Teamlogger.findOne({
      userId: user.id,
      checkOut: { $exists: false },
    });

    if (activeLog) {
      return c.json(
        {
          error: 'You already have an active check-in. Please check out first.',
        },
        400
      );
    }

    // Create new log
    const log = new Teamlogger({
      userId: user.id,
      task: taskIds,
      checkIn: new Date(),
      date: new Date(),
    });

    await log.save();

    const populatedLog = await Teamlogger.findById(log._id).populate('task', 'name');

    return c.json({ log: populatedLog });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Check out
app.post('/check-out/:logId', async c => {
  const user = c.get('user');
  const logId = c.req.param('logId');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    // Find the log and verify it belongs to the user
    const log = await Teamlogger.findOne({
      _id: logId,
      userId: user.id,
    });

    if (!log) {
      return c.json({ error: 'Log not found or not authorized' }, 404);
    }

    if (log.checkOut) {
      return c.json({ error: 'This log has already been checked out' }, 400);
    }

    // Update the log with checkout time
    const checkOutTime = new Date();
    log.checkOut = checkOutTime;
    await log.save();

    // Calculate time spent in hours
    const timeSpentHours = calculateTimeInHours(log.checkIn, checkOutTime);

    // Update loggedTime for all associated tasks
    if (log.task && Array.isArray(log.task) && log.task.length > 0) {
      await Promise.all(
        log.task.map(async (taskId: any) => {
          try {
            const task = await Task.findById(taskId);
            if (task) {
              const currentLoggedTime = task.loggedTime || 0;
              const newLoggedTime = currentLoggedTime + timeSpentHours;
              await Task.findByIdAndUpdate(taskId, {
                loggedTime: Math.round(newLoggedTime * 100) / 100, // Round to 2 decimal places
              });
            }
          } catch (error) {
            // Silently handle individual task update errors to prevent blocking the checkout
          }
        })
      );
    }

    const populatedLog = await Teamlogger.findById(log._id).populate('task', 'name');

    return c.json({
      log: populatedLog,
      timeSpent: timeSpentHours,
      message: `Successfully checked out. Time logged: ${timeSpentHours} hours`,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
