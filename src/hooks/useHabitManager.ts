import { useSupabaseHabits, Habit as SupabaseHabit } from './useSupabaseHabits';
import { useWorkspaceManager } from './useWorkspaceManager';

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

const convertSupabaseHabitToHabit = (supabaseHabit: SupabaseHabit): Habit => {
  // Extract completed and missed days from date_status_map
  const completedDays: string[] = [];
  const missedDays: string[] = [];
  
  Object.entries(supabaseHabit.date_status_map || {}).forEach(([date, status]) => {
    if (status === 'completed') completedDays.push(date);
    if (status === 'missed') missedDays.push(date);
  });

  return {
    id: supabaseHabit.id,
    name: supabaseHabit.name,
    color: supabaseHabit.color,
    iconUrl: supabaseHabit.icon_url,
    startDate: new Date(supabaseHabit.start_date),
    workspaceId: supabaseHabit.workspace_id,
    isCompleted: supabaseHabit.status === 'completed',
    completedAt: supabaseHabit.end_date ? new Date(supabaseHabit.end_date) : undefined,
    completedDays,
    missedDays,
    notes: supabaseHabit.notes || {},
    createdAt: new Date(supabaseHabit.created_at)
  };
};

const convertHabitToSupabaseHabit = (habit: Partial<Habit>, workspaceId: string): Partial<SupabaseHabit> => {
  // Build date_status_map from completedDays and missedDays
  const dateStatusMap: Record<string, 'completed' | 'missed' | 'unmarked'> = {};
  
  habit.completedDays?.forEach(date => {
    dateStatusMap[date] = 'completed';
  });
  
  habit.missedDays?.forEach(date => {
    dateStatusMap[date] = 'missed';
  });

  return {
    workspace_id: workspaceId,
    name: habit.name!,
    color: habit.color!,
    status: habit.isCompleted ? 'completed' : 'active',
    start_date: habit.startDate?.toISOString().split('T')[0]!,
    end_date: habit.completedAt?.toISOString().split('T')[0],
    icon_url: habit.iconUrl,
    complete_count: habit.completedDays?.length || 0,
    missed_count: habit.missedDays?.length || 0,
    date_status_map: dateStatusMap,
    notes: habit.notes || {}
  };
};

export const useHabitManager = () => {
  const { selectedWorkspace } = useWorkspaceManager();
  const workspaceId = selectedWorkspace;
  
  const {
    habits: supabaseHabits,
    loading,
    addHabit: addSupabaseHabit,
    updateHabit: updateSupabaseHabit,
    deleteHabit: deleteSupabaseHabit,
    markHabitForDate,
    addNoteForDate
  } = useSupabaseHabits(workspaceId);

  const habits = supabaseHabits.map(convertSupabaseHabitToHabit);

  const addHabit = async (habitData: Omit<Habit, 'id' | 'isCompleted' | 'completedDays' | 'missedDays' | 'notes' | 'createdAt'>) => {
    if (!workspaceId) return null;
    
    const supabaseHabitData = convertHabitToSupabaseHabit({
      ...habitData,
      isCompleted: false,
      completedDays: [],
      missedDays: [],
      notes: {}
    }, workspaceId);
    
    const result = await addSupabaseHabit({
      workspace_id: workspaceId,
      name: supabaseHabitData.name!,
      color: supabaseHabitData.color!,
      status: supabaseHabitData.status!,
      start_date: supabaseHabitData.start_date!,
      end_date: supabaseHabitData.end_date,
      icon_url: supabaseHabitData.icon_url,
      complete_count: supabaseHabitData.complete_count!,
      missed_count: supabaseHabitData.missed_count!,
      date_status_map: supabaseHabitData.date_status_map!,
      notes: supabaseHabitData.notes!
    });
    return result ? convertSupabaseHabitToHabit(result as SupabaseHabit) : null;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const supabaseUpdates: Partial<SupabaseHabit> = {};
    
    if (updates.name) supabaseUpdates.name = updates.name;
    if (updates.color) supabaseUpdates.color = updates.color;
    if (updates.iconUrl !== undefined) supabaseUpdates.icon_url = updates.iconUrl;
    if (updates.isCompleted !== undefined) supabaseUpdates.status = updates.isCompleted ? 'completed' : 'active';
    if (updates.startDate) supabaseUpdates.start_date = updates.startDate.toISOString().split('T')[0];
    if (updates.completedAt) supabaseUpdates.end_date = updates.completedAt.toISOString().split('T')[0];
    
    await updateSupabaseHabit(id, supabaseUpdates);
  };

  const deleteHabit = async (id: string) => {
    await deleteSupabaseHabit(id);
  };

  const deleteHabitsByWorkspaceId = (workspaceId: string) => {
    const habitsToDelete = habits.filter(habit => habit.workspaceId === workspaceId);
    habitsToDelete.forEach(habit => deleteSupabaseHabit(habit.id));
  };

  const markHabitCompleted = async (id: string) => {
    await updateHabit(id, { isCompleted: true, completedAt: new Date() });
  };

  const markHabitIncomplete = async (id: string) => {
    await updateHabit(id, { isCompleted: false, completedAt: undefined });
  };

  const updateHabitDay = async (habitId: string, date: string, status: 'completed' | 'missed' | null) => {
    const supabaseStatus = status === null ? 'unmarked' : status;
    await markHabitForDate(habitId, date, supabaseStatus);
  };

  const addHabitNote = async (habitId: string, date: string, note: string) => {
    await addNoteForDate(habitId, date, note);
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
    getMonthStats,
    loading
  };
};