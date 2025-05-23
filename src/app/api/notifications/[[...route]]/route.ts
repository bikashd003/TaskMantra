import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { connectDB } from '@/Utility/db';
import { Notification } from '@/models/Notification';
import { sendNotificationToUser } from '../sse/route';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    organizationId?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/notifications');

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
        organizationId: session.user.organizationId || '',
      };
      c.set('user', userData);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
  await next();
});

// Get notifications with pagination
app.get('/', async c => {
  try {
    await connectDB();
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }

    const page = parseInt(c.req.query('page') || '0');
    const limit = parseInt(c.req.query('limit') || '10');
    const filter = c.req.query('filter') || 'all';
    const search = c.req.query('search') || '';

    // Build query based on filters
    const query: any = { userId: user.id };

    // Apply filter
    if (filter === 'unread') {
      query.read = false;
    } else if (filter === 'read') {
      query.read = true;
    }

    // Apply search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Count total documents for pagination
    const total = await Notification.countDocuments(query);

    // Get paginated results
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);

    return c.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

//create notification
app.post('/', async c => {
  try {
    await connectDB();
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }

    const data = await c.req.json();

    const notification = await Notification.create({
      userId: data.userId,
      ...data,
    });
    await sendNotificationToUser(data.userId, notification);
    return c.json(notification);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get unread notification count
app.get('/unread-count', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }

    const count = await Notification.countDocuments({
      userId: user.id,
      read: false,
    });

    return c.json({ count });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Mark all notifications as read
app.patch('/mark-all-read', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }

    const result = await Notification.updateMany({ userId: user.id }, { read: true });

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Clear all notifications
app.delete('/clear-all', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }

    const result = await Notification.deleteMany({
      userId: user.id,
    });

    return c.json({ success: true, result });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create a test notification (for development purposes)
app.post('/test', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }

    const { type = 'system' } = await c.req.json();

    const notification = await Notification.create({
      userId: user.id,
      title: 'Test Notification',
      description: `This is a test ${type} notification`,
      type: type as any,
      link: '/dashboard',
    });

    return c.json({ success: true, notification });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
// Get a specific notification
app.get('/:id', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }

    const notificationId = c.req.param('id');

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: user.id,
    });

    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    return c.json({ notification });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Mark a notification as read
app.patch('/:id/read', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }

    const notificationId = c.req.param('id');

    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: user.id },
      { read: true }
    );

    return c.json({ success: true, notification: result });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete a specific notification
app.delete('/:id', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }

    const notificationId = c.req.param('id');

    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: user.id,
    });

    if (!result) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    return c.json({ success: true, notification: result });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
