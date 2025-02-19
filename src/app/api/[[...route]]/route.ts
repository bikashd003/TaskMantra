import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import { createProject, getAllProjects, getProjectById } from '@/routes/Project/route';

// Define the type for your context
type Variables = {
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api');

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
  } catch (error:any) {
   throw new Error(error.message);  
  }
  await next();
});

const createTask = async (c) => {
  return c.json({ message: 'Task created successfully' });
};

const createProjectController = async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    const result = await createProject(body, user.id);
    if (result instanceof Error) {
      return c.json({ error: result.message }, 500);
    }
    return c.json({ message: 'Project created successfully', project: result });
  } catch (error:any) {
    return c.json({ error: error.message }, 500);
  }
};

const getAllProjectsByUserController = async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    const result = await getAllProjects(user.id);
    if (result instanceof Error) {
      return c.json({ error: result.message }, 500);
    }
    return c.json({ projects: result });
  } catch (error:any) {
    return c.json({ error: error.message }, 500);
  }
};

const getProjectByIdController = async (c:any) => {
    try {
        const user = c.get('user');
        if (!user) {
            return c.json({ error: 'User not authenticated' }, 401);
        }
        const result = await getProjectById(c.req.param('projectId'), user.id);
        if (result instanceof Error) {
            return c.json({ error: result.message }, 500);
        }
        return c.json({ project: result });
    } catch (error:any) {
        return c.json({ error: error.message }, 500);
    }
}

app.post('/create-task', createTask);
app.post('/create-project', createProjectController);
app.get('/get-all-projects', getAllProjectsByUserController);
app.get('/get-project/:projectId',getProjectByIdController);
app.put('/update-project/:id', );
app.delete('/delete-project/:id', );

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);