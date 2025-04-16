"use client";

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';
import { Task } from './types';
import { Printer, Calendar as CalendarIcon, Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReactToPrint } from 'react-to-print';

interface PrintCalendarViewProps {
  tasks: Task[];
  currentDate: Date;
}

const PrintCalendarView: React.FC<PrintCalendarViewProps> = ({ tasks, currentDate }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [printView, setPrintView] = React.useState<'month' | 'list'>('month');

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Calendar_${format(currentDate, 'MMM_yyyy')}`,
    pageStyle: `
      @page {
        size: landscape;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        .min-h-\[100px\] {
          min-height: 100px !important;
        }
        .print-grid {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 4px !important;
          width: 100% !important;
        }
        .print-container {
          width: 100% !important;
          max-width: 100% !important;
        }
        .print-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 16px !important;
        }
        .bg-gray-50, .bg-gray-100, .bg-blue-50, .bg-blue-100,
        .bg-amber-50, .bg-amber-100, .bg-green-50, .bg-green-100 {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
          background-color: inherit !important;
        }
        .text-gray-400, .text-gray-500, .text-gray-700,
        .text-blue-500, .text-blue-600, .text-blue-700,
        .text-amber-500, .text-amber-600, .text-amber-700,
        .text-green-500, .text-green-600, .text-green-700 {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
      }
    `,
  });

  // Group tasks by date
  const tasksByDate = React.useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach(task => {
      if (task.startDate && task.dueDate) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.dueDate);

        // Get all dates between start and end date
        const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });

        // Add task to each date in the range
        datesInRange.forEach(date => {
          const dateKey = date.toDateString();
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(task);
        });
      }
    });

    return grouped;
  }, [tasks]);

  // Get days for the current month
  const monthDays = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add days from previous month to start the calendar on Sunday
    const startDay = getDay(monthStart);
    const prevDays = Array.from({ length: startDay }, (_, i) =>
      addDays(monthStart, -startDay + i)
    );

    // Add days from next month to end the calendar on Saturday
    const endDay = getDay(monthEnd);
    const nextDays = Array.from({ length: 6 - endDay }, (_, i) =>
      addDays(monthEnd, i + 1)
    );

    return [...prevDays, ...daysInMonth, ...nextDays];
  }, [currentDate]);

  // Get task status color
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'border-gray-400 bg-gray-50';
      case 'In Progress': return 'border-blue-400 bg-blue-50';
      case 'Review': return 'border-amber-400 bg-amber-50';
      case 'Completed': return 'border-green-400 bg-green-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Print Calendar</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="month" onValueChange={(value) => setPrintView(value as 'month' | 'list')}>
          <TabsList className="grid grid-cols-2 w-[200px] mb-4">
            <TabsTrigger value="month">
              <Grid className="h-4 w-4 mr-2" /> Month
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" /> List
            </TabsTrigger>
          </TabsList>

          <div className="mb-4">
            <Button onClick={() => handlePrint()} className="gap-1.5">
              <Printer className="h-4 w-4" /> Print {printView === 'month' ? 'Month View' : 'List View'}
            </Button>
          </div>

          <div ref={printRef} className="p-4 bg-white print-container">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
              <p className="text-muted-foreground">Task Calendar</p>
            </div>

            <TabsContent value="month" className="mt-0">
              {/* Month grid */}
              <div className="grid grid-cols-7 gap-1 print-grid">
                {/* Day headers */}
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <div key={day} className="text-center font-semibold p-2 bg-gray-100">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {monthDays.map((day) => {
                  const dateKey = day.toDateString();
                  const dayTasks = tasksByDate[dateKey] || [];

                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "min-h-[100px] border p-1",
                        !isSameMonth(day, currentDate) && "bg-gray-50 text-gray-400",
                        isToday(day) && "bg-blue-50 border-blue-200"
                      )}
                    >
                      <div className="text-right mb-1">
                        <span className={cn(
                          "inline-block w-6 h-6 rounded-full text-center leading-6 text-sm",
                          isToday(day) && "bg-blue-500 text-white"
                        )}>
                          {format(day, 'd')}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        {dayTasks.slice(0, 5).map((task) => (
                          <div
                            key={task.id}
                            className={cn(
                              "p-1 truncate border-l-2 rounded-sm",
                              getTaskStatusColor(task.status)
                            )}
                            style={task.color ? { borderLeftColor: task.color, backgroundColor: `${task.color}10` } : undefined}
                          >
                            {task.name}
                          </div>
                        ))}
                        {dayTasks.length > 5 && (
                          <div className="text-xs text-center text-muted-foreground">
                            +{dayTasks.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              {/* List view */}
              <div className="space-y-4 print-list">
                {Object.entries(tasksByDate)
                  .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                  .map(([dateStr, dateTasks]) => {
                    const date = new Date(dateStr);
                    if (date.getMonth() !== currentDate.getMonth()) return null;

                    return (
                      <div key={dateStr} className="border rounded-md overflow-hidden">
                        <div className={cn(
                          "p-2 font-medium",
                          isToday(date) ? "bg-blue-100" : "bg-gray-100"
                        )}>
                          {format(date, 'EEEE, MMMM d, yyyy')}
                        </div>
                        <div className="divide-y">
                          {dateTasks.map((task) => (
                            <div key={task.id} className="p-3 flex items-start">
                              <div className={cn(
                                "w-1 self-stretch rounded-full mr-3",
                                task.status === 'To Do' && "bg-gray-400",
                                task.status === 'In Progress' && "bg-blue-400",
                                task.status === 'Review' && "bg-amber-400",
                                task.status === 'Completed' && "bg-green-400"
                              )}
                              style={task.color ? { backgroundColor: task.color } : undefined}
                              ></div>
                              <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{task.name}</h4>
                                  <div className={cn(
                                    "px-2 py-0.5 text-xs rounded-full",
                                    task.status === 'To Do' && "bg-gray-100 text-gray-700",
                                    task.status === 'In Progress' && "bg-blue-100 text-blue-700",
                                    task.status === 'Review' && "bg-amber-100 text-amber-700",
                                    task.status === 'Completed' && "bg-green-100 text-green-700"
                                  )}
                                  style={task.color ? { backgroundColor: `${task.color}20`, color: task.color } : undefined}
                                  >
                                    {task.status}
                                  </div>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>
                                      {format(new Date(task.startDate), 'MMM d')}
                                      {task.startDate !== task.dueDate && (
                                        <> - {format(new Date(task.dueDate), 'MMM d')}</>
                                      )}
                                    </span>
                                  </div>
                                  <div>Priority: {task.priority}</div>
                                  {task.assignedTo && task.assignedTo.length > 0 && (
                                    <div>Assigned: {task.assignedTo.length}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PrintCalendarView;
