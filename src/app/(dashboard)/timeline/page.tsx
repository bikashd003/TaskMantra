/* eslint-disable no-console */
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TimelineForm } from '@/components/Timeline/TimelineForm';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ProjectTimeline } from '@/components/Timeline/ProjectTimeline';
import { toast } from 'sonner';

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  projectId?: string;
  users: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

export default function TimelinePage() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Dummy projects data - replace with API call
  const projects: Project[] = [
    { id: '1', name: 'Project Alpha', color: '#FF5733' },
    { id: '2', name: 'Project Beta', color: '#33FF57' },
    { id: '3', name: 'Project Gamma', color: '#3357FF' },
  ];

  // Fetch timeline items
  React.useEffect(() => {
    const fetchTimelineItems = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const dummyData: TimelineItem[] = [
          {
            id: '1',
            title: 'Project Planning Phase',
            description: 'Initial project planning and requirement gathering',
            startDate: '2024-03-01',
            endDate: '2024-03-15',
            status: 'completed',
            projectId: '1',
            users: [
              {
                id: '1',
                name: 'John Doe',
                avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=John',
              },
              {
                id: '2',
                name: 'Jane Smith',
                avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=Jane',
              },
            ],
          },
          {
            id: '2',
            title: 'Development Sprint 1',
            description: 'Core features implementation',
            startDate: '2024-03-16',
            endDate: '2024-03-31',
            status: 'in_progress',
            projectId: '2',
            users: [
              {
                id: '3',
                name: 'Alice Johnson',
                avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=Alice',
              },
            ],
          },
        ];

        setTimelineItems(dummyData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching timeline items:', error);
        setIsLoading(false);
      }
    };

    fetchTimelineItems();
  }, []);

  const handleCreateTimelineItem = async (data: Partial<TimelineItem>) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const newItem: TimelineItem = {
        id: String(Date.now()),
        title: data.title || '',
        description: data.description || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        status: 'planned',
        projectId: data.projectId,
        users: data.users || [],
      };

      setTimelineItems(prev => [...prev, newItem]);
      setIsCreateOpen(false);
    } catch (error) {
      toast.error('Failed to create timeline item');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleStatusChange = async (itemId: string, newStatus: TimelineItem['status']) => {
  //   try {
  //     // TODO: Replace with actual API call
  //     setTimelineItems(prev =>
  //       prev.map(item =>
  //         item.id === itemId ? { ...item, status: newStatus } : item
  //       )
  //     );
  //   } catch (error) {
  //     console.error('Error updating item status:', error);
  //   }
  // };

  const filteredItems = timelineItems.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedProject && item.projectId !== selectedProject) return false;
    return item.status === selectedFilter;
  });

  return (
    <div className="px-2 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Project Timeline</h2>
          <p className="text-muted-foreground">Manage and track your project milestones</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSelectedFilter('all')}>
                All Items
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter('planned')}>
                Planned
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter('in_progress')}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter('completed')}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter('delayed')}>
                Delayed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {projects.map(project => (
                <DropdownMenuItem key={project.id} onClick={() => setSelectedProject(project.id)}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Timeline Item
          </Button>
        </div>
      </div>

      <Card className="border shadow-lg">
        <CardContent className="p-6">
          <ProjectTimeline items={filteredItems} isLoading={isLoading} projects={projects} />
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Timeline Item</DialogTitle>
            <DialogDescription>
              Add a new milestone or phase to your project timeline.
            </DialogDescription>
          </DialogHeader>
          <TimelineForm onSubmit={handleCreateTimelineItem} projects={projects} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
