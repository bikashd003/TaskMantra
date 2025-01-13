"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, Bell, Filter, Plus, Star } from 'lucide-react';
import { generateWeekDays, generateTimeSlots, sampleEvents, generateMonthDays } from "@/components/Calendar/Utils";

type ViewType = 'day' | 'week' | 'month';

function Page() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewType>('week');

    const weekDays = generateWeekDays(currentDate);
    const timeSlots = generateTimeSlots();
    const monthDays = generateMonthDays(currentDate);

    const navigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (view === 'day') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        } else if (view === 'week') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getViewTitle = () => {
        const options: Intl.DateTimeFormatOptions = {
            month: 'long',
            year: 'numeric',
        };
        if (view === 'day') {
            return new Intl.DateTimeFormat('en-US', { ...options, day: 'numeric' }).format(currentDate);
        }
        return new Intl.DateTimeFormat('en-US', options).format(currentDate);
    };

    const renderDayView = () => (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] border-b">
                <div className="hidden sm:block p-4 border-r"></div>
                <div className="p-4 text-center">
                    <div className="text-sm text-gray-500">
                        {new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(currentDate)}
                    </div>
                    <div className="text-lg font-semibold">{currentDate.getDate()}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr]">
                <div className="hidden sm:block border-r">
                    {timeSlots.map((time, index) => (
                        <div key={index} className="h-20 border-b last:border-b-0 text-right pr-2 pt-2">
                            <span className="text-sm text-gray-500">{time}</span>
                        </div>
                    ))}
                </div>

                <div className="relative">
                    {timeSlots.map((time, index) => (
                        <div key={index} className="h-20 border-b last:border-b-0">
                            <span className="sm:hidden text-xs text-gray-500 pl-2">{time}</span>
                        </div>
                    ))}
                    {sampleEvents
                        .filter(event => event.day === currentDate.getDay())
                        .map((event, index) => (
                            <div
                                key={index}
                                className={`absolute p-2 rounded-md text-sm ${event.color} shadow-sm mx-1`}
                                style={{
                                    top: `${event.startHour * 80}px`,
                                    height: `${(event.endHour - event.startHour) * 80}px`,
                                    left: '4px',
                                    right: '4px',
                                }}
                            >
                                <div className="font-medium">{event.title}</div>
                                {event.subtitle && (
                                    <div className="text-xs mt-1 opacity-75">{event.subtitle}</div>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );

    const renderWeekView = () => (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="min-w-[800px]">
                <div className="grid grid-cols-8 border-b">
                    <div className="p-4 border-r"></div>
                    {weekDays.map((day, index) => (
                        <div key={index} className="p-4 text-center border-r last:border-r-0">
                            <div className="text-sm text-gray-500">{day.dayName}</div>
                            <div className="text-lg font-semibold">{day.date}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-8">
                    <div className="border-r">
                        {timeSlots.map((time, index) => (
                            <div key={index} className="h-20 border-b last:border-b-0 text-right pr-2 pt-2">
                                <span className="text-sm text-gray-500">{time}</span>
                            </div>
                        ))}
                    </div>

                    {Array(7).fill(null).map((_, dayIndex) => (
                        <div key={dayIndex} className="relative border-r last:border-r-0">
                            {timeSlots.map((_, timeIndex) => (
                                <div key={timeIndex} className="h-20 border-b last:border-b-0"></div>
                            ))}
                            {sampleEvents
                                .filter(event => event.day === dayIndex)
                                .map((event, eventIndex) => (
                                    <div
                                        key={eventIndex}
                                        className={`absolute p-2 rounded-md text-sm ${event.color} shadow-sm`}
                                        style={{
                                            top: `${event.startHour * 80}px`,
                                            height: `${(event.endHour - event.startHour) * 80}px`,
                                            left: '4px',
                                            right: '4px',
                                        }}
                                    >
                                        <div className="font-medium">{event.title}</div>
                                        {event.subtitle && (
                                            <div className="text-xs mt-1 opacity-75">{event.subtitle}</div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderMonthView = () => (
        <div className="bg-white rounded-lg shadow">
            <div className="grid grid-cols-7 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-4 text-center font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {monthDays.map((day, index) => (
                    <div
                        key={index}
                        className={`min-h-[120px] p-2 border-b border-r relative ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                            } ${day.isToday ? 'bg-blue-50' : ''}`}
                    >
                        <div className="text-sm font-medium mb-1">{day.date}</div>
                        <div className="space-y-1">
                            {sampleEvents
                                .filter(event =>
                                    event.day === new Date(day.fullDate).getDay() &&
                                    new Date(day.fullDate).getDate() === day.date
                                )
                                .slice(0, 3)
                                .map((event, eventIndex) => (
                                    <div
                                        key={eventIndex}
                                        className={`${event.color} p-1 rounded text-xs truncate`}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-semibold">Calendar</h1>
                            <p className="hidden sm:block text-gray-500 text-sm">
                                Stay Organized and On Track with Your Personalized Calendar
                            </p>
                        </div>
                    </div>


                    {/* Navigation */}
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4 overflow-x-auto pb-2 sm:pb-0">
                            <button className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-sm whitespace-nowrap">
                                All Scheduled
                            </button>
                            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md text-sm flex items-center whitespace-nowrap">
                                <Star className="w-4 h-4 mr-1" /> Events
                            </button>
                            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md text-sm flex items-center whitespace-nowrap">
                                <Users className="w-4 h-4 mr-1" /> Meetings
                            </button>
                            <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md text-sm flex items-center whitespace-nowrap">
                                <Bell className="w-4 h-4 mr-1" /> Task Reminders
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 sm:flex-none">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full sm:w-auto pl-3 pr-10 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md">
                                <Filter className="w-5 h-5" />
                            </button>
                            <button className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-sm flex items-center whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-1" /> New
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Calendar */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold">{getViewTitle()}</h2>
                        <button
                            onClick={goToToday}
                            className="px-2 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
                        >
                            Today
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => navigate('prev')}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate('next')}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setView('day')}
                                className={`px-3 py-1.5 rounded text-sm ${view === 'day'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                            >
                                Day
                            </button>
                            <button
                                onClick={() => setView('week')}
                                className={`px-3 py-1.5 rounded text-sm ${view === 'week'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setView('month')}
                                className={`px-3 py-1.5 rounded text-sm ${view === 'month'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                            >
                                Month
                            </button>
                        </div>
                    </div>
                </div>

                {view === 'day' && renderDayView()}
                {view === 'week' && renderWeekView()}
                {view === 'month' && renderMonthView()}
            </main>
        </div>
    );
}

export default Page;