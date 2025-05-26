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
      <div className="flex flex-col theme-surface">
        {/* Header Section */}
        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold theme-text-primary">{task.name}</h2>
            <p className="text-base theme-text-secondary">{task.description}</p>
          </div>

          <div className="flex items-center justify-between theme-surface-elevated p-4 rounded-lg theme-shadow-sm hover-reveal theme-transition">
            <div className="flex items-center gap-4">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium theme-text-primary">Created</p>
                <p className="text-sm theme-text-secondary">
                  {task.createdAt ? formatDate(task.createdAt) : 'Recently'}
                </p>
              </div>
            </div>
            <Badge
              className={`capitalize px-4 py-2 text-sm font-semibold ${getStatusColor(task.status)} text-white rounded-full theme-shadow-sm`}
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
              <div
                key={index}
                className="flex items-center gap-3 theme-surface-elevated p-4 rounded-lg hover-reveal theme-transition theme-shadow-sm"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium theme-text-primary">{item.label}</p>
                  <p className="text-sm theme-text-primary">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium theme-text-primary">Progress</span>
              <span className="font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 theme-surface" />
          </div>

          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-3 theme-surface-elevated p-4 rounded-lg hover-reveal theme-transition theme-shadow-sm">
              <LinkIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium theme-text-primary">Dependencies</p>
                <p className="text-sm theme-text-primary">{task.dependencies.length} tasks</p>
              </div>
            </div>
          )}

          {/* Assigned Users */}
          <div className="theme-surface-elevated p-4 rounded-lg theme-shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium theme-text-primary">Assigned to</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.assignedTo && task.assignedTo.length > 0 ? (
                task.assignedTo.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 theme-surface rounded-full pl-1 pr-3 py-1 theme-shadow-sm hover-reveal theme-transition"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="text-xs theme-button-primary text-primary-foreground">
                        {user?.name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium theme-text-primary">{user.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm theme-text-secondary">No users assigned</p>
              )}
            </div>
          </div>

          <Separator className="theme-border" />
        </div>

        {/* Tabs Section */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="subtasks" className="h-full">
            <TabsList className="flex w-full theme-border theme-surface-elevated">
              {[
                { value: 'subtasks', icon: CheckSquare, label: 'Subtasks' },
                { value: 'comments', icon: MessageSquare, label: 'Comments' },
                { value: 'activity', icon: ActivityIcon, label: 'Activity' },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 gap-2 theme-transition data-[state=active]:theme-surface data-[state=active]:border-b-2 data-[state=active]:border-primary theme-text-secondary data-[state=active]:theme-text-primary"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[calc(100%-48px)] p-6 scrollbar-custom scrollbar-dark">
              <TabsContent value="subtasks" className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a new subtask..."
                    className="flex-1 px-4 py-2 theme-input theme-border rounded-md text-sm theme-focus theme-transition"
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddSubtask}
                    className="theme-button-primary theme-transition"
                  >
                    Add
                  </Button>
                </div>

                {task?.subtasks?.length === 0 ? (
                  <div className="empty-state-container">
                    <div className="empty-state-icon">
                      <CheckSquare className="h-12 w-12 theme-text-secondary" />
                    </div>
                    <p className="empty-state-title">No subtasks yet</p>
                    <p className="empty-state-description">Add subtasks to break down this task</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {task?.subtasks?.map((subtask, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 theme-surface-elevated hover-reveal rounded-lg theme-transition"
                      >
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={checked =>
                            handleSubtaskToggle(index, checked as boolean)
                          }
                          className="h-5 w-5"
                        />
                        <span
                          className={`text-sm flex-1 ${subtask.completed ? 'theme-text-secondary line-through' : 'theme-text-primary'}`}
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
                    className="min-h-[100px] text-sm p-3 theme-input theme-border rounded-md theme-focus theme-transition"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      className="theme-button-primary theme-transition"
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>

                {task?.comments?.length === 0 ? (
                  <div className="empty-state-container">
                    <div className="empty-state-icon">
                      <MessageSquare className="h-12 w-12 theme-text-secondary" />
                    </div>
                    <p className="empty-state-title">No comments yet</p>
                    <p className="empty-state-description">Be the first to comment on this task</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {task?.comments?.map((comment, index) => (
                      <div
                        key={index}
                        className="flex gap-4 theme-surface-elevated p-4 rounded-lg hover-reveal theme-transition theme-shadow-sm"
                      >
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="theme-button-primary text-primary-foreground text-sm">
                            U
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium theme-text-primary">User</p>
                            <p className="text-xs theme-text-secondary">
                              {format(new Date(comment.timestamp), 'MMM dd, h:mm a')}
                            </p>
                          </div>
                          <p className="text-sm theme-text-primary">{comment.text}</p>

                          {comment?.attachments?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {comment?.attachments?.map((attachment, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs px-2 py-1 theme-border theme-text-secondary"
                                >
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
                <div className="empty-state-container">
                  <div className="empty-state-icon">
                    <ActivityIcon className="h-12 w-12 theme-text-secondary" />
                  </div>
                  <p className="empty-state-title">Activity tracking coming soon</p>
                  <p className="empty-state-description">This feature is under development</p>
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
