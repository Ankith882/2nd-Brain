import { useMemo, useState } from 'react';
import { CalendarTask } from '@/components/calendar/CalendarTemplate';
import { 
  getTasksForDay, 
  getUnscheduledTasksForDay, 
  calculateOverlappingTasks,
  getWeekStart,
  getMonthStart,
  generateWeekDays,
  generateMonthDays,
  generateHours
} from '@/utils/calendarUtils';
import { useTaskHierarchy } from './useTaskHierarchy';

export type CalendarViewType = 'day' | 'week' | 'month';

interface UseCalendarLogicProps {
  tasks: CalendarTask[];
  unscheduledTasks?: CalendarTask[];
  currentDate: Date;
  currentView?: CalendarViewType;
}

export const useCalendarLogic = ({ 
  tasks, 
  unscheduledTasks = [], 
  currentDate,
  currentView = 'week'
}: UseCalendarLogicProps) => {
  const [draggedTask, setDraggedTask] = useState<CalendarTask | null>(null);
  
  const hierarchy = useTaskHierarchy(tasks);
  
  // Generate time periods
  const hours = useMemo(() => generateHours(), []);
  
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekDays = useMemo(() => generateWeekDays(weekStart), [weekStart]);
  
  const monthStart = useMemo(() => getMonthStart(currentDate), [currentDate]);
  const monthDays = useMemo(() => generateMonthDays(monthStart), [monthStart]);
  
  // Day view specific logic
  const dayTasks = useMemo(() => getTasksForDay(tasks, currentDate), [tasks, currentDate]);
  const dayUnscheduledTasks = useMemo(() => 
    getUnscheduledTasksForDay(unscheduledTasks, currentDate), 
    [unscheduledTasks, currentDate]
  );
  
  // Calculate overlapping tasks for current day
  const dayOverlappingGroups = useMemo(() => {
    const rootTasks = hierarchy.organizeTasksHierarchy(dayTasks);
    return calculateOverlappingTasks(rootTasks);
  }, [dayTasks, hierarchy]);
  
  // Week view logic
  const weekTasksByDay = useMemo(() => {
    return weekDays.map(day => ({
      day,
      tasks: getTasksForDay(tasks, day).filter(task => !task.parentId),
      overlappingGroups: calculateOverlappingTasks(
        getTasksForDay(tasks, day).filter(task => !task.parentId)
      )
    }));
  }, [weekDays, tasks]);
  
  // Month view logic
  const monthTasksByDay = useMemo(() => {
    return monthDays.map(day => ({
      day,
      tasks: getTasksForDay(tasks, day).filter(task => !task.parentId),
      visibleTasks: getTasksForDay(tasks, day).filter(task => !task.parentId).slice(0, 4),
      moreCount: Math.max(0, getTasksForDay(tasks, day).filter(task => !task.parentId).length - 4)
    }));
  }, [monthDays, tasks]);
  
  // Drag and drop logic
  const handleTaskDragStart = (task: CalendarTask, event: React.DragEvent) => {
    setDraggedTask(task);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', task.id);
  };
  
  const handleDrop = (
    targetDate: Date, 
    hour?: number, 
    minute?: number, 
    onTaskUpdate?: (taskId: string, updates: Partial<CalendarTask>) => void
  ) => {
    return (event: React.DragEvent) => {
      event.preventDefault();
      if (draggedTask && onTaskUpdate) {
        const duration = draggedTask.endTime.getTime() - draggedTask.startTime.getTime();
        const newStartTime = new Date(targetDate);
        
        if (hour !== undefined && minute !== undefined) {
          newStartTime.setHours(hour, minute, 0, 0);
        } else {
          newStartTime.setHours(draggedTask.startTime.getHours(), draggedTask.startTime.getMinutes(), 0, 0);
        }
        
        const newEndTime = new Date(newStartTime.getTime() + duration);
        
        // Validate subtask constraints
        if (draggedTask.parentId) {
          const parentTask = tasks.find(t => t.id === draggedTask.parentId);
          if (parentTask) {
            if (newStartTime < parentTask.startTime || newEndTime > parentTask.endTime) {
              alert('Subtask time must be within parent task time range');
              return;
            }
          }
        }
        
        onTaskUpdate(draggedTask.id, {
          startTime: newStartTime,
          endTime: newEndTime
        });
        setDraggedTask(null);
      }
    };
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  
  return {
    // Time periods
    hours,
    weekDays,
    monthDays,
    
    // Task data
    dayTasks,
    dayUnscheduledTasks,
    dayOverlappingGroups,
    weekTasksByDay,
    monthTasksByDay,
    
    // Hierarchy management
    ...hierarchy,
    
    // Drag and drop
    draggedTask,
    handleTaskDragStart,
    handleDrop,
    handleDragOver
  };
};