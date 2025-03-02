import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/Utility/db";
import { Organization } from "@/models/organization";
import { OrganizationMembers } from "@/models/OrganizationMembers";

export async function POST(req) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, location, description } = await req.json();
        await connectDB()

        // Create the organization
        const organization = await Organization.create({
            name,
            location,
            description,
            ownerId: session.user.id,
        });

        // Link the user as the owner
        await OrganizationMembers.create({
            organizationId: organization._id,
            userId: session.user.id,
            role: "Owner",
        });

        return NextResponse.json({ message: "Organization created" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}