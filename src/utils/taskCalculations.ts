import { Task } from '@/types/task';
import { getAllTasksRecursively } from './taskUtils';

export const getTaskDurationInMinutes = (task: Task): number => {
  if (!task.startTime || !task.endTime) return 0;
  const start = new Date(task.startTime);
  const end = new Date(task.endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

export const calculateProgressForDate = (tasks: Task[], date: Date): number => {
  const dateString = date.toDateString();
  const tasksForDate = tasks.filter(task => 
    task.date.toDateString() === dateString
  );
  
  const allTasksForDate = getAllTasksRecursively(tasksForDate);
  if (allTasksForDate.length === 0) return 0;
  
  const completedTasks = allTasksForDate.filter(task => task.completed);
  return Math.round((completedTasks.length / allTasksForDate.length) * 100);
};

export const getTasksForDate = (tasks: Task[], date: Date, missionId?: string): Task[] => {
  const allTasks = getAllTasksRecursively(tasks);
  
  return allTasks.filter(task => {
    if (missionId && task.missionId !== missionId) return false;
    return task.date.toDateString() === date.toDateString();
  });
};

export const getTasksForDateRange = (tasks: Task[], startDate: Date, endDate: Date, missionId?: string): Task[] => {
  const allTasks = getAllTasksRecursively(tasks);
  
  return allTasks.filter(task => {
    if (missionId && task.missionId !== missionId) return false;
    const taskDate = task.startTime || task.date;
    return taskDate >= startDate && taskDate <= endDate;
  });
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'P1': return 'bg-red-500';
    case 'P2': return 'bg-orange-500';
    case 'P3': return 'bg-yellow-500';
    case 'P4': return 'bg-green-500';
    case 'P5': return 'bg-blue-500';
    case 'P6': return 'bg-purple-500';
    case 'P7': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

export const getTaskBackgroundColor = (task: Task, isSelected: boolean = false): string => {
  const opacity = isSelected ? '40' : '20';
  return `${task.color}${opacity}`;
};