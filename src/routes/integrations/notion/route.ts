import { connectDB } from '@/Utility/db';
import { Integration } from '@/models/Integration';
import { NotificationService } from '@/services/Notification.service';

const connectNotion = async (c: any, userId: string) => {
  try {
    const { accessToken, workspaceId, workspaceName } = await c.req.json();

    if (!accessToken) {
      return c.json({ error: 'Access token is required' }, { status: 400 });
    }

    await connectDB();

    // Check if integration already exists
    const existingIntegration = await Integration.findOne({
      userId: userId,
      provider: 'notion',
    });

    if (existingIntegration) {
      // Update existing integration
      existingIntegration.accessToken = accessToken;
      existingIntegration.workspaceId = workspaceId;
      existingIntegration.workspaceName = workspaceName;
      existingIntegration.lastSyncedAt = new Date();
      await existingIntegration.save();

      // Create notification
      await NotificationService.createNotification({
        userId: userId,
        title: 'Notion Integration Updated',
        description: 'Your Notion integration has been updated successfully.',
        type: 'integration',
        link: '/integrations',
      });

      return c.json({
        success: true,
        message: 'Notion integration updated successfully',
        integration: {
          provider: existingIntegration.provider,
          workspaceName: existingIntegration.workspaceName,
          lastSyncedAt: existingIntegration.lastSyncedAt,
        },
      });
    }

    // Create new integration
    const newIntegration = new Integration({
      userId: userId,
      provider: 'notion',
      accessToken,
      workspaceId,
      workspaceName,
      lastSyncedAt: new Date(),
    });

    await newIntegration.save();

    // Create notification
    await NotificationService.createNotification({
      userId: userId,
      title: 'Notion Integration Connected',
      description: 'Your Notion account has been connected successfully.',
      type: 'integration',
      link: '/integrations',
    });

    return c.json({
      success: true,
      message: 'Notion integration connected successfully',
      integration: {
        provider: newIntegration.provider,
        workspaceName: newIntegration.workspaceName,
        lastSyncedAt: newIntegration.lastSyncedAt,
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, { status: 500 });
  }
};

const disconnectNotion = async (c: any, userId: string) => {
  try {
    await connectDB();

    // Find and delete the integration
    const result = await Integration.findOneAndDelete({
      userId: userId,
      provider: 'notion',
    });

    if (!result) {
      return c.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Create notification
    await NotificationService.createNotification({
      userId: userId,
      title: 'Notion Integration Disconnected',
      description: 'Your Notion integration has been disconnected.',
      type: 'info',
      link: '/integrations',
    });

    return c.json({
      success: true,
      message: 'Notion integration disconnected successfully',
    });
  } catch (error: any) {
    return c.json({ error: error.message }, { status: 500 });
  }
};

const syncNotion = async (c: any, userId: string) => {
  try {
    await connectDB();
    const integration = await Integration.findOne({
      userId: userId,
      provider: 'notion',
    });

    if (!integration) {
      return c.json({ error: 'Integration not found' }, { status: 404 });
    }

    integration.lastSyncedAt = new Date();
    await integration.save();

    await NotificationService.createNotification({
      userId: userId,
      title: 'Notion Sync Completed',
      description: 'Your Notion data has been synced successfully.',
      type: 'success',
      link: '/integrations',
    });

    return c.json({
      success: true,
      message: 'Notion data synced successfully',
      lastSyncedAt: integration.lastSyncedAt,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, { status: 500 });
  }
};

export { connectNotion, disconnectNotion, syncNotion };
