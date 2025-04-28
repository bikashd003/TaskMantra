import { uploadToCloudinary } from '@/Utility/cloudinary';
import { connectDB } from '@/Utility/db';
import { Project } from '@/models/Project';
import { ProjectMembers } from '@/models/ProjectMembers';
import { Task } from '@/models/Task';

const createProject = async (data: any, id: string) => {
  try {
    await connectDB();
    const { name, description, status, priority, tasks, files } = data;
    // create task
    const formatedTasks = tasks.map((task: any) => {
      return {
        name: task.name,
        description: task.description,
        assignedTo: task.assignedTo,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        startDate: task.startDate,
        estimatedTime: task.estimatedTime,
        loggedTime: task.loggedTime,
        subtasks: task.subtasks,
        comments: task.comments,
        createdBy: id,
      };
    });
    const createdTasks = await Task.insertMany(formatedTasks);
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
    const formatedFiles = uploadedFiles.map((file, index: number) => ({
      url: file.secure_url,
      public_id: file.public_id,
      name: files[index].name,
    }));
    // create project
    const newProject = new Project({
      name,
      description,
      ownerId: id,
      status,
      priority,
      history: [], // Initialize with empty array
      tasks: createdTasks.map((task: any) => task._id),
      files: formatedFiles,
    });
    const res = await newProject.save();
    // update those tasks with project id
    await Task.updateMany(
      { _id: { $in: createdTasks.map((task: any) => task._id) } },
      { $set: { projectId: res._id } }
    );
    // create project members
    const additionalMembers =
      tasks.length > 0
        ? formatedTasks.flatMap((task: any) => {
            // Skip if assignedTo is empty or not an array
            if (!Array.isArray(task.assignedTo) || task.assignedTo.length === 0) {
              return [];
            }
            // Create a member entry for each assigned user
            return task.assignedTo.map((userId: string) => ({
              userId,
              role: 'Developer',
              invitedAt: new Date(),
            }));
          })
        : [];

    // Remove duplicates based on userId
    const uniqueMembers = [
      {
        userId: id,
        role: 'Project Admin',
        invitedAt: new Date(),
        acceptedAt: new Date(), // Project creator automatically accepts
      },
      ...additionalMembers.filter(
        (member, index, self) => index === self.findIndex(m => m.userId === member.userId)
      ),
    ];

    await new ProjectMembers({
      projectId: res._id,
      members: uniqueMembers,
    }).save();
    return res;
  } catch (error: any) {
    return error;
  }
};
const getAllProjects = async (userId: string) => {
  try {
    await connectDB();
    // find userId on project members
    const projectMembers = await ProjectMembers.find({ members: { $elemMatch: { userId } } });
    // find projectId on project
    const projects = await Project.find({
      _id: { $in: projectMembers.map((project: any) => project.projectId) },
    });
    return projects;
  } catch (error: any) {
    return error;
  }
};

const getProjectById = async (projectId: string, _userId: string) => {
  try {
    await connectDB();
    const project = await Project.findById(projectId);
    return project;
  } catch (error: any) {
    return error;
  }
};

const getTaskById = async (taskId: string, userId: string) => {
  try {
    await connectDB();
    const task = await Task.findById(taskId).populate({
      path: 'assignedTo',
    });
    if (task.createdBy.toString() !== userId) {
      throw new Error('You are not authorized to view this task');
    }
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  } catch (error: any) {
    return error;
  }
};

const updateTask = async (taskId: string, data: any) => {
  try {
    await connectDB();
    const task = await Task.findByIdAndUpdate(taskId, data);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  } catch (error: any) {
    return error;
  }
};

export { createProject, getAllProjects, getProjectById, getTaskById, updateTask };
