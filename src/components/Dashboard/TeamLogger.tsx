import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
  import { Button } from "@/components/ui/button"
  import { Clock } from "lucide-react"
  import { useState } from "react"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  
  export function TeamLoggerPopover() {
    const [isCheckedIn, setIsCheckedIn] = useState(false)
    const [selectedTask, setSelectedTask] = useState("")
    const [currentTime, setCurrentTime] = useState("")
  
    // Sample tasks - replace with your actual tasks
    const tasks = [
      { id: "1", title: "Development" },
      { id: "2", title: "Design" },
      { id: "3", title: "Testing" },
    ]
  
    const updateCurrentTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}`)
    }
  
    const handleCheckIn = async () => {
      setIsCheckedIn(true)
      updateCurrentTime()
      // Add your API call here
    }
  
    const handleCheckOut = async () => {
      setIsCheckedIn(false)
      updateCurrentTime()
      // Add your API call here
    }
  
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Daily Attendance</h3>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
  
            <div className="text-center py-4">
              <h2 className="text-3xl font-bold">{currentTime || "00:00"}</h2>
            </div>
  
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
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
  
            <div className="flex gap-2 justify-center">
              <Button
                className="flex-1"
                onClick={handleCheckIn}
                disabled={isCheckedIn}
              >
                Check In
              </Button>
              <Button
                className="flex-1"
                variant="secondary"
                onClick={handleCheckOut}
                disabled={!isCheckedIn}
              >
                Check Out
              </Button>
            </div>
  
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                updateCurrentTime()
              }}
            >
              Refresh
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }