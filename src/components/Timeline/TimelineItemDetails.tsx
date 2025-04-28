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
import { useProjectTimelineStore, FrontendTimelineItem } from '@/stores/projectTimelineStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface TimelineItemDetailsProps {
  item: FrontendTimelineItem;
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
}

export const TimelineItemDetails: React.FC<TimelineItemDetailsProps> = ({
  item,
  projects,
  users,
  onClose,
}) => {
  const {
    updateTimelineItem,
    deleteTimelineItem,
    isLoading: storeLoading,
  } = useProjectTimelineStore();
  const [formData, setFormData] = useState({
    title: item.title || '',
    description: item.description || '',
    startDate: item.startDate ? new Date(item.startDate) : new Date(),
    endDate: item.endDate ? new Date(item.endDate) : new Date(),
    status: item.status || 'pending',
    projectId: item.projectId || '',
    progress: item.progress || 0,
    users: item.users?.map(user => user.id) || [],
    color: item.color || '#3498db',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Convert form data to the format expected by the store
      const updatedItem: Partial<FrontendTimelineItem> = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        status: formData.status as FrontendTimelineItem['status'],
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

      // Update the item using the store
      await updateTimelineItem(item.id, updatedItem);
      toast({
        title: 'Success',
        description: 'Timeline item updated successfully',
      });
      onClose();
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

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteTimelineItem(item.id);
      toast({
        title: 'Success',
        description: 'Timeline item deleted successfully',
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete timeline item',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header is now handled by RightSidebar */}

      <div className="flex border-b">
        <button
          className={cn(
            'px-4 py-2 text-sm font-medium transition-all',
            selectedTab === 'details'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setSelectedTab('details')}
        >
          Details
        </button>
        <button
          className={cn(
            'px-4 py-2 text-sm font-medium transition-all',
            selectedTab === 'users'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter milestone title"
                        required
                        className="w-full"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-xs">
                    <p>{formData.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter milestone description"
                className="min-h-[100px] resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      initialFocus
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
                      initialFocus
                      disabled={date => date < formData.startDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={value =>
                  setFormData({ ...formData, status: value as FrontendTimelineItem['status'] })
                }
              >
                <SelectTrigger>
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
                        <span className="truncate max-w-[150px]">{project.name}</span>
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
              <div className="flex flex-wrap gap-2">
                {['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'].map(
                  color => (
                    <div
                      key={color}
                      className={cn(
                        'w-8 h-8 rounded-full cursor-pointer transition-all',
                        formData.color === color
                          ? 'ring-2 ring-offset-2 ring-ring'
                          : 'hover:scale-110'
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
                            <span className="text-sm truncate max-w-[150px]">{user.name}</span>
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
                      <span className="truncate max-w-[100px]">{user.name}</span>
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

      <div className="p-4 border-t flex justify-between">
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isLoading || storeLoading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the timeline item.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={handleSubmit} disabled={isLoading || storeLoading}>
          {isLoading || storeLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
