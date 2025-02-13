import { connectDB } from "@/Utility/db";
import { Project } from "@/models/Project";
import {User} from "@/models/User";

const project = async (data:any) => {
    try {
        await connectDB();
        const { name, description, status, priority } = data;
        const newProject = new Project({
            name,
            description,
            status,
            priority,
            history: [],  // Initialize with empty array
            tasks: [],    // Initialize with empty array
            files: []     // Initialize with empty array
        });
        const res = await newProject.save();
        return res;
    } catch (error:any) {
        return error;
    }
}
const getAllProjects = async (userId:string) => {
    try {
        await connectDB();
        console.log(userId)
        const user=await User.findById(userId)
        .populate({
            path: 'projects',
            populate: {
                path: 'projectId',
            }
        });
        return user.projects;
    } catch (error:any) {
        return error;
    }
}

export {project,getAllProjects}