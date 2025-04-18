import {
  CalendarDays,
  CheckCircle2,
  Flag,
  Folder,
  Tags,
  Clock,
  Users,
  Trash,
  Plus,
} from 'lucide-react';
import { RecurrenceRule } from './types/RecurringTask';
import RecurringTaskForm from './RecurringTaskForm';
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
import * as Yup from 'yup';
import { TaskStatus, TaskPriority, statusOptions, priorityOptions, Subtask, Task } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';

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
  tags: string[];
  color?: string;
  category?: string;
  recurring?: {
    isRecurring: boolean;
    recurrenceRule?: RecurrenceRule;
  };
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
  tags: [],
  color: '',
  category: '',
  recurring: {
    isRecurring: false,
  },
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Task name is required'),
  description: Yup.string(),
  status: Yup.string()
    .oneOf(['To Do', 'In Progress', 'Review', 'Completed'])
    .required('Status is required'),
  priority: Yup.string().oneOf(['High', 'Medium', 'Low']).required('Priority is required'),
  dueDate: Yup.date(),
  startDate: Yup.date(),
  estimatedTime: Yup.number().min(0, 'Estimated time cannot be negative'),
  loggedTime: Yup.number().min(0, 'Logged time cannot be negative'),
  projectId: Yup.string(),
  subtasks: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Subtask name is required'),
      completed: Yup.boolean().default(false),
    })
  ),
  assignedTo: Yup.array().of(Yup.string()),
  tags: Yup.array().of(Yup.string()),
});

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  isLoading,
  initialDate,
  editTask,
}) => {
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
        tags: editTask.tags || [],
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
    validationSchema: validationSchema,
    onSubmit: async values => {
      try {
        await onCreateTask(values);
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
      <div className="max-h-[85vh] overflow-hidden flex flex-col">
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
                <TabsTrigger value="recurring">Recurring</TabsTrigger>
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
                  <Label htmlFor="tags" className="text-sm font-medium">
                    Tags
                  </Label>
                  <div className="relative">
                    <Tags className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tags"
                      placeholder="Enter tags separated by commas"
                      value={formik.values.tags.join(', ')}
                      onChange={e =>
                        formik.setFieldValue(
                          'tags',
                          e.target.value.split(',').map(tag => tag.trim())
                        )
                      }
                      className="h-10 pl-9"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Example: design, frontend, urgent</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectId" className="text-sm font-medium">
                    Project
                  </Label>
                  <div className="relative">
                    <Folder className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="projectId"
                      placeholder="Select project"
                      {...formik.getFieldProps('projectId')}
                      className="h-10 pl-9"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category
                    </Label>
                    <Select
                      value={formik.values.category || ''}
                      onValueChange={value => formik.setFieldValue('category', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="category" className="h-10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-sm font-medium">
                      Color
                    </Label>
                    <Select
                      value={formik.values.color || ''}
                      onValueChange={value => formik.setFieldValue('color', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="color" className="h-10">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                            <span>Default</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="#3b82f6">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <span>Blue</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="#10b981">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span>Green</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="#ef4444">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                            <span>Red</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="#f59e0b">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                            <span>Yellow</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="#8b5cf6">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                            <span>Purple</span>
                          </div>
                        </SelectItem>
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

              <TabsContent value="recurring" className="space-y-4">
                <RecurringTaskForm
                  initialRule={formik.values.recurring?.recurrenceRule}
                  isRecurring={formik.values.recurring?.isRecurring || false}
                  onSave={(rule, isRecurring) => {
                    formik.setFieldValue('recurring', {
                      isRecurring,
                      recurrenceRule: rule,
                    });
                  }}
                  onToggleRecurring={isRecurring => {
                    formik.setFieldValue('recurring', {
                      ...formik.values.recurring,
                      isRecurring,
                    });
                  }}
                />
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
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="assignedTo"
                      placeholder="Assign to users"
                      value={formik.values.assignedTo.join(', ')}
                      onChange={e =>
                        formik.setFieldValue(
                          'assignedTo',
                          e.target.value.split(',').map(id => id.trim())
                        )
                      }
                      className="h-10 pl-9"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter user IDs separated by commas
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
            {isLoading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;
