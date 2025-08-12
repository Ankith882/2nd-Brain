import React from 'react';
import { Button, Input } from '@/components/ui';
import { EnhancedDatePicker } from '../extra-panel/EnhancedDatePicker';

interface TimeRangeSelectorProps {
  startTime?: Date;
  endTime?: Date;
  startTimeHour: string;
  startTimeMinutes: string;
  startTimeAM: boolean;
  endTimeHour: string;
  endTimeMinutes: string;
  endTimeAM: boolean;
  onStartTimeChange: (date: Date) => void;
  onEndTimeChange: (date: Date) => void;
  onStartTimeHourChange: (hour: string) => void;
  onStartTimeMinutesChange: (minutes: string) => void;
  onStartTimeAMChange: (isAM: boolean) => void;
  onEndTimeHourChange: (hour: string) => void;
  onEndTimeMinutesChange: (minutes: string) => void;
  onEndTimeAMChange: (isAM: boolean) => void;
  isDarkMode: boolean;
}

const TimeInput = ({ 
  label, 
  hour, 
  minutes, 
  isAM, 
  onHourChange, 
  onMinutesChange, 
  onPeriodChange 
}: {
  label: string;
  hour: string;
  minutes: string;
  isAM: boolean;
  onHourChange: (hour: string) => void;
  onMinutesChange: (minutes: string) => void;
  onPeriodChange: (isAM: boolean) => void;
}) => (
  <div className="space-y-2">
    <label className="text-xs font-medium">{label}</label>
    <div className="flex gap-2 items-center">
      <Input
        type="number"
        min="1"
        max="12"
        value={hour}
        onChange={(e) => onHourChange(e.target.value)}
        className="w-16 bg-white/10 border-white/20"
        placeholder="HH"
      />
      <span>:</span>
      <Input
        type="number"
        min="0"
        max="59"
        value={minutes}
        onChange={(e) => onMinutesChange(e.target.value)}
        className="w-16 bg-white/10 border-white/20"
        placeholder="MM"
      />
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant={isAM ? "default" : "outline"}
          onClick={() => onPeriodChange(true)}
          className="px-2"
        >
          AM
        </Button>
        <Button
          type="button"
          size="sm"
          variant={!isAM ? "default" : "outline"}
          onClick={() => onPeriodChange(false)}
          className="px-2"
        >
          PM
        </Button>
      </div>
    </div>
  </div>
);

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  startTime,
  endTime,
  startTimeHour,
  startTimeMinutes,
  startTimeAM,
  endTimeHour,
  endTimeMinutes,
  endTimeAM,
  onStartTimeChange,
  onEndTimeChange,
  onStartTimeHourChange,
  onStartTimeMinutesChange,
  onStartTimeAMChange,
  onEndTimeHourChange,
  onEndTimeMinutesChange,
  onEndTimeAMChange,
  isDarkMode
}) => (
  <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg space-y-4">
    <h3 className="text-sm font-medium">Time Range</h3>
    
    <div className="space-y-2">
      <div className="flex gap-2">
        <div onClick={(e) => e.stopPropagation()}>
          <EnhancedDatePicker
            selectedDate={startTime || new Date()}
            onDateSelect={onStartTimeChange}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
      <TimeInput
        label="Start Time"
        hour={startTimeHour}
        minutes={startTimeMinutes}
        isAM={startTimeAM}
        onHourChange={onStartTimeHourChange}
        onMinutesChange={onStartTimeMinutesChange}
        onPeriodChange={onStartTimeAMChange}
      />
    </div>

    <div className="space-y-2">
      <div className="flex gap-2">
        <div onClick={(e) => e.stopPropagation()}>
          <EnhancedDatePicker
            selectedDate={endTime || new Date()}
            onDateSelect={onEndTimeChange}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
      <TimeInput
        label="End Time"
        hour={endTimeHour}
        minutes={endTimeMinutes}
        isAM={endTimeAM}
        onHourChange={onEndTimeHourChange}
        onMinutesChange={onEndTimeMinutesChange}
        onPeriodChange={onEndTimeAMChange}
      />
    </div>
  </div>
);