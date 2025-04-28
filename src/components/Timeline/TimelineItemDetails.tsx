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
import { Calendar as CalendarIcon, Trash2, Users, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface TimelineItemDetailsProps {
  item: any;
  projects: any[];
  users: any[];
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TimelineItemDetails: React.FC<TimelineItemDetailsProps> = ({
  item,
  projects,
  users,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    title: item.title || '',
    description: item.description || '',
    startDate: item.startDate ? new Date(item.startDate) : new Date(),
    endDate: item.endDate ? new Date(item.endDate) : new Date(),
    status: item.status || 'planned',
    projectId: item.projectId?._id || item.projectId || '',
    progress: item.progress || 0,
    users: item.users?.map((user: any) => user._id || user) || [],
    color: item.color || '#3498db',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdate(item._id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update timeline item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(item._id);
      onClose();
    } catch (error) {
      console.error('Failed to delete timeline item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-500', text: 'text-green-500' };
      case 'in_progress':
        return { color: 'bg-blue-500', text: 'text-blue-500' };
      case 'delayed':
        return { color: 'bg-red-500', text: 'text-red-500' };
      default:
        return { color: 'bg-gray-500', text: 'text-gray-500' };
    }
  };

  const statusConfig = getStatusConfig(formData.status);

  return (
    <div className="h-full flex flex-col">
      {/* Header is now handled by RightSidebar */}

      <div className="flex border-b">
        <button
          className={cn(
            'px-4 py-2 text-sm font-medium',
            selectedTab === 'details' ? 'border-b-2 border-primary' : ''
          )}
          onClick={() => setSelectedTab('details')}
        >
          Details
        </button>
        <button
          className={cn(
            'px-4 py-2 text-sm font-medium',
            selectedTab === 'users' ? 'border-b-2 border-primary' : ''
          )}
          onClick={() => setSelectedTab('users')}
        >
          Assigned Users
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {selectedTab === 'details' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter milestone title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter milestone description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={date => setFormData({ ...formData, startDate: date || new Date() })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={date => setFormData({ ...formData, endDate: date || new Date() })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={value => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={value => setFormData({ ...formData, projectId: value })}
              >
                <SelectTrigger>
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
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Progress ({formData.progress}%)</Label>
              </div>
              <Slider
                value={[formData.progress]}
                max={100}
                step={1}
                onValueChange={value => setFormData({ ...formData, progress: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'].map(
                  color => (
                    <div
                      key={color}
                      className={cn(
                        'w-8 h-8 rounded-full cursor-pointer transition-all',
                        formData.color === color ? 'ring-2 ring-offset-2 ring-ring' : ''
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  )
                )}
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Assigned Users</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
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
                                  users: formData.users.filter(id => id !== (user._id || user.id)),
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
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.users.length > 0 ? (
                formData.users.map(userId => {
                  const user = users.find(u => (u._id || u.id) === userId);
                  return user ? (
                    <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            users: formData.users.filter(id => id !== userId),
                          });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null;
                })
              ) : (
                <div className="text-sm text-muted-foreground">No users assigned</div>
              )}
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
