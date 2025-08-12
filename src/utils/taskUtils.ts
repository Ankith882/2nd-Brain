import { Task } from '@/types/task';

export const findTaskById = (tasks: Task[], taskId: string): Task | null => {
  for (const task of tasks) {
    if (task.id === taskId) return task;
    if (task.subTasks?.length) {
      const found = findTaskById(task.subTasks, taskId);
      if (found) return found;
    }
  }
  return null;
};

export const updateTaskRecursively = (tasks: Task[], taskId: string, updates: Partial<Task>): Task[] => {
  return tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, ...updates };
    }
    return { ...task, subTasks: updateTaskRecursively(task.subTasks, taskId, updates) };
  });
};

export const deleteTaskRecursively = (tasks: Task[], taskId: string): Task[] => {
  return tasks.filter(task => task.id !== taskId).map(task => ({
    ...task,
    subTasks: deleteTaskRecursively(task.subTasks, taskId)
  }));
};

export const addSubTaskRecursively = (tasks: Task[], parentId: string, newTask: Task): Task[] => {
  return tasks.map(task => {
    if (task.id === parentId) {
      return { 
        ...task, 
        subTasks: [...task.subTasks, newTask],
        isExpanded: true
      };
    }
    return { ...task, subTasks: addSubTaskRecursively(task.subTasks, parentId, newTask) };
  });
};

export const toggleTaskExpandedRecursively = (tasks: Task[], taskId: string): Task[] => {
  return tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, isExpanded: !task.isExpanded };
    }
    return { ...task, subTasks: toggleTaskExpandedRecursively(task.subTasks, taskId) };
  });
};

export const toggleTaskCompleteRecursively = (tasks: Task[], taskId: string): Task[] => {
  return tasks.map(task => {
    if (task.id === taskId) {
      const wasCompleted = task.completed;
      const updatedTask = { ...task, completed: !task.completed };
      
      // Store/restore original column for Kanban
      if (!wasCompleted) {
        updatedTask.originalKanbanColumn = task.originalKanbanColumn || task.kanbanColumn || 'todo';
      }
      
      return updatedTask;
    }
    return { ...task, subTasks: toggleTaskCompleteRecursively(task.subTasks, taskId) };
  });
};

export const getAllTasksRecursively = (tasks: Task[]): Task[] => {
  const allTasks: Task[] = [];
  tasks.forEach(task => {
    allTasks.push(task);
    allTasks.push(...getAllTasksRecursively(task.subTasks));
  });
  return allTasks;
};

export const getSubtaskCount = (task: Task): number => {
  return task.subTasks?.length || 0;
};

export const getTotalSubtaskCount = (task: Task): number => {
  let count = task.subTasks?.length || 0;
  task.subTasks?.forEach(subTask => {
    count += getTotalSubtaskCount(subTask);
  });
  return count;
};

export const generateTaskId = (): string => {
  return Date.now().toString();
};

export const findParentTaskIds = (tasks: Task[], targetTaskId: string, parentIds: string[] = []): string[] => {
  for (const task of tasks) {
    if (task.id === targetTaskId) {
      return parentIds;
    }
    if (task.subTasks?.length) {
      const found = findParentTaskIds(task.subTasks, targetTaskId, [...parentIds, task.id]);
      if (found.length > 0 || found.length === 0 && task.subTasks.some(subTask => subTask.id === targetTaskId)) {
        return task.subTasks.some(subTask => subTask.id === targetTaskId) ? [...parentIds, task.id] : found;
      }
    }
  }
  return [];
};

export const expandParentTasksRecursively = (tasks: Task[], taskId: string): Task[] => {
  const parentIds = findParentTaskIds(tasks, taskId);
  let updatedTasks = tasks;
  
  // Expand all parent tasks
  parentIds.forEach(parentId => {
    updatedTasks = updateTaskRecursively(updatedTasks, parentId, { isExpanded: true });
  });
  
  return updatedTasks;
};