/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { addDays } from "date-fns";
import { Task as taskArray } from "@/components/Calendar/Task"
import { DateRange } from "react-day-picker";

interface Task {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  status: string;
}

interface CalendarState {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  selectedDate: Date | null;
  tasks: Task[];
  setSelectedDate: (date: Date | null) => void;
  setTasks: (tasks: Task[]) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  dateRange: {
    from: new Date(),
    to: addDays(new Date(), 7),
  },
  setDateRange: (range) => set({ dateRange: range }),
  selectedDate: null,
  tasks: taskArray,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setTasks: (tasks) => set({ tasks }),
}));
