'use client';
import React from 'react';
import { useFormik } from 'formik';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@heroui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  User2,
  Info,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { timelineSchema } from '@/Schemas/Timeline';
import Modal from '../Global/Modal';
import { toast } from 'sonner';

interface TimelineFormProps {
  onSubmit: (_data: any) => Promise<void>;
  projects: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  users?: Array<{
    id: string;
    name: string;
    image?: string;
  }>;
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const TimelineForm: React.FC<TimelineFormProps> = ({
  onSubmit,
  projects,
  users = [],
  isLoading = false,
  isOpen,
  onClose,
}) => {
  // Define status options
  const statusOptions = [
    { value: 'planned', label: 'Planned', icon: <Clock className="h-4 w-4 text-blue-500" /> },
    {
      value: 'in_progress',
      label: 'In Progress',
      icon: <BarChart3 className="h-4 w-4 text-amber-500" />,
    },
    {
      value: 'completed',
      label: 'Completed',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
    { value: 'delayed', label: 'Delayed', icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
  ];

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      projectId: '',
      status: 'planned',
      progress: 0,
      users: [] as string[],
      color: '#3498db',
    },
    validationSchema: timelineSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async values => {
      try {
        const formattedValues = {
          ...values,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        };

        await onSubmit(formattedValues);
        if (!isLoading) {
          formik.resetForm();
          onClose();
        }
      } catch (error) {
        toast.error('Failed to create timeline item', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  const {
    values,
    setFieldValue,
    handleChange,
    handleSubmit,
    errors,
    touched,
    isSubmitting,
    setFieldTouched,
  } = formik;

  // Helper to check if a field has errors
  const hasError = (fieldName: string) => {
    return touched[fieldName] && errors[fieldName];
  };

  // Color options
  const colorOptions = [
    { value: '#3498db', name: 'Blue' },
    { value: '#2ecc71', name: 'Green' },
    { value: '#e74c3c', name: 'Red' },
    { value: '#f39c12', name: 'Orange' },
    { value: '#9b59b6', name: 'Purple' },
    { value: '#1abc9c', name: 'Teal' },
    { value: '#34495e', name: 'Dark Blue' },
  ];

  // Handle date changes with validation
  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (!date) return;

    setFieldValue(field, date);
    setFieldTouched(field, true, false);

    // If changing start date and it's after end date, update end date
    if (field === 'startDate' && values.endDate && date > values.endDate) {
      setFieldValue('endDate', date);
      setFieldTouched('endDate', true, false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col min-h-[calc(100vh-250px)]">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-1 h-6 rounded" style={{ backgroundColor: values.color }}></div>
          Create Timeline Item
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between">
          <Tabs defaultValue="details" className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4 rounded-md">
              <TabsTrigger
                value="details"
                className="rounded-md text-xs flex gap-1 items-center py-2"
              >
                <Info className="h-3 w-3" />
                Details
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-md text-xs flex gap-1 items-center py-2"
              >
                <User2 className="h-3 w-3" />
                Team Members
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 flex flex-col overflow-hidden h-96">
              <TabsContent value="details" className="space-y-4 pt-1 flex-1 overflow-y-auto">
                {/* Title */}
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-xs font-medium">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={() => setFieldTouched('title', true)}
                    placeholder="Enter milestone title"
                    className={cn(
                      'h-9 px-3 text-sm',
                      hasError('title')
                        ? 'border-red-500 focus:ring-red-200'
                        : 'focus:ring-1 focus:ring-blue-100'
                    )}
                  />
                  {hasError('title') && (
                    <div className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={values.description || ''}
                    onChange={handleChange}
                    placeholder="Enter milestone description"
                    className="min-h-16 max-h-32 resize-none px-3 py-2 text-sm focus:ring-1 focus:ring-blue-100"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Start Date */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">
                      Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal h-9 text-sm',
                            hasError('startDate') ? 'border-red-500' : ''
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3 text-gray-500" />
                          {values.startDate
                            ? format(values.startDate, 'MMM d, yyyy')
                            : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={values.startDate}
                          onSelect={date => handleDateChange('startDate', date)}
                          className="rounded-md border-0"
                        />
                      </PopoverContent>
                    </Popover>
                    {hasError('startDate') && (
                      <div className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {String(errors.startDate)}
                      </div>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">
                      End Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal h-9 text-sm',
                            hasError('endDate') ? 'border-red-500' : ''
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3 text-gray-500" />
                          {values.endDate ? format(values.endDate, 'MMM d, yyyy') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={values.endDate}
                          onSelect={date => handleDateChange('endDate', date)}
                          disabled={date => date < values.startDate}
                          className="rounded-md border-0"
                        />
                      </PopoverContent>
                    </Popover>
                    {hasError('endDate') && (
                      <div className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {String(errors.endDate)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Status */}
                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-xs font-medium">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="status"
                      value={values.status}
                      onChange={e => {
                        setFieldValue('status', e?.target.value);
                        setFieldTouched('status', true);
                      }}
                      placeholder="Select status"
                      aria-label="Select status"
                      className={cn('h-9 text-sm', hasError('status') ? 'border-red-500' : '')}
                    >
                      {statusOptions.map(option => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          textValue={option.label}
                        >
                          <div className="flex items-center gap-2">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Project */}
                  <div className="space-y-1">
                    <Label htmlFor="projectId" className="text-xs font-medium">
                      Project <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="projectId"
                      selectedKeys={[values.projectId]}
                      onChange={e => {
                        setFieldValue('projectId', e?.target?.value);
                        setFieldTouched('projectId', true);
                      }}
                      placeholder="Select project"
                      aria-label="Select project"
                      className={cn('h-9 text-sm', hasError('projectId') ? 'border-red-500' : '')}
                    >
                      {projects?.map(project => (
                        <SelectItem key={project.id} value={project.id} textValue={project.name}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="progress" className="text-xs font-medium">
                      Progress
                    </Label>
                    <Badge
                      variant={values.progress === 100 ? 'success' : 'outline'}
                      className="px-1.5 py-0.5 text-xs"
                    >
                      {values.progress}%
                    </Badge>
                  </div>
                  <Slider
                    id="progress"
                    value={[values.progress]}
                    max={100}
                    step={1}
                    onValueChange={val => setFieldValue('progress', val[0])}
                    aria-label="Progress percentage"
                    className="py-0.5"
                  />
                  {hasError('progress') && (
                    <div className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.progress}
                    </div>
                  )}
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label htmlFor="color-picker" className="text-xs font-medium">
                    Color
                  </Label>
                  <div
                    id="color-picker"
                    role="radiogroup"
                    aria-label="Select color"
                    className="flex flex-wrap gap-2 p-1"
                  >
                    {colorOptions.map(color => (
                      <div
                        key={color.value}
                        role="radio"
                        aria-checked={values.color === color.value}
                        aria-label={`Color ${color.name}`}
                        className={cn(
                          'w-7 h-7 rounded-full cursor-pointer transition-all flex items-center justify-center',
                          values.color === color.value ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                        )}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFieldValue('color', color.value)}
                      >
                        {values.color === color.value && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                    ))}
                  </div>
                  {hasError('color') && (
                    <div className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.color}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="flex-1 pt-1 overflow-hidden flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-50 text-blue-700 p-1.5 rounded-full mr-2">
                    <User2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Assign Team Members</h3>
                    <p className="text-xs text-gray-500">Select who will be working on this item</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 border rounded-md p-2 shadow-sm mb-3">
                  <div className="space-y-1" role="group" aria-label="Select users">
                    {users?.map(user => {
                      const isSelected = values.users.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-md transition-all',
                            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                          )}
                        >
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={isSelected}
                            onChange={e => {
                              const isChecked = e.target.checked;
                              if (isChecked) {
                                setFieldValue('users', [...values.users, user.id]);
                              } else {
                                setFieldValue(
                                  'users',
                                  values.users.filter(id => id !== user.id)
                                );
                              }
                            }}
                            className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`user-${user.id}`}
                            className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                          >
                            <Avatar className="h-6 w-6 border border-white shadow-sm">
                              <AvatarImage src={user.image} alt={user.name} />
                              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Selected users badges */}
                <div>
                  <Label className="text-xs font-medium mb-1 block">Selected Team Members:</Label>
                  <div className="flex flex-wrap gap-1 mt-1 min-h-8">
                    {values.users.length > 0 ? (
                      values.users.map(userId => {
                        const user = users.find(u => u.id === userId);
                        return user ? (
                          <Badge
                            key={userId}
                            variant="secondary"
                            className="py-0.5 px-2 flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs"
                          >
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={user.image} alt={user.name} />
                              <AvatarFallback className="text-xs">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {user.name}
                          </Badge>
                        ) : null;
                      })
                    ) : (
                      <div className="text-xs text-gray-500 italic">No team members selected</div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-1.5 h-8 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="px-4 py-1.5 h-8 text-sm bg-blue-600 hover:bg-blue-700"
            >
              {isLoading || isSubmitting ? (
                <>
                  <span className="animate-spin mr-1">⏳</span>
                  Creating...
                </>
              ) : (
                'Create Item'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
