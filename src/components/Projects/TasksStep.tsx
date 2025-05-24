import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProject, User } from '@/context/ProjectContext';
import ReactSelect from '../Global/ReactSelect';
import { useQuery } from '@tanstack/react-query';
import { OrganizationService } from '@/services/Organization.service';
import { toast } from 'sonner';
import Image from 'next/image';

const TasksStep = ({ stepValidationAttempted = false }) => {
  const { formik } = useProject()!;
  const { values, errors, setFieldValue, touched } = formik;

  // Options for ReactSelect components
  const priorityOptions = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
  ];

  const statusOptions = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Review', label: 'Review' },
    { value: 'Completed', label: 'Completed' },
  ];

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

  const shouldShowError = (fieldName: string, index?: number | null) => {
    if (index !== null && index !== undefined) {
      return (
        stepValidationAttempted ||
        (touched.tasks && touched.tasks[index] && touched.tasks[index][fieldName])
      );
    }
    return stepValidationAttempted || touched[fieldName];
  };

  const getFieldError = (fieldName, taskIndex) => {
    return errors.tasks &&
      typeof errors.tasks !== 'string' &&
      errors.tasks[taskIndex] &&
      typeof errors.tasks[taskIndex] !== 'string' &&
      errors.tasks[taskIndex][fieldName]
      ? errors.tasks[taskIndex][fieldName]
      : null;
  };

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
    <div className="p-6 theme-surface">
      <h2 className="text-2xl font-bold theme-text-primary mb-6 flex items-center gap-2">
        Add Tasks
      </h2>
      <div className="space-y-6">
        {values.tasks.map((task, taskIndex) => {
          return (
            <div
              key={taskIndex}
              className="p-4 theme-border rounded-lg theme-shadow-sm relative theme-surface-elevated"
            >
              {taskIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 theme-transition"
                  onClick={() => handleRemoveTask(taskIndex)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}

              {/* Task Name Field */}
              <div className="mb-4">
                <label className="text-sm font-medium theme-text-primary">Task Name</label>
                <Input
                  name={`tasks[${taskIndex}].name`}
                  value={task.name}
                  onChange={e => {
                    const updatedTasks = [...values.tasks];
                    updatedTasks[taskIndex].name = e.target.value;
                    setFieldValue('tasks', updatedTasks);
                  }}
                  placeholder="Enter task name"
                  className={`mt-1 theme-input theme-focus ${
                    shouldShowError('name', taskIndex) && getFieldError('name', taskIndex)
                      ? 'border-destructive'
                      : ''
                  }`}
                />
                {shouldShowError('name', taskIndex) && getFieldError('name', taskIndex) && (
                  <p className="text-destructive text-sm mt-1">
                    {getFieldError('name', taskIndex)}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="mb-4">
                <label className="text-sm font-medium theme-text-primary">Description</label>
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
                  className={`mt-1 theme-input theme-focus ${
                    shouldShowError('description', taskIndex) &&
                    getFieldError('description', taskIndex)
                      ? 'border-destructive'
                      : ''
                  }`}
                />
                {shouldShowError('description', taskIndex) &&
                  getFieldError('description', taskIndex) && (
                    <p className="text-destructive text-sm mt-1">
                      {getFieldError('description', taskIndex)}
                    </p>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Priority Field */}
                <div>
                  <ReactSelect
                    label="Priority"
                    options={priorityOptions}
                    value={priorityOptions.find(option => option.value === task.priority) || null}
                    onChange={(selectedOption: any) => {
                      const updatedTasks = [...values.tasks];
                      updatedTasks[taskIndex].priority = selectedOption?.value || 'Medium';
                      setFieldValue('tasks', updatedTasks);
                    }}
                    placeholder="Select priority"
                    isSearchable={false}
                    isClearable={false}
                    error={
                      shouldShowError('priority', taskIndex) && getFieldError('priority', taskIndex)
                        ? getFieldError('priority', taskIndex)
                        : undefined
                    }
                  />
                </div>

                {/* Status Field */}
                <div>
                  <ReactSelect
                    label="Status"
                    options={statusOptions}
                    value={statusOptions.find(option => option.value === task.status) || null}
                    onChange={(selectedOption: any) => {
                      const updatedTasks = [...values.tasks];
                      updatedTasks[taskIndex].status = selectedOption?.value || 'To Do';
                      setFieldValue('tasks', updatedTasks);
                    }}
                    placeholder="Select status"
                    isSearchable={false}
                    isClearable={false}
                    error={
                      shouldShowError('status', taskIndex) && getFieldError('status', taskIndex)
                        ? getFieldError('status', taskIndex)
                        : undefined
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Due Date Field */}
                <div>
                  <label className="text-sm font-medium theme-text-primary">Due Date</label>
                  <Input
                    type="date"
                    value={task.dueDate}
                    onChange={e => {
                      const updatedTasks = [...values.tasks];
                      updatedTasks[taskIndex].dueDate = e.target.value;
                      setFieldValue('tasks', updatedTasks);
                    }}
                    placeholder="Enter due date"
                    className={`mt-1 theme-input theme-focus ${
                      shouldShowError('dueDate', taskIndex) && getFieldError('dueDate', taskIndex)
                        ? 'border-destructive'
                        : ''
                    }`}
                  />
                  {shouldShowError('dueDate', taskIndex) && getFieldError('dueDate', taskIndex) && (
                    <p className="text-destructive text-sm mt-1">
                      {getFieldError('dueDate', taskIndex)}
                    </p>
                  )}
                </div>

                {/* Start Date Field */}
                <div>
                  <label className="text-sm font-medium theme-text-primary">Start Date</label>
                  <Input
                    type="date"
                    value={task.startDate}
                    onChange={e => {
                      const updatedTasks = [...values.tasks];
                      updatedTasks[taskIndex].startDate = e.target.value;
                      setFieldValue('tasks', updatedTasks);
                    }}
                    placeholder="Enter start date"
                    className={`mt-1 theme-input theme-focus ${
                      shouldShowError('startDate', taskIndex) &&
                      getFieldError('startDate', taskIndex)
                        ? 'border-destructive'
                        : ''
                    }`}
                  />
                  {shouldShowError('startDate', taskIndex) &&
                    getFieldError('startDate', taskIndex) && (
                      <p className="text-destructive text-sm mt-1">
                        {getFieldError('startDate', taskIndex)}
                      </p>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Assigned To Field */}
                <div>
                  <label className="text-sm font-medium theme-text-primary">Assigned To</label>
                  {users && (
                    <div
                      className={`${
                        shouldShowError('assignedTo', taskIndex) &&
                        getFieldError('assignedTo', taskIndex)
                          ? 'border-destructive rounded border'
                          : ''
                      }`}
                    >
                      <ReactSelect
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
                                  width={24}
                                  height={24}
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
                    </div>
                  )}
                  {shouldShowError('assignedTo', taskIndex) &&
                    getFieldError('assignedTo', taskIndex) && (
                      <p className="text-destructive text-sm mt-1">
                        {String(getFieldError('assignedTo', taskIndex))}
                      </p>
                    )}
                </div>

                {/* Estimated Time Field */}
                <div>
                  <label className="text-sm font-medium theme-text-primary">Estimated Time</label>
                  <Input
                    type="number"
                    value={task.estimatedTime}
                    onChange={e => {
                      const updatedTasks = [...values.tasks];
                      updatedTasks[taskIndex].estimatedTime = Number(e.target.value);
                      setFieldValue('tasks', updatedTasks);
                    }}
                    placeholder="Enter estimated time"
                    className={`mt-1 theme-input theme-focus ${
                      shouldShowError('estimatedTime', taskIndex) &&
                      getFieldError('estimatedTime', taskIndex)
                        ? 'border-destructive'
                        : ''
                    }`}
                  />
                  {shouldShowError('estimatedTime', taskIndex) &&
                    getFieldError('estimatedTime', taskIndex) && (
                      <p className="text-destructive text-sm mt-1">
                        {getFieldError('estimatedTime', taskIndex)}
                      </p>
                    )}
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold theme-text-primary mb-2">Subtasks</h3>
                <div className="space-y-4">
                  {(task.subtasks || []).map((subtask, subtaskIndex) => (
                    <div key={subtaskIndex} className="p-3 theme-border rounded-md theme-surface">
                      {task.subtasks.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 theme-transition mb-2"
                          onClick={() => handleRemoveSubtask(taskIndex, subtaskIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <div className="mb-2">
                        <label className="text-sm font-medium theme-text-primary">
                          Subtask Name
                        </label>
                        <Input
                          value={subtask.name}
                          onChange={e => {
                            const updatedTasks = [...values.tasks];
                            updatedTasks[taskIndex].subtasks[subtaskIndex].name = e.target.value;
                            setFieldValue('tasks', updatedTasks);
                          }}
                          placeholder="Enter subtask name"
                          className="mt-1 theme-input theme-focus"
                        />
                      </div>
                      <div className="mb-2 flex items-center">
                        <label className="text-sm font-medium theme-text-primary">Completed</label>
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={e => {
                            const updatedTasks = [...values.tasks];
                            updatedTasks[taskIndex].subtasks[subtaskIndex].completed =
                              e.target.checked;
                            setFieldValue('tasks', updatedTasks);
                          }}
                          className="ml-2 theme-focus"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 flex items-center gap-2 theme-button-secondary theme-transition"
                  onClick={() => handleAddSubtask(taskIndex)}
                >
                  <PlusCircle className="w-5 h-5" /> Add Subtask
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        variant="outline"
        className="mt-6 flex items-center gap-2 theme-button-secondary theme-transition"
        onClick={handleAddTask}
      >
        <PlusCircle className="w-5 h-5" /> Add Task
      </Button>
    </div>
  );
};

export default TasksStep;
