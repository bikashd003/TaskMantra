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
import ReusableSelect from '../Global/ReactSelect';

const TasksStep: React.FC = () => {
  const { control, errors, trigger } = useProject()!;
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

  const handleAddTask = async () => {

    const isValid = await trigger(['tasks']);
    if (!isValid) {
      return;
    }
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
  const handleAddSubtask = (taskIndex: number) => {
    const currentTasks = [...fields];
    const currentTask = currentTasks[taskIndex];

    if (!currentTask.subtasks) {
      currentTask.subtasks = [];
    }

    currentTask.subtasks.push({
      name: '',
      completed: false
    });

    // Update the entire tasks array
    remove(taskIndex);
    append(currentTask);
  };
  const handleRemoveSubtask = (taskIndex: number, subtaskIndex: number) => {
    const currentTasks = [...fields];
    const currentTask = currentTasks[taskIndex];

    if (currentTask.subtasks) {
      currentTask.subtasks = currentTask.subtasks.filter((_, index) => index !== subtaskIndex);

      // Update the entire tasks array
      remove(taskIndex);
      append(currentTask);
    }
  };
  return (
    <div className="p-6 max-h-[75vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        Add Tasks
      </h2>
      <div className="space-y-6">

        {fields.map((task, taskIndex) => {

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
                  {errors.tasks?.[taskIndex]?.priority && (
                    <p className="text-red-500 text-sm mt-1">{errors.tasks[taskIndex].priority.message}</p>
                  )}
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
                  {errors.tasks?.[taskIndex]?.status && (
                    <p className="text-red-500 text-sm mt-1">{errors.tasks[taskIndex].status.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-blue-700">Due Date</label>
                  <Controller
                    name={`tasks.${taskIndex}.dueDate`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter due date"
                        type='date'
                        className={`mt-1 ${errors.tasks?.[taskIndex]?.dueDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                    )}
                  />
                  {errors.tasks?.[taskIndex]?.dueDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.tasks[taskIndex].dueDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Start Date</label>
                  <Controller
                    name={`tasks.${taskIndex}.startDate`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter start date"
                        type='date'
                        className={`mt-1 ${errors.tasks?.[taskIndex]?.startDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                    )}
                  />
                  {errors.tasks?.[taskIndex]?.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.tasks[taskIndex].startDate.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="mb-4">
                  <label className="text-sm font-medium text-blue-700">Assigned To</label>
                  <Controller
                    name={`tasks.${taskIndex}.assignedTo`}
                    control={control}
                    render={({ field }) => {
                      const options = users.map((user) => ({
                        value: user.id,
                        label: `${user.name} (${user.role})`,
                      }));
                      const selectedValues = options.filter((option) =>
                        Array.isArray(field.value)
                          ? field.value.some((user: User) => user.id === option.value)
                          : (field.value as User | undefined)?.id === option.value
                      );

                      const handleChange = (newValue: any) => {
                        if (Array.isArray(newValue)) {
                          field.onChange(newValue.map((opt) => users.find((user) => user.id === opt.value)));
                        } else if (newValue) {
                          field.onChange(users.find((user) => user.id === newValue.value) || null);
                        } else {
                          field.onChange([]);
                        }
                      };

                      return (
                        <ReusableSelect
                          options={options}
                          value={selectedValues}
                          onChange={handleChange}
                          placeholder="Select team members"
                          isMulti={true}
                        />
                      );
                    }}
                  />
                  {errors.tasks?.[taskIndex]?.assignedTo && (
                    <p className="text-red-500 text-sm mt-1">{errors.tasks[taskIndex].assignedTo.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Estimated Time</label>
                  <Controller
                    name={`tasks.${taskIndex}.estimatedTime`}
                    control={control}
                    defaultValue={0}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter estimated time"
                        className={`mt-1 ${errors.tasks?.[taskIndex]?.estimatedTime ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                    )}
                  />
                  {errors.tasks?.[taskIndex]?.estimatedTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.tasks[taskIndex].estimatedTime.message}</p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Subtasks</h3>
                <div className="space-y-4">
                  {(task.subtasks || []).map((_, subtaskIndex) => (
                    <div
                      key={subtaskIndex}
                      className="p-3 border border-gray-300 rounded-md bg-gray-50"
                    >
                      {task.subtasks.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleRemoveSubtask(taskIndex, subtaskIndex)}
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
                  onClick={() => handleAddSubtask(taskIndex)}
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
