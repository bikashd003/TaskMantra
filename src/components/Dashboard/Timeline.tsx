/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, Circle } from 'lucide-react'; // Icons for status

// Reusable TimelineItem Component
const TimelineItem = ({ date, title, users, status, statusColor, statusIcon }) => {
    return (
        <div className="relative group">
            {/* Connector Circle */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-3 bg-gray-300 z-10 transition-all duration-300 group-hover:scale-110"
                 style={{ borderColor: statusColor }}
            ></div>

            {/* Timeline Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-gray-200">
                <div className="flex items-center gap-3">
                    {/* User Avatars */}
                    <div className="flex -space-x-2">
                        {users.map((user, index) => (
                            <img
                                key={index}
                                src={user}
                                className="w-7 h-7 rounded-full border-2 border-white"
                                alt={`User ${index + 1}`}
                            />
                        ))}
                    </div>
                    {/* Title and Date */}
                    <div>
                        <h3 className="font-medium text-gray-800">{title}</h3>
                        <p className="text-xs text-gray-500">{date}</p>
                    </div>
                </div>
                {/* Status */}
                <div className={`flex items-center gap-2 mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs ${statusColor} w-fit`}>
                    {statusIcon}
                    <span>{status}</span>
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
            statusColor: "bg-blue-50 text-blue-600",
            statusIcon: <Clock className="w-4 h-4" />,
        },
        {
            date: "20 February - 28 March",
            title: "UI Design Website",
            users: [
                "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40",
            ],
            status: "Done",
            statusColor: "bg-emerald-50 text-emerald-600",
            statusIcon: <CheckCircle className="w-4 h-4" />,
        },
        {
            date: "15 January - 10 February",
            title: "Project Planning",
            users: [
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40",
            ],
            status: "Pending",
            statusColor: "bg-gray-100 text-gray-600",
            statusIcon: <Circle className="w-4 h-4" />,
        },
        {
            date: "15 January - 10 February",
            title: "Project Planning",
            users: [
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40",
            ],
            status: "Pending",
            statusColor: "bg-gray-100 text-gray-600",
            statusIcon: <Circle className="w-4 h-4" />,
        },
    ];

    return (
        <ScrollArea className="bg-white w-full p-4 lg:p-6 rounded-2xl shadow-lg h-[40vh]">
            {/* Tabs */}
            <div className="flex items-center gap-3 mb-4 pb-2 overflow-x-auto scrollbar-hide">
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-all whitespace-nowrap">
                    Project Timeline
                </button>
                <button className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-all whitespace-nowrap">
                    Project Notes
                </button>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 space-y-4">
                {/* Vertical Line */}
                <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Render Timeline Items */}
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
    );
};

export default Timeline;