import { CalendarTask } from '@/components/calendar/CalendarTemplate';

// Pure utility functions for calendar operations

export const getTaskDurationMinutes = (task: CalendarTask): number => {
  return (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60);
};

export const isMultiDay = (task: CalendarTask): boolean => {
  const startDate = new Date(task.startTime);
  const endDate = new Date(task.endTime);
  return startDate.toDateString() !== endDate.toDateString();
};

export const isTaskStartDay = (task: CalendarTask, day: Date): boolean => {
  const taskStart = new Date(task.startTime);
  return taskStart.toDateString() === day.toDateString();
};

export const isTaskEndDay = (task: CalendarTask, day: Date): boolean => {
  const taskEnd = new Date(task.endTime);
  return taskEnd.toDateString() === day.toDateString();
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
};

export const formatTaskTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

export const formatTaskDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};

export const formatTaskDateRange = (task: CalendarTask, currentDay?: Date) => {
  if (isMultiDay(task) && currentDay) {
    const isStart = isTaskStartDay(task, currentDay);
    const isEnd = isTaskEndDay(task, currentDay);
    
    if (isStart && isEnd) {
      return {
        time: `${formatTaskTime(task.startTime)} – ${formatTaskTime(task.endTime)}`,
        dates: null
      };
    } else if (isStart) {
      return {
        time: `Start: ${formatTaskDate(task.startTime)} ${formatTaskTime(task.startTime)}`,
        dates: null
      };
    } else if (isEnd) {
      return {
        time: `End: ${formatTaskDate(task.endTime)} ${formatTaskTime(task.endTime)}`,
        dates: null
      };
    } else {
      return {
        time: 'continues...',
        dates: null
      };
    }
  }
  
  if (isMultiDay(task)) {
    return {
      time: `${formatTaskTime(task.startTime)} – ${formatTaskTime(task.endTime)}`,
      dates: `${formatTaskDate(task.startTime)} – ${formatTaskDate(task.endTime)}`
    };
  }
  
  return {
    time: `${formatTaskTime(task.startTime)} – ${formatTaskTime(task.endTime)}`,
    dates: null
  };
};

export const getTasksForDay = (tasks: CalendarTask[], day: Date): CalendarTask[] => {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);
  
  return tasks.filter(task => {
    const taskStart = new Date(task.startTime);
    const taskEnd = new Date(task.endTime);
    return taskStart <= dayEnd && taskEnd >= dayStart;
  });
};

export const getUnscheduledTasksForDay = (tasks: CalendarTask[], day: Date): CalendarTask[] => {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);
  
  return tasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate >= dayStart && taskDate <= dayEnd;
  });
};

export const getWeekStart = (date: Date): Date => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getMonthStart = (date: Date): Date => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

export const generateWeekDays = (weekStart: Date): Date[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });
};

export const generateMonthDays = (monthStart: Date): Date[] => {
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(monthStart);
    day.setDate(monthStart.getDate() + i);
    return day;
  });
};

export const generateHours = (): number[] => {
  return Array.from({ length: 24 }, (_, i) => i);
};

export const getTaskColor = (task: CalendarTask): string => {
  return task.color || (task.parentId ? '#EF4444' : '#10B981');
};

export const calculateOverlappingTasks = (tasks: CalendarTask[]): CalendarTask[][] => {
  // Sort tasks by start time, then by duration (shorter tasks first for same start time)
  const sortedTasks = [...tasks].sort((a, b) => {
    const startDiff = a.startTime.getTime() - b.startTime.getTime();
    if (startDiff !== 0) return startDiff;
    
    // For same start time, prioritize shorter tasks
    const aDuration = a.endTime.getTime() - a.startTime.getTime();
    const bDuration = b.endTime.getTime() - b.startTime.getTime();
    return aDuration - bDuration;
  });
  
  const overlappingGroups: CalendarTask[][] = [];
  
  sortedTasks.forEach(task => {
    const taskStart = task.startTime.getTime();
    const taskEnd = task.endTime.getTime();
    
    // Find all groups that this task overlaps with
    const overlappingGroupIndices: number[] = [];
    
    overlappingGroups.forEach((group, groupIndex) => {
      const overlapsWithGroup = group.some(groupTask => {
        const groupStart = groupTask.startTime.getTime();
        const groupEnd = groupTask.endTime.getTime();
        return taskStart < groupEnd && taskEnd > groupStart;
      });
      
      if (overlapsWithGroup) {
        overlappingGroupIndices.push(groupIndex);
      }
    });
    
    if (overlappingGroupIndices.length === 0) {
      // No overlaps, create new group
      overlappingGroups.push([task]);
    } else if (overlappingGroupIndices.length === 1) {
      // Overlaps with one group, add to it
      overlappingGroups[overlappingGroupIndices[0]].push(task);
    } else {
      // Overlaps with multiple groups, merge them
      const mergedGroup = [task];
      
      // Collect all tasks from overlapping groups (in reverse order to maintain indices)
      for (let i = overlappingGroupIndices.length - 1; i >= 0; i--) {
        const groupIndex = overlappingGroupIndices[i];
        mergedGroup.push(...overlappingGroups[groupIndex]);
        overlappingGroups.splice(groupIndex, 1);
      }
      
      overlappingGroups.push(mergedGroup);
    }
  });
  
  return overlappingGroups;
};

export const calculateTaskPosition = (
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
  
  // FIXED: Responsive pixels per hour based on screen size
  // 48px on mobile (< 640px), 64px on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const pixelsPerHour = isMobile ? 48 : 64;
  const topPosition = (startMinutes / 60) * pixelsPerHour;
  const heightInPixels = ((endMinutes - startMinutes) / 60) * pixelsPerHour;
  
  // Sort overlapping tasks by start time, then by duration (shorter first)
  const sortedOverlappingTasks = [...overlappingTasks].sort((a, b) => {
    const startDiff = a.startTime.getTime() - b.startTime.getTime();
    if (startDiff !== 0) return startDiff;
    
    const aDuration = a.endTime.getTime() - a.startTime.getTime();
    const bDuration = b.endTime.getTime() - b.startTime.getTime();
    return aDuration - bDuration;
  });
  
  // Find the correct index of current task in sorted list
  const sortedTaskIndex = sortedOverlappingTasks.findIndex(t => t.id === task.id);
  const actualTaskIndex = sortedTaskIndex >= 0 ? sortedTaskIndex : taskIndex;
  
  const totalOverlapping = overlappingTasks.length;
  
  // Improve spacing for overlapping tasks
  const marginBetweenTasks = 2; // 2% margin between tasks
  const availableWidth = 100 - (totalOverlapping - 1) * marginBetweenTasks;
  const taskWidth = totalOverlapping > 1 ? availableWidth / totalOverlapping : 98;
  const leftPosition = totalOverlapping > 1 
    ? (actualTaskIndex * (taskWidth + marginBetweenTasks))
    : 1;
  
  return {
    top: `${Math.max(0, topPosition)}px`,
    height: `${Math.max(16, heightInPixels)}px`,
    width: `${taskWidth}%`,
    left: `${leftPosition}%`,
    zIndex: totalOverlapping > 1 ? 10 + actualTaskIndex : 10
  };
};