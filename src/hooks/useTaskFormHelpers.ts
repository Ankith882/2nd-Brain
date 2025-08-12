import { useCallback } from 'react';

interface TimeData {
  hour: string;
  minutes: string;
  isAM: boolean;
}

export const useTaskFormHelpers = () => {
  const parseTimeFromDate = useCallback((date: Date): TimeData => {
    const hour = date.getHours();
    const minutes = date.getMinutes();
    return {
      hour: String(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      isAM: hour < 12
    };
  }, []);

  const createDateWithTime = useCallback((baseDate: Date, hour: string, minutes: string, isAM: boolean): Date => {
    const newDate = new Date(baseDate);
    let parsedHour = parseInt(hour) || 0;
    const parsedMinutes = parseInt(minutes) || 0;
    
    if (!isAM && parsedHour !== 12) {
      parsedHour += 12;
    } else if (isAM && parsedHour === 12) {
      parsedHour = 0;
    }
    
    newDate.setHours(parsedHour, parsedMinutes);
    return newDate;
  }, []);


  const getDefaultTimeSettings = useCallback((selectedDate: Date, parentId?: string) => {
    const now = new Date();
    const startTime = new Date(selectedDate);
    startTime.setHours(now.getHours(), now.getMinutes());
    
    const endTime = new Date(selectedDate);
    endTime.setHours(now.getHours() + 1, now.getMinutes());
    
    const defaultColor = parentId ? '#10B981' : '#3B82F6';
    
    return {
      startTime,
      endTime,
      defaultColor,
      startTimeData: parseTimeFromDate(startTime),
      endTimeData: parseTimeFromDate(endTime)
    };
  }, [parseTimeFromDate]);

  return {
    parseTimeFromDate,
    createDateWithTime,
    getDefaultTimeSettings
  };
};