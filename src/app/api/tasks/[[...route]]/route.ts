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
        image: session.user.image || ''
      };
      c.set('user', userData);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
  await next();
});
app.get('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    // Get query parameters
    const searchQuery = c.req.query('search') || '';
    const status = c.req.query('status') || 'all';
    const priority = c.req.query('priority') || 'all';
    const sortField = c.req.query('sortField') || 'dueDate';
    const sortDirection = c.req.query('sortDirection') || 'desc';
    const fromDate = c.req.query('fromDate');
    const toDate = c.req.query('toDate');
    const assignedTo = c.req.query('assignedTo');

    // Build the query
    const query: any = { createdBy: user.id };

    // Add search filter if provided
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Add status filter if not 'all'
    if (status !== 'all') {
      // Handle hyphenated status values from frontend
      const formattedStatus = status.includes('-')
        ? status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : status;
      query.status = formattedStatus;
    }

    // Add priority filter if not 'all'
    if (priority !== 'all') {
      query.priority = priority.charAt(0).toUpperCase() + priority.slice(1);
    }

    // Add date range filter if provided
    if (fromDate && toDate) {
      query.$or = [
        // Tasks that start within the range
        { startDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
        // Tasks that end within the range
        { dueDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
        // Tasks that span across the range (start before, end after)
        {
          $and: [
            { startDate: { $lte: new Date(fromDate) } },
            { dueDate: { $gte: new Date(toDate) } }
          ]
        }
      ];
    }

    // Add assignedTo filter if provided
    if (assignedTo) {
      query.assignedTo = { $in: [assignedTo] };
    }

    // Create sort object
    const sort: any = {};
    sort[sortField] = sortDirection === 'asc' ? 1 : -1;

    // Execute query with filters and sorting
    const tasks = await Task.find(query).sort(sort);

    return c.json({ tasks });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/get-task/:taskId', async (c) => {
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

app.post('/', async (c) => {
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

app.patch('/:taskId', async (c) => {
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
