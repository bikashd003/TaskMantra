'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronDownIcon, Slash } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ProjectService } from '@/services/Project.service';
import ProjectKanban from '@/components/IndividualProject/ProjectKanban';
import ProjectAnalytics from '@/components/IndividualProject/ProjectAnalytics';
import { useEffect, useState } from 'react';

export default function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) {
        return { project: null };
      }
      const response = await ProjectService.getProjectById(projectId as string);
      return response || { project: null };
    },
    enabled: !!projectId,
  });
  useEffect(() => {
    if (projectData?.project) {
      setProject(projectData.project);
    }
  }, [projectData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-96px)] theme-surface">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    );
  }
  return (
    <div className="h-full w-full flex flex-col overflow-hidden theme-surface">
      <header className="py-4 px-2 theme-border-bottom">
        <Breadcrumb className="text-sm">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link
                href="/home"
                className="theme-text-secondary hover:text-primary theme-transition"
              >
                Home
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash className="h-4 w-4 theme-text-secondary" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 theme-text-secondary hover:text-primary theme-transition">
                  Projects
                  <ChevronDownIcon className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="theme-surface-elevated theme-shadow-lg"
                >
                  <DropdownMenuItem className="flex items-center gap-2 font-medium theme-button-ghost">
                    Create Project +
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash className="h-4 w-4 theme-text-secondary" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold theme-text-primary">
                {project?.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 p-2 w-full">
        <Tabs defaultValue="kanban" className="w-full h-full flex flex-col space-y-4">
          <TabsList className="w-fit theme-border theme-surface-elevated">
            <TabsTrigger value="kanban" className="px-6 theme-button-ghost">
              Kanban
            </TabsTrigger>
            <TabsTrigger value="analytics" className="px-6 theme-button-ghost">
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="kanban" className="w-full h-full">
            <ProjectKanban project={project} />
          </TabsContent>
          <TabsContent value="analytics" className="w-full">
            <ProjectAnalytics project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
