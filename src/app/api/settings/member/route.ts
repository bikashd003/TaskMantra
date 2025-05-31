import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { Organization } from '@/models/organization';
import { User } from '@/models/User';
import { NotificationService } from '@/services/Notification.service';
import { connectDB } from '@/Utility/db';

type Variables = {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    organizationId?: string;
  };
};
const app = new Hono<{ Variables: Variables }>().basePath('/api/settings/member');
app.use('*', logger());

app.use('*', async (c, next) => {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        const userData = {
          id: user._id.toString(),
          name: user.name || '',
          email: user.email || '',
          image: user.image || '',
          organizationId: user.organizationId?.toString(),
        };
        c.set('user', userData);
      }
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
  await next();
});

const getTeamMembers = async (c: any) => {
  try {
    const user = c.get('user');
    const search = c.req.query('search');
    const role = c.req.query('role');

    if (!user?.organizationId) {
      return [];
    }

    // Get user's organization with members
    const organization = await Organization.findById(user.organizationId).populate({
      path: 'members.userId',
      select: 'name email image',
      model: 'User',
    });

    if (!organization) {
      return [];
    }

    // Filter members based on search and role
    let filteredMembers = organization.members;

    if (search) {
      filteredMembers = filteredMembers.filter((member: any) => {
        const memberUser = member.userId;
        if (!memberUser) return false;

        const searchLower = search.toLowerCase();
        const nameMatch = memberUser.name?.toLowerCase().includes(searchLower);
        const emailMatch = memberUser.email?.toLowerCase().includes(searchLower);

        return nameMatch || emailMatch;
      });
    }

    if (role && role !== 'all') {
      filteredMembers = filteredMembers.filter((member: any) => member.role === role);
    }

    return [
      {
        organizationId: organization._id,
        organizationName: organization.name,
        members: filteredMembers,
      },
    ];
  } catch (error: any) {
    throw new Error(error.message);
  }
};

app.get('/', async c => {
  try {
    const teamMembers = await getTeamMembers(c);
    return c.json({
      success: true,
      teamMembers,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { email, role } = await c.req.json();

    if (!email || !role) {
      return c.json({ error: 'Email and role are required' }, 400);
    }

    if (!user.organizationId) {
      return c.json({ error: 'User not associated with any organization' }, 400);
    }

    const organization = await Organization.findById(user.organizationId);
    if (!organization || organization.ownerId.toString() !== user.id) {
      return c.json({ error: 'Only organization owner can invite members' }, 403);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const isMember = organization.members.some(
        (member: any) => member.userId.toString() === existingUser._id.toString()
      );

      if (isMember) {
        return c.json({ error: 'User is already a member of this organization' }, 400);
      }

      organization.members.push({
        userId: existingUser._id,
        role,
        joinedAt: new Date(),
      });

      await organization.save();

      existingUser.organizationId = organization._id;
      await existingUser.save();

      await NotificationService.createNotification({
        userId: existingUser._id.toString(),
        title: 'Added to Organization',
        description: `You have been added to ${organization.name} as a ${role}`,
        type: 'team',
        metadata: {
          organizationId: organization._id.toString(),
          role,
        },
      });

      return c.json({
        success: true,
        message: 'User added to organization successfully',
        member: {
          userId: existingUser._id,
          email: existingUser.email,
          name: existingUser.name,
          role,
        },
      });
    } else {
      return c.json({
        success: true,
        message: 'Invitation sent successfully',
        invitation: {
          email,
          role,
          organizationName: organization.name,
          invitedBy: user.name,
        },
      });
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.put('/', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { memberId, newRole } = await c.req.json();

    if (!memberId || !newRole) {
      return c.json({ error: 'Member ID and new role are required' }, 400);
    }

    if (!user.organizationId) {
      return c.json({ error: 'User not associated with any organization' }, 400);
    }

    const organization = await Organization.findById(user.organizationId);
    if (!organization || organization.ownerId.toString() !== user.id) {
      return c.json({ error: 'Only organization owner can update member roles' }, 403);
    }

    const memberIndex = organization.members.findIndex(
      (member: any) => member.userId.toString() === memberId
    );

    if (memberIndex === -1) {
      return c.json({ error: 'Member not found' }, 404);
    }

    const oldRole = organization.members[memberIndex].role;
    organization.members[memberIndex].role = newRole;
    await organization.save();

    await NotificationService.createNotification({
      userId: memberId,
      title: 'Role Updated',
      description: `Your role has been updated from ${oldRole} to ${newRole} in ${organization.name}`,
      type: 'team',
      metadata: {
        organizationId: organization._id.toString(),
        oldRole,
        newRole,
      },
    });

    return c.json({
      success: true,
      message: 'Member role updated successfully',
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const memberId = c.req.query('memberId');

    if (!memberId) {
      return c.json({ error: 'Member ID is required' }, 400);
    }

    if (!user.organizationId) {
      return c.json({ error: 'User not associated with any organization' }, 400);
    }

    const organization = await Organization.findById(user.organizationId);
    if (!organization || organization.ownerId.toString() !== user.id) {
      return c.json({ error: 'Only organization owner can remove members' }, 403);
    }

    if (memberId === organization.ownerId.toString()) {
      return c.json({ error: 'Cannot remove organization owner' }, 400);
    }

    organization.members = organization.members.filter(
      (member: any) => member.userId.toString() !== memberId
    );
    await organization.save();

    await User.findByIdAndUpdate(memberId, { $unset: { organizationId: 1 } });

    await NotificationService.createNotification({
      userId: memberId,
      title: 'Removed from Organization',
      description: `You have been removed from ${organization.name}`,
      type: 'team',
      metadata: {
        organizationId: organization._id.toString(),
      },
    });

    return c.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
