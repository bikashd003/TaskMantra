import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { NotificationService } from '@/services/Notification.service';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api');

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

// Get notifications with pagination
app.get('/notifications', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    
    const page = parseInt(c.req.query('page') || '0');
    const limit = parseInt(c.req.query('limit') || '10');
    const filter = c.req.query('filter') || 'all';
    const search = c.req.query('search') || '';
    
    const result = await NotificationService.getNotifications(user.id, page, limit, filter, search);
    
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get unread notification count
app.get('/notifications/unread-count', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    
    const count = await NotificationService.getUnreadCount(user.id);
    
    return c.json({ count });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Mark a notification as read
app.patch('/notifications/:id/read', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    
    const notificationId = c.req.param('id');
    
    const result = await NotificationService.markAsRead(notificationId, user.id);
    
    return c.json({ success: true, notification: result });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Mark all notifications as read
app.patch('/notifications/mark-all-read', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    
    const result = await NotificationService.markAllAsRead(user.id);
    
    return c.json({ success: true, result });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Clear all notifications
app.delete('/notifications/clear-all', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    
    const result = await NotificationService.clearAllNotifications(user.id);
    
    return c.json({ success: true, result });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create a test notification (for development purposes)
app.post('/notifications/test', async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    
    const { type = 'system' } = await c.req.json();
    
    const notification = await NotificationService.createNotification({
      userId: user.id,
      title: 'Test Notification',
      description: `This is a test ${type} notification`,
      type: type as any,
      link: '/dashboard'
    });
    
    return c.json({ success: true, notification });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
