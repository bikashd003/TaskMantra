"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChevronDownIcon, Slash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject } from "@/context/ProjectContext";
import Link from "next/link";
import ProjectPageContent from "@/components/IndividualProject/ProjectPageContent";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { data: projectData, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/get-project/${projectId}`);
      return data;
    },
  });
  const projectContext = useProject();
  const projects = projectContext?.allProjects?.projects || [];

  const project = projectData?.project?.projectId;
  const projectRole = projectData?.project?.projectRole;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-96px)] bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="py-2 px-4 bg-white min-h-[calc(100vh-96px)] rounded-lg">
      <header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/home">Home</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  Projects
                  <ChevronDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Create Project +</DropdownMenuItem>
                  {projects.map((project: any) => (
                    <DropdownMenuItem
                      key={project?._id}
                      className="cursor-pointer"
                      onClick={() => {}}
                    >
                      {project?.projectId?.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{project?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <ProjectPageContent project={project}/>
    </ScrollArea>
  );
}
