
import { useState } from 'react';
import { CalendarTask } from '@/components/calendar/CalendarTemplate';

// Remove all initial tasks - start with empty array
const initialCalendarTasks: CalendarTask[] = [];

export const useCalendarTasks = () => {
  const [tasks, setTasks] = useState<CalendarTask[]>(initialCalendarTasks);

  const createTask = (taskData: Omit<CalendarTask, 'id' | 'order'>) => {
    const newTask: CalendarTask = {
      ...taskData,
      id: Date.now().toString(),
      order: tasks.length,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<CalendarTask>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  };
};
