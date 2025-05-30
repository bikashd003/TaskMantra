import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { connectDB } from '@/Utility/db';
import { Organization } from '@/models/organization';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    organizationId?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/usage');

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
        organizationId: session.user.organizationId || '',
      };
      c.set('user', userData);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
  await next();
});

app.get('/stats', async c => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    await connectDB();
    const organization = await Organization.findById(user.organizationId).populate(
      'members.userId',
      'name email'
    );

    if (!organization) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    const stats = {
      projects: {
        used: 0,
        limit: -1,
        percentage: 0,
        isUnlimited: true,
      },
      tasks: {
        used: 0,
        limit: -1,
        percentage: 0,
        isUnlimited: true,
      },
      teamMembers: {
        used: organization.members.length,
        limit: -1,
        percentage: 0,
        isUnlimited: true,
      },
      apiCalls: {
        used: 0,
        limit: 10000,
        percentage: 0,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
      organization: {
        name: organization.name,
        ownerId: organization.ownerId,
        memberCount: organization.members.length,
        createdAt: organization.createdAt,
      },
    };

    const usageHistory: any[] = [];
    const currentDate = new Date();

    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      const year = date.getFullYear();

      const monthData = {
        month: monthName,
        year: year,
        date: date,
        projects: {
          used: Math.max(0, stats.projects.used - (2 - i)),
          limit: stats.projects.limit,
        },
        teamMembers: {
          used: Math.max(1, stats.teamMembers.used - (2 - i)),
          limit: stats.teamMembers.limit,
        },
        storage: {
          used: i === 0 ? 0 : Math.random() * 30,
          limit: 50,
        },
      };

      usageHistory.push(monthData);
    }

    const recommendations: any[] = [];

    if (stats.teamMembers.used >= 5) {
      recommendations.push({
        type: 'team',
        title: 'Consider team organization',
        description: 'With multiple team members, consider setting up clear roles and permissions.',
        priority: 'medium',
      });
    }

    if (stats.teamMembers.used === 1) {
      recommendations.push({
        type: 'growth',
        title: 'Invite team members',
        description: 'Collaborate better by inviting team members to your organization.',
        priority: 'low',
      });
    }

    recommendations.push({
      type: 'storage',
      title: 'Monitor storage usage',
      description: 'Keep track of your file uploads to avoid hitting storage limits.',
      priority: 'medium',
    });

    return c.json({
      success: true,
      stats,
      usageHistory,
      recommendations,
      lastUpdated: new Date(),
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message || 'An error occurred while fetching usage stats',
      },
      500
    );
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
