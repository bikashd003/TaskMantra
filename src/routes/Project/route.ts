import { connectDB } from "@/Utility/db";
import { Project } from "@/models/Project";

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
export default project;