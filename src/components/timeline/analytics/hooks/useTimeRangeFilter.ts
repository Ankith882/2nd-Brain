import { useMemo } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { TimeMode, DateRange } from './useAnalyticsData';

export interface TimeRangeFilterProps {
  timeMode: TimeMode;
  customStartDate: Date;
  customEndDate: Date;
  selectedDates: Date[];
}

export const useTimeRangeFilter = ({
  timeMode,
  customStartDate,
  customEndDate,
  selectedDates
}: TimeRangeFilterProps): DateRange => {
  return useMemo(() => {
    const now = new Date();
    
    switch (timeMode) {
      case 'weekly':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'monthly':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'yearly':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        return { start: customStartDate, end: customEndDate };
      case 'selected':
        if (selectedDates.length === 0) {
          return { start: new Date(0), end: new Date() };
        }
        const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
        return { start: sorted[0], end: sorted[sorted.length - 1] };
      default:
        return { start: new Date(0), end: new Date() };
    }
  }, [timeMode, customStartDate, customEndDate, selectedDates]);
};