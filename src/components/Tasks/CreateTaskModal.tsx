import React from 'react';
import { CalendarDays, CheckCircle2, Flag, Folder, Tags} from 'lucide-react';
import Modal from '@/components/Global/Modal';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Type Definitions (matching TasksPage)
type TaskStatus = 'todo' | 'in-progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

interface TaskData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  project: string;
  tags: string[];
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: TaskData) => void;
  isLoading: boolean;
}

const initialTaskState: TaskData = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  project: '',
  tags: [],
};

const statusOptions = [
  { value: 'todo' as const, label: 'To Do', color: 'bg-slate-500' },
  { value: 'in-progress' as const, label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed' as const, label: 'Completed', color: 'bg-green-500' },
];

const priorityOptions = [
  { value: 'low' as const, label: 'Low', color: 'bg-slate-500' },
  { value: 'medium' as const, label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high' as const, label: 'High', color: 'bg-red-500' },
];

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  status: Yup.string().oneOf(['todo', 'in-progress', 'completed']).required('Status is required'),
  priority: Yup.string().oneOf(['low', 'medium', 'high']).required('Priority is required'),
  dueDate: Yup.date(),
  project: Yup.string(),
  tags: Yup.array().of(Yup.string()),
});

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  isLoading,
}) => {
  const formik = useFormik({
    initialValues: initialTaskState,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await onCreateTask(values);
        formik.resetForm();
        onClose();
      } catch (error) {
        toast.error("Failed to create task", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size='lg'
    >
      <div>
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Create New Task</h2>
          <p className="text-sm text-muted-foreground">
            Add a new task to your project
          </p>
        </div>
      </div>
        
      {/* Body */}
      <form onSubmit={formik.handleSubmit} className="space-y-6 py-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Task Title
          </Label>
          <Input
            id="title"
            placeholder="Enter task title"
            {...formik.getFieldProps('title')}
            className="h-11"
            disabled={isLoading}
          />
          {formik.touched.title && formik.errors.title && (
            <div className="text-red-500 text-sm">{formik.errors.title}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your task..."
            {...formik.getFieldProps('description')}
            className="min-h-[100px] resize-none"
            disabled={isLoading}
          />
          {formik.touched.description && formik.errors.description && (
            <div className="text-red-500 text-sm">{formik.errors.description}</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={formik.values.status}
              onValueChange={(value) => formik.setFieldValue('status', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="status" className="h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    <span className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', option.color)} />
                      {option.label}
                      </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <div className="text-red-500 text-sm">{formik.errors.status}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority
            </Label>
            <Select
              value={formik.values.priority}
              onValueChange={(value) => formik.setFieldValue('priority', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="priority" className="h-11">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    <span className="flex items-center gap-2">
                    <Flag className={cn('h-4 w-4', {
                      'text-slate-500': option.value === 'low',
                      'text-yellow-500': option.value === 'medium',
                      'text-red-500': option.value === 'high',
                    })} />
                      {option.label}
                      </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.priority && formik.errors.priority && (
              <div className="text-red-500 text-sm">{formik.errors.priority}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project" className="text-sm font-medium">
              Project
            </Label>
            <div className="relative">
              <Folder className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="project"
                placeholder="Select project"
                {...formik.getFieldProps('project')}
                className="h-11 pl-10"
                disabled={isLoading}
              />
            </div>
            {formik.touched.project && formik.errors.project && (
              <div className="text-red-500 text-sm">{formik.errors.project}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium">
              Due Date
            </Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="dueDate"
                type="date"
                {...formik.getFieldProps('dueDate')}
                className="h-11 pl-10"
                disabled={isLoading}
              />
            </div>
            {formik.touched.dueDate && formik.errors.dueDate && (
              <div className="text-red-500 text-sm">{formik.errors.dueDate}</div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm font-medium">
            Tags
          </Label>
          <div className="relative">
            <Tags className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              id="tags"
              placeholder="Enter tags separated by commas"
              value={formik.values.tags.join(', ')}
              onChange={(e) => formik.setFieldValue('tags', e.target.value.split(',').map(tag => tag.trim()))}
              className="h-11 pl-10"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Example: design, frontend, urgent
          </p>
          {formik.touched.tags && formik.errors.tags && (
            <div className="text-red-500 text-sm">{formik.errors.tags}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="h-11"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={!formik.isValid || !formik.dirty || isLoading}
            className="h-11 px-8"
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;
