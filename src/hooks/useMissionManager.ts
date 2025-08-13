import { useState } from 'react';
import { useSupabaseMissions, Mission as SupabaseMission } from './useSupabaseMissions';
import { useWorkspaceManager } from './useWorkspaceManager';

export interface Mission {
  id: string;
  name: string;
  color: string;
  iconUrl: string;
  template: 'notes' | 'task' | 'kanban' | 'timeline' | 'calendar' | 'matrix';
  workspaceId: string;
  taskCount: number;
  createdAt: Date;
  parentId?: string;
  subMissions: Mission[];
  isExpanded: boolean;
  order: number;
}

const convertSupabaseMissionToMission = (supabaseMission: SupabaseMission): Mission => {
  return {
    id: supabaseMission.id,
    name: supabaseMission.name,
    color: supabaseMission.color,
    iconUrl: supabaseMission.image_url || '',
    template: (supabaseMission.selected_template as any) || 'kanban',
    workspaceId: supabaseMission.workspace_id,
    taskCount: 0, // Will be calculated from tasks
    createdAt: new Date(supabaseMission.created_at),
    parentId: supabaseMission.parent_id,
    subMissions: supabaseMission.sub_missions?.map(convertSupabaseMissionToMission) || [],
    isExpanded: true,
    order: 0
  };
};

const convertMissionToSupabaseMission = (mission: Partial<Mission>, workspaceId: string): Partial<SupabaseMission> => {
  return {
    workspace_id: workspaceId,
    parent_id: mission.parentId,
    name: mission.name!,
    color: mission.color!,
    image_url: mission.iconUrl,
    selected_template: mission.template || 'kanban',
    kanban_config: {
      rows: [],
      columns: [
        { id: "todo", title: "To Do" },
        { id: "in-progress", title: "In Progress" },
        { id: "completed", title: "Completed" }
      ]
    }
  };
};

export const useMissionManager = () => {
  const { selectedWorkspace } = useWorkspaceManager();
  const workspaceId = typeof selectedWorkspace === 'string' ? selectedWorkspace : selectedWorkspace?.id;
  
  const {
    missions: supabaseMissions,
    loading,
    addMission: addSupabaseMission,
    updateMission: updateSupabaseMission,
    deleteMission: deleteSupabaseMission
  } = useSupabaseMissions(workspaceId);

  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const missions = supabaseMissions.map(convertSupabaseMissionToMission);

  const addMission = async (mission: Omit<Mission, 'id' | 'createdAt' | 'taskCount' | 'subMissions' | 'isExpanded' | 'order'>) => {
    if (!workspaceId) return;
    
    const supabaseMissionData = convertMissionToSupabaseMission(mission, workspaceId);
    await addSupabaseMission({
      workspace_id: workspaceId,
      parent_id: supabaseMissionData.parent_id,
      name: supabaseMissionData.name!,
      color: supabaseMissionData.color!,
      image_url: supabaseMissionData.image_url,
      selected_template: supabaseMissionData.selected_template!,
      kanban_config: supabaseMissionData.kanban_config
    });
  };

  const addSubMission = async (parentId: string, mission: Omit<Mission, 'id' | 'createdAt' | 'taskCount' | 'subMissions' | 'isExpanded' | 'order' | 'parentId'>) => {
    if (!workspaceId) return;
    
    const supabaseMissionData = convertMissionToSupabaseMission({ ...mission, parentId }, workspaceId);
    await addSupabaseMission({
      workspace_id: workspaceId,
      parent_id: parentId,
      name: supabaseMissionData.name!,
      color: supabaseMissionData.color!,
      image_url: supabaseMissionData.image_url,
      selected_template: supabaseMissionData.selected_template!,
      kanban_config: supabaseMissionData.kanban_config
    });
  };

  const updateMission = async (id: string, updates: Partial<Mission>) => {
    const supabaseUpdates: Partial<SupabaseMission> = {};
    
    if (updates.name) supabaseUpdates.name = updates.name;
    if (updates.color) supabaseUpdates.color = updates.color;
    if (updates.iconUrl !== undefined) supabaseUpdates.image_url = updates.iconUrl;
    if (updates.template) supabaseUpdates.selected_template = updates.template;
    
    await updateSupabaseMission(id, supabaseUpdates);
    
    // Update selectedMission if it's the one being updated
    if (selectedMission?.id === id) {
      setSelectedMission(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const toggleMissionExpanded = (id: string) => {
    // This is just UI state, no need to persist to database
    const mission = findMissionById(id);
    if (mission) {
      updateMission(id, { isExpanded: !mission.isExpanded });
    }
  };

  const findMissionById = (id: string): Mission | null => {
    for (const mission of missions) {
      if (mission.id === id) return mission;
      const found = findMissionInTree(mission, id);
      if (found) return found;
    }
    return null;
  };

  const findMissionInTree = (mission: Mission, id: string): Mission | null => {
    for (const subMission of mission.subMissions) {
      if (subMission.id === id) return subMission;
      const found = findMissionInTree(subMission, id);
      if (found) return found;
    }
    return null;
  };

  const getMissionsByWorkspace = (workspaceId: string) => {
    return missions.filter(mission => mission.workspaceId === workspaceId && !mission.parentId);
  };

  // Helper function to get all mission IDs that will be deleted (including sub-missions)
  const getAllMissionIds = (missionId: string): string[] => {
    const mission = findMissionById(missionId);
    if (!mission) return [missionId];
    
    const getAllSubMissionIds = (mission: Mission): string[] => {
      let ids = [mission.id];
      for (const subMission of mission.subMissions) {
        ids = ids.concat(getAllSubMissionIds(subMission));
      }
      return ids;
    };
    
    return getAllSubMissionIds(mission);
  };

  const deleteMission = async (id: string, onDeleteTasks?: (missionIds: string[]) => void) => {
    // Get all mission IDs that will be deleted
    const missionIdsToDelete = getAllMissionIds(id);
    
    // Delete all tasks associated with these missions
    if (onDeleteTasks) {
      onDeleteTasks(missionIdsToDelete);
    }
    
    await deleteSupabaseMission(id);
    
    if (selectedMission?.id === id) {
      setSelectedMission(null);
    }
  };

  const deleteMissionsByWorkspaceId = (workspaceId: string) => {
    const missionsToDelete = missions.filter(mission => mission.workspaceId === workspaceId);
    const missionIdsToDelete = missionsToDelete.flatMap(mission => getAllMissionIds(mission.id));
    
    // Delete each mission individually (cascade will handle sub-missions)
    missionsToDelete.forEach(mission => deleteSupabaseMission(mission.id));
    
    if (selectedMission && missionsToDelete.some(mission => mission.id === selectedMission.id)) {
      setSelectedMission(null);
    }
    
    return missionIdsToDelete;
  };

  const reorderMissions = (workspaceId: string, newOrder: Mission[]) => {
    // For now, this is just UI state - could be enhanced to persist order to database
    console.log('Reorder missions not yet implemented for Supabase');
  };

  return {
    missions,
    selectedMission,
    setSelectedMission,
    addMission,
    addSubMission,
    updateMission,
    toggleMissionExpanded,
    findMissionById,
    getMissionsByWorkspace,
    deleteMission,
    deleteMissionsByWorkspaceId,
    reorderMissions,
    loading
  };
};