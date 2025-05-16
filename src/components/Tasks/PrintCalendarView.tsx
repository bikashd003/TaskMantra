'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
} from 'date-fns';
import { Task } from './types';
import { Printer, Calendar as CalendarIcon, Grid, List, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReactToPrint } from 'react-to-print';
import Modal from '../Global/Modal';

interface PrintCalendarViewProps {
  tasks: Task[];
  currentDate: Date;
}

const PrintCalendarView: React.FC<PrintCalendarViewProps> = ({ tasks, currentDate }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [printView, setPrintView] = React.useState<'month' | 'list'>('month');
  const [isOpen, setIsOpen] = React.useState(false);

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
        .min-h-[120px] {
          min-height: 120px !important;
        }
        .print-grid {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .print-container {
          width: 100% !important;
          max-width: 100% !important;
          padding: 20px !important;
          height: auto !important;
          overflow: visible !important;
          max-height: none !important;
        }
        .print-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 16px !important;
        }
        .bg-gray-50, .bg-gray-100, .bg-blue-50, .bg-blue-100,
        .bg-amber-50, .bg-amber-100, .bg-green-50, .bg-green-100,
        .bg-slate-50, .bg-slate-100 {
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
    const prevDays = Array.from({ length: startDay }, (_, i) => addDays(monthStart, -startDay + i));

    // Add days from next month to end the calendar on Saturday
    const endDay = getDay(monthEnd);
    const nextDays = Array.from({ length: 6 - endDay }, (_, i) => addDays(monthEnd, i + 1));

    return [...prevDays, ...daysInMonth, ...nextDays];
  }, [currentDate]);

  // Get task status color
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'To Do':
        return 'border-gray-400 bg-gray-50 hover:bg-gray-100';
      case 'In Progress':
        return 'border-blue-400 bg-blue-50 hover:bg-blue-100';
      case 'Review':
        return 'border-amber-400 bg-amber-50 hover:bg-amber-100';
      case 'Completed':
        return 'border-green-400 bg-green-50 hover:bg-green-100';
      default:
        return 'border-gray-400 bg-gray-50 hover:bg-gray-100';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 hover:bg-slate-100"
        onClick={() => setIsOpen(true)}
      >
        <Printer className="h-4 w-4" /> Print
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Print Calendar</h2>

          <Tabs
            defaultValue="month"
            onValueChange={value => setPrintView(value as 'month' | 'list')}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="grid grid-cols-2 w-[220px]">
                <TabsTrigger value="month" className="gap-1.5">
                  <Grid className="h-4 w-4" /> Month View
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1.5">
                  <List className="h-4 w-4" /> List View
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={() => handlePrint()}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="h-4 w-4" /> Print{' '}
                {printView === 'month' ? 'Month View' : 'List View'}
              </Button>
            </div>

            <div
              ref={printRef}
              className="p-6 bg-white print-container rounded-lg border shadow-sm overflow-y-auto custom-scrollbar h-[calc(100vh-30vh)]"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <p className="text-slate-500 mt-1">Task Calendar</p>
              </div>

              <TabsContent value="month" className="mt-0">
                {/* Month grid */}
                <div className="grid grid-cols-7 gap-2 print-grid">
                  {/* Day headers */}
                  {[
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                  ].map(day => (
                    <div
                      key={day}
                      className="text-center font-semibold p-2 bg-slate-100 rounded-md"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {monthDays.map(day => {
                    const dateKey = day.toDateString();
                    const dayTasks = tasksByDate[dateKey] || [];

                    return (
                      <div
                        key={day.toString()}
                        className={cn(
                          'min-h-[120px] border rounded-md p-2 transition-colors',
                          !isSameMonth(day, currentDate) && 'bg-slate-50 text-slate-400',
                          isToday(day) && 'bg-blue-50 border-blue-200'
                        )}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-500">{format(day, 'EEE')}</span>
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-7 h-7 rounded-full text-center text-sm font-medium',
                              isToday(day) ? 'bg-blue-500 text-white' : 'text-slate-700'
                            )}
                          >
                            {format(day, 'd')}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          {dayTasks.length === 0 && (
                            <div className="text-center text-slate-400 py-1">
                              <FileText className="h-3 w-3 mx-auto mb-1 opacity-50" />
                              <span>No tasks</span>
                            </div>
                          )}
                          {dayTasks.slice(0, 4).map(task => (
                            <div
                              key={task.id}
                              className={cn(
                                'p-1.5 truncate border-l-2 rounded-sm shadow-sm transition-colors',
                                getTaskStatusColor(task.status)
                              )}
                            >
                              {task.name}
                            </div>
                          ))}
                          {dayTasks.length > 4 && (
                            <div className="text-xs text-center py-1 bg-slate-100 rounded-sm text-slate-600 font-medium">
                              +{dayTasks.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                {/* List view - improved styling */}
                <div className="space-y-4 print-list">
                  {Object.entries(tasksByDate)
                    .sort(
                      ([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()
                    )
                    .map(([dateStr, dateTasks]) => {
                      const date = new Date(dateStr);
                      if (date.getMonth() !== currentDate.getMonth()) return null;

                      return (
                        <div key={dateStr} className="border rounded-lg overflow-hidden shadow-sm">
                          <div
                            className={cn(
                              'p-3 font-medium',
                              isToday(date) ? 'bg-blue-100' : 'bg-slate-100'
                            )}
                          >
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-slate-600" />
                              <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                          </div>
                          <div className="divide-y">
                            {dateTasks.length === 0 ? (
                              <div className="p-4 text-center text-slate-500">
                                No tasks scheduled for this day
                              </div>
                            ) : (
                              dateTasks.map(task => (
                                <div
                                  key={task.id}
                                  className="p-3 flex items-start hover:bg-slate-50 transition-colors"
                                >
                                  <div
                                    className={cn(
                                      'w-1.5 self-stretch rounded-full mr-3',
                                      task.status === 'To Do' && 'bg-gray-400',
                                      task.status === 'In Progress' && 'bg-blue-400',
                                      task.status === 'Review' && 'bg-amber-400',
                                      task.status === 'Completed' && 'bg-green-400'
                                    )}
                                  ></div>
                                  <div className="flex-grow">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-slate-800">{task.name}</h4>
                                      <div
                                        className={cn(
                                          'px-2 py-0.5 text-xs rounded-full',
                                          task.status === 'To Do' && 'bg-gray-100 text-gray-700',
                                          task.status === 'In Progress' &&
                                            'bg-blue-100 text-blue-700',
                                          task.status === 'Review' && 'bg-amber-100 text-amber-700',
                                          task.status === 'Completed' &&
                                            'bg-green-100 text-green-700'
                                        )}
                                      >
                                        {task.status}
                                      </div>
                                    </div>
                                    {task.description && (
                                      <p className="text-sm text-slate-600 mt-1">
                                        {task.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                                      <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" />
                                        <span>
                                          {task.startDate
                                            ? format(new Date(task.startDate), 'MMM d')
                                            : 'Not set'}
                                          {task.startDate &&
                                            task.dueDate &&
                                            task.startDate !== task.dueDate && (
                                              <>
                                                {' '}
                                                -{' '}
                                                {task.dueDate
                                                  ? format(new Date(task.dueDate), 'MMM d')
                                                  : 'Not set'}
                                              </>
                                            )}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">Priority:</span>
                                        <span
                                          className={cn(
                                            task?.priority === 'High' && 'text-red-600',
                                            task?.priority === 'Medium' && 'text-amber-600',
                                            task?.priority === 'Low' && 'text-green-600'
                                          )}
                                        >
                                          {task.priority}
                                        </span>
                                      </div>
                                      {task.assignedTo && task.assignedTo.length > 0 && (
                                        <div>Assigned: {task.assignedTo.length}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Modal>
    </>
  );
};

export default PrintCalendarView;
