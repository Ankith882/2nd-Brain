import { useMemo } from 'react';
import { Task } from '@/types/task';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

export interface TaskWithLevel extends Task {
  level: number;
}

export interface WeekSegmentTask extends Task {
  isWeekSegment?: boolean;
  originalStartTime?: Date | string;
  originalEndTime?: Date | string;
  weekNumber?: number;
  totalWeeks?: number;
  isLastWeekSegment?: boolean;
  weekSegmentId?: string;
}

export interface TaskBlock {
  task: WeekSegmentTask;
  left: number;
  width: number;
  dayIndex: number;
  top: number;
  height: number;
  isCurrentWeekPart?: boolean;
  originalTask?: Task;
  spannedDays?: number;
  endDayIndex?: number;
}

export const useTimelineCalculations = (
  tasks: Task[],
  currentWeekStart: Date,
  isZoomedIn: boolean
) => {
  const HOUR_WIDTH = isZoomedIn ? 240 : 40;
  const MINUTE_WIDTH = isZoomedIn ? 4 : 0;
  const DAY_WIDTH = HOUR_WIDTH * 24;
  const TASK_HEIGHT = 60;
  const TASK_SPACING = 8;

  const weekDates = useMemo(() => 
    eachDayOfInterval({
      start: currentWeekStart,
      end: endOfWeek(currentWeekStart, { weekStartsOn: 0 })
    }),
    [currentWeekStart]
  );

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

  const getTaskDurationInMinutes = (task: Task): number => {
    if (!task.startTime || !task.endTime) return 0;
    const start = new Date(task.startTime);
    const end = new Date(task.endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  const getVisibleTasks = (allTasks: Task[]): TaskWithLevel[] => {
    const rootTasks = allTasks.filter(task => !task.parentId);
    return rootTasks.map(task => ({ ...task, level: 0 }));
  };

  const splitMultiWeekTasks = (task: Task): WeekSegmentTask[] => {
    if (!task.startTime || !task.endTime) return [task];
    
    const startDate = new Date(task.startTime);
    const endDate = new Date(task.endTime);
    const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });

    if (endDate < currentWeekStart || startDate > currentWeekEnd) {
      return [];
    }

    const startsBeforeWeek = startDate < currentWeekStart;
    const endsAfterWeek = endDate > currentWeekEnd;
    
    // Check if task spans across week boundaries regardless of duration
    const spansAcrossWeeks = startsBeforeWeek || endsAfterWeek;
    
    // Check if task spans multiple calendar days (even if less than 24 hours)
    const startDay = startDate.toDateString();
    const endDay = endDate.toDateString();
    const isMultiDay = startDay !== endDay;
    
    // Task needs splitting if it spans across weeks OR spans multiple days within current week
    const needsSplitting = spansAcrossWeeks || (isMultiDay && !spansAcrossWeeks);
    
    if (!needsSplitting) {
      return [task];
    }

    const clampedStartTime = startsBeforeWeek 
      ? new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate(), 0, 0, 0) 
      : startDate;
    const clampedEndTime = endsAfterWeek 
      ? new Date(currentWeekEnd.getFullYear(), currentWeekEnd.getMonth(), currentWeekEnd.getDate(), 23, 59, 59) 
      : endDate;

    const totalWeeksSpanned = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const isMultiWeek = totalWeeksSpanned > 1 || spansAcrossWeeks;
    const weekNumber = Math.floor((currentWeekStart.getTime() - startOfWeek(startDate, { weekStartsOn: 0 }).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    const isLastWeekSegment = (!endsAfterWeek && isMultiWeek) || (spansAcrossWeeks && !endsAfterWeek);
    
    return [{
      ...task,
      startTime: clampedStartTime,
      endTime: clampedEndTime,
      isWeekSegment: isMultiWeek,
      originalStartTime: task.startTime,
      originalEndTime: task.endTime,
      weekNumber,
      totalWeeks: totalWeeksSpanned,
      isLastWeekSegment,
      weekSegmentId: isMultiWeek ? `${task.id}_week_${currentWeekStart.getTime()}` : task.id
    } as WeekSegmentTask];
  };

  const calculateTaskBlocks = useMemo((): TaskBlock[] => {
    const visibleTasks = getVisibleTasks(tasks);
    const allBlocks: TaskBlock[] = [];
    
    visibleTasks.forEach(task => {
      if (!task.startTime || !task.endTime) return;

      const taskParts = splitMultiWeekTasks(task);
      taskParts.forEach(taskPart => {
        const startDate = new Date(taskPart.startTime!);
        const endDate = new Date(taskPart.endTime!);

        const taskStartInWeek = startDate >= currentWeekStart ? startDate : currentWeekStart;
        const taskEndInWeek = endDate <= endOfWeek(currentWeekStart, { weekStartsOn: 0 }) ? endDate : endOfWeek(currentWeekStart, { weekStartsOn: 0 });
        const dayIndex = weekDates.findIndex(date => isSameDay(date, taskStartInWeek));
        if (dayIndex === -1) return;

        const endDayIndex = weekDates.findIndex(date => isSameDay(date, taskEndInWeek));
        const spannedDays = endDayIndex >= dayIndex ? endDayIndex - dayIndex + 1 : 1;

        let left, width;
        if (isZoomedIn) {
          const startMinutes = taskStartInWeek.getHours() * 60 + taskStartInWeek.getMinutes();
          const endMinutes = taskEndInWeek.getHours() * 60 + taskEndInWeek.getMinutes();
          const daysDiff = Math.floor((taskEndInWeek.getTime() - taskStartInWeek.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 0) {
            left = startMinutes * MINUTE_WIDTH;
            width = (endMinutes - startMinutes) * MINUTE_WIDTH;
          } else {
            left = startMinutes * MINUTE_WIDTH;
            width = (1440 - startMinutes + (daysDiff - 1) * 1440 + endMinutes) * MINUTE_WIDTH;
          }
        } else {
          const startHour = taskStartInWeek.getHours() + taskStartInWeek.getMinutes() / 60;
          const endHour = taskEndInWeek.getHours() + taskEndInWeek.getMinutes() / 60;
          const daysDiff = Math.floor((taskEndInWeek.getTime() - taskStartInWeek.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 0) {
            left = startHour * HOUR_WIDTH;
            width = Math.max((endHour - startHour) * HOUR_WIDTH, 120);
          } else {
            left = startHour * HOUR_WIDTH;
            const totalHours = 24 - startHour + (daysDiff - 1) * 24 + endHour;
            width = Math.max(totalHours * HOUR_WIDTH, 120);
          }
        }

        allBlocks.push({
          task: taskPart,
          left,
          width,
          dayIndex,
          top: 0,
          height: TASK_HEIGHT,
          isCurrentWeekPart: taskPart.id.includes('_week_'),
          originalTask: task,
          spannedDays,
          endDayIndex: endDayIndex >= 0 ? endDayIndex : dayIndex
        });
      });
    });

    // Sort blocks by priority
    allBlocks.sort((a, b) => {
      const aDuration = getTaskDurationInMinutes(a.task);
      const bDuration = getTaskDurationInMinutes(b.task);
      const aIsMultiDay = (a.endDayIndex || a.dayIndex) > a.dayIndex;
      const bIsMultiDay = (b.endDayIndex || b.dayIndex) > b.dayIndex;
      
      if (aIsMultiDay !== bIsMultiDay) return aIsMultiDay ? 1 : -1;
      if (aDuration !== bDuration) return aDuration - bDuration;
      
      const aStart = new Date(a.task.startTime!).getTime();
      const bStart = new Date(b.task.startTime!).getTime();
      return aStart - bStart;
    });

    // Assign positions with global overlap detection
    const globalLanes: { 
      startTime: number; 
      endTime: number; 
      startDay: number; 
      endDay: number; 
      top: number;
    }[] = [];

    allBlocks.forEach((block) => {
      const taskStartTime = new Date(block.task.startTime!).getTime();
      const taskEndTime = new Date(block.task.endTime!).getTime();
      const taskStartDay = block.dayIndex;
      const taskEndDay = block.endDayIndex || block.dayIndex;
      
      let assignedLane = -1;
      for (let i = 0; i < globalLanes.length; i++) {
        const lane = globalLanes[i];
        const timeOverlap = !(taskEndTime <= lane.startTime || taskStartTime >= lane.endTime);
        const dayOverlap = !(taskEndDay < lane.startDay || taskStartDay > lane.endDay);
        
        // Only assign to this lane if there's NO overlap in both time AND day
        if (!timeOverlap && !dayOverlap) {
          assignedLane = i;
          break;
        }
      }
      
      if (assignedLane === -1) {
        assignedLane = globalLanes.length;
      }
      
      if (assignedLane >= globalLanes.length) {
        globalLanes.push({
          startTime: taskStartTime,
          endTime: taskEndTime,
          startDay: taskStartDay,
          endDay: taskEndDay,
          top: 8 + assignedLane * (TASK_HEIGHT + TASK_SPACING)
        });
      } else {
        const lane = globalLanes[assignedLane];
        lane.startTime = Math.min(lane.startTime, taskStartTime);
        lane.endTime = Math.max(lane.endTime, taskEndTime);
        lane.startDay = Math.min(lane.startDay, taskStartDay);
        lane.endDay = Math.max(lane.endDay, taskEndDay);
      }
      
      block.top = globalLanes[assignedLane].top;
    });

    return allBlocks;
  }, [tasks, currentWeekStart, isZoomedIn, weekDates]);

  return {
    weekDates,
    taskBlocks: calculateTaskBlocks,
    findTaskById,
    getTaskDurationInMinutes,
    DAY_WIDTH,
    HOUR_WIDTH,
    MINUTE_WIDTH,
    TASK_HEIGHT,
    TASK_SPACING
  };
};