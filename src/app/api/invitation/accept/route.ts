import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import { getServerSession } from "next-auth";
import { connectDB } from "@/Utility/db";
import { Invitation } from "@/models/Invitations";
import { Organization } from "@/models/organization";
import { authOptions } from "../../auth/[...nextauth]/options";


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

app.post("/accept", async (c: any) => {
    try {
        const user = c.get('user');
        if (!user) return c.json({ message: "Unauthorized" }, { status: 401 });

        const { email } = await c.req.json();

        await connectDB();

        const invite = await Invitation.findOne({ email, status: "pending" });
        if (!invite) return c.json({ message: "Invite not found" }, { status: 404 });

        const org = await Organization.findOne({ _id: invite.organization });
        if (!org) return c.json({ message: "Organization not found" }, { status: 404 });
        if (org.members.includes(user.id)) return c.json({ message: "Already a member" }, { status: 400 });
        org.members.push({
            userId: user.id,
            role: invite.role,
            joinedAt: new Date(),
        });

        await Invitation.updateOne({ _id: invite._id }, { status: "accepted" });

        return c.json({ message: "Invite accepted" }, { status: 200 });
    } catch (error: any) {
        return c.json({ message: error.message }, { status: 500 });
    }
});
