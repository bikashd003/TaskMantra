import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { Task } from '@/models/Task';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/tasks');

app.use('*', logger());

// Middleware to inject user details
app.use('*', async (c, next) => {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user) {
      const userData = {
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
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
    const searchQuery = c.req.query('search') || '';
    const status = c.req.query('status') || 'all';
    const priority = c.req.query('priority') || 'all';
    const sortField = c.req.query('sortField') || 'dueDate';
    const sortDirection = c.req.query('sortDirection') || 'desc';
    const fromDate = c.req.query('fromDate');
    const toDate = c.req.query('toDate');
    const assignedTo = c.req.query('assignedTo');

    const query: any = {};

    if (searchQuery) {
      const searchTerms = searchQuery
        .trim()
        .split(/\s+/)
        .filter(term => term.length > 0);

      const searchConditions = searchTerms.map(term => ({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
        ],
      }));

      if (searchConditions.length > 0) {
        if (query.$or) {
          query.$and = query.$and || [];
          query.$and.push({ $or: query.$or });
          query.$and.push({ $and: searchConditions });
          delete query.$or;
        } else {
          query.$and = searchConditions;
        }
      }
    }

    if (status !== 'all') {
      const formattedStatus = status.includes('-')
        ? status
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : status;
      query.status = formattedStatus;
    }

    if (priority !== 'all') {
      query.priority = priority.charAt(0).toUpperCase() + priority.slice(1);
    }

    if (fromDate && toDate) {
      const dateRangeCondition = {
        $or: [
          { startDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
          { dueDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
          {
            $and: [
              { startDate: { $lte: new Date(fromDate) } },
              { dueDate: { $gte: new Date(toDate) } },
            ],
          },
        ],
      };

      if (query.$and) {
        query.$and.push(dateRangeCondition);
      } else if (query.$or) {
        query.$and = [{ $or: query.$or }, dateRangeCondition];
        delete query.$or;
      }
      // Otherwise, just set the $or condition for date range
      else {
        query.$or = dateRangeCondition.$or;
      }
    }

    if (assignedTo) {
      query.assignedTo = { $in: [assignedTo] };
    }

    const sort: any = {};
    sort[sortField] = sortDirection === 'asc' ? 1 : -1;

    const tasks = await Task.find(query).sort(sort);

    return c.json({ tasks });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/get-task/:taskId', async c => {
  const taskId = c.req.param('taskId');
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    const task = await Task.findById(taskId);
    return c.json({ task });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/', async c => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    const taskData = await c.req.json();
    const task = new Task({ ...taskData, createdBy: user.id });
    await task.save();
    return c.json({ task });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.patch('/:taskId', async c => {
  const taskId = c.req.param('taskId');
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    const taskData = await c.req.json();
    const task = await Task.findByIdAndUpdate(taskId, taskData, { new: true });
    return c.json({ task });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
