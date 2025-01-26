'use client';
import React, { useState } from 'react';
import { Task } from './Task';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TaskCalendar = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get the start of the week
  const startDate = startOfWeek(currentDate);

  // Generate week days
  const weekDays = [...Array(7)].map((_, index) => {
    const date = addDays(startDate, index);
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      fullDate: format(date, 'yyyy-MM-dd'),
    };
  });

  // Group tasks by date
  const tasksByDate = Task.reduce((acc, task) => {
    const date = task.startDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, typeof Task>);

  // Get random pastel color for task
  const getTaskColor = (taskId: number) => {
    const colors = [
      'bg-pink-100 hover:bg-pink-200 border-pink-200',
      'bg-blue-100 hover:bg-blue-200 border-blue-200',
      'bg-green-100 hover:bg-green-200 border-green-200',
      'bg-purple-100 hover:bg-purple-200 border-purple-200',
      'bg-yellow-100 hover:bg-yellow-200 border-yellow-200',
      'bg-indigo-100 hover:bg-indigo-200 border-indigo-200',
    ];
    return colors[taskId % colors.length];
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-4 mb-4">
        {weekDays.map((day) => (
          <div 
            key={day.fullDate} 
            className="text-center"
          >
            <div className="font-medium text-gray-400 text-sm">{day.dayName}</div>
            <div className={cn(
              "w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm transition-colors",
              isToday(day.date) && "bg-blue-500 text-white font-semibold",
              selectedDate && isSameDay(selectedDate, day.date) && "bg-blue-100"
            )}>
              {day.dayNumber}
            </div>
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <motion.div 
            key={day.fullDate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "min-h-[200px] border rounded-xl p-3 transition-colors",
              isToday(day.date) ? "border-blue-200 bg-blue-50/30" : "border-gray-100",
              "hover:border-blue-200 cursor-pointer"
            )}
            onClick={() => setSelectedDate(day.date)}
          >
            {/* Tasks for the day */}
            <div className="space-y-2">
              {tasksByDate[day.fullDate]?.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "p-4 rounded-xl shadow-sm border transition-all",
                    getTaskColor(task.id)
                  )}
                >
                  <div className="flex flex-col gap-2">
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-gray-600">
                      {format(new Date(task.startDate), 'MMM d')} - {format(new Date(task.endDate), 'MMM d')}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {task.description}
                    </div>
                    <div className="flex gap-2 items-center mt-2">
                      <Badge variant={task.completed ? "default" : "secondary"} className="text-xs">
                        {task.completed ? "Done" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TaskCalendar;