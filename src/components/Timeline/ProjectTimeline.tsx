/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  projectId?: string;
  users: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface ProjectTimelineProps {
  items: TimelineItem[];
  isLoading: boolean;
  projects: Project[];
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  items,
  isLoading,
  projects
}) => {
  const getStatusConfig = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return { ring: 'border-green-500' };
      case 'in_progress':
        return { ring: 'border-blue-500' };
      case 'delayed':
        return { ring: 'border-red-500' };
      default:
        return { ring: 'border-gray-500' };
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-20 bg-gray-100 rounded-lg"></div>
        </div>
      ))}
    </div>
  );

  const TimelineItemComponent = ({ item }: { item: TimelineItem }) => {
    const statusConfig = getStatusConfig(item.status);
    const project = projects.find(p => p.id === item.projectId);

    return (
      <div className="relative group animate-fadeIn">
        <div className={cn(
          "absolute -left-6 top-8 w-4 h-4 rounded-full",
          "border-[3px] bg-background z-10 transition-all duration-300",
          "group-hover:scale-125 group-hover:ring-2 group-hover:ring-offset-2",
          "ring-offset-background shadow-md",
          statusConfig.ring
        )} />
        
        <Card className="ml-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  {project && (
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-xs text-muted-foreground">{project.name}</span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex -space-x-2">
                {item.users.map((user) => (
                  <img
                    key={user.id}
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-background"
                    title={user.name}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="relative pl-8 space-y-6">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border/50" />
      {isLoading ? (
        <LoadingSkeleton />
      ) : items.length > 0 ? (
        items.map((item) => (
          <TimelineItemComponent key={item.id} item={item} />
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No timeline items found
        </div>
      )}
    </div>
  );
};
