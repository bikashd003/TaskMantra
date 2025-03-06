import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import { getServerSession } from "next-auth";
import { connectDB } from "@/Utility/db";
import { authOptions } from "../../auth/[...nextauth]/options";
import { Organization } from "@/models/organization";

const app = new Hono().basePath("/api/onboarding");

app.use("*", logger());

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

// /api/onboarding/status
app.get("/status", async (c: any) => {
    try {
        const user = c.get('user');
        if (!user?.id) {
            return c.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const hasCompletedOnboarding = await Organization.findOne({ ownerId: user.id });

        return c.json({ hasCompletedOnboarding }, { status: 200 });
    } catch (error: any) {
        return c.json({ message: error.message }, { status: 500 });
    }
});
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
