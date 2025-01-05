"use client";

import React, { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
    differenceInDays,
} from "date-fns";
import { cn } from "@/lib/utils";

const tasks = [
    {
        id: 1,
        title: "Design Landing Page",
        startDate: "2025-01-02",
        endDate: "2025-01-05",
        color: "bg-blue-500",
    },
    {
        id: 2,
        title: "Develop API Integration",
        startDate: "2025-01-04",
        endDate: "2025-01-10",
        color: "bg-green-500",
    },
    {
        id: 3,
        title: "Finalize Marketing Strategy",
        startDate: "2025-01-06",
        endDate: "2025-01-08",
        color: "bg-purple-500",
    },
];

const TaskCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthDays = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    const firstDayOfMonth = getDay(startOfMonth(currentDate));
    const emptyDays = Array.from({ length: firstDayOfMonth });

    const renderTaskBars = (day: Date) => {
        return tasks
            .filter(
                (task) =>
                    new Date(task.startDate) <= day && new Date(task.endDate) >= day
            )
            .map((task) => {
                const taskStart = new Date(task.startDate);
                const taskEnd = new Date(task.endDate);
                const totalDays = differenceInDays(taskEnd, taskStart) + 1;


                return (
                    <div
                        key={task.id}
                        className={cn(
                            "absolute top-6 left-0 right-0 h-6 rounded-md text-white text-xs font-semibold flex items-center px-2",
                            task.color
                        )}
                        style={{
                            gridColumnStart: getDay(taskStart) + 1,
                            gridColumnEnd: `span ${totalDays}`,
                        }}
                        title={`${task.title} (${format(taskStart, "MMM d")} - ${format(
                            taskEnd,
                            "MMM d"
                        )})`}
                    >
                        {task.title.slice(0, 3) + "..."}
                    </div>
                );
            });
    };

    return (
        <div className="w-full mx-auto p-3 bg-white rounded-md shadow-md">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() =>
                        setCurrentDate(
                            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                        )
                    }
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                    {format(currentDate, "MMMM yyyy")}
                </h2>
                <button
                    onClick={() =>
                        setCurrentDate(
                            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                        )
                    }
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
                {/* Weekday Headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                        key={day}
                        className="h-8 flex items-center justify-center bg-gray-50 text-xs font-medium text-gray-500"
                    >
                        {day}
                    </div>
                ))}

                {/* Empty Days for Alignment */}
                {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} className="h-16 bg-white" />
                ))}

                {/* Calendar Days */}
                {monthDays.map((day) => (
                    <div
                        key={day.toISOString()}
                        className="relative h-16 bg-white p-1 border border-gray-200"
                    >
                        {/* Day Number */}
                        <div
                            className={cn(
                                "text-xs font-semibold",
                                format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                                    ? "text-blue-600"
                                    : "text-gray-800"
                            )}
                        >
                            {format(day, "d")}
                        </div>

                        {/* Task Bars */}
                        {renderTaskBars(day)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskCalendar;