import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import { getServerSession } from "next-auth";
import { connectDB } from "@/Utility/db";
import { OrganizationMembers } from "@/models/OrganizationMembers";
import { authOptions } from "../../auth/[...nextauth]/options";
import { uploadToCloudinary } from "@/Utility/cloudinary";
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
app.post("/organization", async (c: any) => {
    try {
        const user = c.get('user');
        if (!user?.id) {
            return c.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, location, description, image } = await c.req.json();
        await connectDB()
        let logoUrl = ""
        if (image) {
            const uploadResult = await uploadToCloudinary(image);
            if (uploadResult.error) {
                return c.json({ message: uploadResult.error }, { status: 400 });
            }
            logoUrl = uploadResult.secure_url;
        }


        // Create the organization
        const organization = await Organization.create({
            name,
            location,
            description,
            ownerId: user.id,
            logo: logoUrl,
        });

        // Link the user as the owner
        await OrganizationMembers.create({
            organizationId: organization._id,
            userId: user.id,
            role: "Owner",
        });

        return c.json({ message: "Organization created" }, { status: 200 });
    } catch (error: any) {
        return c.json({ message: error.message }, { status: 500 });
    }
});
app.get("/organization", async (c: any) => {
    try {
        const user = c.get('user');
        if (!user?.id) {
            return c.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB()
        const organization = await Organization.findOne({ ownerId: user.id });
        if (!organization) {
            return c.json({ message: "Organization not found" }, { status: 404 });
        }

        return c.json({ organization }, { status: 200 });
    } catch (error: any) {
        return c.json({ message: error.message }, { status: 500 });
    }
});
app.get("/organization/:organizationId", async (c: any) => {
    try {
        const user = c.get('user');
        if (!user?.id) {
            return c.json({ message: "Unauthorized" }, { status: 401 });
        }

        const organizationId = c.req.param('organizationId');
        await connectDB()
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return c.json({ message: "Organization not found" }, { status: 404 });
        }

        return c.json({ organization }, { status: 200 });
    } catch (error: any) {
        return c.json({ message: error.message }, { status: 500 });
    }
})
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
