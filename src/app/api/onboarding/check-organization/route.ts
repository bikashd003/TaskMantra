import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/Utility/db';
import { Organization } from '@/models/organization';
import { authOptions } from '../../auth/[...nextauth]/options';

const app = new Hono().basePath('/api/onboarding');

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
        systemRole: session.user.systemRole || '',
      };
      (c as any).set('user', userData);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
  await next();
});

// /api/onboarding/check-organization
app.get('/check-organization', async (c: any) => {
  try {
    await connectDB();
    const user = c.get('user');
    if (!user) return c.json({ message: 'Unauthorized' }, { status: 401 });

    // Check if user is a member of any organization
    const organization = await Organization.findOne({
      'members.userId': user.id,
    });

    return c.json(
      {
        isOrganizationMember: !!organization,
        organization: organization
          ? {
              id: organization._id,
              name: organization.name,
              role:
                organization.members.find((m: any) => m.userId.toString() === user.id)?.role ||
                'Member',
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return c.json({ message: error.message }, { status: 500 });
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
