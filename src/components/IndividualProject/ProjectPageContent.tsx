import React from "react";
import ProjectKanban from "./ProjectKanban";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const ProjectPageContent = () => {
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="kanban" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban">
            <ProjectKanban />
          </TabsContent>
          <TabsContent value="analytics">Analytics</TabsContent>
        </Tabs>
        <div>{/* all  workers of the project */}</div>
      </div>
      <Separator />
    </div>
  );
};

export default ProjectPageContent;
