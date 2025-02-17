import { uploadToCloudinary } from "@/Utility/cloudinary";
import { connectDB } from "@/Utility/db";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import {User} from "@/models/User";

const createProject = async (data:any,id:string) => {
    try {
        await connectDB();
        const { name, description, status, priority,tasks,files } = data;
        // create task
        const formatedTasks=tasks.map((task:any)=>{
            return {
                name:task.name,
                description:task.description,
                assignedTo:task.assignedTo,
                status:task.status,
                priority:task.priority,
                dueDate:task.dueDate,
                startDate:task.startDate,
                estimatedTime:task.estimatedTime,
                loggedTime:task.loggedTime,
                subtasks:task.subtasks,
                comments:task.comments,
                createdBy:id,
            }
        })
        const createdTasks= await Task.insertMany(formatedTasks);
        // upload files to cloudinary
        interface UploadedFile {
            secure_url: string;
            public_id: string;
        }
        const uploadedFiles: UploadedFile[] = [];
        for (const file of files) {
            const { secure_url, public_id } = await uploadToCloudinary(file.data);
            uploadedFiles.push({ secure_url, public_id });
        }
        const formatedFiles = uploadedFiles.map((file, index:number) => ({
            url: file.secure_url,
            public_id: file.public_id,
            name: files[index].name
        }))
        // create project
        const newProject = new Project({
            name,
            description,
            status,
            priority,
            history: [],  // Initialize with empty array
            tasks: createdTasks.map((task:any)=>task._id),
            files: formatedFiles,
        });
        const res = await newProject.save();
        // update those tasks with project id
        await Task.updateMany({ _id: { $in: createdTasks.map((task:any)=>task._id) } }, { $set: { projectId: res._id } });
        // push project id to user projects array and also
        await User.findByIdAndUpdate(id, { $push: { projects: { projectId: res._id,projectRole:"Project Admin"}} });
        return res;
    } catch (error:any) {
        return error;
    } 
}
const getAllProjects = async (userId:string) => {
    try {
        await connectDB();
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

export {createProject,getAllProjects}