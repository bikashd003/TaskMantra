import { CalendarDays, CheckCircle2, Flag, Folder, Clock, Users, Trash, Plus } from 'lucide-react';
import Modal from '@/components/Global/Modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import { TaskStatus, TaskPriority, statusOptions, priorityOptions, Subtask, Task } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { taskSchema } from '@/Schemas/Task';
import { OrganizationService } from '@/services/Organization.service';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ProjectService } from '@/services/Project.service';

interface TaskData {
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  startDate: string;
  estimatedTime: number;
  loggedTime: number;
  projectId: string;
  subtasks: Subtask[];
  assignedTo: string[];
  dependencies?: string[];
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: TaskData) => void;
  isLoading: boolean;
  initialDate?: Date | null;
  editTask?: Task | null;
}

const initialTaskState: TaskData = {
  name: '',
  description: '',
  status: 'To Do',
  priority: 'Medium',
  dueDate: '',
  startDate: '',
  estimatedTime: 0,
  loggedTime: 0,
  projectId: '',
  subtasks: [],
  assignedTo: [],
  dependencies: [],
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  isLoading,
  initialDate,
  editTask,
}) => {
  const { data: organization } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        return await OrganizationService.getOrganizations();
      } catch (error: any) {
        toast.error('Failed to fetch organization data', {
          description: error.message || 'Unknown error',
        });
        throw error;
      }
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        return await ProjectService.getProjects();
      } catch (error: any) {
        toast.error('Failed to fetch projects', {
          description: error.message || 'Unknown error',
        });
        throw error;
      }
    },
  });
  const availableProject = projects?.projects || [];

  // Prepare initial values based on props
  const getInitialValues = () => {
    if (editTask) {
      // If editing an existing task, use its values
      return {
        name: editTask.name || '',
        description: editTask.description || '',
        status: editTask.status || 'To Do',
        priority: editTask.priority || 'Medium',
        dueDate: editTask.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : '',
        startDate: editTask.startDate
          ? new Date(editTask.startDate).toISOString().split('T')[0]
          : '',
        estimatedTime: editTask.estimatedTime || 0,
        loggedTime: editTask.loggedTime || 0,
        projectId: editTask.projectId || '',
        subtasks: editTask.subtasks || [],
        assignedTo: editTask.assignedTo
          ? editTask.assignedTo.map(user => (typeof user === 'string' ? user : user.id))
          : [],
        dependencies: editTask.dependencies || [],
      };
    } else {
      // For new tasks, use default values with initialDate if provided
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      return {
        ...initialTaskState,
        startDate: initialDate ? initialDate.toISOString().split('T')[0] : dateString,
        dueDate: initialDate ? initialDate.toISOString().split('T')[0] : dateString,
      };
    }
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: taskSchema,
    onSubmit: values => {
      try {
        onCreateTask(values);
        formik.resetForm();
        onClose();
      } catch (error) {
        toast.error('Failed to ' + (editTask ? 'update' : 'create') + ' task', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ScrollArea className="max-h-[85vh] overflow-hidden flex flex-col px-2">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {editTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {editTask ? 'Update task details' : 'Add a new task to your project'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto py-4 pr-2">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Task Name
              </Label>
              <Input
                id="name"
                placeholder="Enter task name"
                {...formik.getFieldProps('name')}
                className="h-10"
                disabled={isLoading}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-red-500 text-xs">{formik.errors.name}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={formik.values.status}
                  onValueChange={value => formik.setFieldValue('status', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status" className="h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', option.color)} />
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-red-500 text-xs">{formik.errors.status}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </Label>
                <Select
                  value={formik.values.priority}
                  onValueChange={value => formik.setFieldValue('priority', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="priority" className="h-10">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <Flag
                            className={cn('h-4 w-4', {
                              'text-green-500': option.value === 'Low',
                              'text-yellow-500': option.value === 'Medium',
                              'text-red-500': option.value === 'High',
                            })}
                          />
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.priority && formik.errors.priority && (
                  <div className="text-red-500 text-xs">{formik.errors.priority}</div>
                )}
              </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="dates">Dates & Time</TabsTrigger>
                <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your task..."
                    {...formik.getFieldProps('description')}
                    className="min-h-[120px] resize-none"
                    disabled={isLoading}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-red-500 text-xs">{formik.errors.description}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectId" className="text-sm font-medium">
                    Project
                  </Label>
                  <div className="relative">
                    <Folder className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={formik.values.projectId}
                      onValueChange={value => formik.setFieldValue('projectId', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="projectId" className="h-10 pl-9">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProject.map((project: any) => (
                          <SelectItem
                            key={project._id || project.id}
                            value={project._id || project.id}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="truncate max-w-[150px]">{project.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dates" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium">
                      Start Date
                    </Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        {...formik.getFieldProps('startDate')}
                        className="h-10 pl-9"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-sm font-medium">
                      Due Date
                    </Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dueDate"
                        type="date"
                        {...formik.getFieldProps('dueDate')}
                        className="h-10 pl-9"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime" className="text-sm font-medium">
                      Estimated Hours
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="estimatedTime"
                        type="number"
                        min="0"
                        step="0.5"
                        {...formik.getFieldProps('estimatedTime')}
                        className="h-10 pl-9"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loggedTime" className="text-sm font-medium">
                      Logged Hours
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loggedTime"
                        type="number"
                        min="0"
                        step="0.5"
                        {...formik.getFieldProps('loggedTime')}
                        className="h-10 pl-9"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="subtasks" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subtasks" className="text-sm font-medium">
                      Subtasks
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        formik.setFieldValue('subtasks', [
                          ...formik.values.subtasks,
                          { name: '', completed: false },
                        ]);
                      }}
                      disabled={isLoading}
                      className="h-8"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  {formik.values.subtasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/40 rounded-lg">
                      <div className="p-3 bg-background rounded-full border mb-3">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No subtasks yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add subtasks to break down this task
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {formik.values.subtasks.map((subtask, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-muted/30 rounded-md p-2"
                        >
                          <Input
                            placeholder="Subtask name"
                            value={subtask.name}
                            onChange={e => {
                              const newSubtasks = [...formik.values.subtasks];
                              newSubtasks[index].name = e.target.value;
                              formik.setFieldValue('subtasks', newSubtasks);
                            }}
                            className="flex-grow h-9 bg-transparent border-muted"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newSubtasks = formik.values.subtasks.filter(
                                (_, i) => i !== index
                              );
                              formik.setFieldValue('subtasks', newSubtasks);
                            }}
                            disabled={isLoading}
                            className="h-8 w-8"
                          >
                            <Trash className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="assignments" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo" className="text-sm font-medium">
                    Assigned To
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                    <Select
                      value={formik.values.assignedTo.length > 0 ? formik.values.assignedTo[0] : ''}
                      onValueChange={value => {
                        // If value is empty, clear the assignedTo array
                        if (!value) {
                          formik.setFieldValue('assignedTo', []);
                          return;
                        }

                        // If the value is already in the array, don't add it again
                        if (formik.values.assignedTo.includes(value)) {
                          return;
                        }

                        // Add the value to the assignedTo array
                        formik.setFieldValue('assignedTo', [...formik.values.assignedTo, value]);
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="assignedTo" className="h-10 pl-9">
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {organization?.members?.map((member: any) => (
                          <SelectItem key={member.userId._id} value={member.userId._id}>
                            <span className="flex">
                              <Avatar className="h-4 w-4 mr-2">
                                <AvatarImage src={member.userId.image} alt={member.userId.name} />
                                <AvatarFallback className="bg-muted/30 text-muted-foreground">
                                  {member.userId.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {member.userId.name}
                            </span>
                          </SelectItem>
                        )) || (
                          <SelectItem value="" disabled>
                            No members found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Display selected users with option to remove */}
                  {formik.values.assignedTo.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <Label className="text-sm font-medium">Selected Users</Label>
                      <div className="flex flex-wrap gap-2">
                        {formik.values.assignedTo.map(userId => {
                          const member = organization?.members?.find(
                            (m: any) => m.userId._id === userId
                          );
                          const userName = member ? member.userId.name : userId;

                          return (
                            <div
                              key={userId}
                              className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs"
                            >
                              <span>{userName}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 rounded-full"
                                onClick={() => {
                                  formik.setFieldValue(
                                    'assignedTo',
                                    formik.values.assignedTo.filter(id => id !== userId)
                                  );
                                }}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Select users to assign this task to
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="h-9"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={!formik.isValid || !formik.dirty || isLoading}
            className="h-9 px-4"
            onClick={e => {
              e.preventDefault();
              formik.handleSubmit();
            }}
          >
            {isLoading
              ? editTask
                ? 'Updating...'
                : 'Creating...'
              : editTask
                ? 'Update Task'
                : 'Create Task'}
          </Button>
        </div>
      </ScrollArea>
    </Modal>
  );
};

export default CreateTaskModal;
