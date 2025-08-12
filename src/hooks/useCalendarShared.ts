import { useState, useMemo } from 'react';
import { CalendarTask } from '@/components/calendar/CalendarTemplate';

export const useCalendarShared = (tasks: CalendarTask[]) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [draggedTask, setDraggedTask] = useState<CalendarTask | null>(null);

  // Task hierarchy utilities
  const hasSubtasks = (taskId: string): boolean => {
    return tasks.some(task => task.parentId === taskId);
  };

  const getSubtasks = (parentId: string): CalendarTask[] => {
    return tasks.filter(task => task.parentId === parentId);
  };

  const getSubtaskCount = (task: CalendarTask): number => {
    return task.subTasks.length;
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Task utilities
  const getTaskDurationMinutes = (task: CalendarTask): number => {
    return (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60);
  };

  const isMultiDay = (task: CalendarTask): boolean => {
    const startDate = new Date(task.startTime);
    const endDate = new Date(task.endTime);
    return startDate.toDateString() !== endDate.toDateString();
  };

  const getTaskColor = (task: CalendarTask): string => {
    return task.color || (task.parentId ? '#EF4444' : '#10B981');
  };

  // Drag and drop
  const handleTaskDrag = (task: CalendarTask, event: React.DragEvent | React.MouseEvent) => {
    setDraggedTask(task);
    if ('dataTransfer' in event) {
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  const createDropHandler = (onTaskUpdate: (taskId: string, updates: Partial<CalendarTask>) => void) => 
    (day: Date, hour?: number, minute?: number) => (event: React.DragEvent) => {
      event.preventDefault();
      if (draggedTask) {
        const duration = draggedTask.endTime.getTime() - draggedTask.startTime.getTime();
        const newStartTime = new Date(day);
        
        if (hour !== undefined && minute !== undefined) {
          newStartTime.setHours(hour, minute, 0, 0);
        } else {
          newStartTime.setHours(draggedTask.startTime.getHours(), draggedTask.startTime.getMinutes(), 0, 0);
        }
        
        const newEndTime = new Date(newStartTime.getTime() + duration);
        
        onTaskUpdate(draggedTask.id, {
          startTime: newStartTime,
          endTime: newEndTime
        });
        setDraggedTask(null);
      }
    };

  // Overlapping tasks calculation
  const getOverlappingTasks = (dayTasks: CalendarTask[]): CalendarTask[][] => {
    const overlappingGroups: CalendarTask[][] = [];
    dayTasks.forEach(task => {
      const taskStart = task.startTime.getTime();
      const taskEnd = task.endTime.getTime();
      let addedToGroup = false;
      
      for (const group of overlappingGroups) {
        const overlapsWithGroup = group.some(groupTask => {
          const groupStart = groupTask.startTime.getTime();
          const groupEnd = groupTask.endTime.getTime();
          return taskStart < groupEnd && taskEnd > groupStart;
        });
        
        if (overlapsWithGroup) {
          group.push(task);
          addedToGroup = true;
          break;
        }
      }
      
      if (!addedToGroup) {
        overlappingGroups.push([task]);
      }
    });
    return overlappingGroups;
  };

  return {
    expandedTasks,
    draggedTask,
    hasSubtasks,
    getSubtasks,
    getSubtaskCount,
    toggleTaskExpansion,
    getTaskDurationMinutes,
    isMultiDay,
    getTaskColor,
    handleTaskDrag,
    createDropHandler,
    getOverlappingTasks,
  };
};