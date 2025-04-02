import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger } from "hono/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { Organization } from "@/models/organization";

type Variables = {
    user?: {
        id?: string;
        name?: string;
        email?: string;
        image?: string;
    };
}
const app = new Hono<{ Variables: Variables }>().basePath("/api/settings/member");
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

const getTeamMembers = async (c: any) => {
    try {
        const user = c.get("user");
        const search = c.req.query('search');
        const role = c.req.query('role');
        
        // Get organizations where user is a member
        const organizationMembers = await Organization.find({
            'members.userId': user?.id
        })
            .select('members')
            .populate({
                path: 'members.userId',
                model: 'User'
            });
            
        // Filter members based on search and role parameters
        const filteredOrganizations = organizationMembers.map(org => {
            // Create a copy of the organization to avoid modifying the original
            const filteredOrg = { ...org.toObject() };
            
            // Filter members based on search query and role
            filteredOrg.members = filteredOrg.members.filter((member: any) => {
                // Skip filtering if no search or role parameters
                if (!search && !role) return true;
                
                const memberUser = member.userId;
                if (!memberUser) return false;
                
                // Filter by role if specified
                if (role && member.role !== role) return false;
                
                // Filter by search query if specified
                if (search) {
                    const searchLower = search.toLowerCase();
                    const nameMatch = memberUser.name?.toLowerCase().includes(searchLower);
                    const emailMatch = memberUser.email?.toLowerCase().includes(searchLower);
                    
                    return nameMatch || emailMatch;
                }
                
                return true;
            });
            
            return filteredOrg;
        });
        
        // Remove password field from user data
        filteredOrganizations.forEach(org => {
            org.members.forEach((member: any) => {
                if (member.userId) {
                    member.userId.password = undefined;
                }
            });
        });
        
        // Filter out organizations with no matching members
        return filteredOrganizations.filter(org => org.members.length > 0);

    } catch (error: any) {
        throw new Error(error.message);
    }
}

app.get("/", async (c) => {
    try {
        const teamMembers = await getTeamMembers(c);
        return c.json({
            teamMembers
        });
    } catch (error: any) {
        throw new Error(error.message);
    }
});

export const GET = handle(app);
export const PUT = handle(app);