export const generateWeekDays = (startDate: Date) => {
    const days = [];
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
        days.push({
            dayName: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(currentDate),
            date: currentDate.getDate(),
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
};

export const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 17; i++) {
        slots.push(i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`);
    }
    return slots;
};

export const generateMonthDays = (date: Date) => {
    const days = [];
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Add days from previous month
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = new Date(prevMonthLastDay);
        day.setDate(prevMonthLastDay.getDate() - i);
        days.push({
            date: day.getDate(),
            isCurrentMonth: false,
            isToday: false,
            fullDate: day.toISOString(),
        });
    }

    // Add days from current month
    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const day = new Date(date.getFullYear(), date.getMonth(), i);
        days.push({
            date: i,
            isCurrentMonth: true,
            isToday:
                today.getDate() === i &&
                today.getMonth() === date.getMonth() &&
                today.getFullYear() === date.getFullYear(),
            fullDate: day.toISOString(),
        });
    }

    // Add days from next month
    const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
        const day = new Date(date.getFullYear(), date.getMonth() + 1, i);
        days.push({
            date: i,
            isCurrentMonth: false,
            isToday: false,
            fullDate: day.toISOString(),
        });
    }

    return days;
};

export const sampleEvents = [
    {
        day: 0,
        startHour: 0,
        endHour: 1,
        title: 'Client Presentation Preparation',
        color: 'bg-purple-100 text-purple-800',
    },
    {
        day: 0,
        startHour: 1,
        endHour: 2,
        title: 'Client Meeting Planning',
        subtitle: 'Team Sync',
        color: 'bg-blue-100 text-blue-800',
    },
    {
        day: 0,
        startHour: 3,
        endHour: 4,
        title: 'Meetup with UB Internal Team',
        color: 'bg-green-100 text-green-800',
    },
    {
        day: 1,
        startHour: 1,
        endHour: 2,
        title: 'Design Revisions',
        color: 'bg-purple-100 text-purple-800',
    },
    {
        day: 1,
        startHour: 2.5,
        endHour: 3,
        title: 'Collaboration with Development Team',
        color: 'bg-purple-100 text-purple-800',
    },
    {
        day: 1,
        startHour: 3.5,
        endHour: 4.5,
        title: 'Client Feedback Meeting',
        color: 'bg-blue-100 text-blue-800',
    },
    {
        day: 2,
        startHour: 0,
        endHour: 1,
        title: 'New Project Kickoff Meeting',
        color: 'bg-blue-100 text-blue-800',
    },
    {
        day: 2,
        startHour: 4,
        endHour: 5,
        title: 'Meetup with Internal Team',
        color: 'bg-green-100 text-green-800',
    },
    {
        day: 3,
        startHour: 1,
        endHour: 2,
        title: 'Design Refinement',
        color: 'bg-purple-100 text-purple-800',
    },
    {
        day: 3,
        startHour: 4,
        endHour: 4.5,
        title: 'Client Meeting',
        color: 'bg-blue-100 text-blue-800',
    },
    {
        day: 4,
        startHour: 0.5,
        endHour: 1.5,
        title: 'Design Team Stand-up Meeting',
        color: 'bg-blue-100 text-blue-800',
    },
    {
        day: 4,
        startHour: 2,
        endHour: 3,
        title: 'Final Touches on Client Project',
        color: 'bg-purple-100 text-purple-800',
    },
    {
        day: 5,
        startHour: 1,
        endHour: 2,
        title: 'Planning & Goal Setting for the Week',
        color: 'bg-purple-100 text-purple-800',
    },
    {
        day: 6,
        startHour: 2,
        endHour: 3,
        title: 'Meetup with Adobe Internal team',
        color: 'bg-green-100 text-green-800',
    },
];