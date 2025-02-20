import React from "react";
import ProjectKanban from "./ProjectKanban";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectAnalytics from "./ProjectAnalytics";

const ProjectPageContent = ({ project }: { project: any }) => {
  return (
    <div className="mt-2">
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban" className="w-full">
            <ProjectKanban project={project} />
          </TabsContent>
          <TabsContent value="analytics" className="w-full">
            <ProjectAnalytics project={project} />
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default ProjectPageContent;
