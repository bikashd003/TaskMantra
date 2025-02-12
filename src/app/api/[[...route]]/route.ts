import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { logger } from 'hono/logger'
import project from '@/routes/Project/route'

const app = new Hono().basePath('/api')

app.use('*', logger())

const createTask = async (c: any) => {
    return c.json({ message: 'Task created successfully' })
}

const createProject = async (c: any) => {
    try {
        const body = await c.req.json();
        const result = await project(body);
        if (result instanceof Error) {
            return c.json({ error: result.message }, 500);
        }
        return c.json({ message: 'Project created successfully', project: result });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
}

app.post('/create-task', createTask)
app.post('/create-project', createProject)

export const GET = handle(app)
export const POST = handle(app)
export const DELETE = handle(app)
export const PUT = handle(app)