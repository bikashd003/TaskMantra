import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { logger } from 'hono/logger'


const app = new Hono().basePath('/api')

app.use('*', logger())

const createTask = async (c: any) => {
    return c.json({ message: 'Task created successfully' })
}

const routes = app
    .route('/create-task', createTask)

export const GET = handle(routes)
export const POST = handle(routes)
export const DELETE = handle(routes)
export const PUT = handle(routes)
