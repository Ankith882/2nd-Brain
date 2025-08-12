import { useState, useEffect } from 'react';

export interface Habit {
  id: string;
  name: string;
  color: string;
  iconUrl?: string;
  startDate: Date;
  workspaceId: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedDays: string[]; // Array of date strings in YYYY-MM-DD format
  missedDays: string[]; // Array of date strings in YYYY-MM-DD format
  notes: { [date: string]: string }; // Notes for specific dates
  createdAt: Date;
}

export interface HabitEntry {
  date: string; // YYYY-MM-DD format
  status: 'completed' | 'missed' | 'pending';
  note?: string;
}

export const useHabitManager = () => {
  const [habits, setHabits] = useState<Habit[]>([]);

  // Load habits from localStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      try {
        const parsedHabits = JSON.parse(savedHabits).map((habit: any) => ({
          ...habit,
          startDate: new Date(habit.startDate),
          completedAt: habit.completedAt ? new Date(habit.completedAt) : undefined,
          createdAt: new Date(habit.createdAt)
        }));
        setHabits(parsedHabits);
      } catch (error) {
        console.error('Error loading habits:', error);
      }
    }
  }, []);

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const addHabit = (habitData: Omit<Habit, 'id' | 'isCompleted' | 'completedDays' | 'missedDays' | 'notes' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      isCompleted: false,
      completedDays: [],
      missedDays: [],
      notes: {},
      createdAt: new Date()
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id ? { ...habit, ...updates } : habit
    ));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const deleteHabitsByWorkspaceId = (workspaceId: string) => {
    setHabits(prev => prev.filter(habit => habit.workspaceId !== workspaceId));
  };

  const markHabitCompleted = (id: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id 
        ? { ...habit, isCompleted: true, completedAt: new Date() }
        : habit
    ));
  };

  const markHabitIncomplete = (id: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id 
        ? { ...habit, isCompleted: false, completedAt: undefined }
        : habit
    ));
  };

  const updateHabitDay = (habitId: string, date: string, status: 'completed' | 'missed' | null) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id !== habitId) return habit;

      const updatedHabit = { ...habit };
      
      // Remove date from both arrays first
      updatedHabit.completedDays = habit.completedDays.filter(d => d !== date);
      updatedHabit.missedDays = habit.missedDays.filter(d => d !== date);

      // Add to appropriate array based on status
      if (status === 'completed') {
        updatedHabit.completedDays.push(date);
      } else if (status === 'missed') {
        updatedHabit.missedDays.push(date);
      }

      return updatedHabit;
    }));
  };

  const addHabitNote = (habitId: string, date: string, note: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id !== habitId) return habit;
      
      const updatedNotes = { ...habit.notes };
      if (note.trim()) {
        updatedNotes[date] = note.trim();
      } else {
        delete updatedNotes[date];
      }
      
      return { ...habit, notes: updatedNotes };
    }));
  };

  const getHabitsByWorkspace = (workspaceId: string) => {
    return habits.filter(habit => habit.workspaceId === workspaceId);
  };

  const getActiveHabitsByWorkspace = (workspaceId: string) => {
    return habits.filter(habit => habit.workspaceId === workspaceId && !habit.isCompleted);
  };

  const getCompletedHabitsByWorkspace = (workspaceId: string) => {
    return habits.filter(habit => habit.workspaceId === workspaceId && habit.isCompleted);
  };

  const getHabitDayStatus = (habitId: string, date: string): 'completed' | 'missed' | null => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return null;

    if (habit.completedDays.includes(date)) return 'completed';
    if (habit.missedDays.includes(date)) return 'missed';
    return null;
  };

  const getMonthStats = (habitId: string, year: number, month: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return { completed: 0, missed: 0 };

    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    const completed = habit.completedDays.filter(date => date.startsWith(monthStr)).length;
    const missed = habit.missedDays.filter(date => date.startsWith(monthStr)).length;

    return { completed, missed };
  };

  return {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    deleteHabitsByWorkspaceId,
    markHabitCompleted,
    markHabitIncomplete,
    updateHabitDay,
    addHabitNote,
    getHabitsByWorkspace,
    getActiveHabitsByWorkspace,
    getCompletedHabitsByWorkspace,
    getHabitDayStatus,
    getMonthStats
  };
};