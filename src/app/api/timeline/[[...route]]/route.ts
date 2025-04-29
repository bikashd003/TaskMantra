import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { Timeline } from '@/models/Timeline';
import { Project } from '@/models/Project';
import { connectDB } from '@/Utility/db';
import { User } from '@/models/User';
import { NotificationService } from '@/services/Notification.service';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/timeline');

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

    const { projectId, status, startDate, endDate, search } = c.req.query();

    const query: any = {};

    if (projectId) {
      query.projectId = projectId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate && endDate) {
      query.$or = [
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
        {
          endDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
        {
          $and: [
            { startDate: { $lte: new Date(startDate) } },
            { endDate: { $gte: new Date(endDate) } },
          ],
        },
      ];
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const timelineItems = await Timeline.find(query)
      .populate('projectId', 'name color')
      .populate('users', 'name image')
      .populate('createdBy', 'name image')
      .sort({ startDate: 1 });

    return c.json({ timelineItems });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/:id', async c => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    const timelineItem = await Timeline.findById(id)
      .populate('projectId', 'name color')
      .populate('users', 'name image')
      .populate('createdBy', 'name image')
      .populate('dependencies', 'title startDate endDate');

    if (!timelineItem) {
      return c.json({ error: 'Timeline item not found' }, 404);
    }

    return c.json({ timelineItem });
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
    await connectDB();

    const data = await c.req.json();

    if (!data.title || !data.startDate || !data.endDate || !data.projectId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const project = await Project.findById(data.projectId);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const timelineItem = new Timeline({
      ...data,
      createdBy: user.id,
      organizationId: project.organizationId,
    });

    await timelineItem.save();

    const populatedItem = await Timeline.findById(timelineItem._id)
      .populate('projectId', 'name color')
      .populate('users', 'name image')
      .populate('createdBy', 'name image');

    return c.json({ timelineItem: populatedItem });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.patch('/:id', async c => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    const data = await c.req.json();
    const timelineItem = await Timeline.findById(id);

    if (!timelineItem) {
      return c.json({ error: 'Timeline item not found' }, 404);
    }

    if (typeof data.users === 'string') {
      try {
        data.users = JSON.parse(data.users);
      } catch (parseError) {
        return c.json({ error: 'Invalid users data format' }, 400);
      }
    }
    if (Array.isArray(data.users)) {
      data.users = data.users.map(user => user.id || user);
    }

    const updatedItem = await Timeline.findByIdAndUpdate(id, { ...data }, { new: true })
      .populate('projectId', 'name color')
      .populate('users', 'name image')
      .populate('createdBy', 'name image');

    return c.json({ timelineItem: updatedItem });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/:id', async c => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();
    const timelineItem = await Timeline.findById(id);

    if (!timelineItem) {
      return c.json({ error: 'Timeline item not found' }, 404);
    }
    await Timeline.findByIdAndDelete(id);

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/users/:projectId', async c => {
  const user = c.get('user');
  const projectId = c.req.param('projectId');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();
    const project = await Project.findById(projectId);

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    const users = await User.find({ organizationId: project.organizationId }).select('name image');

    return c.json({ users });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
