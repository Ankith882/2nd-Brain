import { CalendarTask } from '@/components/calendar/CalendarTemplate';

export const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isTaskStartDay = (task: CalendarTask, day: Date): boolean => {
  const taskStart = new Date(task.startTime);
  return taskStart.toDateString() === day.toDateString();
};

export const isTaskEndDay = (task: CalendarTask, day: Date): boolean => {
  const taskEnd = new Date(task.endTime);
  return taskEnd.toDateString() === day.toDateString();
};

export const formatTime = (time: Date): string => {
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTaskTimeRange = (task: CalendarTask): { time: string; dates?: string } => {
  const startTime = formatTime(task.startTime);
  const endTime = formatTime(task.endTime);
  
  const isMultiDay = task.startTime.toDateString() !== task.endTime.toDateString();
  
  if (isMultiDay) {
    const startDate = formatDate(task.startTime);
    const endDate = formatDate(task.endTime);
    return {
      time: `${startTime} – ${endTime}`,
      dates: `${startDate} – ${endDate}`
    };
  }
  
  return {
    time: `${startTime} – ${endTime}`
  };
};

export const formatTaskDateRangeForDay = (task: CalendarTask, currentDay: Date): string => {
  const isMultiDay = task.startTime.toDateString() !== task.endTime.toDateString();
  
  if (isMultiDay) {
    const isStart = isTaskStartDay(task, currentDay);
    const isEnd = isTaskEndDay(task, currentDay);
    
    if (isStart && isEnd) {
      return `${formatTime(task.startTime)} – ${formatTime(task.endTime)}`;
    } else if (isStart) {
      return `Start: ${formatDate(task.startTime)} ${formatTime(task.startTime)}`;
    } else if (isEnd) {
      return `End: ${formatDate(task.endTime)} ${formatTime(task.endTime)}`;
    } else {
      return 'continues...';
    }
  }
  
  return `${formatTime(task.startTime)} – ${formatTime(task.endTime)}`;
};

export const getTaskPosition = (
  task: CalendarTask, 
  day: Date, 
  overlappingTasks: CalendarTask[], 
  taskIndex: number
) => {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  const effectiveStart = new Date(Math.max(task.startTime.getTime(), dayStart.getTime()));
  const effectiveEnd = new Date(Math.min(task.endTime.getTime(), dayEnd.getTime()));

  const startMinutes = effectiveStart.getHours() * 60 + effectiveStart.getMinutes();
  const endMinutes = effectiveEnd.getHours() * 60 + effectiveEnd.getMinutes();

  const top = startMinutes / 1440 * 100;
  const height = (endMinutes - startMinutes) / 1440 * 100;

  const totalOverlapping = overlappingTasks.length;
  const width = totalOverlapping > 1 ? `${100 / totalOverlapping - 1}%` : 'calc(100% - 8px)';
  const left = totalOverlapping > 1 ? `${taskIndex / totalOverlapping * 100}%` : '4px';

  return {
    top: `${Math.max(0, top)}%`,
    height: `${Math.max(0.2, height)}%`,
    width,
    left
  };
};