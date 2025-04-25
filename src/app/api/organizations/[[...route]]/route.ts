import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { Organization } from '@/models/organization';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/organizations');

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
    // Use the $elemMatch operator to correctly match the userId in the members array
    const organization = await Organization.findOne({
      'members.userId': user.id,
    }).populate('members.userId');

    if (!organization) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    return c.json(organization);
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to fetch organization' }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
