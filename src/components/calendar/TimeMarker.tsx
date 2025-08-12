
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface TimeMarkerProps {
  label: string;
  date: Date;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => void;
  isDarkMode: boolean;
}

export const TimeMarker: React.FC<TimeMarkerProps> = ({
  label,
  date,
  onDateChange,
  onTimeChange,
  isDarkMode
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Extract current time values
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const period = currentHour >= 12 ? 'PM' : 'AM';
  const displayHour = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
  
  const [selectedHour, setSelectedHour] = useState(displayHour);
  const [selectedMinute, setSelectedMinute] = useState(currentMinute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(period);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleTimeUpdate = () => {
    onTimeChange({
      hour: selectedHour,
      minute: selectedMinute,
      period: selectedPeriod
    });
    setShowTimePicker(false);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
      <span className="text-sm font-medium text-foreground w-16">{label}</span>
      
      <div className="flex items-center gap-3">
        {/* Date Picker */}
        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, 'MMM dd, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  onDateChange(newDate);
                  setShowDatePicker(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Time Display */}
        <div className="flex items-center gap-2">
          <Popover open={showTimePicker} onOpenChange={setShowTimePicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-sm font-mono"
              >
                {`${displayHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="flex flex-col gap-4">
                <div className="text-sm font-medium text-foreground">Select Time</div>
                
                <div className="flex gap-2">
                  {/* Hour Selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Hour</label>
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(Number(e.target.value))}
                      className="bg-background border border-border rounded px-2 py-1 text-foreground text-sm min-w-16"
                    >
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Minute Selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Min</label>
                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(Number(e.target.value))}
                      className="bg-background border border-border rounded px-2 py-1 text-foreground text-sm min-w-16"
                    >
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* AM/PM Buttons */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={selectedPeriod === 'AM' ? 'default' : 'outline'}
                    onClick={() => setSelectedPeriod('AM')}
                    className="flex-1 text-xs"
                  >
                    AM
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedPeriod === 'PM' ? 'default' : 'outline'}
                    onClick={() => setSelectedPeriod('PM')}
                    className="flex-1 text-xs"
                  >
                    PM
                  </Button>
                </div>

                <Button onClick={handleTimeUpdate} size="sm" className="w-full">
                  Set Time
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            variant={period === 'AM' ? 'default' : 'secondary'}
            className="text-xs px-3 min-w-12"
          >
            {period}
          </Button>
        </div>
      </div>
    </div>
  );
};
