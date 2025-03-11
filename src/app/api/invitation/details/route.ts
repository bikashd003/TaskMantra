import { Hono } from 'hono'
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import { getServerSession } from "next-auth";
import { connectDB } from "@/Utility/db";
import { Invitation } from "@/models/Invitations";
import { authOptions } from '../../auth/[...nextauth]/options';

const app = new Hono().basePath("/api/invitation");

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
app.get("/details", async (c: any) => {
    try {
        const user = c.get('user');
        if (!user) throw new Error("User not found");
        await connectDB();
        const invitations = await Invitation.findOne({ email: user.email, status: "pending" }).populate(
            "organizationId",
            "name"
        )
        if (!invitations) return c.json({ message: "No invite found" }, { status: 404 });
        const inviteData = {
            email: invitations.email,
            organizationName: invitations.organizationId.name,
            role: invitations.role,
        }
        return c.json({ inviteData });
    } catch (error: any) {
        throw new Error(error.message);
    }
});
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
