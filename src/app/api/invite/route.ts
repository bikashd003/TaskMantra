import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/Utility/db";
import { Invitation } from "@/models/Invitations";

export async function POST(req) {
    try {
        const session = await getServerSession();
        if (!session || session.user.systemRole !== "Admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { email, organizationId, role } = await req.json();
        await connectDB()
        const invite = await Invitation.create({
            email,
            organizationId,
            invitedBy: session.user.id,
            role,
        });

        // TODO: Send email with invite link (e.g., /accept-invite?token=invite._id)
        return NextResponse.json({ message: "Invite sent", inviteId: invite._id }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}