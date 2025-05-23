import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { projectInfoSchema } from '@/Schemas/ProjectInfo';
import { useFormik } from 'formik';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  _id: string;
  id: string;
  name: string;
  role: string;
  image: string;
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

interface FileData {
  name: string;
  data: string;
  type: string;
}
export interface Project {
  name: string;
  description?: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  tasks: Task[];
  history: ActivityLogEntry[];
  files: FileData[];
}

interface ProjectsResponse {
  projects: Project[];
}

interface ProjectContextType {
  projectData: Project | null;
  setProjectData: (project: Project | null) => void;
  createProject: (project: Project) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formik: ReturnType<typeof useFormik<Project>>;
  isProjectCreating: boolean;
  allProjects: ProjectsResponse | null;
  isLoadingProjects: boolean;
  resetUploader: boolean;
  setResetUploader: React.Dispatch<React.SetStateAction<boolean>>;
  setProjectFiles: React.Dispatch<React.SetStateAction<FileData[]>>;
}

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [projectFiles, setProjectFiles] = useState<FileData[]>([]);
  const [resetUploader, setResetUploader] = useState(false);
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const { mutate, isPending: isProjectCreating } = useMutation<void, Error, Project>({
    mutationFn: async (data: Project) => {
      await axios.post('/api/create-project', data);
    },
    onError: error => {
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
      setCurrentStep(1);
      setProjectData(null);
      // reset form
      formik.resetForm();
      setResetUploader(true);
    },
  });

  const {
    data: projects,
    error,
    isLoading: isLoadingProjects,
  } = useQuery<ProjectsResponse>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await axios.get('/api/get-all-projects');
      return data as ProjectsResponse;
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const handleSubmit = async (values: Project) => {
    try {
      const formattedData = {
        ...values,
        files: projectFiles || [],
      };
      mutate(formattedData);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formik = useFormik<Project>({
    initialValues: {
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
      files: [],
    },
    validationSchema: projectInfoSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: handleSubmit,
  });

  const createProject = (project: Project) => {
    setProjectData(project);
  };

  const contextValue = useMemo(
    () => ({
      projectData,
      setProjectData,
      createProject,
      currentStep,
      setCurrentStep,
      formik,
      isProjectCreating,
      allProjects: projects || null,
      isLoadingProjects,
      resetUploader,
      setResetUploader,
      setProjectFiles,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectData, currentStep, formik.values, formik.errors, projects]
  );

  return <ProjectContext.Provider value={contextValue}>{children}</ProjectContext.Provider>;
};

export const useProject = () => useContext(ProjectContext);
