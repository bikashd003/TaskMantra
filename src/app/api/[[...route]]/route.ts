import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { logger } from 'hono/logger'

const app = new Hono().basePath('/api')

app.use('*', logger())

const createTask = async (c: any) => {
    return c.json({ message: 'Task created successfully' })
}

app.post('/create-task', createTask)

export const GET = handle(app)
export const POST = handle(app)
export const DELETE = handle(app)
export const PUT = handle(app)