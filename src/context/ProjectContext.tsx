/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectInfoSchema } from "@/Schemas/ProjectInfo"
import { useForm, Control, FieldErrors, UseFormHandleSubmit, UseFormTrigger, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';




interface Attachment {
    filename: string;
    url: string;
}

interface Comment {
    userId: string;
    text: string;
    timestamp: string;
    attachments: Attachment[];
}

export interface User {
    id: string;
    name: string;
    role: string;
}
interface Subtask {
    name: string;
    completed: boolean;
}

interface Task {
    name: string;
    description?: string;
    assignedTo: User[];
    status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    startDate: string;
    estimatedTime: number;
    loggedTime: number;
    subtasks: Subtask[];
    comments: Comment[];
}
interface ActivityLogEntry {
    timestamp: string;
    userId: string;
    action: string;
    details: Record<string, string | number | boolean | null>;
}


export interface Project {
    name: string;
    description?: string;
    status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
    priority: 'High' | 'Medium' | 'Low';
    tasks: Task[];
    history: ActivityLogEntry[]
    files: File[];
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
    isProjectCreating: boolean;
}

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const { control, handleSubmit, formState: { errors }, trigger, reset } = useForm<Project>({
        resolver: yupResolver(projectInfoSchema) as Resolver<Project>,
        defaultValues: {
            name: '',
            description: '',
            priority: 'Medium',
            status: 'Planning',
            tasks: [
                {
                    name: '',
                    description: '',
                    assignedTo: [],
                    status: 'To Do',
                    priority: 'Medium',
                    dueDate: '',
                    startDate: '',
                    estimatedTime: 0,
                    loggedTime: 0,
                    subtasks: [],
                    comments: [],
                },
            ],
            history: [],
        },
    });
    const {mutate, isPending: isProjectCreating} = useMutation<void, Error, Project>({
        mutationFn: async (data: Project) => {
            await axios.post('/api/create-project', data)
        },
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            toast.success("Project created successfully")
            setCurrentStep(1)
            setProjectData(null)
            // reset form
            reset()
        }
    })
    const {data: projects, error, isLoading: isLoadingProjects} = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const {data} = await axios.get('/api/get-all-projects');
            return data as Project[];
        }
    })

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    const onSubmit = async (data: Project) => {
        try {
            // console.log('Submitting project:', data);
            mutate(data);

        } catch (error) {
            // eslint-disable-next-line no-console
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
        isProjectCreating,
        projects,
        isLoadingProjects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [projectData, currentStep, errors]);

    return (
        <ProjectContext.Provider value={contextValue}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);