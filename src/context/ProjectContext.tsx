import { createContext, useContext, useState } from 'react';

interface Subtask {
    id: string;
    name: string;
    completed: boolean;
}

interface Attachment {
    id: string;
    filename: string;
    url: string;
}

interface Comment {
    userId: User;
    text: string;
    timestamp: string;
    attachments: Attachment[];
}

interface User {
    id: string;
    name: string;
    role: string;
}

interface Task {
    id: string;
    name: string;
    description: string;
    assignedTo: [User];
    status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    startDate: string;
    estimatedTime: number;
    loggedTime: number;
    dependencies: number[];
    subtasks: Subtask[];
    comments: Comment[];
}
interface ActivityLogEntry {
    timestamp: string;
    userId: number;
    action: string;
    details: Record<string, string | number | boolean | null>;
}


interface Project {
    id: string;
    name: string;
    description: string;
    status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
    priority: 'High' | 'Medium' | 'Low';
    tasks: Task[];
    history: [ActivityLogEntry]
}




interface ProjectContextType {
    projectData: Project | null;
    setProjectData: (project: Project | null) => void;
    createProject: (project: Project) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
}

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    const createProject = (project: Project) => {
        setProjectData(project);
    }


    return (
        <ProjectContext.Provider value={{ projectData, setProjectData, createProject, currentStep, setCurrentStep }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);