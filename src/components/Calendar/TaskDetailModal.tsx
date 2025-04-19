'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCalendarStore } from '@/stores/calendarStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarService } from '@/services/Calendar.service';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreating?: boolean;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  isCreating = false,
}) => {
  const { selectedTask, selectedDate, setSelectedTask } = useCalendarStore();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with selected task data or default values
  useEffect(() => {
    if (isCreating) {
      // Set default values for new task
      setTitle('');
      setDescription('');
      setStartDate(selectedDate || new Date());
      setEndDate(selectedDate || new Date());
      setStatus('To Do');
      setPriority('Medium');
    } else if (selectedTask) {
      // Set values from existing task
      setTitle(selectedTask.title);
      setDescription(selectedTask.description);
      setStartDate(new Date(selectedTask.startDate));
      setEndDate(new Date(selectedTask.endDate));
      setStatus(selectedTask.status);
      setPriority(selectedTask.priority);
    }
  }, [selectedTask, isCreating, selectedDate]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => CalendarService.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
      toast.success('Task created successfully');
      handleClose();
    },
    onError: (_error: Error) => {
      toast.error('Failed to create task');
      setIsSubmitting(false);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      CalendarService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
      toast.success('Task updated successfully');
      handleClose();
    },
    onError: (_error: Error) => {
      toast.error('Failed to update task');
      setIsSubmitting(false);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => CalendarService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
      toast.success('Task deleted successfully');
      handleClose();
    },
    onError: (_error: Error) => {
      toast.error('Failed to delete task');
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Start and end dates are required');
      return;
    }

    setIsSubmitting(true);

    const taskData = {
      name: title.trim(),
      description: description.trim(),
      startDate: startDate,
      dueDate: endDate,
      status: status,
      priority: priority,
      completed: status === 'Completed',
      // Add other fields as needed
      estimatedTime: 0,
      loggedTime: 0,
      assignedTo: [],
      dependencies: [],
      subtasks: [],
      comments: [],
    };

    if (isCreating) {
      createTaskMutation.mutate(taskData);
    } else if (selectedTask) {
      updateTaskMutation.mutate({
        id: selectedTask.id,
        updates: taskData,
      });
    }
  };

  const handleDelete = () => {
    if (selectedTask && !isCreating) {
      if (confirm('Are you sure you want to delete this task?')) {
        deleteTaskMutation.mutate(selectedTask.id);
      }
    }
  };

  const handleClose = () => {
    setIsSubmitting(false);
    setSelectedTask(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isCreating ? 'Create New Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Task description"
              className="min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={date => date < (startDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            {!isCreating && (
              <Button
                variant="outline"
                type="button"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isCreating ? 'Create' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
