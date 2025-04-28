/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Circle,
  Edit,
  MoreHorizontal,
  Trash2,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface TimelineItem {
  _id?: string;
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  projectId?: string;
  progress?: number;
  color?: string;
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
    image?: string;
  }>;
}

interface Project {
  id: string;
  _id?: string;
  name: string;
  color: string;
}

interface ProjectTimelineProps {
  items: TimelineItem[];
  isLoading: boolean;
  projects: Project[];
  onItemClick?: (item: TimelineItem) => void;
  onItemEdit?: (item: TimelineItem) => void;
  onItemDelete?: (id: string) => Promise<void>;
  onStatusChange?: (id: string, status: TimelineItem['status']) => Promise<void>;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  items,
  isLoading,
  projects,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onStatusChange,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getStatusConfig = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return {
          ring: 'border-emerald-500',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
          label: 'Completed',
        };
      case 'in_progress':
        return {
          ring: 'border-blue-500',
          badge: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
          icon: <Clock className="w-4 h-4 mr-1" />,
          label: 'In Progress',
        };
      case 'delayed':
        return {
          ring: 'border-amber-500',
          badge: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
          icon: <AlertTriangle className="w-4 h-4 mr-1" />,
          label: 'Delayed',
        };
      default:
        return {
          ring: 'border-slate-400',
          badge: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
          icon: <Circle className="w-4 h-4 mr-1" />,
          label: 'Planned',
        };
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="relative">
          <div className="absolute -left-6 top-8 w-4 h-4 rounded-full border-2 border-slate-200 bg-slate-100 z-10"></div>
          <div className="ml-4">
            <Card className="border-l-4 border-l-slate-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-1/3 mb-2" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>

                    <Skeleton className="h-4 w-2/3 mb-4" />

                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <Skeleton className="h-1.5 w-full" />
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>

                  <div className="flex -space-x-2 ml-4">
                    {[1, 2].map(u => (
                      <Skeleton
                        key={u}
                        className="w-8 h-8 rounded-full border-2 border-background"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );

  const TimelineItemComponent = ({ item }: { item: TimelineItem }) => {
    const statusConfig = getStatusConfig(item.status);
    const project = projects.find(p => p.id === item.projectId || p._id === item.projectId);
    const itemId = item._id || item.id;
    const isHovered = hoveredItem === itemId;

    // Format dates to be more readable
    const formattedStartDate = format(new Date(item.startDate), 'MMM d, yyyy');
    const formattedEndDate = format(new Date(item.endDate), 'MMM d, yyyy');

    return (
      <div
        className="relative group"
        onMouseEnter={() => setHoveredItem(itemId)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {/* Timeline node */}
        <div
          className={cn(
            'absolute -left-6 top-8 w-4 h-4 rounded-full',
            'border-[3px] bg-background z-10 transition-all duration-300',
            'group-hover:scale-150 group-hover:shadow-[0_0_0_4px_rgba(0,0,0,0.05)]',
            statusConfig.ring
          )}
        />

        <Card
          className={cn(
            'ml-4 transition-all duration-200 overflow-hidden',
            isHovered ? 'shadow-lg transform translate-x-1' : 'shadow-sm',
            item.status === 'completed' && 'border-emerald-200',
            item.status === 'delayed' && 'border-amber-200'
          )}
          onClick={() => onItemClick && onItemClick(item)}
          style={{
            borderLeftColor: item.color || '#94a3b8',
            borderLeftWidth: 4,
          }}
        >
          <CardContent className="p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-lg text-slate-800">{item.title}</h3>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'flex items-center py-1 px-2 font-medium text-xs',
                        statusConfig.badge
                      )}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </Badge>

                    {(onItemEdit || onItemDelete || onStatusChange) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-slate-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {onItemEdit && (
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                onItemEdit(item);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Item
                            </DropdownMenuItem>
                          )}

                          {onStatusChange && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  onStatusChange(itemId, 'planned');
                                }}
                              >
                                <Circle className="h-4 w-4 mr-2 text-slate-500" />
                                Mark as Planned
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  onStatusChange(itemId, 'in_progress');
                                }}
                              >
                                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                Mark as In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  onStatusChange(itemId, 'completed');
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  onStatusChange(itemId, 'delayed');
                                }}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                Mark as Delayed
                              </DropdownMenuItem>
                            </>
                          )}

                          {onItemDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 hover:text-red-700 focus:text-red-700"
                                onClick={e => {
                                  e.stopPropagation();
                                  onItemDelete(itemId);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Item
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-3 leading-relaxed">{item.description}</p>

                {item.progress !== undefined && (
                  <div className="mt-2 mb-3">
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                      <span>Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress
                      value={item.progress}
                      className="h-2 bg-slate-100"
                      style={
                        {
                          // Apply color based on status
                          '--progress-color':
                            item.status === 'completed'
                              ? '#10b981'
                              : item.status === 'delayed'
                                ? '#f59e0b'
                                : item.status === 'in_progress'
                                  ? '#3b82f6'
                                  : '#94a3b8',
                        } as React.CSSProperties
                      }
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                  {project && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="font-medium">{project.name}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Project: {project.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center bg-slate-50 px-2 py-1 rounded-md">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span>
                            {formattedStartDate} - {formattedEndDate}
                          </span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Duration: {format(new Date(item.startDate), 'MMMM d, yyyy')} to{' '}
                          {format(new Date(item.endDate), 'MMMM d, yyyy')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {item.users && item.users.length > 0 && (
                <div className="flex -space-x-2 self-start">
                  {item.users.slice(0, 3).map(user => (
                    <TooltipProvider key={user.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="w-9 h-9 border-2 border-white shadow-sm transition-transform hover:scale-110">
                            <AvatarImage src={user.avatar || user.image} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white font-medium">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{user.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}

                  {item.users.length > 3 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="w-9 h-9 border-2 border-white shadow-sm bg-gradient-to-r from-indigo-500 to-purple-500">
                            <AvatarFallback className="text-white text-xs font-medium">
                              +{item.users.length - 3}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            {item.users.slice(3).map(user => (
                              <p key={user.id}>{user.name}</p>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-250px)] px-2">
      <div className="relative pl-8 pr-2 space-y-8 py-6">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

        {isLoading ? (
          <LoadingSkeleton />
        ) : items.length > 0 ? (
          items.map(item => <TimelineItemComponent key={item._id || item.id} item={item} />)
        ) : (
          <div className="text-center py-16 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium">No timeline items found</p>
            <p className="text-sm mt-1">Create a new item to get started</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
