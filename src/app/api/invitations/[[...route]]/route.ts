import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { connectDB } from '@/Utility/db';
import { Invitation } from '@/models/Invitations';
import { Organization } from '@/models/organization';
import { User } from '@/models/User';
import { Resend } from 'resend';
import { NotificationService } from '@/services/Notification.service';

const resend = new Resend(process.env.RESEND_API_KEY);
const defaultFrom = 'TaskMantra <notifications@resend.dev>';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    organizationId?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/invitations');

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

app.post('/accept', async (c: any) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const { token } = await c.req.json();

    let invitation: any = null;
    if (token) {
      invitation = await Invitation.findById(token).populate('organizationId');
    } else {
      invitation = await Invitation.findOne({ email: user.email, status: 'pending' }).populate(
        'organizationId'
      );
    }

    if (!invitation) {
      return c.json({ message: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return c.json(
        { message: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    const organization = await Organization.findById(invitation.organizationId);
    if (!organization) {
      return c.json({ message: 'Organization not found' }, { status: 404 });
    }

    const isMember = organization.members.some(
      (member: { userId: any }) => member.userId && member.userId.toString() === user.id
    );

    if (isMember) {
      return c.json({ message: 'You are already a member of this organization' }, { status: 400 });
    }

    organization.members.push({
      userId: user.id,
      role: invitation.role,
      joinedAt: new Date(),
    });

    await organization.save();

    invitation.status = 'accepted';
    await invitation.save();

    await User.findByIdAndUpdate(user.id, { organizationId: organization._id });

    await NotificationService.createOnboardingNotification(user.id, organization.name);

    return c.json({
      message: 'Invitation accepted successfully',
      organization: {
        id: organization._id,
        name: organization.name,
      },
    });
  } catch (error: any) {
    return c.json({ message: error.message }, { status: 500 });
  }
});

app.get('/accept', async (c: any) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const token = c.req.query('token');

    let invitation: any = null;
    if (token) {
      invitation = await Invitation.findById(token).populate('organizationId invitedBy');
    } else {
      invitation = await Invitation.findOne({ email: user.email, status: 'pending' }).populate(
        'organizationId invitedBy'
      );
    }

    if (!invitation) {
      return c.json({ message: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return c.json(
        { message: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    return c.json({
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        organization: {
          id: invitation.organizationId._id,
          name: invitation.organizationId.name,
        },
        inviter: {
          id: invitation.invitedBy._id,
          name: invitation.invitedBy.name,
        },
        invitedAt: invitation.invitedAt,
      },
    });
  } catch (error: any) {
    return c.json({ message: error.message }, { status: 500 });
  }
});
app.get('/pending', async (c: any) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const invitations = await Invitation.find({
      email: user.email,
      status: 'pending',
    }).populate('organizationId invitedBy');

    const formattedInvitations = invitations.map(invitation => ({
      id: invitation._id,
      email: invitation.email,
      role: invitation.role,
      organization: {
        id: invitation.organizationId._id,
        name: invitation.organizationId.name,
      },
      inviter: {
        id: invitation.invitedBy._id,
        name: invitation.invitedBy.name,
      },
      invitedAt: invitation.invitedAt,
    }));

    return c.json({ invitations: formattedInvitations });
  } catch (error: any) {
    return c.json({ message: error.message }, { status: 500 });
  }
});
app.post('/send', async (c: any) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { emails, role, customMessage } = await c.req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return c.json({ message: 'No email addresses provided' }, { status: 400 });
    }

    if (!role) {
      return c.json({ message: 'Role is required' }, { status: 400 });
    }

    await connectDB();

    const organization = await Organization.findById(user.organizationId);
    if (!organization) {
      return c.json({ message: 'Organization not found' }, { status: 404 });
    }

    const inviter = await User.findById(user.id);
    if (!inviter) {
      return c.json({ message: 'Inviter not found' }, { status: 404 });
    }

    const results = await Promise.all(
      emails.map(async (email: string) => {
        try {
          const existingInvitation = await Invitation.findOne({
            email,
            organizationId: user.organizationId,
            status: 'pending',
          });

          if (existingInvitation) {
            return {
              email,
              success: false,
              message: 'Invitation already sent',
            };
          }

          const invitation = await Invitation.create({
            email,
            organizationId: user.organizationId,
            invitedBy: user.id,
            role,
            status: 'pending',
            invitedAt: new Date(),
          });

          const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${invitation._id}`;

          try {
            await resend.emails.send({
              from: defaultFrom,
              to: email,
              subject: `${inviter.name} invited you to join ${organization.name} on TaskMantra`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6ebf1; border-radius: 8px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://vercel.com/api/v0/deployments/dpl_4rT1F2NQeFVqgwmfr2tcLK56KCRZ/favicon?project=task-mantra&readyState=READY&teamId=team_UqHydx5mzWPxgu7M28BW5toP" alt="TaskMantra" width="120" height="40" style="display: block; margin: 0 auto 20px;">
                    <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">You've been invited to join a team</h1>
                  </div>

                  <p style="color: #444; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    <strong>${inviter.name}</strong> has invited you to join <strong>${organization.name}</strong> on TaskMantra as a <strong>${role}</strong>.
                  </p>

                  ${
                    customMessage
                      ? `
                  <div style="background-color: #f8f9fa; border-left: 4px solid #4f46e5; border-radius: 4px; margin: 20px 0; padding: 15px;">
                    <p style="color: #555; font-size: 16px; font-style: italic; line-height: 1.5; margin: 0;">
                      ${customMessage}
                    </p>
                  </div>
                  `
                      : ''
                  }

                  <p style="color: #444; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    TaskMantra is a collaborative task management platform that helps teams organize, track, and complete work efficiently.
                  </p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      Accept Invitation
                    </a>
                  </div>

                  <p style="color: #777; font-size: 14px; line-height: 1.5; margin-top: 20px;">
                    This invitation was sent to ${email}. If you were not expecting this invitation, you can ignore this email.
                  </p>

                  <p style="color: #777; font-size: 14px; line-height: 1.5; margin-top: 20px;">
                    If the button above doesn't work, copy and paste this URL into your browser:
                    <a href="${inviteLink}" style="color: #4f46e5; text-decoration: underline;">${inviteLink}</a>
                  </p>

                  <p style="color: #999; font-size: 13px; line-height: 1.5; margin-top: 30px; text-align: center;">
                    © ${new Date().getFullYear()} TaskMantra. All rights reserved.
                  </p>
                </div>
              `,
            });
            // if it return with statusCode 403 that means the email is not verified
          } catch (emailError: any) {
            throw new Error(`Email sending failed: ${emailError.message}`);
          }

          await NotificationService.createNotification({
            userId: user.id,
            title: 'Invitation Sent',
            description: `You have successfully invited ${email} to join ${organization.name} as a ${role}.`,
            type: 'team',
            link: `/dashboard/organizations/${user.organizationId}/members`,
          });

          return {
            email,
            success: true,
            inviteId: invitation._id,
          };
        } catch (error: any) {
          return {
            email,
            success: false,
            message: error.message,
          };
        }
      })
    );

    const successCount = results.filter(result => result.success).length;

    return c.json({
      message: `${successCount} of ${emails.length} invitations sent successfully`,
      results,
    });
  } catch (error: any) {
    return c.json({ message: error.message }, { status: 500 });
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
