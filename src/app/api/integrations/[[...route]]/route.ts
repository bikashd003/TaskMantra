import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { connectDB } from '@/Utility/db';
import { Integration } from '@/models/Integration';
import { connectNotion, disconnectNotion, syncNotion } from '@/routes/integrations/notion/route';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    organizationId?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/integrations');

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
app.get('/', async c => {
  try {
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const integrations = await Integration.find({
      userId: user.id,
    });

    return c.json({
      success: true,
      integrations: integrations.map(integration => ({
        id: integration._id,
        provider: integration.provider,
        workspaceName: integration.workspaceName,
        lastSyncedAt: integration.lastSyncedAt,
      })),
    });
  } catch (error: any) {
    return c.json({ error: error.message }, { status: 500 });
  }
});

app.get('/:provider', async c => {
  try {
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const provider = c.req.param('provider');

    await connectDB();

    const integration = await Integration.findOne({
      userId: user.id,
      provider,
    });

    if (!integration) {
      return c.json({ error: 'Integration not found' }, { status: 404 });
    }

    return c.json({
      success: true,
      integration: {
        id: integration._id,
        provider: integration.provider,
        workspaceName: integration.workspaceName,
        lastSyncedAt: integration.lastSyncedAt,
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, { status: 500 });
  }
});
const connectNotionController = async (c: any) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    const result = await connectNotion(c, user.id);
    return result; // Return the result directly from the connectNotion function
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  }
};
const disconnectNotionController = async (c: any) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    const result = await disconnectNotion(c, user.id);
    return result; // Return the result directly from the disconnectNotion function
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  }
};

const syncNotionController = async (c: any) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    const result = await syncNotion(c, user.id);
    return result; // Return the result directly from the syncNotion function
  } catch (error: unknown) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    } else {
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  }
};
app.post('/notion/connect', connectNotionController);
app.post('/notion/disconnect', disconnectNotionController);
app.post('/notion/sync', syncNotionController);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
