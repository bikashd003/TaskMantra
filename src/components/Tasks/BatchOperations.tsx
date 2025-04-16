"use client";

import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from './types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, CheckSquare, Trash, Edit, Calendar as CalendarIconLucide, Tag, AlertCircle } from 'lucide-react';

interface BatchOperationsProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  onDeleteTasks: (taskIds: string[]) => void;
}

const BatchOperations: React.FC<BatchOperationsProps> = ({ tasks, onUpdateTasks, onDeleteTasks }) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [operation, setOperation] = useState<'status' | 'priority' | 'dueDate' | 'delete'>('status');
  const [newStatus, setNewStatus] = useState<TaskStatus>('To Do');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id));

  const handleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map(task => task.id));
    }
  };

  const handleSelectTask = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  const handleApplyChanges = () => {
    if (operation === 'delete') {
      onDeleteTasks(selectedTaskIds);
    } else {
      const updatedTasks = tasks.map(task => {
        if (selectedTaskIds.includes(task.id)) {
          const updatedTask = { ...task };

          if (operation === 'status') {
            updatedTask.status = newStatus;
            // If status is Completed, mark as completed
            updatedTask.completed = newStatus === 'Completed';
          } else if (operation === 'priority') {
            updatedTask.priority = newPriority;
          } else if (operation === 'dueDate' && newDueDate) {
            updatedTask.dueDate = newDueDate;
          }

          return updatedTask;
        }
        return task;
      });

      onUpdateTasks(updatedTasks);
    }

    // Reset selection
    setSelectedTaskIds([]);
    setIsSelectMode(false);
    setIsDialogOpen(false);
  };

  return (
    <div>
      {isSelectMode ? (
        <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-md border">
          <Checkbox
            checked={selectedTaskIds.length === tasks.length}
            onCheckedChange={handleSelectAll}
            id="select-all"
          />
          <Label htmlFor="select-all" className="text-sm cursor-pointer">
            {selectedTaskIds.length === 0
              ? 'Select All'
              : selectedTaskIds.length === tasks.length
                ? 'Deselect All'
                : `Selected ${selectedTaskIds.length} of ${tasks.length}`}
          </Label>

          <div className="ml-auto flex items-center gap-2">
            {selectedTaskIds.length > 0 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Edit className="h-4 w-4" /> Edit {selectedTaskIds.length} Tasks
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Batch Edit {selectedTaskIds.length} Tasks</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-4 gap-4">
                      <Button
                        variant={operation === 'status' ? 'default' : 'outline'}
                        className="flex-col h-20 gap-1"
                        onClick={() => setOperation('status')}
                      >
                        <CheckSquare className="h-5 w-5" />
                        <span className="text-xs">Status</span>
                      </Button>
                      <Button
                        variant={operation === 'priority' ? 'default' : 'outline'}
                        className="flex-col h-20 gap-1"
                        onClick={() => setOperation('priority')}
                      >
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-xs">Priority</span>
                      </Button>
                      <Button
                        variant={operation === 'dueDate' ? 'default' : 'outline'}
                        className="flex-col h-20 gap-1"
                        onClick={() => setOperation('dueDate')}
                      >
                        <CalendarIconLucide className="h-5 w-5" />
                        <span className="text-xs">Due Date</span>
                      </Button>
                      <Button
                        variant={operation === 'delete' ? 'destructive' : 'outline'}
                        className="flex-col h-20 gap-1"
                        onClick={() => setOperation('delete')}
                      >
                        <Trash className="h-5 w-5" />
                        <span className="text-xs">Delete</span>
                      </Button>
                    </div>

                    {operation === 'status' && (
                      <div className="space-y-2">
                        <Label>New Status</Label>
                        <Select value={newStatus} onValueChange={(value) => setNewStatus(value as TaskStatus)}>
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
                    )}

                    {operation === 'priority' && (
                      <div className="space-y-2">
                        <Label>New Priority</Label>
                        <Select value={newPriority} onValueChange={(value) => setNewPriority(value as TaskPriority)}>
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
                    )}

                    {operation === 'dueDate' && (
                      <div className="space-y-2">
                        <Label>New Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newDueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newDueDate ? format(newDueDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newDueDate}
                              onSelect={setNewDueDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}

                    {operation === 'delete' && (
                      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
                        <p className="text-sm">
                          Are you sure you want to delete {selectedTaskIds.length} tasks? This action cannot be undone.
                        </p>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApplyChanges}
                      variant={operation === 'delete' ? 'destructive' : 'default'}
                    >
                      {operation === 'delete' ? 'Delete Tasks' : 'Apply Changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Button size="sm" variant="ghost" onClick={() => setIsSelectMode(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 mb-4"
          onClick={() => setIsSelectMode(true)}
        >
          <CheckSquare className="h-4 w-4" /> Batch Operations
        </Button>
      )}

      {isSelectMode && (
        <div className="space-y-2 mb-4">
          {tasks.map(task => (
            <div
              key={task.id}
              className={cn(
                "flex items-center p-2 rounded-md border",
                selectedTaskIds.includes(task.id) ? "bg-blue-50 border-blue-200" : "bg-white"
              )}
            >
              <Checkbox
                checked={selectedTaskIds.includes(task.id)}
                onCheckedChange={() => handleSelectTask(task.id)}
                id={`task-${task.id}`}
                className="mr-2"
              />
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`task-${task.id}`} className="font-medium cursor-pointer">
                    {task.name}
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      task.status === 'To Do' && "bg-gray-100 text-gray-700",
                      task.status === 'In Progress' && "bg-blue-100 text-blue-700",
                      task.status === 'Review' && "bg-amber-100 text-amber-700",
                      task.status === 'Completed' && "bg-green-100 text-green-700"
                    )}>
                      {task.status}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      task.priority === 'High' && "bg-red-100 text-red-700",
                      task.priority === 'Medium' && "bg-amber-100 text-amber-700",
                      task.priority === 'Low' && "bg-green-100 text-green-700"
                    )}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIconLucide className="h-3 w-3" />
                    <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                  </div>
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span>{task.tags.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchOperations;
