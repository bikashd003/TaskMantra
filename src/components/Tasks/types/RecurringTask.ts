// Recurring task type definitions

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 weeks
  endDate?: Date; // When the recurrence ends
  count?: number; // Number of occurrences
  weekDays?: WeekDay[]; // For weekly recurrence
  monthDay?: number; // For monthly recurrence (day of month)
  monthWeek?: number; // For monthly recurrence (e.g., 1st Monday)
}

export interface RecurringTaskInfo {
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  parentTaskId?: string; // For instances of recurring tasks
  instanceDate?: Date; // The date this instance represents
}
