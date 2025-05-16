import React from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { OrganizationService } from '@/services/Organization.service';
import { toast } from 'sonner';
import Image from 'next/image';

const TasksStep: React.FC = () => {
  const { formik } = useProject()!;
  const { values, errors, setFieldValue } = formik;

  const { data: organizations } = useQuery({
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
  const users = organizations?.members?.map((member: any) => member.userId);

  const handleAddTask = () => {
    const updatedTasks = [
      ...values.tasks,
      {
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
        comments: [],
      },
    ];

    setFieldValue('tasks', updatedTasks);
  };

  const handleRemoveTask = (taskIndex: number) => {
    const updatedTasks = values.tasks.filter((_, index) => index !== taskIndex);
    setFieldValue('tasks', updatedTasks);
  };

  const handleAddSubtask = (taskIndex: number) => {
    const updatedTasks = [...values.tasks];

    if (!updatedTasks[taskIndex].subtasks) {
      updatedTasks[taskIndex].subtasks = [];
    }

    updatedTasks[taskIndex].subtasks.push({
      name: '',
      completed: false,
    });

    setFieldValue('tasks', updatedTasks);
  };

  const handleRemoveSubtask = (taskIndex: number, subtaskIndex: number) => {
    const updatedTasks = [...values.tasks];

    if (updatedTasks[taskIndex].subtasks) {
      updatedTasks[taskIndex].subtasks = updatedTasks[taskIndex].subtasks.filter(
        (_, index) => index !== subtaskIndex
      );

      setFieldValue('tasks', updatedTasks);
    }
  };
  return (
    <div className="p-6 max-h-[75vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">Add Tasks</h2>
      <div className="space-y-6">
        {values.tasks.map((task, taskIndex) => {
          return (
            <div
              key={taskIndex}
              className="p-4 border border-gray-200 rounded-lg shadow-sm relative bg-white"
            >
              {taskIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={() => handleRemoveTask(taskIndex)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <div className="mb-4">
                <label className="text-sm font-medium text-blue-700">Task Name</label>
                <Input
                  name={`tasks[${taskIndex}].name`}
                  value={task.name}
                  onChange={e => {
                    const updatedTasks = [...values.tasks];
                    updatedTasks[taskIndex].name = e.target.value;
                    setFieldValue('tasks', updatedTasks);
                  }}
                  placeholder="Enter task name"
                  className={`mt-1 ${
                    errors.tasks &&
                    typeof errors.tasks !== 'string' &&
                    errors.tasks[taskIndex] &&
                    typeof errors.tasks[taskIndex] !== 'string' &&
                    errors.tasks[taskIndex].name
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.tasks &&
                  typeof errors.tasks !== 'string' &&
                  errors.tasks[taskIndex] &&
                  typeof errors.tasks[taskIndex] !== 'string' &&
                  errors.tasks[taskIndex].name && (
                    <p className="text-red-500 text-sm mt-1">{errors.tasks[taskIndex].name}</p>
                  )}
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium text-blue-700">Description</label>
                <Textarea
                  name={`tasks[${taskIndex}].description`}
                  value={task.description}
                  onChange={e => {
                    const updatedTasks = [...values.tasks];
                    updatedTasks[taskIndex].description = e.target.value;
                    setFieldValue('tasks', updatedTasks);
                  }}
                  placeholder="Enter task description"
                  rows={3}
                  className={`mt-1 ${
                    errors.tasks &&
                    typeof errors.tasks !== 'string' &&
                    errors.tasks[taskIndex] &&
                    typeof errors.tasks[taskIndex] !== 'string' &&
                    errors.tasks[taskIndex].description
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.tasks &&
                  typeof errors.tasks !== 'string' &&
                  errors.tasks[taskIndex] &&
                  typeof errors.tasks[taskIndex] !== 'string' &&
                  errors.tasks[taskIndex].description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.tasks[taskIndex].description}
                    </p>
                  )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-blue-700">Priority</label>
                  <Select
                    value={task.priority}
                    onValueChange={value => {
                      const updatedTasks = [...values.tasks];
                      updatedTasks[taskIndex].priority = value as 'High' | 'Medium' | 'Low';
                      setFieldValue('tasks', updatedTasks);
                    }}
                  >
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
                  {errors.tasks &&
                    typeof errors.tasks !== 'string' &&
                    errors.tasks[taskIndex] &&
                    typeof errors.tasks[taskIndex] !== 'string' &&
                    errors.tasks[taskIndex].priority && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.tasks[taskIndex].priority}
                      </p>
                    )}
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Status</label>
                  <Select
                    value={task.status}
                    onValueChange={value => {
                      const updatedTasks = [...values.tasks];
                      updatedTasks[taskIndex].status = value as
                        | 'To Do'
                        | 'In Progress'
                        | 'Review'
                        | 'Completed';
                      setFieldValue('tasks', updatedTasks);
                    }}
                  >
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
                  {errors.tasks &&
                    typeof errors.tasks !== 'string' &&
                    errors.tasks[taskIndex] &&
                    typeof errors.tasks[taskIndex] !== 'string' &&
                    errors.tasks[taskIndex].status && (
                      <p className="text-red-500 text-sm mt-1">{errors.tasks[taskIndex].status}</p>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-blue-700">Due Date</label>
                  <Input
                    type="date"
                    value={task.dueDate}
                    onChange={e => {
                      const updatedTasks = [...values.tasks];
                      updatedTasks[taskIndex].dueDate = e.target.value;
                      setFieldValue('tasks', updatedTasks);
                    }}
                    placeholder="Enter due date"
                    className={`mt-1 ${
                      errors.tasks &&
                      typeof errors.tasks !== 'string' &&
                      errors.tasks[taskIndex] &&
                      typeof errors.tasks[taskIndex] !== 'string' &&
                      errors.tasks[taskIndex].dueDate
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.tasks &&
                    typeof errors.tasks !== 'string' &&
                    errors.tasks[taskIndex] &&
                    typeof errors.tasks[taskIndex] !== 'string' &&
                    errors.tasks[taskIndex].dueDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.tasks[taskIndex].dueDate}</p>
                    )}
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Start Date</label>
                  <Input
                    type="date"
                    value={task.startDate}
                    onChange={e => {
                      const updatedTasks = [...values.tasks];
                      updatedTasks[taskIndex].startDate = e.target.value;
                      setFieldValue('tasks', updatedTasks);
                    }}
                    placeholder="Enter start date"
                    className={`mt-1 ${
                      errors.tasks &&
                      typeof errors.tasks !== 'string' &&
                      errors.tasks[taskIndex] &&
                      typeof errors.tasks[taskIndex] !== 'string' &&
                      errors.tasks[taskIndex].startDate
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.tasks &&
                    typeof errors.tasks !== 'string' &&
                    errors.tasks[taskIndex] &&
                    typeof errors.tasks[taskIndex] !== 'string' &&
                    errors.tasks[taskIndex].startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.tasks[taskIndex].startDate}
                      </p>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="mb-4">
                  <label className="text-sm font-medium text-blue-700">Assigned To</label>
                  {users && (
                    <ReusableSelect
                      options={users.map(user => ({
                        value: user._id,
                        label: (
                          <div className="flex items-center">
                            <Image
                              src={user?.image}
                              alt={user?.name}
                              className="w-6 h-6 rounded-full mr-2"
                              width={24}
                              height={24}
                            />
                            <span>{user?.name}</span>
                          </div>
                        ),
                      }))}
                      value={users
                        .filter(user =>
                          task.assignedTo.some(
                            (assignedUser: User) => assignedUser._id === user._id
                          )
                        )
                        .map(user => ({
                          value: user._id,
                          label: (
                            <div className="flex items-center">
                              <Image
                                src={user?.image}
                                alt={user?.name}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                              <span>{user?.name}</span>
                            </div>
                          ),
                        }))}
                      onChange={(newValue: any) => {
                        const updatedTasks = [...values.tasks];
                        if (Array.isArray(newValue)) {
                          updatedTasks[taskIndex].assignedTo = newValue.map(opt =>
                            users.find(user => user._id === opt.value)
                          );
                        } else if (newValue) {
                          updatedTasks[taskIndex].assignedTo = [
                            users.find(user => user._id === newValue.value) || null,
                          ];
                        } else {
                          updatedTasks[taskIndex].assignedTo = [];
                        }
                        setFieldValue('tasks', updatedTasks);
                      }}
                      placeholder="Select team members"
                      isMulti={true}
                    />
                  )}
                  {errors.tasks &&
                    typeof errors.tasks !== 'string' &&
                    errors.tasks[taskIndex] &&
                    typeof errors.tasks[taskIndex] !== 'string' &&
                    errors.tasks[taskIndex].assignedTo && (
                      <p className="text-red-500 text-sm mt-1">
                        {String(errors.tasks[taskIndex].assignedTo)}
                      </p>
                    )}
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Estimated Time</label>
                  <Input
                    type="number"
                    value={task.estimatedTime}
                    onChange={e => {
                      const updatedTasks = [...values.tasks];
                      updatedTasks[taskIndex].estimatedTime = Number(e.target.value);
                      setFieldValue('tasks', updatedTasks);
                    }}
                    placeholder="Enter estimated time"
                    className={`mt-1 ${
                      errors.tasks &&
                      typeof errors.tasks !== 'string' &&
                      errors.tasks[taskIndex] &&
                      typeof errors.tasks[taskIndex] !== 'string' &&
                      errors.tasks[taskIndex].estimatedTime
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.tasks &&
                    typeof errors.tasks !== 'string' &&
                    errors.tasks[taskIndex] &&
                    typeof errors.tasks[taskIndex] !== 'string' &&
                    errors.tasks[taskIndex].estimatedTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.tasks[taskIndex].estimatedTime}
                      </p>
                    )}
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Subtasks</h3>
                <div className="space-y-4">
                  {(task.subtasks || []).map((subtask, subtaskIndex) => (
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
                          value={subtask.name}
                          onChange={e => {
                            const updatedTasks = [...values.tasks];
                            updatedTasks[taskIndex].subtasks[subtaskIndex].name = e.target.value;
                            setFieldValue('tasks', updatedTasks);
                          }}
                          placeholder="Enter subtask name"
                          className="mt-1"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="text-sm font-medium text-blue-700">Completed</label>
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={e => {
                            const updatedTasks = [...values.tasks];
                            updatedTasks[taskIndex].subtasks[subtaskIndex].completed =
                              e.target.checked;
                            setFieldValue('tasks', updatedTasks);
                          }}
                          className="ml-2"
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
