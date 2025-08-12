import { useMemo } from 'react';
import { Task, TaskTemplate } from '@/types/task';
import { getAllTasksRecursively } from '@/utils/taskUtils';

export interface UseTaskFiltersProps {
  tasks: Task[];
  selectedDate: Date;
  missionId: string;
  template: TaskTemplate;
}

export const useTaskFilters = ({
  tasks,
  selectedDate,
  missionId,
  template
}: UseTaskFiltersProps) => {
  
  const getTasksForDate = useMemo(() => {
    return (date: Date) => {
      const allTasks = getAllTasksRecursively(tasks);
      
      return allTasks.filter(task => {
        if (task.missionId !== missionId) return false;
        
        let dateToCheck: Date;
        
        // Template-based date logic
        if (template === 'timeline' || template === 'calendar') {
          dateToCheck = task.startTime || task.date;
        } else {
          dateToCheck = task.date;
        }
        
        return dateToCheck.toDateString() === date.toDateString();
      });
    };
  }, [tasks, missionId, template]);

  const regularTasks = useMemo(() => {
    return tasks.filter(task => 
      task.missionId === missionId &&
      task.date.toDateString() === selectedDate.toDateString() &&
      !task.parentId
    );
  }, [tasks, missionId, selectedDate]);

  const allMissionTasks = useMemo(() => {
    return tasks.filter(task => 
      task.missionId === missionId &&
      !task.parentId
    );
  }, [tasks, missionId]);

  const filteredTasks = useMemo(() => {
    // For calendar and timeline templates, show all tasks regardless of selected date
    if (template === 'calendar' || template === 'timeline') {
      return allMissionTasks;
    }
    return regularTasks;
  }, [template, allMissionTasks, regularTasks]);

  const completedTasks = useMemo(() => {
    return getAllTasksRecursively(filteredTasks).filter(task => task.completed);
  }, [filteredTasks]);

  const pendingTasks = useMemo(() => {
    return getAllTasksRecursively(filteredTasks).filter(task => !task.completed);
  }, [filteredTasks]);

  const tasksByPriority = useMemo(() => {
    const allTasks = getAllTasksRecursively(filteredTasks);
    return allTasks.reduce((acc, task) => {
      const priority = task.priority || 'P7';
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [filteredTasks]);

  return {
    filteredTasks,
    regularTasks,
    allMissionTasks,
    completedTasks,
    pendingTasks,
    tasksByPriority,
    getTasksForDate
  };
};