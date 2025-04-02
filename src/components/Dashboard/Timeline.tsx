/* eslint-disable no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, Circle, ChevronDown, Filter } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface TimelineUser {
    id: string;
    avatar: string;
    name: string;
}

interface TimelineItem {
    id: string;
    startDate: string;
    endDate: string;
    title: string;
    users: TimelineUser[];
    status: 'pending' | 'in_progress' | 'done';
    description?: string;
}

interface TimelineProps {
    items?: TimelineItem[];
    isLoading?: boolean;
    onStatusChange?: (itemId: string, newStatus: TimelineItem['status']) => Promise<void>;
    onFilterChange?: (filter: string) => Promise<void>;
}

const Timeline: React.FC<TimelineProps> = ({
    items: propItems,
    isLoading = false,
    onStatusChange,
    onFilterChange
}) => {
    // Default data - replace with API data
    const defaultItems: TimelineItem[] = [
        {
            id: '1',
            startDate: '2024-03-05',
            endDate: '2024-04-11',
            title: 'Development Phase',
            description: 'Implementation of core features and functionality',
            users: [
                { id: '1', avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40", name: 'John Doe' },
                { id: '2', avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40", name: 'Jane Smith' },
            ],
            status: 'in_progress',
        },
        // ... other items
    ];

    const items = propItems || defaultItems;

    const getStatusConfig = (status: TimelineItem['status']) => {
        const configs = {
            in_progress: {
                badge: "bg-primary/10 text-primary border-primary/20",
                ring: "border-primary ring-primary/30",
                icon: <Clock className="w-4 h-4" />,
                label: 'In Progress'
            },
            done: {
                badge: "bg-success/10 text-success border-success/20",
                ring: "border-success ring-success/30",
                icon: <CheckCircle className="w-4 h-4" />,
                label: 'Completed'
            },
            pending: {
                badge: "bg-muted/50 text-muted-foreground border-muted",
                ring: "border-muted-foreground ring-muted-foreground/30",
                icon: <Circle className="w-4 h-4" />,
                label: 'Pending'
            }
        };
        return configs[status];
    };

    const TimelineItemComponent = ({ item }: { item: TimelineItem }) => {
        const statusConfig = getStatusConfig(item.status);
        const dateRange = new Date(item.startDate).toLocaleDateString() + ' - ' + new Date(item.endDate).toLocaleDateString();

        return (
            <div className="relative group animate-fadeIn">
                {/* Connector Line & Circle */}
                <div className={cn(
                    "absolute -left-6 top-8 w-4 h-4 rounded-full",
                    "border-[3px] bg-background z-10 transition-all duration-300",
                    "group-hover:scale-125 group-hover:ring-2 group-hover:ring-offset-2",
                    "ring-offset-background shadow-md",
                    statusConfig.ring
                )} />

                {/* Timeline Card */}
                <div className={cn(
                    "p-4 sm:p-6 rounded-2xl transition-all duration-300",
                    "bg-card/50 backdrop-blur-sm hover:bg-card",
                    "border border-border/50 hover:border-border",
                    "transform hover:-translate-y-1 hover:shadow-xl"
                )}>
                    <div className="flex flex-col gap-4">
                        {/* Header Section */}
                        <div className="flex flex-col gap-3">
                            <div className="space-y-2">
                                {/* Title and Status */}
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-tight break-words pr-2">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-sm font-medium",
                                            "flex items-center gap-1.5 whitespace-nowrap",
                                            "border shadow-sm shrink-0",
                                            statusConfig.badge
                                        )}>
                                            {statusConfig.icon}
                                            <span className="hidden sm:inline">{statusConfig.label}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{dateRange}</span>
                                </div>
                            </div>

                            {/* Status Update Button */}
                            <div className="flex justify-start sm:justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "w-full sm:w-auto",
                                                "transition-all duration-300",
                                                "hover:bg-accent hover:text-accent-foreground",
                                                "active:scale-95"
                                            )}
                                        >
                                            Update Status
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem
                                            onClick={() => onStatusChange?.(item.id, 'pending')}
                                            className="flex items-center gap-2"
                                        >
                                            <Circle className="w-4 h-4" />
                                            Set as Pending
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onStatusChange?.(item.id, 'in_progress')}
                                            className="flex items-center gap-2"
                                        >
                                            <Clock className="w-4 h-4" />
                                            Set as In Progress
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onStatusChange?.(item.id, 'done')}
                                            className="flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Set as Completed
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Description Section */}
                        {item.description && (
                            <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground leading-relaxed text-sm break-words">
                                    {item.description}
                                </p>
                            </div>
                        )}

                        {/* Users Section */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <div className="flex -space-x-2">
                                {item.users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="relative group/avatar"
                                    >
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className={cn(
                                                "w-8 h-8 sm:w-10 sm:h-10 rounded-full",
                                                "border-2 border-background",
                                                "ring-2 ring-border/50",
                                                "transition-transform hover:scale-110 hover:z-10"
                                            )}
                                        />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity z-50">
                                            {user.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {item.users.length} {item.users.length === 1 ? 'member' : 'members'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const LoadingSkeleton = () => (
        <div className="space-y-8">
            {[1, 2, 3].map((i) => (
                <div key={i} className="relative pl-6">
                    <div className="absolute -left-6 top-8 w-4 h-4 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <Skeleton className="h-7 w-3/4" />
                            <Skeleton className="h-5 w-1/4" />
                        </div>
                        <Skeleton className="h-20 w-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <Card className="bg-gradient-to-br from-background to-accent/10 border-none shadow-xl h-full">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-6">
                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Project Timeline</h2>
                    <p className="text-sm text-muted-foreground">Track your project milestones and progress</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onFilterChange?.('all')}>All Items</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onFilterChange?.('pending')}>Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onFilterChange?.('in_progress')}>In Progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onFilterChange?.('done')}>Completed</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="h-[calc(100%-5rem)]">
                <ScrollArea className="h-full pr-4 -mr-4">
                    <div className="relative pl-8 space-y-6 pb-6">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border/50" />

                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <TimelineItemComponent key={item.id} item={item} />
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No timeline items found
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default Timeline;
