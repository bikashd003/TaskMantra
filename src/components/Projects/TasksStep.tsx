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
import { useProject, User } from '@/context/ProjectContext';

const TasksStep: React.FC = () => {
  const { control, errors } = useProject()!;
  const users: User[] = [
    { id: "001", name: 'Alice', role: 'Developer' },
    { id: "002", name: 'Bob', role: 'Designer' },
    { id: "003", name: 'Charlie', role: 'Manager' },
  ];

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
      subtasks: [],
      comments: []
    });
  };

  return (
    <div className="p-6 max-h-[75vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        Add Tasks
      </h2>
      <div className="space-y-6">
        {fields.map((task, taskIndex) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { fields: subtaskFields, append: addSubtask, remove: removeSubtask } = useFieldArray({
            control,
            name: `tasks.${taskIndex}.subtasks`,
            keyName: 'id',
          });

          return (
          <div
            key={task.id}
            className="p-4 border border-gray-200 rounded-lg shadow-sm relative bg-white"
          >
              {taskIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-red-500"
                  onClick={() => remove(taskIndex)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <div className="mb-4">
              <label className="text-sm font-medium text-blue-700">Task Name</label>
              <Input
                  {...control.register(`tasks.${taskIndex}.name`)}
                placeholder="Enter task name"
                  className={`mt-1 ${errors.tasks?.[taskIndex]?.name ? 'border-red-500' : 'border-gray-300'}`}
              />
                {errors.tasks?.[taskIndex]?.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.tasks[taskIndex].name.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-blue-700">Description</label>
              <Textarea
                  {...control.register(`tasks.${taskIndex}.description`)}
                placeholder="Enter task description"
                rows={3}
                  className={`mt-1 ${errors.tasks?.[taskIndex]?.description ? 'border-red-500' : 'border-gray-300'}`}
              />
                {errors.tasks?.[taskIndex]?.description && (
                <p className="text-red-500 text-sm mt-1">
                    {errors.tasks[taskIndex].description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-blue-700">Priority</label>
                <Controller
                    name={`tasks.${taskIndex}.priority`}
                    control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    name={`tasks.${taskIndex}.status`}
                    control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
              <div className="mb-4">
                <label className="text-sm font-medium text-blue-700">Assigned To</label>
                <Controller
                  name={`tasks.${taskIndex}.assignedTo`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange([...field.value, value])}
                      value={field.value}
                      multiple
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team members" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Subtasks</h3>
                <div className="space-y-4">
                  {subtaskFields.map((subtask, subtaskIndex) => (
                    <div
                      key={subtask.id}
                      className="p-3 border border-gray-300 rounded-md bg-gray-50"
                    >
                      {subtaskIndex > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-red-500"
                          onClick={() => removeSubtask(subtaskIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <div className="mb-2">
                        <label className="text-sm font-medium text-blue-700">Subtask Name</label>
                        <Input
                          {...control.register(
                            `tasks.${taskIndex}.subtasks.${subtaskIndex}.name`
                          )}
                          placeholder="Enter subtask name"
                          className={`mt-1 ${errors.tasks?.[taskIndex]?.subtasks?.[subtaskIndex]?.name
                            ? 'border-red-500'
                            : 'border-gray-300'
                            }`}
                        />
                        {errors.tasks?.[taskIndex]?.subtasks?.[subtaskIndex]?.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.tasks[taskIndex].subtasks[subtaskIndex].name.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="text-sm font-medium text-blue-700">Completed</label>
                        <Controller
                          name={`tasks.${taskIndex}.subtasks.${subtaskIndex}.completed`}
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="ml-2"
                            />
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 flex items-center gap-2"
                  onClick={() =>
                    addSubtask({
                      name: '',
                      completed: false,
                    })
                  }
                >
                  <PlusCircle className="w-5 h-5" /> Add Subtask
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <Button variant="outline" className="mt-6 flex items-center gap-2" onClick={handleAddTask}>
        <PlusCircle className="w-5 h-5" /> Add Task
      </Button>
    </div>
  );
};

export default TasksStep;
