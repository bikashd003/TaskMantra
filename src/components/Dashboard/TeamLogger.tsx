import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Clock, History, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface TimeLog {
  id: string;
  checkIn: string;
  checkOut: string | null;
  taskId: string;
  date: string;
}

export function TeamLoggerPopover() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [selectedTask, setSelectedTask] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [currentLogId, setCurrentLogId] = useState<string | null>(null)

  // Sample tasks - replace with your actual tasks
  const tasks = [
    { id: "1", title: "Development" },
    { id: "2", title: "Design" },
    { id: "3", title: "Testing" },
  ]

  useEffect(() => {
    // Load state from localStorage
    const savedState = localStorage.getItem('teamLogger')
    if (savedState) {
      const { isCheckedIn: savedCheckedIn, currentLogId: savedLogId, timeLogs: savedLogs } = JSON.parse(savedState)
      setIsCheckedIn(savedCheckedIn)
      setCurrentLogId(savedLogId)
      setTimeLogs(savedLogs)
    }

    // Update time every minute
    const interval = setInterval(updateCurrentTime, 60000)
    updateCurrentTime()
    return () => clearInterval(interval)
  }, [])

  const updateCurrentTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    setCurrentTime(`${hours}:${minutes}`)
  }

  const saveState = (checkedIn: boolean, logId: string | null, logs: TimeLog[]) => {
    localStorage.setItem('teamLogger', JSON.stringify({
      isCheckedIn: checkedIn,
      currentLogId: logId,
      timeLogs: logs
    }))
  }

  const handleCheckIn = async () => {
    if (!selectedTask) return

    const newLog: TimeLog = {
      id: Date.now().toString(),
      checkIn: currentTime,
      checkOut: null,
      taskId: selectedTask,
      date: new Date().toISOString().split('T')[0]
    }

    const updatedLogs = [...timeLogs, newLog]
    setTimeLogs(updatedLogs)
    setIsCheckedIn(true)
    setCurrentLogId(newLog.id)
    saveState(true, newLog.id, updatedLogs)
  }

  const handleCheckOut = async () => {
    if (!currentLogId) return

    const updatedLogs = timeLogs.map(log =>
      log.id === currentLogId ? { ...log, checkOut: currentTime } : log
    )

    setTimeLogs(updatedLogs)
    setIsCheckedIn(false)
    setCurrentLogId(null)
    saveState(false, null, updatedLogs)
  }

  const getTaskTitle = (taskId: string) => {
    return tasks.find(task => task.id === taskId)?.title || taskId
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={isCheckedIn ? "destructive" : "outline"}
          className={`flex items-center gap-2 transition-all duration-300 ${isCheckedIn ? 'bg-green-600 hover:bg-green-700' : ''
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
                day: 'numeric'
              })}
            </p>
          </div>

          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="text-center">
              <h2 className="text-4xl font-bold font-mono tracking-tight">
                {currentTime || "00:00"}
              </h2>
            </div>
          </Card>

          <Select
            value={selectedTask}
            onValueChange={setSelectedTask}
            disabled={isCheckedIn}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select task" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleCheckIn}
              disabled={isCheckedIn || !selectedTask}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Check In
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              onClick={handleCheckOut}
              disabled={!isCheckedIn}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Check Out
            </Button>
          </div>
        </div>

        <Separator />

        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4" />
            <h4 className="font-medium">Today&apos;s Timeline</h4>
          </div>
          <div className="space-y-3">
            {timeLogs
              .filter(log => log.date === new Date().toISOString().split('T')[0])
              .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
              .map((log) => (
                <Card key={log.id} className="p-3 bg-card/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{getTaskTitle(log.taskId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.checkIn} - {log.checkOut || 'Ongoing'}
                      </p>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${log.checkOut ? 'bg-muted' : 'bg-green-500 animate-pulse'
                      }`} />
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
  }
