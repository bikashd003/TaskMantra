import { NextResponse } from "next/server";
import { OrganizationMembers } from "@/models/OrganizationMembers";
import { getServerSession } from "next-auth";
import { connectDB } from "@/Utility/db";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
    try {
        const user = await getServerSession(authOptions);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        await connectDB()

        const hasCompletedOnboarding = await OrganizationMembers.exists({
            userId: user.id,
        });

        return NextResponse.json({ hasCompletedOnboarding }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}