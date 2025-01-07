// ProjectContext.tsx
import { createContext, useContext, useState } from 'react';

// Define detailed interfaces based on the data structure
interface Subtask {
    id: number;
    name: string;
    completed: boolean;
}

interface Attachment {
    filename: string;
    url: string;
}

interface Comment {
    userId: number;
    text: string;
    timestamp: string;
    attachments: Attachment[];
}

interface Task {
    id: number;
    name: string;
    description: string;
    assignedTo: number[];
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

interface Project {
    id: number;
    name: string;
    description: string;
    status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
    priority: 'High' | 'Medium' | 'Low';
    tasks: Task[];
}

interface User {
    id: number;
    name: string;
    role: string;
    availability: Record<string, boolean>;
}

interface File {
    id: number;
    name: string;
    url: string;
}

interface CalendarEvent {
    taskId?: number;
    type: 'deadline' | 'meeting';
    title?: string;
    startTime?: string;
    endTime?: string;
    participants?: number[];
}

interface CalendarDay {
    date: string;
    events: CalendarEvent[];
}

interface ActivityLogEntry {
    timestamp: string;
    userId: number;
    action: string;
    details: Record<string, string | number | boolean | null>;
}

interface ProjectManagementData {
    projects: Project[];
    users: User[];
    files: File[];
    calendar: CalendarDay[];
    activityLog: ActivityLogEntry[];
}

// Create the context with the new interface
const ProjectContext = createContext<{
    projectData: ProjectManagementData;
    updateProjectData: (section: keyof ProjectManagementData, data: unknown) => void;
}>({
    projectData: {
        projects: [],
        users: [],
        files: [],
        calendar: [],
        activityLog: []
    },
    updateProjectData: () => { }
});

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [projectData, setProjectData] = useState<ProjectManagementData>({
        projects: [],
        users: [],
        files: [],
        calendar: [],
        activityLog: []
    });

    const updateProjectData = (section: keyof ProjectManagementData, data: unknown) => {
        setProjectData(prev => ({
            ...prev,
            [section]: data
        }));
    };

    return (
        <ProjectContext.Provider value={{ projectData, updateProjectData }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);