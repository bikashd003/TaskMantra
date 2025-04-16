import React, { useState } from 'react';
import { RecurrenceFrequency, RecurrenceRule, WeekDay } from './types/RecurringTask';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecurringTaskFormProps {
  initialRule?: RecurrenceRule;
  onSave: (rule: RecurrenceRule | undefined, isRecurring: boolean) => void;
  isRecurring: boolean;
  onToggleRecurring: (isRecurring: boolean) => void;
}

const weekDays: { value: WeekDay; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const RecurringTaskForm: React.FC<RecurringTaskFormProps> = ({
  initialRule,
  onSave,
  isRecurring,
  onToggleRecurring,
}) => {
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(initialRule?.frequency || 'weekly');
  const [interval, setInterval] = useState<number>(initialRule?.interval || 1);
  const [endType, setEndType] = useState<'never' | 'on' | 'after'>(
    initialRule?.endDate ? 'on' : initialRule?.count ? 'after' : 'never'
  );
  const [endDate, setEndDate] = useState<Date | undefined>(initialRule?.endDate);
  const [occurrences, setOccurrences] = useState<number>(initialRule?.count || 10);
  const [selectedWeekDays, setSelectedWeekDays] = useState<WeekDay[]>(
    initialRule?.weekDays || ['monday']
  );
  const [monthDay, setMonthDay] = useState<number>(initialRule?.monthDay || 1);
  const [monthWeek, setMonthWeek] = useState<number>(initialRule?.monthWeek || 1);

  const handleSave = () => {
    if (!isRecurring) {
      onSave(undefined, false);
      return;
    }

    const rule: RecurrenceRule = {
      frequency,
      interval,
      ...(endType === 'on' && endDate ? { endDate } : {}),
      ...(endType === 'after' ? { count: occurrences } : {}),
      ...(frequency === 'weekly' ? { weekDays: selectedWeekDays } : {}),
      ...(frequency === 'monthly' ? { monthDay, monthWeek } : {}),
    };

    onSave(rule, true);
  };

  const handleWeekDayToggle = (day: WeekDay) => {
    if (selectedWeekDays.includes(day)) {
      // Don't allow removing the last day
      if (selectedWeekDays.length > 1) {
        setSelectedWeekDays(selectedWeekDays.filter((d) => d !== day));
      }
    } else {
      setSelectedWeekDays([...selectedWeekDays, day]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Recurring Task</h3>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={onToggleRecurring}
          aria-label="Toggle recurring task"
        />
      </div>

      {isRecurring && (
        <>
          <div className="space-y-3">
            <Label>Repeat every</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min={1}
                max={99}
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                className="w-16"
              />
              <Select value={frequency} onValueChange={(value) => setFrequency(value as RecurrenceFrequency)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Day(s)</SelectItem>
                  <SelectItem value="weekly">Week(s)</SelectItem>
                  <SelectItem value="monthly">Month(s)</SelectItem>
                  <SelectItem value="yearly">Year(s)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {frequency === 'weekly' && (
            <div className="space-y-3">
              <Label>Repeat on</Label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`weekday-${day.value}`}
                      checked={selectedWeekDays.includes(day.value)}
                      onCheckedChange={() => handleWeekDayToggle(day.value)}
                    />
                    <Label htmlFor={`weekday-${day.value}`} className="text-xs">
                      {day.label.substring(0, 3)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {frequency === 'monthly' && (
            <div className="space-y-3">
              <Label>Repeat on</Label>
              <RadioGroup value={monthDay ? 'day' : 'week'} onValueChange={(v) => v === 'day' ? setMonthDay(1) : setMonthWeek(1)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="day" id="month-day" />
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="month-day">Day</Label>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={monthDay}
                      onChange={(e) => setMonthDay(parseInt(e.target.value) || 1)}
                      className="w-16"
                      disabled={!monthDay}
                    />
                    <span>of the month</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="week" id="month-week" />
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="month-week">The</Label>
                    <Select 
                      value={monthWeek?.toString()} 
                      onValueChange={(v) => setMonthWeek(parseInt(v))}
                      disabled={!!monthDay}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Week" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">First</SelectItem>
                        <SelectItem value="2">Second</SelectItem>
                        <SelectItem value="3">Third</SelectItem>
                        <SelectItem value="4">Fourth</SelectItem>
                        <SelectItem value="5">Last</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={selectedWeekDays[0]} 
                      onValueChange={(v) => setSelectedWeekDays([v as WeekDay])}
                      disabled={!!monthDay}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-3">
            <Label>Ends</Label>
            <RadioGroup value={endType} onValueChange={(v) => setEndType(v as 'never' | 'on' | 'after')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="end-never" />
                <Label htmlFor="end-never">Never</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="on" id="end-on" />
                <Label htmlFor="end-on">On</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                      disabled={endType !== 'on'}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="after" id="end-after" />
                <Label htmlFor="end-after">After</Label>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={occurrences}
                  onChange={(e) => setOccurrences(parseInt(e.target.value) || 1)}
                  className="w-16"
                  disabled={endType !== 'after'}
                />
                <span>occurrences</span>
              </div>
            </RadioGroup>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} className="w-full">
              Save Recurrence Pattern
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default RecurringTaskForm;
