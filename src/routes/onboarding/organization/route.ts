import { Hono } from "hono";
import { connectDB } from "@/Utility/db";
import { uploadToCloudinary } from "@/Utility/cloudinary";
import { Organization } from "@/models/organization";
import { OrganizationMembers } from "@/models/OrganizationMembers";

const createOrganization = new Hono()
    .post("/organization", async (c:any) => {
        try {
            const user = c.get('user');
console.log(user)
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

export default createOrganization;