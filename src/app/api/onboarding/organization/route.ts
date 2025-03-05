import { Hono } from "hono"
import { handle } from "hono/vercel"
import { logger } from "hono/logger"
import createOrganization from "@/routes/onboarding/organization/route"
import { authOptions } from "../../auth/[...nextauth]/options"
import { getServerSession } from "next-auth"

const app = new Hono().basePath("/api")

app.use("*", logger())

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

const routes = app
    .route("/onboarding", createOrganization)

export const GET = handle(routes)
export const POST = handle(routes)
export const DELETE = handle(routes)
export const PUT = handle(routes)
