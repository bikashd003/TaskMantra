import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { KanbanSettings } from '@/models/KanbanSettings';
import { connectDB } from '@/Utility/db';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/kanban-settings');

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

// Get user's kanban settings
app.get('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();
    
    // Find or create settings for the user
    let settings = await KanbanSettings.findOne({ userId: user.id });
    
    if (!settings) {
      // Create default settings
      const defaultColumns = [
        { id: "todo", title: "To Do", order: 0 },
        { id: "inprogress", title: "In Progress", order: 1 },
        { id: "review", title: "Review", order: 2 },
        { id: "completed", title: "Completed", order: 3 },
      ];
      
      settings = new KanbanSettings({
        userId: user.id,
        columns: defaultColumns,
        defaultView: 'kanban',
        compactView: false,
        showCompletedTasks: true,
        columnWidth: 280,
      });
      
      await settings.save();
    }
    
    return c.json({ settings });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update kanban settings
app.patch('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();
    const updateData = await c.req.json();
    
    // Find and update settings
    const settings = await KanbanSettings.findOneAndUpdate(
      { userId: user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    return c.json({ settings });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update columns specifically (for reordering, adding, removing)
app.patch('/columns', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();
    const { columns } = await c.req.json();
    
    if (!columns || !Array.isArray(columns)) {
      return c.json({ error: 'Invalid columns data' }, 400);
    }
    
    // Find and update settings
    const settings = await KanbanSettings.findOneAndUpdate(
      { userId: user.id },
      { $set: { columns } },
      { new: true, upsert: true }
    );
    
    return c.json({ settings });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export const GET = handle(app);
export const PATCH = handle(app);
