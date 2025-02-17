import React from "react";
import ProjectKanban from "./ProjectKanban";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectAnalytics from "./ProjectAnalytics";

const ProjectPageContent = ({ project }: { project: any }) => {
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="kanban" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban">
            <ProjectKanban project={project} />
          </TabsContent>
          <TabsContent value="analytics">
            <ProjectAnalytics project={project} />
          </TabsContent>
        </Tabs>
        <div>
          {/* dp of all workers of the project */}
        </div>
      </div>
    </div>
  );
};

export default ProjectPageContent;
