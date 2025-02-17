import { NextResponse } from "next/server";
import { connectDB } from "@/Utility/db"; 
import {Project} from "@/models/Project";

export async function GET(
    request: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        await connectDB();
        const projectId =await params.projectId;

        const project = await Project.findById(projectId);
        
        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (_error:any) {
        return NextResponse.json(
            { error: _error.message },
            { status: 500 }
        );
    }
}
