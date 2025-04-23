'use client';
import React from 'react';
import CalendarHeader from '@/components/Calendar/CalendarHeader';
import TaskCalendar from '@/components/Calendar/TaskCalendar';
import { ScrollArea } from '@/components/ui/scroll-area';

const page = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg border h-full flex flex-col">
      <CalendarHeader />
      <ScrollArea className="flex-1">
        <TaskCalendar />
      </ScrollArea>
    </div>
  );
};

export default page;
