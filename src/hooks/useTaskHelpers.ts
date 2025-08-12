import { useMemo } from 'react';
import { Task } from '@/types/task';
import { WeekSegmentTask } from './useTimelineCalculations';
import { format } from 'date-fns';

export const useTaskHelpers = (tasks: Task[]) => {
  const getTaskColor = (task: Task) => {
    // Return the task's actual color, not the light variant
    return task.color || '#3B82F6'; // Default to blue if no color
  };

  const getTaskDurationInMinutes = (task: Task): number => {
    if (!task.startTime || !task.endTime) return 0;
    const start = new Date(task.startTime);
    const end = new Date(task.endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  const findTaskById = (taskList: Task[], taskId: string): Task | null => {
    for (const task of taskList) {
      if (task.id === taskId) return task;
      if (task.subTasks?.length) {
        const found = findTaskById(task.subTasks, taskId);
        if (found) return found;
      }
    }
    return null;
  };

  const getSubtaskCount = (parentId: string): number => {
    const parentTask = findTaskById(tasks, parentId);
    return parentTask?.subTasks?.length || 0;
  };

  const getTotalSubtaskCount = (parentId: string): number => {
    const countSubtasksRecursively = (task: Task): number => {
      let count = task.subTasks?.length || 0;
      task.subTasks?.forEach(subTask => {
        count += countSubtasksRecursively(subTask);
      });
      return count;
    };

    const parentTask = findTaskById(tasks, parentId);
    return parentTask ? countSubtasksRecursively(parentTask) : 0;
  };

  const formatTaskTime = (task: WeekSegmentTask, isWeekSegment: boolean = false) => {
    if (!task.startTime || !task.endTime) return '';

    if (task.isWeekSegment && task.originalStartTime && task.originalEndTime) {
      const originalStart = new Date(task.originalStartTime);
      const originalEnd = new Date(task.originalEndTime);
      const startMonth = originalStart.getMonth();
      const endMonth = originalEnd.getMonth();
      const startYear = originalStart.getFullYear();
      const endYear = originalEnd.getFullYear();

      if (startMonth !== endMonth || startYear !== endYear) {
        const startMonthName = format(originalStart, 'MMMM');
        const endMonthName = format(originalEnd, 'MMMM');
        const yearSuffix = startYear !== endYear ? ` ${endYear}` : '';
        const startDateTime = `${format(originalStart, 'dd/MM/yyyy')} ${format(originalStart, 'h:mm a')}`;
        const endDateTime = `${format(originalEnd, 'dd/MM/yyyy')} ${format(originalEnd, 'h:mm a')}`;
        const monthRange = `${startMonthName} – ${endMonthName}${yearSuffix}`;
        
        return {
          displayText: `${startDateTime} – ${endDateTime} (${monthRange})`,
          isMultiMonth: true,
          isSegment: true
        };
      } else {
        const startTime = format(originalStart, 'h:mm a');
        const endTime = format(originalEnd, 'h:mm a');
        const startDate = format(originalStart, 'dd/MM/yyyy');
        const endDate = format(originalEnd, 'dd/MM/yyyy');
        
        return {
          timeRange: `${startTime} – ${endTime}`,
          dateRange: `${startDate} – ${endDate}`,
          isMultiWeek: true,
          isSegment: true
        };
      }
    }

    const start = new Date(task.startTime);
    const end = new Date(task.endTime);
    const startTime = format(start, 'h:mm a');
    const endTime = format(end, 'h:mm a');
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      return `${startTime} – ${endTime}`;
    } else {
      const startDate = format(start, 'dd/MM/yyyy');
      const endDate = format(end, 'dd/MM/yyyy');
      return {
        time: `${startTime} – ${endTime}`,
        dates: `${startDate} – ${endDate}`
      };
    }
  };

  return {
    getTaskColor,
    getTaskDurationInMinutes,
    findTaskById,
    getSubtaskCount,
    getTotalSubtaskCount,
    formatTaskTime
  };
};