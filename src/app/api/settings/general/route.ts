import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getGeneralSettings, updateGeneralSettings } from "@/routes/settings/general/route";
type Variables = {
    user?: {
        id?: string;
        name?: string;
        email?: string;
        image?: string;
    };
}
const app = new Hono<{ Variables: Variables }>().basePath("/api/settings/general");
app.use("*", logger());

app.use("*", async (c, next) => {
    try {
        const session = await getServerSession(authOptions);

        if (session?.user) {
            const userData = {
                id: session.user.id || "",
                name: session.user.name || "",
                email: session.user.email || "",
                image: session.user.image || "",
            };
            c.set("user", userData);
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
    await next();
});

const getGenerallSettingController = async (c: any) => {
    try {
        const user = c.get("user");
        if (!user) {
            return c.json({ error: 'User not authenticated' }, 401);
        }
        const result =await getGeneralSettings(user.id);
        return c.json({ general: result});
    } catch (error: unknown) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 500);
        } else {
            return c.json({ error: 'An unexpected error occurred' }, 500);
        }
    }
}

const updateGeneralSettingController = async (c) => {
    try {
        const user = c.get("user");
        if (!user) {
            return c.json({ error: 'User not authenticated' }, 401);
        }
        const data=await c.req.json();
        const result = await updateGeneralSettings(user.id, data);
        return c.json({ message: 'Profile updated successfully', general: result });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 500);
        } else {
            return c.json({ error: 'An unexpected error occurred' }, 500);
        }
    }
}

app.get("/", getGenerallSettingController)
app.put("/", updateGeneralSettingController)

export const GET = handle(app);
export const PUT = handle(app);