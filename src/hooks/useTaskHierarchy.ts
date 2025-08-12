import { useState, useMemo } from 'react';
import { CalendarTask } from '@/components/calendar/CalendarTemplate';

export const useTaskHierarchy = (tasks: CalendarTask[]) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const taskMap = useMemo(() => {
    const map = new Map<string, CalendarTask>();
    tasks.forEach(task => map.set(task.id, task));
    return map;
  }, [tasks]);

  const rootTasks = useMemo(() => {
    return tasks.filter(task => !task.parentId);
  }, [tasks]);

  const getSubtasks = (parentId: string): CalendarTask[] => {
    return tasks.filter(task => task.parentId === parentId);
  };

  const hasSubtasks = (taskId: string): boolean => {
    return tasks.some(task => task.parentId === taskId);
  };

  const getSubtaskCount = (taskId: string): number => {
    return tasks.filter(task => task.parentId === taskId).length;
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

  const isExpanded = (taskId: string): boolean => {
    return expandedTasks.has(taskId);
  };

  const getAllSubtaskIds = (parentId: string): string[] => {
    const result: string[] = [];
    const stack = [parentId];
    
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const subtasks = getSubtasks(currentId);
      
      subtasks.forEach(subtask => {
        result.push(subtask.id);
        stack.push(subtask.id);
      });
    }
    
    return result;
  };

  const organizeTasksHierarchy = (taskList: CalendarTask[]) => {
    const taskMap = new Map<string, CalendarTask>();
    const roots: CalendarTask[] = [];
    
    taskList.forEach(task => taskMap.set(task.id, task));
    
    taskList.forEach(task => {
      if (!task.parentId) {
        roots.push(task);
      }
    });
    
    return roots;
  };

  return {
    expandedTasks,
    rootTasks,
    taskMap,
    getSubtasks,
    hasSubtasks,
    getSubtaskCount,
    toggleTaskExpansion,
    isExpanded,
    getAllSubtaskIds,
    organizeTasksHierarchy
  };
};