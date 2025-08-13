import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  color: string;
  image_url?: string;
  is_selected: boolean;
  created_at: string;
  updated_at: string;
}

export const useSupabaseWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch workspaces
  const fetchWorkspaces = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWorkspaces(data || []);
      
      // Set selected workspace
      const selected = data?.find(w => w.is_selected);
      setSelectedWorkspace(selected || data?.[0] || null);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  // Add workspace
  const addWorkspace = async (workspace: Omit<Workspace, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: workspace.name,
          color: workspace.color,
          image_url: workspace.image_url,
          is_selected: workspace.is_selected,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setWorkspaces(prev => [data, ...prev]);
      toast.success('Workspace created successfully');
      return data;
    } catch (error) {
      console.error('Error adding workspace:', error);
      toast.error('Failed to create workspace');
    }
  };

  // Update workspace
  const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWorkspaces(prev => prev.map(w => w.id === id ? data : w));
      if (selectedWorkspace?.id === id) {
        setSelectedWorkspace(data);
      }
      toast.success('Workspace updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast.error('Failed to update workspace');
    }
  };

  // Delete workspace
  const deleteWorkspace = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkspaces(prev => prev.filter(w => w.id !== id));
      
      if (selectedWorkspace?.id === id) {
        const remaining = workspaces.filter(w => w.id !== id);
        setSelectedWorkspace(remaining[0] || null);
      }
      
      toast.success('Workspace deleted successfully');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast.error('Failed to delete workspace');
    }
  };

  // Select workspace
  const selectWorkspace = async (id: string) => {
    try {
      // Unselect all workspaces first
      await supabase
        .from('workspaces')
        .update({ is_selected: false })
        .eq('user_id', user?.id);

      // Select the chosen workspace
      const { data, error } = await supabase
        .from('workspaces')
        .update({ is_selected: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSelectedWorkspace(data);
      setWorkspaces(prev => prev.map(w => ({
        ...w,
        is_selected: w.id === id
      })));
    } catch (error) {
      console.error('Error selecting workspace:', error);
      toast.error('Failed to select workspace');
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchWorkspaces();

    const channel = supabase
      .channel('workspaces-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspaces',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchWorkspaces();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    workspaces,
    selectedWorkspace,
    loading,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    refetch: fetchWorkspaces
  };
};