import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Clock,
  Users,
  MessageSquare,
  ActivityIcon,
  CheckSquare,
  Calendar,
  Timer,
  Link as LinkIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import RightSidebar from '../Global/RightSidebar';
import { Task, TaskStatus } from './types';
import { useToast } from '@/hooks/use-toast';
import { TaskService } from '@/services/Task.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TaskDetailSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskDetailSidebar({ task, isOpen, onClose, onTaskUpdate }: TaskDetailSidebarProps) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const queryClient = useQueryClient();

  // Mutation for updating tasks
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      return TaskService.updateTask(taskId, {
        ...updates,
        assignedTo: updates.assignedTo?.map(user => (typeof user === 'string' ? user : user.id)),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task updated',
        description: 'Changes saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task',
        variant: 'destructive',
      });
    },
  });

  if (!task) return null;

  // Calculate task progress based on completed subtasks
  const totalSubtasks = task?.subtasks?.length || 0;
  const completedSubtasks = task?.subtasks?.filter(subtask => subtask.completed)?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Format dates
  const formatDate = (date?: Date) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  // Handle subtask toggle
  const handleSubtaskToggle = (index: number, completed: boolean) => {
    const updatedSubtasks = task.subtasks ? [...task.subtasks] : [];
    updatedSubtasks[index] = { ...updatedSubtasks[index], completed };

    // Update locally through the parent component
    onTaskUpdate(task.id, { subtasks: updatedSubtasks });

    // Also send to the server
    updateTaskMutation.mutate({
      taskId: task.id,
      updates: { subtasks: updatedSubtasks },
    });

    toast({
      title: completed ? 'Subtask completed' : 'Subtask marked as incomplete',
      description: updatedSubtasks[index].name,
    });
  };

  // Add new subtask
  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;

    const updatedSubtasks = [
      ...(task.subtasks || []),
      { name: newSubtask.trim(), completed: false },
    ];

    // Update locally through the parent component
    onTaskUpdate(task.id, { subtasks: updatedSubtasks });

    // Also send to the server
    updateTaskMutation.mutate({
      taskId: task.id,
      updates: { subtasks: updatedSubtasks },
    });

    setNewSubtask('');
    toast({
      title: 'Subtask added',
      description: newSubtask.trim(),
    });
  };

  // Add new comment
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      userId: 'current-user', // This should be the actual user ID
      text: newComment.trim(),
      timestamp: new Date(),
      attachments: [],
    };

    const updatedComments = [...task.comments, newCommentObj];

    // Update locally through the parent component
    onTaskUpdate(task.id, { comments: updatedComments });

    // Also send to the server
    updateTaskMutation.mutate({
      taskId: task.id,
      updates: { comments: updatedComments },
    });

    setNewComment('');
    toast({
      title: 'Comment added',
    });
  };

  // Get status badge color
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'To Do':
        return 'bg-slate-500';
      case 'In Progress':
        return 'bg-blue-500';
      case 'Review':
        return 'bg-amber-500';
      case 'Completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      onEdit={() => toast({ title: 'Edit mode', description: 'Not implemented yet' })}
      onDelete={() => toast({ title: 'Delete option', description: 'Not implemented yet' })}
    >
      <div className="flex flex-col">
        {/* Header Section */}
        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{task.name}</h2>
            <p className="text-base text-gray-600">{task.description}</p>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <Clock className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Created</p>
                <p className="text-sm text-gray-500">
                  {task.createdAt ? formatDate(task.createdAt) : 'Recently'}
                </p>
              </div>
            </div>
            <Badge
              className={`capitalize px-4 py-2 text-sm font-semibold ${getStatusColor(task.status)} text-white rounded-full`}
            >
              {task.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: Calendar, label: 'Start Date', value: formatDate(task.startDate) },
              { icon: Calendar, label: 'Due Date', value: formatDate(task.dueDate) },
              { icon: Timer, label: 'Estimated', value: `${task.estimatedTime || 0} hours` },
              { icon: Timer, label: 'Logged', value: `${task.loggedTime || 0} hours` },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                <item.icon className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                  <p className="text-sm text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Progress</span>
              <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200" />
          </div>

          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
              <LinkIcon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Dependencies</p>
                <p className="text-sm text-gray-900">{task.dependencies.length} tasks</p>
              </div>
            </div>
          )}

          {/* Assigned Users */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-blue-500" />
              <p className="text-sm font-medium text-gray-700">Assigned to</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.assignedTo && task.assignedTo.length > 0 ? (
                task.assignedTo.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white rounded-full pl-1 pr-3 py-1 shadow-sm"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        {user?.name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No users assigned</p>
              )}
            </div>
          </div>

          <Separator className="bg-gray-200" />
        </div>

        {/* Tabs Section */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="subtasks" className="h-full">
            <TabsList className="flex w-full border-b bg-gray-50">
              {[
                { value: 'subtasks', icon: CheckSquare, label: 'Subtasks' },
                { value: 'comments', icon: MessageSquare, label: 'Comments' },
                { value: 'activity', icon: ActivityIcon, label: 'Activity' },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[calc(100%-48px)] p-6">
              <TabsContent value="subtasks" className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a new subtask..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <Button size="sm" onClick={handleAddSubtask}>
                    Add
                  </Button>
                </div>

                {task?.subtasks?.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">No subtasks yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Add subtasks to break down this task
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {task?.subtasks?.map((subtask, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={checked =>
                            handleSubtaskToggle(index, checked as boolean)
                          }
                          className="h-5 w-5"
                        />
                        <span
                          className={`text-sm flex-1 ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                        >
                          {subtask.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-6">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="min-h-[100px] text-sm p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddComment}>Post Comment</Button>
                  </div>
                </div>

                {task?.comments?.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">No comments yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Be the first to comment on this task
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {task?.comments?.map((comment, index) => (
                      <div key={index} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-blue-500 text-white text-sm">
                            U
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">User</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(comment.timestamp), 'MMM dd, h:mm a')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>

                          {comment?.attachments?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {comment?.attachments?.map((attachment, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs px-2 py-1">
                                  {attachment.filename}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-2">
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <ActivityIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Activity tracking coming soon</p>
                  <p className="text-sm text-gray-500 mt-1">This feature is under development</p>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </RightSidebar>
  );
}

export default TaskDetailSidebar;
