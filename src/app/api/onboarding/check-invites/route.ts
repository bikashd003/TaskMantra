import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/Utility/db";
import { Invitation } from "@/models/Invitations";

export async function GET() {
    try {
        await connectDB();
        const session = await getServerSession();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const invite = await Invitation.findOne({ email: session.user.email, status: "pending" });
        return NextResponse.json({ hasInvite: !!invite }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}