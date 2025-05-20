'use client';
import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  MessageSquare,
  ActivityIcon,
  CheckSquare,
  Calendar,
  Timer,
  Link as LinkIcon,
  Save,
  X,
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import RightSidebar from '../Global/RightSidebar';
import { TaskService } from '@/services/Task.service';
import { Task as TaskType, User, statusOptions, priorityOptions } from '../Tasks/types';

interface TaskActivity {
  id?: string;
  _id?: string;
  user?: User;
  action?: string;
  detail?: string;
  time?: string;
}

// Extended Task type to include activities which might come from the API
interface Task extends TaskType {
  activities?: TaskActivity[];
}

interface TaskSidebarProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskSidebar({ taskId, isOpen, onClose }: TaskSidebarProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: task,
    error,
    isLoading,
  } = useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      return await TaskService.getTaskById(taskId);
    },
    enabled: !!taskId && isOpen,
  });

  // Initialize editedTask when task data is loaded
  useEffect(() => {
    if (task) {
      setEditedTask({
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        startDate: task.startDate,
        estimatedTime: task.estimatedTime,
        loggedTime: task.loggedTime,
      });
    }
  }, [task]);

  // Mutation for updating tasks
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      return TaskService.updateTask(taskId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast({
        title: 'Task updated',
        description: 'Changes saved successfully',
      });
      setIsEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task',
        variant: 'destructive',
      });
    },
  });

  // Handle form field changes
  const handleInputChange = (field: string, value: any) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  // Handle save button click
  const handleSave = () => {
    if (task && editedTask) {
      updateTaskMutation.mutate({
        taskId: task.id || task._id,
        updates: editedTask,
      });
    }
  };

  // Handle subtask toggle
  const handleSubtaskToggle = (index: number, completed: boolean) => {
    if (!task || !task.subtasks) return;

    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[index] = { ...updatedSubtasks[index], completed };

    updateTaskMutation.mutate({
      taskId: task.id || task._id,
      updates: { subtasks: updatedSubtasks },
    });
  };

  // Add new subtask
  const handleAddSubtask = () => {
    if (!newSubtask.trim() || !task) return;

    const updatedSubtasks = [
      ...(task.subtasks || []),
      { name: newSubtask.trim(), completed: false },
    ];

    updateTaskMutation.mutate({
      taskId: task.id || task._id,
      updates: { subtasks: updatedSubtasks },
    });

    setNewSubtask('');
  };

  // Add new comment
  const handleAddComment = () => {
    if (!newComment.trim() || !task) return;

    const newCommentObj = {
      userId: 'current-user', // This should be the actual user ID
      text: newComment.trim(),
      timestamp: new Date(),
      attachments: [],
    };

    const updatedComments = [...(task.comments || []), newCommentObj];

    updateTaskMutation.mutate({
      taskId: task.id || task._id,
      updates: { comments: updatedComments },
    });

    setNewComment('');
  };

  // Calculate progress based on completed subtasks
  const calculateProgress = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completedCount = task.subtasks.filter(subtask => subtask.completed).length;
    return (completedCount / task.subtasks.length) * 100;
  };

  if (isLoading) {
    return (
      <RightSidebar isOpen={isOpen} onClose={onClose} title="Task Details">
        <div className="flex h-full items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </RightSidebar>
    );
  }

  if (error) {
    return (
      <RightSidebar isOpen={isOpen} onClose={onClose} title="Task Details">
        <div className="flex h-full items-center justify-center bg-white/80">
          <div className="rounded-lg bg-red-50 p-4 text-red-600">
            Error loading task details. Please try again.
          </div>
        </div>
      </RightSidebar>
    );
  }

  if (!task) {
    return (
      <RightSidebar isOpen={isOpen} onClose={onClose} title="Task Details">
        <div className="flex h-full items-center justify-center bg-white/80">
          <div className="rounded-lg bg-yellow-50 p-4 text-yellow-600">Task not found</div>
        </div>
      </RightSidebar>
    );
  }

  // Calculate progress
  const progress = task ? calculateProgress(task) : 0;

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      onEdit={() => setIsEditMode(true)}
    >
      <div className="flex flex-col">
        {isEditMode ? (
          // Edit Mode
          <div className="space-y-6 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Task</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Task Name</label>
                <Input
                  value={editedTask.name || ''}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <Textarea
                  value={editedTask.description || ''}
                  onChange={e => handleInputChange('description', e.target.value)}
                  className="w-full min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <Select
                    value={editedTask.status}
                    onValueChange={value => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                  <Select
                    value={editedTask.priority}
                    onValueChange={value => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                  <Input
                    type="date"
                    value={
                      editedTask.startDate
                        ? new Date(editedTask.startDate).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={e => handleInputChange('startDate', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
                  <Input
                    type="date"
                    value={
                      editedTask.dueDate
                        ? new Date(editedTask.dueDate).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={e => handleInputChange('dueDate', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Estimated Hours
                  </label>
                  <Input
                    type="number"
                    value={editedTask.estimatedTime || 0}
                    onChange={e => handleInputChange('estimatedTime', Number(e.target.value))}
                    className="w-full"
                    min={0}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Logged Hours
                  </label>
                  <Input
                    type="number"
                    value={editedTask.loggedTime || 0}
                    onChange={e => handleInputChange('loggedTime', Number(e.target.value))}
                    className="w-full"
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{task.name}</h2>
              <p className="text-base text-gray-600">
                {task.description || 'No description provided'}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-900">
                    {task.createdAt ? format(new Date(task.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
              {task.status && (
                <Badge
                  variant={task.status === 'Completed' ? 'secondary' : 'default'}
                  className="capitalize px-3 py-1"
                >
                  {task.status}
                </Badge>
              )}
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

            {/* Assignees */}
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">Assignees</p>
                <div className="flex -space-x-2">
                  {task.assignedTo && task.assignedTo.length > 0 ? (
                    task.assignedTo.map(assignee => (
                      <Avatar
                        key={assignee._id || assignee.id}
                        className="h-8 w-8 border-2 border-white ring-2 ring-white/10 transition-transform hover:scale-105"
                      >
                        <AvatarImage src={assignee.image} alt={assignee.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {assignee.name && assignee.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No assignees</span>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200" />
          </div>
        )}

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

            <ScrollArea className="h-[calc(100%-48px)]">
              <TabsContent value="subtasks" className="p-6 space-y-4">
                {!isEditMode && (
                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      placeholder="Add a new subtask..."
                      value={newSubtask}
                      onChange={e => setNewSubtask(e.target.value)}
                      className="flex-1"
                      onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                    />
                    <Button size="sm" onClick={handleAddSubtask}>
                      Add
                    </Button>
                  </div>
                )}

                {task.subtasks && task.subtasks.length > 0 ? (
                  <div className="space-y-2">
                    {task.subtasks.map((subtask, index) => (
                      <div
                        key={subtask._id || subtask.id || index}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={checked => handleSubtaskToggle(index, checked === true)}
                          id={`subtask-${index}`}
                        />
                        <label
                          htmlFor={`subtask-${index}`}
                          className={`text-sm flex-1 ${
                            subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                          }`}
                        >
                          {subtask.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-3 py-8 bg-gray-50 rounded-lg">
                    <CheckSquare className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No subtasks yet</p>
                    <p className="text-sm text-gray-400">Add a subtask to break down this task</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="p-6 space-y-4">
                {!isEditMode && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      className="w-full min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAddComment}>Add Comment</Button>
                    </div>
                  </div>
                )}

                {task.comments && task.comments.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    {task.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-500 text-white">U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">User</p>
                            <p className="text-xs text-gray-500">
                              {comment.timestamp
                                ? format(new Date(comment.timestamp), "MMM dd, yyyy 'at' h:mm a")
                                : ''}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-3 py-8 bg-gray-50 rounded-lg mt-4">
                    <MessageSquare className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No comments yet</p>
                    <p className="text-sm text-gray-400">Be the first to comment on this task</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="p-6">
                {task.activities && task.activities.length > 0 ? (
                  <div className="space-y-4">
                    {task.activities.map((activity: TaskActivity) => (
                      <div
                        key={activity.id || activity._id}
                        className="flex gap-3 group hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        <Avatar className="h-8 w-8 ring-2 ring-white">
                          <AvatarImage src={activity.user?.image} alt={activity.user?.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {activity.user?.name && activity.user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium text-gray-900">{activity.user?.name}</span>{' '}
                            <span className="text-gray-600">{activity.action}</span>{' '}
                            <span className="font-medium text-gray-900">{activity.detail}</span>
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-3 py-8 bg-gray-50 rounded-lg">
                    <ActivityIcon className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No activity yet</p>
                    <p className="text-sm text-gray-400">
                      Activity will be tracked as changes are made
                    </p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </RightSidebar>
  );
}
