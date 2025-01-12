import React from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProject } from '@/context/ProjectContext';

const TasksStep: React.FC = () => {
  const { control, errors } = useProject()!;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
    keyName: 'id',
  });
  const handleAddTask = () => {
    append({
      name: '',
      description: '',
      assignedTo: [],
      status: 'To Do',
      priority: 'Medium',
      dueDate: '',
      startDate: '',
      estimatedTime: 0,
      loggedTime: 0,
      dependencies: [],
      subtasks: [],
      comments: [],
    });
  };

  return (
    <div className="p-6 max-h-[75vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        Manage Tasks
      </h2>
      <div className="space-y-6">
        {fields.map((task, index) => (
          <div
            key={task.id}
            className="p-4 border border-gray-200 rounded-lg shadow-sm relative bg-white"
          >
            {index > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-red-500"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <div className="mb-4">
              <label className="text-sm font-medium text-blue-700">Task Name</label>
              <Input
                {...control.register(`tasks.${index}.name`)}
                placeholder="Enter task name"
                className={`mt-1 ${errors.tasks?.[index]?.name ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.tasks?.[index]?.name && (
                <p className="text-red-500 text-sm mt-1">{errors.tasks[index].name.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-blue-700">Description</label>
              <Textarea
                {...control.register(`tasks.${index}.description`)}
                placeholder="Enter task description"
                rows={3}
                className={`mt-1 ${errors.tasks?.[index]?.description ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.tasks?.[index]?.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tasks[index].description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-blue-700">Priority</label>
                <Controller
                  name={`tasks.${index}.priority`}
                  control={control}
                  defaultValue="Medium"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-blue-700">Status</label>
                <Controller
                  name={`tasks.${index}.status`}
                  control={control}
                  defaultValue="To Do"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-6 flex items-center gap-2" onClick={handleAddTask}>
        <PlusCircle className="w-5 h-5" /> Add Task
      </Button>
    </div>
  );
};

export default TasksStep;
