"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
} from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronLeft, ChevronRight, Clock, MoreHorizontal } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Task {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  color: string
  priority: "low" | "medium" | "high"
}

const MAX_VISIBLE_TASKS = 1

const TaskCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const tasks: Task[] = [
    {
      id: 1,
      title: "Design Landing Page",
      description: "Create modern landing page design",
      startDate: "2025-01-02",
      endDate: "2025-01-05",
      color: "bg-violet-500",
      priority: "high",
    },
    {
      id: 2,
      title: "Update Dashboard",
      description: "Revamp dashboard UI",
      startDate: "2025-01-03",
      endDate: "2025-01-04",
      color: "bg-teal-500",
      priority: "medium",
    },
    {
      id: 3,
      title: "Project Planning",
      description: "Q1 Project Planning",
      startDate: "2025-01-01",
      endDate: "2025-01-08",
      color: "bg-orange-500",
      priority: "high",
    },
    {
      id: 4,
      title: "Team Meeting",
      description: "Weekly sync",
      startDate: "2025-01-03",
      endDate: "2025-01-03",
      color: "bg-blue-500",
      priority: "medium",
    },
  ]

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  const firstDayOfMonth = getDay(startOfMonth(currentDate))
  const emptyDays = Array.from({ length: firstDayOfMonth })

  const TaskContent = ({ task, isFirstDay }: { task: Task; isFirstDay: boolean }) => (
    <>
      {isFirstDay ? (
        <>
          <Clock className="h-3 w-3 mr-1 shrink-0" />
          <span className="font-medium mr-1 whitespace-nowrap">{format(parseISO(task.startDate), "HH:mm")}</span>
          <span className="truncate whitespace-nowrap">{task.title}</span>
        </>
      ) : null}
      
    </>
  )

  const renderTaskBars = (day: Date) => {
    const dayTasks = tasks
      .filter((task) => {
        const taskStart = parseISO(task.startDate)
        const taskEnd = parseISO(task.endDate)
        return isWithinInterval(day, { start: taskStart, end: taskEnd })
      })
      .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())

    if (dayTasks.length === 0) return null

    const visibleTasks = dayTasks.slice(0, MAX_VISIBLE_TASKS)
    const remainingTasks = dayTasks.slice(MAX_VISIBLE_TASKS)

    return (
      <div className="absolute top-7 left-0 right-0 flex flex-col gap-[2px] px-1 overflow-hidden">
        {visibleTasks.map((task, index) => {
          const taskStart = parseISO(task.startDate)
          const taskEnd = parseISO(task.endDate)
          const isFirstDay = isSameDay(new Date(taskStart), day)
          const isLastDay = isSameDay(new Date(taskEnd), day)

          return (
            <Popover key={task.id}>
              <PopoverTrigger asChild>
                <div
                  className={`
                    h-5 relative text-white text-xs flex items-center
                    ${task.color} 
                    ${isFirstDay ? 'rounded-l-lg ' : ''}
                    ${isLastDay ? 'rounded-r-lg' : 'w-[130%]'}
                    ${!isFirstDay ? '-ml-2 pl-0' : ''}
                    ${!isLastDay ? 'pr-0' : ''}
                `}
                  style={{
                    zIndex: 10 - index,
                  }}
                >
                  <div className="px-1 flex items-center min-w-0 w-full">
                    <TaskContent task={task} isFirstDay={isFirstDay} />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <div className="font-semibold">{task.title}</div>
                  <div className="text-sm text-muted-foreground">{task.description}</div>
                  <div className="text-xs flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(taskStart, "MMM d, HH:mm")} -{format(taskEnd, "MMM d, HH:mm")}
                    </span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )
        })}

        {remainingTasks.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <div className="h-5 px-1 text-xs flex items-center justify-center text-muted-foreground bg-muted/50 rounded-sm cursor-pointer hover:bg-muted">
                <MoreHorizontal className="h-3 w-3 mr-1" />
                {remainingTasks.length} more
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {remainingTasks.map((task) => (
                    <div key={task.id} className="space-y-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(parseISO(task.startDate), "HH:mm")} -{format(parseISO(task.endDate), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}
      </div>
    )
  }

  return (
    <Card className="rounded-lg bg-white shadow-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate((prev) => subMonths(prev, 1))}>
            <ChevronLeft className="h-3 w-2" />
          </Button>
          <h2 className="text-base font-bold">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate((prev) => addMonths(prev, 1))}>
            <ChevronRight className="h-3 w-2" />
          </Button>
        </div>
        <Button variant="outline" size="default" onClick={() => setCurrentDate(new Date())}>
         Today
        </Button>
      </div>

      <div className="grid grid-cols-7 rounded-md overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="h-6 flex items-center justify-center bg-muted/50 text-xs font-medium text-foreground">
            {day}
          </div>
        ))}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-[4.5rem] bg-background border-b border-b-background" />
        ))}
        {monthDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "relative h-[4.5rem] bg-background p-1 border-b border-b-background transition-colors",
              !isSameMonth(day, currentDate) && "bg-muted/50 text-muted-foreground",
              isSameDay(day, new Date()) && "bg-primary/5",
            )}
          >
            <div className={cn("text-xs font-medium", isSameDay(day, new Date()) && "text-primary")}>
              {format(day, "d")}
            </div>
            {renderTaskBars(day)}
          </div>
        ))}
      </div>
    </Card>
  )
}

export default TaskCalendar

