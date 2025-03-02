import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/Utility/db";
import { Invitation } from "@/models/Invitations";

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await connectDB();

        const invite = await Invitation.findOne({ email: session.user.email, status: "pending" }).populate(
            "organizationId",
            "name"
        );
        if (!invite) return NextResponse.json({ message: "No invite found" }, { status: 404 });

        return NextResponse.json({
            email: invite.email,
            organizationName: invite.organizationId.name,
            role: invite.role,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}