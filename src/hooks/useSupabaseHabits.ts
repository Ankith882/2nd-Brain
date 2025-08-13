import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Habit {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  color: string;
  status: 'active' | 'completed';
  start_date: string;
  end_date?: string;
  icon_url?: string;
  complete_count: number;
  missed_count: number;
  date_status_map: Record<string, 'completed' | 'missed' | 'unmarked'>;
  notes: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const useSupabaseHabits = (workspaceId?: string) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch habits
  const fetchHabits = async () => {
    if (!user || !workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits((data || []) as Habit[]);
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  // Add habit
  const addHabit = async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          workspace_id: habit.workspace_id,
          name: habit.name,
          color: habit.color,
          status: habit.status,
          start_date: habit.start_date,
          end_date: habit.end_date,
          icon_url: habit.icon_url,
          complete_count: habit.complete_count,
          missed_count: habit.missed_count,
          date_status_map: habit.date_status_map,
          notes: habit.notes,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchHabits();
      toast.success('Habit created successfully');
      return data;
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Failed to create habit');
    }
  };

  // Update habit
  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchHabits();
      return data;
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error('Failed to update habit');
    }
  };

  // Delete habit
  const deleteHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchHabits();
      toast.success('Habit deleted successfully');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  // Mark habit for date
  const markHabitForDate = async (habitId: string, date: string, status: 'completed' | 'missed' | 'unmarked') => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const updatedDateStatusMap = { ...habit.date_status_map };
      const oldStatus = updatedDateStatusMap[date];

      // Update the status
      if (status === 'unmarked') {
        delete updatedDateStatusMap[date];
      } else {
        updatedDateStatusMap[date] = status;
      }

      // Update counts
      let completeCount = habit.complete_count;
      let missedCount = habit.missed_count;

      // Remove old status count
      if (oldStatus === 'completed') completeCount--;
      if (oldStatus === 'missed') missedCount--;

      // Add new status count
      if (status === 'completed') completeCount++;
      if (status === 'missed') missedCount++;

      await updateHabit(habitId, {
        date_status_map: updatedDateStatusMap,
        complete_count: completeCount,
        missed_count: missedCount
      });
    } catch (error) {
      console.error('Error marking habit:', error);
      toast.error('Failed to update habit status');
    }
  };

  // Add note for date
  const addNoteForDate = async (habitId: string, date: string, note: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const updatedNotes = { ...habit.notes };
      if (note.trim()) {
        updatedNotes[date] = note;
      } else {
        delete updatedNotes[date];
      }

      await updateHabit(habitId, { notes: updatedNotes });
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user || !workspaceId) return;

    fetchHabits();

    const channel = supabase
      .channel('habits-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habits',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchHabits();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, workspaceId]);

  return {
    habits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    markHabitForDate,
    addNoteForDate,
    refetch: fetchHabits
  };
};