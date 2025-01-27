import React from "react";
import {  format } from "date-fns";
import { CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCalendarStore } from "@/stores/calendarStore";

const CalendarHeader = () => {
  const dateRange = useCalendarStore((state) => state.dateRange);
  const setDateRange = useCalendarStore((state) => state.setDateRange);


  return (
    <header className="flex flex-wrap justify-between items-center p-4 border-b bg-white shadow-sm rounded-lg">
      {/* Title and priorities */}
      <div className="flex flex-col mb-4 md:mb-0">
        <h2 className="text-xl font-semibold text-gray-800">Project Timeline</h2>
        <div className="flex gap-4 text-sm text-gray-600 mt-1">
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> 3 High
          </p>
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span> 2 Medium
          </p>
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> 1 Low
          </p>
        </div>
      </div>

      {/* Date picker and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filter by date */}
        <div className="flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-full md:w-[300px] justify-start text-left font-normal border-gray-300",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span className="text-gray-500">Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => range && setDateRange(range)}
                numberOfMonths={2}
                className="p-2 mr-4"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Other filter */}
        <div className="flex items-center">
          <Button variant="outline" className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-gray-500" /> Filter
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;
