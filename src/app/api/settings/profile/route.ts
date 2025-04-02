import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getProfileSetting, updateProfileImage, updateProfileSetting } from "@/routes/settings/profile/route";

type Variables = {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

const app = new Hono<{ Variables: Variables }>().basePath('/api/settings/profile');

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
  } catch (error: any) {
    throw new Error(error.message);
  }
  await next();
});

const updateProfileSettingController = async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    const data = await c.req.json();
    const result = await updateProfileSetting(user.id, data);
    if (result instanceof Error) {
      return c.json({ error: result.message }, 500);
    }
    return c.json({ message: 'Profile updated successfully', profile: result });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

const getProfileSettingController = async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    const result = await getProfileSetting(user.id);
    if (result instanceof Error) {
      return c.json({ error: result.message }, 500);
    }
    return c.json({ profile: result });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};
const updateProfileImageController = async (c: any) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    const data = await c.req.json();
    const result = await updateProfileImage(user.id, data);
    if (result instanceof Error) {
      return c.json({ error: result.message }, 500);
    }
    return c.json({ profile: result });
  } catch (error: any) {
    return c.json({ error: error.message }, 500)

  }
}


app.patch('/', updateProfileSettingController);
app.get('/', getProfileSettingController);
app.post('/', updateProfileImageController)


export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);