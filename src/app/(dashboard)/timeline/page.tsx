'use client';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter, List, Search, X, LayoutGrid } from 'lucide-react';
import { TimelineForm } from '@/components/Timeline/TimelineForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { ProjectTimeline } from '@/components/Timeline/ProjectTimeline';
import { GanttChart } from '@/components/Timeline/GanttChart';
import { TimelineItemDetails } from '@/components/Timeline/TimelineItemDetails';
import { TimelineService } from '@/services/Timeline.service';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RightSidebar from '@/components/Global/RightSidebar';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizationService } from '@/services/Organization.service';
import { useToast } from '@/hooks/use-toast';
import { ProjectService } from '@/services/Project.service';
import { motion, AnimatePresence } from 'framer-motion';

// Define a common interface that works with both components
export interface TimelineItem {
  _id?: string;
  id: string;
  title: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  projectId?: any; // Can be string or object with _id
  progress?: number;
  color?: string;
  users: Array<{
    id: string;
    _id?: string;
    name: string;
    avatar?: string;
    image?: string;
  }>;
}

export default function TimelinePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt'>('timeline');
  const [isEdit, setIsEdit] = useState(false);
  const getFilters = useCallback(() => {
    const filters: any = {};
    if (selectedProject) filters.projectId = selectedProject;
    if (selectedFilter !== 'all') filters.status = selectedFilter;
    if (searchQuery) filters.search = searchQuery;
    if (dateRange.from && dateRange.to) {
      filters.startDate = format(dateRange.from, 'yyyy-MM-dd');
      filters.endDate = format(dateRange.to, 'yyyy-MM-dd');
    }
    return filters;
  }, [selectedFilter, selectedProject, searchQuery, dateRange]);
  const handleDateRangeChange = (range: any) => {
    setDateRange(range);
  };
  const { data: organization } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        return await OrganizationService.getOrganizations();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch organization data',
          variant: 'destructive',
        });
        throw error;
      }
    },
  });

  const users =
    organization?.members?.map((member: any) => ({
      id: member.userId._id,
      name: member.userId.name,
      image: member.userId.image,
    })) || [];

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        return await ProjectService.getProjects();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch project data',
          variant: 'destructive',
        });
        throw error;
      }
    },
  });
  const formatedProjects =
    projects?.projects?.map((project: any) => ({
      id: project._id,
      name: project.name,
    })) || [];

  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['timeline-items', selectedFilter, selectedProject, searchQuery, dateRange],
    queryFn: async () => {
      try {
        const filters = getFilters();
        const response = await TimelineService.getTimelineItems(filters);

        if (response.timelineItems && response.timelineItems.length > 0) {
          return response.timelineItems.map((item: any) => ({
            ...item,
            id: item._id || String(Date.now()),
          }));
        }
        return [];
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch timeline items',
          variant: 'destructive',
        });
        return [];
      }
    },
  });
  const timelineItems: TimelineItem[] = timelineData || [];
  const createTimelineMutation = useMutation({
    mutationFn: (data: any) => TimelineService.createTimelineItem(data),
    onSuccess: response => {
      if (response.timelineItem) {
        toast({
          title: 'Success',
          description: 'Timeline item created successfully',
          variant: 'success',
        });
        queryClient.invalidateQueries({ queryKey: ['timeline-items'] });
        setIsCreateOpen(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create timeline item',
        variant: 'destructive',
      });
    },
  });

  const handleCreateTimelineItem = async (data: any) => {
    createTimelineMutation.mutate(data);
  };

  const updateTimelineMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      TimelineService.updateTimelineItem(id, data),
    onSuccess: (response, variables) => {
      if (response.timelineItem) {
        toast({
          title: 'Success',
          description: 'Timeline item updated successfully',
          variant: 'success',
        });
        setIsEdit(false);

        if (
          selectedItem &&
          (selectedItem._id === variables.id || selectedItem.id === variables.id)
        ) {
          setSelectedItem(null);
        }
        queryClient.invalidateQueries({ queryKey: ['timeline-items'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update timeline item',
        variant: 'destructive',
      });
    },
  });

  const handleUpdateTimelineItem = async (id: string, data: any) => {
    updateTimelineMutation.mutate({ id, data });
  };

  const deleteTimelineMutation = useMutation({
    mutationFn: (id: string) => TimelineService.deleteTimelineItem(id),
    onSuccess: (response, id) => {
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Timeline item deleted successfully',
          variant: 'success',
        });

        if (selectedItem && (selectedItem._id === id || selectedItem.id === id)) {
          setSelectedItem(null);
        }
        queryClient.invalidateQueries({ queryKey: ['timeline-items'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete timeline item',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteTimelineItem = async (id: string) => {
    deleteTimelineMutation.mutate(id);
  };

  // Status change mutation
  const statusChangeMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TimelineItem['status'] }) =>
      TimelineService.updateTimelineItem(id, { status }),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['timeline-items'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['timeline-items']);

      // Optimistically update to the new value
      queryClient.setQueryData(['timeline-items'], (old: any) => {
        if (!old) return old;
        return old.map((item: TimelineItem) =>
          item._id === id || item.id === id ? { ...item, status } : item
        );
      });

      return { previousData };
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Success',
        description: `Status updated to ${variables.status}`,
        variant: 'success',
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['timeline-items'] });
    },
    onError: (error: any, _, context) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });

      // Rollback to the previous value
      if (context?.previousData) {
        queryClient.setQueryData(['timeline-items'], context.previousData);
      }
    },
  });

  // Handle status change
  const handleStatusChange = async (id: string, status: TimelineItem['status']) => {
    statusChangeMutation.mutate({ id, status });
  };

  // Handle item click to show details
  const handleItemClick = (item: TimelineItem) => {
    setSelectedItem(item);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilter('all');
    setSelectedProject(null);
    setSearchQuery('');
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="theme-surface px-4 rounded-md py-2 h-full w-full"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold theme-text-primary">Project Timeline</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="theme-button-primary theme-shadow-md hover:theme-shadow-lg theme-transition"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Timeline Item
          </Button>
        </div>
      </div>

      <Card className="theme-border theme-shadow-lg rounded-xl overflow-hidden theme-surface">
        <CardHeader className="pb-3 theme-surface-elevated theme-border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Tabs defaultValue="timeline" className="w-[400px]">
                <TabsList className="glass theme-border">
                  <TabsTrigger
                    value="timeline"
                    onClick={() => setViewMode('timeline')}
                    className="flex items-center gap-1 theme-transition data-[state=active]:theme-active-primary"
                  >
                    <List className="h-4 w-4" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger
                    value="gantt"
                    onClick={() => setViewMode('gantt')}
                    className="flex items-center gap-1 theme-transition data-[state=active]:theme-active-primary"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Gantt Chart
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 theme-text-secondary" />
                <Input
                  placeholder="Search timeline items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-[220px] rounded-full theme-input theme-focus theme-transition"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full theme-button-ghost"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 rounded-full theme-border theme-hover-primary theme-transition"
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                    {(selectedFilter !== 'all' ||
                      selectedProject ||
                      (dateRange.from && dateRange.to)) && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1 theme-badge-primary">
                        {(selectedFilter !== 'all' ? 1 : 0) +
                          (selectedProject ? 1 : 0) +
                          (dateRange.from && dateRange.to ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2 rounded-xl theme-surface-elevated theme-shadow-lg theme-border"
                >
                  <div className="px-2 py-1.5 text-sm font-semibold theme-text-primary">Status</div>
                  <DropdownMenuRadioGroup value={selectedFilter} onValueChange={setSelectedFilter}>
                    <DropdownMenuRadioItem
                      value="all"
                      className="rounded-lg my-1 cursor-pointer theme-hover-surface theme-transition"
                    >
                      All Statuses
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="planned"
                      className="rounded-lg my-1 cursor-pointer theme-hover-surface theme-transition"
                    >
                      Planned
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="in_progress"
                      className="rounded-lg my-1 cursor-pointer theme-hover-surface theme-transition"
                    >
                      In Progress
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="completed"
                      className="rounded-lg my-1 cursor-pointer theme-hover-surface theme-transition"
                    >
                      Completed
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="delayed"
                      className="rounded-lg my-1 cursor-pointer theme-hover-surface theme-transition"
                    >
                      Delayed
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator className="my-2 theme-divider" />

                  <div className="px-2 py-1.5 text-sm font-semibold theme-text-primary">
                    Projects
                  </div>
                  {projectsLoading ? (
                    <div className="px-2 py-2">
                      <Skeleton className="h-5 w-full rounded-md loading-skeleton" />
                      <Skeleton className="h-5 w-full mt-2 rounded-md loading-skeleton" />
                      <Skeleton className="h-5 w-3/4 mt-2 rounded-md loading-skeleton" />
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto pr-1 theme-scrollbar">
                      <DropdownMenuItem
                        onClick={() => setSelectedProject(null)}
                        className="rounded-lg my-1 cursor-pointer theme-hover-surface theme-transition"
                      >
                        All Projects
                      </DropdownMenuItem>
                      {projects?.projects?.map((project: any) => (
                        <DropdownMenuItem
                          key={project._id || project.id}
                          onClick={() => setSelectedProject(project._id || project.id)}
                          className="rounded-lg my-1 cursor-pointer theme-hover-surface theme-transition"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="truncate theme-text-primary">{project.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}

                  <DropdownMenuSeparator className="my-2 theme-divider" />

                  <div className="px-2 py-1.5 text-sm font-semibold theme-text-primary">
                    Date Range
                  </div>
                  <div className="px-2 py-1.5">
                    <DateRangePicker
                      value={dateRange}
                      onChange={handleDateRangeChange}
                      className="w-full theme-input theme-focus"
                    />
                  </div>

                  <DropdownMenuSeparator className="my-2 theme-divider" />

                  <DropdownMenuItem
                    onClick={clearFilters}
                    className="rounded-lg mt-1 cursor-pointer theme-surface-elevated theme-hover-surface justify-center font-medium theme-transition"
                  >
                    Clear All Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 relative theme-surface">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'timeline' ? (
                <ProjectTimeline
                  items={timelineItems as any}
                  isLoading={isLoading}
                  projects={projects?.projects || []}
                  onItemClick={handleItemClick}
                  onItemDelete={handleDeleteTimelineItem}
                  onStatusChange={handleStatusChange}
                />
              ) : (
                <GanttChart
                  items={timelineItems as any}
                  isLoading={isLoading}
                  onItemUpdate={handleUpdateTimelineItem}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
      <TimelineForm
        onSubmit={handleCreateTimelineItem}
        projects={formatedProjects}
        users={users}
        isLoading={createTimelineMutation.isPending}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <AnimatePresence>
        {selectedItem && (
          <RightSidebar
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            title="Timeline Details"
            onDelete={() => handleDeleteTimelineItem(selectedItem._id || selectedItem.id)}
            onEdit={() => setIsEdit(prev => !prev)}
          >
            <TimelineItemDetails
              item={selectedItem}
              projects={projects?.projects || []}
              users={users}
              onClose={() => setSelectedItem(null)}
              onUpdate={handleUpdateTimelineItem}
              isEdit={isEdit}
            />
          </RightSidebar>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
