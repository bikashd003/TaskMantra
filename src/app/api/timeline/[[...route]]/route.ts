import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { Timeline } from '@/models/Timeline';
import { Project } from '@/models/Project';
import { connectDB } from '@/Utility/db';
import { User } from '@/models/User';

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

// Get all timeline items
app.get('/', async c => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    // Get query parameters
    const { projectId, status, startDate, endDate, search } = c.req.query();

    // Build query
    const query: any = {};

    // Filter by project if provided
    if (projectId) {
      query.projectId = projectId;
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by date range if provided
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

    // Search by title or description if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get timeline items
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

// Get a single timeline item
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

// Create a new timeline item
app.post('/', async c => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    const data = await c.req.json();

    // Validate required fields
    if (!data.title || !data.startDate || !data.endDate || !data.projectId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if project exists
    const project = await Project.findById(data.projectId);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Create timeline item
    const timelineItem = new Timeline({
      ...data,
      createdBy: user.id,
      organizationId: project.organizationId,
    });

    await timelineItem.save();

    // Populate fields for response
    const populatedItem = await Timeline.findById(timelineItem._id)
      .populate('projectId', 'name color')
      .populate('users', 'name image')
      .populate('createdBy', 'name image');

    return c.json({ timelineItem: populatedItem });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update a timeline item
app.patch('/:id', async c => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    const data = await c.req.json();

    // Find timeline item
    const timelineItem = await Timeline.findById(id);

    if (!timelineItem) {
      return c.json({ error: 'Timeline item not found' }, 404);
    }

    // Update timeline item
    const updatedItem = await Timeline.findByIdAndUpdate(id, { ...data }, { new: true })
      .populate('projectId', 'name color')
      .populate('users', 'name image')
      .populate('createdBy', 'name image');

    return c.json({ timelineItem: updatedItem });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete a timeline item
app.delete('/:id', async c => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    // Find timeline item
    const timelineItem = await Timeline.findById(id);

    if (!timelineItem) {
      return c.json({ error: 'Timeline item not found' }, 404);
    }

    // Delete timeline item
    await Timeline.findByIdAndDelete(id);

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get users for assignment
app.get('/users/:projectId', async c => {
  const user = c.get('user');
  const projectId = c.req.param('projectId');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get organization members
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
