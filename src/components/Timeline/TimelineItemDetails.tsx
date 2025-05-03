'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Users, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { toast } from '@/hooks/use-toast';

export type CombinedTimelineItem = {
  _id?: string;
  id: string;
  title: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  status: 'pending' | 'in_progress' | 'done' | 'planned' | 'completed' | 'delayed';
  projectId?: string | { _id: string; name: string; color: string };
  progress?: number;
  color?: string;
  users: Array<{
    id: string;
    _id?: string;
    name: string;
    avatar?: string;
    image?: string;
  }>;
};

interface TimelineItemDetailsProps {
  item: CombinedTimelineItem;
  projects: Array<{
    id: string;
    _id?: string;
    name: string;
    color: string;
  }>;
  users: Array<{
    id: string;
    _id?: string;
    name: string;
    image?: string;
  }>;
  onClose: () => void;
  onUpdate?: (id: string, data: any) => Promise<void>;
  isEdit?: boolean;
}

export const TimelineItemDetails: React.FC<TimelineItemDetailsProps> = ({
  item,
  projects,
  users,
  onUpdate,
  isEdit,
}) => {
  const normalizeStatus = (status: CombinedTimelineItem['status']) => {
    if (status === 'pending' || status === 'in_progress' || status === 'done') {
      return status;
    }

    // Map backend statuses to frontend statuses
    const statusMap = {
      planned: 'pending',
      in_progress: 'in_progress',
      completed: 'done',
      delayed: 'pending',
    };

    return statusMap[status] || 'pending';
  };

  const [formData, setFormData] = useState({
    title: item.title || '',
    description: item.description || '',
    startDate: item.startDate ? new Date(item.startDate) : new Date(),
    endDate: item.endDate ? new Date(item.endDate) : new Date(),
    status: normalizeStatus(item.status),
    projectId: typeof item.projectId === 'object' ? item.projectId._id : item.projectId || '',
    progress: item.progress || 0,
    users: item.users?.map(user => user.id || user._id || '') || [],
    color: item.color || '#3498db',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Convert form data to the format expected by the API
      const updatedItem = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        status: formData.status,
        projectId: formData.projectId,
        progress: formData.progress,
        color: formData.color,
        users: formData.users.map(userId => {
          const user = users.find(u => (u._id || u.id) === userId);
          return {
            id: userId,
            name: user?.name || 'Unknown',
            avatar: user?.image,
          };
        }),
      };

      if (onUpdate) {
        await onUpdate(item.id || item._id || '', updatedItem);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update timeline item',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex border-b">
        <button
          className={cn(
            'px-4 py-3 text-sm font-medium',
            selectedTab === 'details'
              ? 'border-b-2 border-primary text-primary bg-white'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setSelectedTab('details')}
        >
          Details
        </button>
        <button
          className={cn(
            'px-4 py-3 text-sm font-medium',
            selectedTab === 'users'
              ? 'border-b-2 border-primary text-primary bg-white'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setSelectedTab('users')}
        >
          Assigned Users
        </button>
      </div>

      <ScrollArea className="flex-1 p-5">
        {selectedTab === 'details' ? (
          isEdit ? (
            // Edit mode - form with editable fields
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter milestone title"
                  required
                  className="w-full border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter milestone description"
                  className="min-h-[100px] resize-y border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-gray-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={date =>
                          setFormData({ ...formData, startDate: date || new Date() })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-gray-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={date => setFormData({ ...formData, endDate: date || new Date() })}
                        initialFocus
                        disabled={date => date < formData.startDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={value => {
                    const validStatus = value;
                    setFormData({ ...formData, status: validStatus });
                  }}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Project</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={value => setFormData({ ...formData, projectId: value })}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project._id || project.id} value={project._id || project.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="truncate max-w-[150px]">{project.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium text-gray-700">Progress</Label>
                  <span className="text-sm font-semibold text-primary">{formData.progress}%</span>
                </div>
                <Slider
                  value={[formData.progress]}
                  max={100}
                  step={1}
                  onValueChange={value => setFormData({ ...formData, progress: value[0] })}
                  className="py-1"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Color</Label>
                <div className="flex flex-wrap gap-3 p-2 bg-gray-50 rounded-md">
                  {[
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f39c12',
                    '#9b59b6',
                    '#1abc9c',
                    '#34495e',
                  ].map(color => (
                    <div
                      key={color}
                      className={cn(
                        'w-8 h-8 rounded-full cursor-pointer',
                        formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </form>
          ) : (
            // View mode - modern and professional layout
            <div>
              {/* Header with title and status badge */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">{formData.title}</h2>
                  <Badge
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-full',
                      formData.status === 'pending'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : formData.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    )}
                  >
                    {formData.status === 'pending'
                      ? 'Planned'
                      : formData.status === 'in_progress'
                        ? 'In Progress'
                        : 'Completed'}
                  </Badge>
                </div>

                {/* Description with styled container */}
                {formData.description ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {formData.description}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-500 italic mt-4">
                    No description provided.
                  </div>
                )}
              </div>

              {/* Progress section with visual indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Progress</h3>
                  <span
                    className={cn(
                      'text-sm font-bold px-2 py-1 rounded-md',
                      formData.progress < 30
                        ? 'bg-red-50 text-red-600'
                        : formData.progress < 70
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                    )}
                  >
                    {formData.progress}%
                  </span>
                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={cn(
                      'h-full rounded-full shadow-sm',
                      formData.progress < 30
                        ? 'bg-red-500'
                        : formData.progress < 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    )}
                    style={{ width: `${formData.progress}%` }}
                  />
                </div>
              </div>

              {/* Timeline and project info in cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Timeline card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                      Timeline
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center mb-3">
                        <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                        <span className="text-sm text-gray-500">Start Date</span>
                        <span className="ml-auto font-medium text-gray-800">
                          {format(formData.startDate, 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                        <span className="text-sm text-gray-500">End Date</span>
                        <span className="ml-auto font-medium text-gray-800">
                          {format(formData.endDate, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700">Project Details</h3>
                  </div>
                  <div className="p-4">
                    {formData.projectId ? (
                      (() => {
                        const project = projects.find(p => (p._id || p.id) === formData.projectId);
                        return project ? (
                          <div className="flex items-center">
                            <div className="font-medium text-gray-800">{project.name}</div>
                          </div>
                        ) : (
                          <div className="text-gray-500">No project selected</div>
                        );
                      })()
                    ) : (
                      <div className="text-gray-500">No project selected</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline visualization */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline Visualization</h3>
                <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gray-200"
                    style={{
                      width: '100%',
                      backgroundImage:
                        'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.05) 20px, rgba(0,0,0,0.05) 40px)',
                    }}
                  />
                  <div
                    className="absolute inset-y-0 rounded-r-lg"
                    style={{
                      left: '0%',
                      width: '100%',
                      backgroundColor: formData.color || '#3498db',
                      opacity: 0.2,
                    }}
                  />
                  <div
                    className="absolute inset-y-0 rounded-r-lg"
                    style={{
                      left: '0%',
                      width: `${formData.progress}%`,
                      backgroundColor: formData.color || '#3498db',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-gray-800/70">
                      {format(formData.startDate, 'MMM d')} -{' '}
                      {format(formData.endDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Color sample */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div
                  className="w-8 h-8 rounded-full shadow-sm"
                  style={{ backgroundColor: formData.color }}
                />
                <div>
                  <span className="text-xs text-gray-500">Timeline Color</span>
                  <div className="font-mono text-xs text-gray-700">{formData.color}</div>
                </div>
              </div>
            </div>
          )
        ) : (
          // Users tab
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Assigned Team Members</h3>
              {isEdit && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      Assign Users
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0">
                    <ScrollArea className="h-64 p-4">
                      <div className="space-y-2">
                        {users.map(user => (
                          <div key={user._id || user.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`user-${user._id || user.id}`}
                              checked={formData.users.includes(user._id || user.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    users: [...formData.users, user._id || user.id],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    users: formData.users.filter(
                                      id => id !== (user._id || user.id)
                                    ),
                                  });
                                }
                              }}
                            />
                            <label
                              htmlFor={`user-${user._id || user.id}`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback className="bg-gray-200 text-gray-700">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm truncate max-w-[150px]">{user.name}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {formData.users.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      Team Members ({formData.users.length})
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.users.map(userId => {
                        const user = users.find(u => (u._id || u.id) === userId);
                        return user ? (
                          <div
                            key={userId}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                          >
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                              <AvatarImage src={user.image} alt={user.name} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white font-medium">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-800">{user.name}</div>
                              <div className="text-xs text-gray-500">Team Member</div>
                            </div>
                            {isEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-auto text-gray-400 hover:text-red-500"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    users: formData.users.filter(id => id !== userId),
                                  });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>

                {/* Team visualization */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700">Team Overview</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex -space-x-3 mb-4 justify-center">
                      {formData.users.slice(0, 5).map(userId => {
                        const user = users.find(u => (u._id || u.id) === userId);
                        return user ? (
                          <Avatar
                            key={userId}
                            className="h-12 w-12 border-2 border-white shadow-md"
                          >
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white font-medium">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : null;
                      })}
                      {formData.users.length > 5 && (
                        <div className="h-12 w-12 rounded-full bg-gray-100 border-2 border-white shadow-md flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            +{formData.users.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      This timeline item has {formData.users.length} team member
                      {formData.users.length !== 1 ? 's' : ''} assigned
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    Team Members
                  </h3>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium">No team members assigned</p>
                  <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    This timeline item doesn&apos;t have any team members assigned to it yet.
                    {isEdit && (
                      <span className="block mt-2 text-primary">
                        Click &quot;Assign Users&quot; to add team members
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {isEdit && (
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};
