import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { WorkflowSettings, WorkflowTemplate } from '@/models/WorkflowSettings';
import { connectDB } from '@/Utility/db';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/workflow-settings');

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

// Get user's workflow settings
app.get('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    // Find or create settings for the user
    let settings = await WorkflowSettings.findOne({ userId: user.id });

    if (!settings) {
      // Create default settings
      const defaultStates = [
        {
          id: "todo",
          name: "To Do",
          color: "#6b7280",
          order: 0,
          useAsColumn: true,
          columnWidth: 280,
          wip: 0
        },
        {
          id: "inProgress",
          name: "In Progress",
          color: "#3b82f6",
          order: 1,
          useAsColumn: true,
          columnWidth: 280,
          wip: 0
        },
        {
          id: "review",
          name: "Review",
          color: "#f59e0b",
          order: 2,
          useAsColumn: true,
          columnWidth: 280,
          wip: 0
        },
        {
          id: "completed",
          name: "Completed",
          color: "#10b981",
          order: 3,
          useAsColumn: true,
          columnWidth: 280,
          wip: 0
        },
      ];

      const defaultTransitions = [
        {
          fromState: "todo",
          toState: "inProgress",
          name: "Start Work",
          description: "Task is actively being worked on",
          requiresApproval: false,
          allowedRoles: []
        },
        {
          fromState: "inProgress",
          toState: "review",
          name: "Submit for Review",
          description: "Work is completed and ready for review",
          requiresApproval: false,
          allowedRoles: []
        },
        {
          fromState: "review",
          toState: "completed",
          name: "Approve",
          description: "Task has passed review and is complete",
          requiresApproval: false,
          allowedRoles: []
        },
        {
          fromState: "review",
          toState: "inProgress",
          name: "Request Changes",
          description: "Task needs additional work after review",
          requiresApproval: false,
          allowedRoles: []
        },
      ];

      settings = new WorkflowSettings({
        userId: user.id,
        name: "Default Workflow",
        description: "Standard task workflow",
        states: defaultStates,
        transitions: defaultTransitions,
        isDefault: true,
        syncWithKanban: true,
        allowCustomStatuses: false,
        templates: []
      });

      await settings.save();
    }

    return c.json({ settings });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update workflow settings
app.patch('/', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();
    const updateData = await c.req.json();

    // Find and update settings
    const settings = await WorkflowSettings.findOneAndUpdate(
      { userId: user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return c.json({ settings });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create a new workflow
app.post('/create', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();
    const { name, description, states, transitions } = await c.req.json();

    if (!name || !states || !transitions) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create new workflow settings
    const settings = await WorkflowSettings.findOneAndUpdate(
      { userId: user.id },
      {
        $set: {
          name,
          description: description || 'Custom workflow',
          states,
          transitions,
          isDefault: false,
          syncWithKanban: true,
          allowCustomStatuses: false
        }
      },
      { new: true, upsert: true }
    );

    return c.json({ settings });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update states specifically
app.patch('/states', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();
    const { states } = await c.req.json();

    if (!states || !Array.isArray(states)) {
      return c.json({ error: 'Invalid states data' }, 400);
    }

    // Find and update settings
    const settings = await WorkflowSettings.findOneAndUpdate(
      { userId: user.id },
      { $set: { states, isDefault: false } },
      { new: true, upsert: true }
    );

    return c.json({ settings });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update transitions specifically
app.patch('/transitions', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();
    const { transitions } = await c.req.json();

    if (!transitions || !Array.isArray(transitions)) {
      return c.json({ error: 'Invalid transitions data' }, 400);
    }

    // Find and update settings
    const settings = await WorkflowSettings.findOneAndUpdate(
      { userId: user.id },
      { $set: { transitions, isDefault: false } },
      { new: true, upsert: true }
    );

    return c.json({ settings });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get workflow templates
app.get('/templates', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    // Get templates created by the user or public templates
    const templates = await WorkflowTemplate.find({
      $or: [
        { createdBy: user.id },
        { isPublic: true }
      ]
    });

    return c.json({ templates });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create a workflow template
app.post('/templates', async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();
    const templateData = await c.req.json();

    if (!templateData.name || !templateData.states || !templateData.transitions) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create new template
    const template = new WorkflowTemplate({
      ...templateData,
      createdBy: user.id,
      isPublic: templateData.isPublic || false
    });

    await template.save();

    return c.json({ template });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Apply a template to user's workflow
app.post('/templates/:templateId/apply', async (c) => {
  const user = c.get('user');
  const templateId = c.req.param('templateId');

  if (!user) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    await connectDB();

    // Find the template
    const template = await WorkflowTemplate.findById(templateId);

    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }

    // Check if user has access to this template
    if (!template.isPublic && template.createdBy.toString() !== user.id) {
      return c.json({ error: 'You do not have access to this template' }, 403);
    }

    // Apply template to user's workflow settings
    const settings = await WorkflowSettings.findOneAndUpdate(
      { userId: user.id },
      {
        $set: {
          name: template.name,
          description: template.description,
          states: template.states,
          transitions: template.transitions,
          isDefault: false
        }
      },
      { new: true, upsert: true }
    );

    return c.json({ settings });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
