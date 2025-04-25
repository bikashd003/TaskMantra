import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/Utility/db';
import { Invitation } from '@/models/Invitations';
import { authOptions } from '../../auth/[...nextauth]/options';
import { Organization } from '@/models/organization';
import { uploadToCloudinary } from '@/Utility/cloudinary';
import { NotificationService } from '@/services/Notification.service';

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
app.get('/check-invites', async (c: any) => {
  try {
    await connectDB();
    const user = c.get('user');
    if (!user) return c.json({ message: 'Unauthorized' }, { status: 401 });

    const invite = await Invitation.findOne({ email: user.email, status: 'pending' });
    return c.json({ hasInvite: !!invite }, { status: 200 });
  } catch (error: any) {
    return c.json({ message: error.message }, { status: 500 });
  }
});
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
app.post('/organization', async (c: any) => {
  try {
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, location, description, image } = await c.req.json();
    await connectDB();
    let logoUrl = '';
    if (image) {
      const uploadResult = await uploadToCloudinary(image);
      if (uploadResult.error) {
        return c.json({ message: uploadResult.error }, { status: 400 });
      }
      logoUrl = uploadResult.secure_url;
    }

    // Create the organization
    const organization = await Organization.create({
      name,
      location,
      description,
      ownerId: user.id,
      logo: logoUrl,
      members: [
        {
          userId: user.id,
          role: 'Owner',
          joinedAt: new Date(),
        },
      ],
    });

    // Create onboarding notification for the user
    await NotificationService.createOnboardingNotification(user.id, name);

    return c.json({ message: 'Organization created' }, { organization }, { status: 200 });
  } catch (error: any) {
    return c.json({ message: error.message }, { status: 500 });
  }
});
app.get('/organization', async (c: any) => {
  try {
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const organization = await Organization.findOne({ ownerId: user.id });
    if (!organization) {
      return c.json({ message: 'Organization not found' }, { status: 404 });
    }

    return c.json({ organization }, { status: 200 });
  } catch (error: any) {
    return c.json({ message: error.message }, { status: 500 });
  }
});
app.get('/organization/:organizationId', async (c: any) => {
  try {
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = c.req.param('organizationId');
    await connectDB();
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return c.json({ message: 'Organization not found' }, { status: 404 });
    }

    return c.json({ organization }, { status: 200 });
  } catch (error: any) {
    return c.json({ message: error.message }, { status: 500 });
  }
});
app.get('/status', async (c: any) => {
  try {
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const hasCompletedOnboarding = await Organization.findOne({ 'members.userId': user.id });

    return c.json({ hasCompletedOnboarding }, { status: 200 });
  } catch (error: any) {
    return c.json({ message: error.message }, { status: 500 });
  }
});
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
