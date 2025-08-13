import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Mission {
  id: string;
  user_id: string;
  workspace_id: string;
  parent_id?: string;
  name: string;
  color: string;
  image_url?: string;
  selected_template: string;
  kanban_config: any;
  created_at: string;
  updated_at: string;
  sub_missions?: Mission[];
}

export const useSupabaseMissions = (workspaceId?: string) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch missions with hierarchical structure
  const fetchMissions = async () => {
    if (!user || !workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Build hierarchical structure
      const missionMap = new Map<string, Mission>();
      const rootMissions: Mission[] = [];

      data?.forEach(mission => {
        missionMap.set(mission.id, { ...mission, sub_missions: [] });
      });

      data?.forEach(mission => {
        const missionObj = missionMap.get(mission.id)!;
        if (mission.parent_id) {
          const parent = missionMap.get(mission.parent_id);
          if (parent) {
            parent.sub_missions!.push(missionObj);
          }
        } else {
          rootMissions.push(missionObj);
        }
      });

      setMissions(rootMissions);
    } catch (error) {
      console.error('Error fetching missions:', error);
      toast.error('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  // Add mission
  const addMission = async (mission: Omit<Mission, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sub_missions'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('missions')
        .insert({
          workspace_id: mission.workspace_id,
          parent_id: mission.parent_id,
          name: mission.name,
          color: mission.color,
          image_url: mission.image_url,
          selected_template: mission.selected_template,
          kanban_config: mission.kanban_config,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchMissions();
      toast.success('Mission created successfully');
      return data;
    } catch (error) {
      console.error('Error adding mission:', error);
      toast.error('Failed to create mission');
    }
  };

  // Update mission
  const updateMission = async (id: string, updates: Partial<Mission>) => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchMissions();
      toast.success('Mission updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating mission:', error);
      toast.error('Failed to update mission');
    }
  };

  // Delete mission (cascades to sub-missions and tasks)
  const deleteMission = async (id: string) => {
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchMissions();
      toast.success('Mission deleted successfully');
    } catch (error) {
      console.error('Error deleting mission:', error);
      toast.error('Failed to delete mission');
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user || !workspaceId) return;

    fetchMissions();

    const channel = supabase
      .channel('missions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'missions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchMissions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, workspaceId]);

  return {
    missions,
    loading,
    addMission,
    updateMission,
    deleteMission,
    refetch: fetchMissions
  };
};