import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/Utility/db";
import { Invitation } from "@/models/Invitations";
import { OrganizationMembers } from "@/models/OrganizationMembers";

export async function POST(req) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { email } = await req.json();

        await connectDB()

        const invite = await Invitation.findOne({ email, status: "pending" });
        if (!invite) return NextResponse.json({ message: "Invite not found" }, { status: 404 });

        await OrganizationMembers.create({
            organizationId: invite.organizationId,
            userId: session.user.id,
            role: invite.role,
        });

        await Invitation.updateOne({ _id: invite._id }, { status: "accepted" });

        return NextResponse.json({ message: "Invite accepted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}