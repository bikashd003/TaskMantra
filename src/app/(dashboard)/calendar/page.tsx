"use client"
import React from 'react'
import CalendarHeader from '@/components/Calendar/CalendarHeader'
import TaskCalendar from '@/components/Calendar/TaskCalendar'

const page = () => {
  return (
    <div className='bg-white shadow-lg mx-2 rounded-lg min-h-full border'>
        <CalendarHeader />
        <TaskCalendar />
    </div>
  )
}

export default page