/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const TimelineItem = ({ date, title, users, status, statusColor, statusIcon }) => {
    return (
        <div className="relative group">
            {/* Connector Circle */}
            <div className={cn(
                "absolute -left-6 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full",
                "border-2 bg-background z-10 transition-all duration-300",
                "group-hover:scale-125 group-hover:ring-2 group-hover:ring-offset-2",
                "ring-offset-background",
                statusColor.ring
            )}></div>

            {/* Timeline Card */}
            <div className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between",
                "p-4 rounded-lg transition-all duration-300",
                "bg-card hover:bg-accent/50",
                "border border-border/50 hover:border-border"
            )}>
                <div className="flex items-center gap-4">
                    {/* User Avatars */}
                    <div className="flex -space-x-2">
                        {users.map((user, index) => (
                            <img
                                key={index}
                                src={user}
                                className={cn(
                                    "w-8 h-8 rounded-full",
                                    "border-2 border-background",
                                    "ring-1 ring-border/50"
                                )}
                                alt={`User ${index + 1}`}
                            />
                        ))}
                    </div>
                    {/* Title and Date */}
                    <div>
                        <h3 className="font-medium text-foreground">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{date}</p>
                    </div>
                </div>
                {/* Status */}
                <div className={cn(
                    "flex items-center gap-2 mt-3 sm:mt-0",
                    "px-3 py-1.5 rounded-full text-sm",
                    "transition-colors duration-300",
                    statusColor.badge
                )}>
                    {statusIcon}
                    <span className="font-medium">{status}</span>
                </div>
            </div>
        </div>
    );
};

const Timeline = () => {
    const timelineData = [
        {
            date: "5 March - 11 April",
            title: "Developing State",
            users: [
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40",
            ],
            status: "On Progress",
            statusColor: {
                badge: "bg-primary/15 text-primary",
                ring: "border-primary/50 ring-primary/50"
            },
            statusIcon: <Clock className="w-4 h-4" />,
        },
        {
            date: "20 February - 28 March",
            title: "UI Design Website",
            users: [
                "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40",
            ],
            status: "Done",
            statusColor: {
                badge: "bg-success/15 text-success",
                ring: "border-success/50 ring-success/50"
            },
            statusIcon: <CheckCircle className="w-4 h-4" />,
        },
        {
            date: "15 January - 10 February",
            title: "Project Planning",
            users: [
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40",
            ],
            status: "Pending",
            statusColor: {
                badge: "bg-muted text-muted-foreground",
                ring: "border-muted-foreground/50 ring-muted-foreground/50"
            },
            statusIcon: <Circle className="w-4 h-4" />,
        },
    ];

    return (
        <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-md overflow-hidden h-[calc(40vh-5.5rem)]">
            <CardHeader className="pt-6 px-6">
                <div className="flex items-center gap-3">
                    <button className={cn(
                        "px-4 py-1.5 rounded-md text-sm font-medium",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 transition-colors"
                    )}>
                        Project Timeline
                    </button>
                    <button className={cn(
                        "px-4 py-1.5 rounded-md text-sm font-medium",
                        "bg-muted text-muted-foreground",
                        "hover:bg-accent transition-colors"
                    )}>
                        Project Notes
                    </button>
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4">
                <ScrollArea className="h-[calc(40vh-11rem)]">
                    <div className="relative pl-6 space-y-4">
                        {/* Vertical Line */}
                        <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-border"></div>

                        {/* Timeline Items */}
                        {timelineData.map((item, index) => (
                            <TimelineItem
                                key={index}
                                date={item.date}
                                title={item.title}
                                users={item.users}
                                status={item.status}
                                statusColor={item.statusColor}
                                statusIcon={item.statusIcon}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default Timeline;
