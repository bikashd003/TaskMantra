import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { connectDB } from '@/Utility/db';
import { Integration } from '@/models/Integration';
import { NotificationService } from '@/services/Notification.service';
import { Client } from '@notionhq/client';
import { Project } from '@/models/Project';
import { Task } from '@/models/Task';

type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    organizationId?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/notion');

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

async function getNotionClient(userId: string) {
  await connectDB();

  const integration = await Integration.findOne({
    userId,
    provider: 'notion',
  });

  if (!integration) {
    throw new Error('Notion integration not found');
  }

  const notion = new Client({ auth: integration.accessToken });
  return notion;
}

// Define types for Notion API responses
interface NotionPage {
  id: string;
  object: string;
  created_time: string;
  last_edited_time: string;
  url: string;
  icon?: {
    type?: string;
    emoji?: string;
    external?: {
      url: string;
    };
  };
  properties?: Record<string, any>;
}

interface NotionSearchResponse {
  results: Array<NotionPage>;
  next_cursor: string | null;
  has_more: boolean;
}

app.get('/pages', async c => {
  try {
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notion = await getNotionClient(user.id);

    // Fix the filter syntax according to Notion API documentation
    const response = (await notion.search({
      filter: {
        value: 'page',
        property: 'object',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
    })) as NotionSearchResponse;

    const pages = await Promise.all(
      response.results.map(async (page: NotionPage) => {
        let title = 'Untitled';

        // Try to extract title from page properties
        if (page.properties && page.properties.title) {
          const titleProperty = page.properties.title;
          if (titleProperty.title && titleProperty.title.length > 0) {
            title = titleProperty.title.map((t: any) => t.plain_text).join('');
          }
        }

        // If title is still "Untitled", try to retrieve the page to get more details
        if (title === 'Untitled' && page.id) {
          try {
            const pageContent = await notion.pages.retrieve({ page_id: page.id });
            if ('properties' in pageContent && pageContent.properties) {
              // Look for a title property
              for (const [_key, value] of Object.entries(pageContent.properties)) {
                if (value.type === 'title' && value.title && value.title.length > 0) {
                  title = value.title.map((t: any) => t.plain_text).join('');
                  break;
                }
              }
            }
          } catch (_error) {
            // Ignore errors when retrieving page content
          }
        }

        return {
          id: page.id,
          title,
          icon: page.icon?.emoji || page.icon?.external?.url || null,
          lastUpdated: page.last_edited_time,
          url: page.url,
        };
      })
    );

    return c.json({ success: true, pages });
  } catch (error: any) {
    return c.json({ error: error.message }, { status: 500 });
  }
});

// Import a Notion page as a task
app.post('/import-page', async c => {
  try {
    const user = c.get('user');
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId } = await c.req.json();
    if (!pageId) {
      return c.json({ error: 'Page ID is required' }, { status: 400 });
    }

    const notion = await getNotionClient(user.id);

    // Get the page details
    const page = (await notion.pages.retrieve({ page_id: pageId })) as any;

    // Extract title
    let title = 'Untitled';
    if (page.properties && page.properties.title) {
      const titleProperty = page.properties.title;
      if (titleProperty.title && titleProperty.title.length > 0) {
        title = titleProperty.title.map((t: any) => t.plain_text).join('');
      }
    }

    // Create a new task
    await connectDB();

    // Find or create a default project
    let project = await Project.findOne({
      userId: user.id,
      name: 'Notion Imports',
    });

    if (!project) {
      project = new Project({
        name: 'Notion Imports',
        userId: user.id,
        description: 'Tasks imported from Notion',
        organizationId: user.organizationId,
      });
      await project.save();
    }

    // Create the task
    const task = new Task({
      title,
      description: `Imported from Notion: ${page.url}`,
      status: 'todo',
      priority: 'medium',
      projectId: project._id,
      userId: user.id,
      organizationId: user.organizationId,
      metadata: {
        notionPageId: pageId,
        notionPageUrl: page.url,
      },
    });

    await task.save();

    // Create notification
    await NotificationService.createNotification({
      userId: user.id,
      title: 'Notion Page Imported',
      description: `"${title}" has been imported as a task`,
      type: 'success',
      link: `/tasks?id=${task._id}`,
    });

    return c.json({
      success: true,
      message: 'Page imported successfully',
      task: {
        id: task._id,
        title: task.title,
        status: task.status,
        projectId: task.projectId,
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, { status: 500 });
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
