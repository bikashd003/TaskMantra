import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Clock, History, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TaskService } from '@/services/Task.service';
import { useQuery } from '@tanstack/react-query';
import { TeamLoggerService } from '@/services/TeamLogger.service';
import { toast } from 'sonner';
import { MultiSelect } from '../Global/MultiSelect';
import { useTaskStore } from '@/stores/taskStore';
import { format } from 'date-fns';

export function TeamLoggerPopover() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const { setMyTasks } = useTaskStore();
  const [selectedTasks, setSelectedTasks] = useState<any>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [todaySelectedTaskIds, setTodaySelectedTaskIds] = useState<string[]>([]);

  // Fetch tasks
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      return await TaskService.getMyTasks();
    },
  });

  useEffect(() => {
    setMyTasks(tasks as any);
  }, [tasks]);

  // Fetch time logs for today
  const { data: timeLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ['teamlogs', currentDate],
    queryFn: async () => {
      return await TeamLoggerService.getMyLogs(currentDate);
    },
  });

  // Process time logs to extract task IDs
  useEffect(() => {
    if (timeLogs && timeLogs.length > 0) {
      // Extract all task IDs that were used today
      const taskIds = new Set<string>();
      timeLogs.forEach(log => {
        if (log.task && Array.isArray(log.task)) {
          log.task.forEach((task: any) => {
            if (typeof task === 'string') {
              taskIds.add(task);
            } else if (task.$oid) {
              taskIds.add(task.$oid);
            } else if (task._id) {
              const id = typeof task._id === 'string' ? task._id : task._id.$oid;
              if (id) taskIds.add(id);
            }
          });
        }
      });
      setTodaySelectedTaskIds(Array.from(taskIds));
    }
  }, [timeLogs]);

  // Fetch active log if any
  const { data: activeLog, refetch: refetchActiveLog } = useQuery({
    queryKey: ['activeLog'],
    queryFn: async () => {
      return await TeamLoggerService.getActiveLog();
    },
  });

  // Process active log to extract task IDs
  useEffect(() => {
    if (activeLog && activeLog.task && Array.isArray(activeLog.task) && tasks) {
      // Extract task IDs from active log
      const activeTasks = activeLog.task
        .map((task: any) => {
          if (typeof task === 'string') return task;
          if (task.$oid) return task.$oid;
          if (task._id) return typeof task._id === 'string' ? task._id : task._id.$oid;
          return '';
        })
        .filter((id: string) => id);

      // Convert task IDs to options for the MultiSelect
      if (activeTasks.length > 0) {
        const taskOptions = activeTasks.map((taskId: string) => {
          const task = tasks.find(t => t._id === taskId);
          return {
            value: taskId,
            label: task ? task.name : `Task ${taskId.substring(0, 6)}`,
          };
        });
        setSelectedTasks(taskOptions);
      }
    }
  }, [activeLog, tasks]);

  // Update checked-in status when active log changes
  useEffect(() => {
    setIsCheckedIn(!!activeLog);
  }, [activeLog]);

  // Pre-select tasks that were used today if no active log
  useEffect(() => {
    if (!activeLog && tasks && todaySelectedTaskIds.length > 0 && selectedTasks.length === 0) {
      const recentTaskOptions = todaySelectedTaskIds.map(taskId => {
        const task = tasks.find(t => t._id === taskId);
        return {
          value: taskId,
          label: task ? task.name : `Task ${taskId.substring(0, 6)}`,
        };
      });
      setSelectedTasks(recentTaskOptions);
    }
  }, [todaySelectedTaskIds, tasks, activeLog, selectedTasks.length]);

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(updateCurrentTime, 60000);
    updateCurrentTime();
    return () => clearInterval(interval);
  }, []);

  const updateCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
  };

  const handleCheckIn = async () => {
    if (!selectedTasks || selectedTasks.length === 0) return;

    setIsLoading(true);
    try {
      const taskIds = selectedTasks.map((task: any) => task.value);
      await TeamLoggerService.checkIn(taskIds);
      setIsCheckedIn(true);
      toast.success('Successfully checked in');

      // Refetch data
      await refetchActiveLog();
      await refetchLogs();

      // Don't reset selected tasks - they will be shown during checkout
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error('Failed to check in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeLog?._id) return;

    setIsLoading(true);
    try {
      // Handle MongoDB ObjectId format
      const logId = typeof activeLog._id === 'string' ? activeLog._id : activeLog._id.$oid || '';

      await TeamLoggerService.checkOut(logId);
      setIsCheckedIn(false);
      toast.success('Successfully checked out');

      // Refetch data
      await refetchActiveLog();
      await refetchLogs();
    } catch (error) {
      console.error('Check-out failed:', error);
      toast.error('Failed to check out');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get task title from task ID
  const getTaskTitle = (taskId: string) => {
    return tasks?.find(task => task._id === taskId)?.name || 'Task ' + taskId.substring(0, 6);
  };

  // Helper function to parse MongoDB date format
  const parseMongoDate = (date: string | Date | any): Date => {
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    if (date && date.$date) return new Date(date.$date);
    return new Date();
  };

  // Format duration between check-in and check-out
  const formatDuration = (checkIn: any, checkOut: any): string => {
    if (!checkOut) return 'Ongoing';

    const startTime = parseMongoDate(checkIn).getTime();
    const endTime = parseMongoDate(checkOut).getTime();
    const durationMs = endTime - startTime;

    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}m`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={isCheckedIn ? 'destructive' : 'outline'}
          className={`flex items-center gap-2 transition-all duration-300 ${
            isCheckedIn ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          <Clock className="h-4 w-4" />
          {isCheckedIn ? 'Checked In' : 'Check In'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 shadow-xl">
        <div className="p-4 bg-white space-y-4">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-xl">Daily Attendance</h3>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="text-center">
              <h2 className="text-4xl font-bold font-mono tracking-tight">
                {currentTime || '00:00'}
              </h2>
            </div>
          </Card>
          <MultiSelect
            options={tasks?.map(task => ({ value: task._id, label: task.name })) || []}
            selectedValues={selectedTasks}
            onChange={setSelectedTasks}
            placeholder="Select tasks to work on"
            disabled={isCheckedIn}
            className="mb-4"
            searchable={false}
          />
          <div className="flex gap-2">
            <Button
              className="flex-1 min-w-0"
              onClick={handleCheckIn}
              disabled={isCheckedIn || !selectedTasks || selectedTasks.length === 0 || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="truncate">Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span className="truncate">Check In</span>
                </span>
              )}
            </Button>
            <Button
              className="flex-1 min-w-0"
              variant="destructive"
              onClick={handleCheckOut}
              disabled={!isCheckedIn || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="truncate">Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <XCircle className="mr-2 h-4 w-4" />
                  <span className="truncate">Check Out</span>
                </span>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <h4 className="font-medium">Today&apos;s Timeline</h4>
            </div>
            <span className="text-xs text-muted-foreground">
              {timeLogs.length} {timeLogs.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {isLoading && (
            <div className="flex justify-center py-6">
              <svg
                className="animate-spin h-6 w-6 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {!isLoading && timeLogs.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p>No time logs for today</p>
              <p className="text-xs mt-1">Check in to a task to start tracking time</p>
            </div>
          )}

          <div className="space-y-3">
            {!isLoading &&
              timeLogs
                .sort((a, b) => {
                  // Convert dates to timestamps for comparison
                  const aTime = parseMongoDate(a.checkIn).getTime();
                  const bTime = parseMongoDate(b.checkIn).getTime();
                  // Sort in descending order (newest first)
                  return bTime - aTime;
                })
                .map(log => {
                  // Get task IDs from task array
                  const taskIds: string[] = [];

                  if (log.task && Array.isArray(log.task)) {
                    log.task.forEach((task: any) => {
                      if (typeof task === 'string') {
                        taskIds.push(task);
                      } else if (task.$oid) {
                        taskIds.push(task.$oid);
                      } else if (task._id) {
                        const id = typeof task._id === 'string' ? task._id : task._id.$oid;
                        if (id) taskIds.push(id);
                      }
                    });
                  } else if (log.taskId) {
                    taskIds.push(log.taskId);
                  }

                  // If no tasks found, add unknown
                  if (taskIds.length === 0) {
                    taskIds.push('Unknown');
                  }

                  // Format check-in time
                  const checkInDate = parseMongoDate(log.checkIn);
                  const checkInTime = checkInDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  // Format check-out time
                  let checkOutTime = 'Ongoing';
                  if (log.checkOut) {
                    const checkOutDate = parseMongoDate(log.checkOut);
                    checkOutTime = checkOutDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  }

                  // Calculate duration
                  const duration = log.checkOut
                    ? formatDuration(log.checkIn, log.checkOut)
                    : 'Ongoing';

                  // Generate a unique key for the card
                  const cardKey =
                    typeof log._id === 'string'
                      ? log._id
                      : log._id && typeof log._id === 'object' && log._id.$oid
                        ? log._id.$oid
                        : log.id || `log-${checkInDate.getTime()}`;

                  return (
                    <Card
                      key={cardKey}
                      className="p-3 bg-card/50 hover:bg-card/70 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              {!log.checkOut && (
                                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                  Active
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {taskIds.length} {taskIds.length === 1 ? 'task' : 'tasks'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {taskIds.map(id => (
                                <span
                                  key={id}
                                  className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
                                >
                                  {getTaskTitle(id)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {checkInTime} - {checkOutTime}
                            </p>
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                              {duration}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`h-3 w-3 rounded-full ${log.checkOut ? 'bg-muted' : 'bg-green-500 animate-pulse'}`}
                        />
                      </div>
                    </Card>
                  );
                })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
