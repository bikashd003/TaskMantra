import React, { createContext, useContext, useState } from 'react';
import { projectInfoSchema } from "@/app/Schemas/ProjectInfo"
import { useForm, Control, FieldErrors, UseFormHandleSubmit, UseFormTrigger } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'


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


export interface Project {
    name: string;
    description: string;
    status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
    priority: 'High' | 'Medium' | 'Low';
    tasks: Task[];
    history: ActivityLogEntry[]
}




interface ProjectContextType {
    projectData: Project | null;
    setProjectData: (project: Project | null) => void;
    createProject: (project: Project) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    onSubmit: (data: Project) => void;
    control: Control<Project>;
    errors: FieldErrors<Project>;
    handleSubmit: UseFormHandleSubmit<Project>;
    trigger: UseFormTrigger<Project>;
}

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const {
        control,
        handleSubmit,
        formState: { errors },
        trigger,
    } = useForm<Project>({
        resolver: yupResolver(projectInfoSchema),
        defaultValues: {
            name: '',
            description: '',
            priority: 'Medium',
            status: 'Planning',
            tasks: [],
            history: []
        },
    });
    const onSubmit = async (data: Project) => {
        try {
            console.log('Submitting project:', data);
            setProjectData((prevData) => prevData ? { ...prevData, ...data } : data);
            setCurrentStep((prev) => prev + 1);
        } catch (error) {
            console.error('Error submitting project:', error);
        }
    };

    const createProject = (project: Project) => {
        setProjectData(project);
    }
    const contextValue = React.useMemo(() => ({
        projectData,
        setProjectData,
        createProject,
        currentStep,
        setCurrentStep,
        onSubmit,
        control,
        errors,
        handleSubmit,
        trigger,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [projectData, currentStep, errors]);

    return (
        <ProjectContext.Provider value={contextValue}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);