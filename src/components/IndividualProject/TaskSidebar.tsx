"use client";
import { format } from "date-fns";
import { Clock, Users, MessageSquare, ActivityIcon, CheckSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import RightSidebar from "../Global/RightSidebar";

interface TaskSidebarProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskSidebar({ taskId, isOpen, onClose }: TaskSidebarProps) {
  const {
    data: tasksData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["tasks", taskId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/get-task/${taskId}`);
      return data;
    },
  });

  const { task } = tasksData || {};

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-white/80">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <RightSidebar isOpen={isOpen} onClose={onClose} title="Task Details">
      <div className="flex  flex-col overflow-hidden bg-white">
        {/* Header Section */}
        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(task?.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              <Badge 
                variant={task.status === 'completed' ? 'secondary' : 'default'}
                className="capitalize px-3 py-1"
              >
                {task.status}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-2">Assignees</p>
                <div className="flex -space-x-2">
                  {task?.assigneTo?.map((assignee) => (
                    <Avatar
                      key={assignee.id}
                      className="h-8 w-8 border-2 border-white ring-2 ring-white/10 transition-transform hover:scale-105"
                    >
                      <AvatarImage src={assignee.image} alt={assignee.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {assignee.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Description</h3>
            <p className="text-sm leading-relaxed text-gray-600">{task.description}</p>
          </div>
        </div>

        <Separator />

        {/* Tabs Section */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="activity" className="h-full">
            <TabsList className="flex w-full border-b bg-gray-50/50">
              <TabsTrigger 
                value="activity" 
                className="flex-1 gap-2 data-[state=active]:bg-white"
              >
                <ActivityIcon className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="subtasks" 
                className="flex-1 gap-2 data-[state=active]:bg-white"
              >
                <CheckSquare className="h-4 w-4" />
                Subtasks
              </TabsTrigger>
              <TabsTrigger 
                value="comments" 
                className="flex-1 gap-2 data-[state=active]:bg-white"
              >
                <MessageSquare className="h-4 w-4" />
                Comments
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100%-48px)] p-6">
              <TabsContent value="activity" className="space-y-4">
                {task?.activities?.map((activity) => (
                  <div key={activity.id} className="flex gap-3 group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <Avatar className="h-8 w-8 ring-2 ring-white">
                      <AvatarImage src={activity.user.image} alt={activity.user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {activity.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">{activity.user.name}</span>{" "}
                        <span className="text-gray-600">{activity.action}</span>{" "}
                        <span className="font-medium text-gray-900">{activity.detail}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="subtasks" className="space-y-3">
                {task?.subtasks?.map((subtask) => (
                  <div 
                    key={subtask._id} 
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      readOnly
                    />
                    <span className={`text-sm ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {subtask.name}
                    </span>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="comments" className="p-4">
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300" />
                  <p className="text-sm text-gray-500">No comments yet.</p>
                  <button className="text-sm text-primary hover:text-primary/80 font-medium">
                    Add the first comment
                  </button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </RightSidebar>
  );
}