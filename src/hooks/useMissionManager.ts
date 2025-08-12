import { useState } from 'react';
import { CalendarTask } from '@/components/calendar/CalendarTemplate';
import { addDays, endOfWeek, endOfMonth, endOfYear, eachDayOfInterval, isSameDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';


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

const initialMissions: Mission[] = [];


export const useMissionManager = () => {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const addMission = (mission: Omit<Mission, 'id' | 'createdAt' | 'taskCount' | 'subMissions' | 'isExpanded' | 'order'>) => {
    const newMission: Mission = {
      id: Date.now().toString(),
      taskCount: 0,
      createdAt: new Date(),
      subMissions: [],
      isExpanded: true,
      order: missions.length,
      ...mission
    };
    setMissions(prev => [...prev, newMission]);
  };

  const addSubMission = (parentId: string, mission: Omit<Mission, 'id' | 'createdAt' | 'taskCount' | 'subMissions' | 'isExpanded' | 'order' | 'parentId'>) => {
    const newSubMission: Mission = {
      id: Date.now().toString(),
      taskCount: 0,
      createdAt: new Date(),
      subMissions: [],
      isExpanded: true,
      
      order: 0,
      parentId,
      ...mission
    };

    setMissions(prev => prev.map(m => {
      if (m.id === parentId) {
        return {
          ...m,
          subMissions: [...m.subMissions, { ...newSubMission, order: m.subMissions.length }]
        };
      }
      return updateSubMissionInTree(m, parentId, newSubMission);
    }));
  };

  const updateSubMissionInTree = (mission: Mission, parentId: string, newSubMission: Mission): Mission => {
    if (mission.subMissions.some(sub => sub.id === parentId)) {
      return {
        ...mission,
        subMissions: mission.subMissions.map(sub => 
          sub.id === parentId 
            ? { ...sub, subMissions: [...sub.subMissions, { ...newSubMission, order: sub.subMissions.length }] }
            : sub
        )
      };
    }
    
    return {
      ...mission,
      subMissions: mission.subMissions.map(sub => updateSubMissionInTree(sub, parentId, newSubMission))
    };
  };

  const updateMission = (id: string, updates: Partial<Mission>) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, ...updates };
      }
      return updateMissionInTree(m, id, updates);
    }));
    
    // Update selectedMission if it's the one being updated
    if (selectedMission?.id === id) {
      setSelectedMission(prev => prev ? { ...prev, ...updates } : null);
    } else if (selectedMission) {
      // Check if it's a sub-mission of the selected mission
      const updatedSelectedMission = updateMissionInTree(selectedMission, id, updates);
      if (updatedSelectedMission !== selectedMission) {
        setSelectedMission(updatedSelectedMission);
      }
    }
  };

  const updateMissionInTree = (mission: Mission, id: string, updates: Partial<Mission>): Mission => {
    if (mission.subMissions.some(sub => sub.id === id)) {
      return {
        ...mission,
        subMissions: mission.subMissions.map(sub => 
          sub.id === id ? { ...sub, ...updates } : sub
        )
      };
    }
    
    return {
      ...mission,
      subMissions: mission.subMissions.map(sub => updateMissionInTree(sub, id, updates))
    };
  };

  const toggleMissionExpanded = (id: string) => {
    updateMission(id, { isExpanded: !findMissionById(id)?.isExpanded });
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

  const deleteMission = (id: string, onDeleteTasks?: (missionIds: string[]) => void) => {
    // Get all mission IDs that will be deleted
    const missionIdsToDelete = getAllMissionIds(id);
    
    // Delete all tasks associated with these missions
    if (onDeleteTasks) {
      onDeleteTasks(missionIdsToDelete);
    }
    
    setMissions(prev => prev.filter(m => m.id !== id).map(m => ({
      ...m,
      subMissions: removeMissionFromTree(m.subMissions, id)
    })));
    
    if (selectedMission?.id === id) {
      setSelectedMission(null);
    }
  };

  const deleteMissionsByWorkspaceId = (workspaceId: string) => {
    const missionsToDelete = missions.filter(mission => mission.workspaceId === workspaceId);
    const missionIdsToDelete = missionsToDelete.flatMap(mission => getAllMissionIds(mission.id));
    
    setMissions(prev => prev.filter(mission => mission.workspaceId !== workspaceId));
    
    if (selectedMission && missionsToDelete.some(mission => mission.id === selectedMission.id)) {
      setSelectedMission(null);
    }
    
    return missionIdsToDelete;
  };

  const removeMissionFromTree = (missions: Mission[], id: string): Mission[] => {
    return missions.filter(m => m.id !== id).map(m => ({
      ...m,
      subMissions: removeMissionFromTree(m.subMissions, id)
    }));
  };


  const reorderMissions = (workspaceId: string, newOrder: Mission[]) => {
    setMissions(prev => {
      const otherMissions = prev.filter(m => m.workspaceId !== workspaceId);
      return [...otherMissions, ...newOrder];
    });
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
    reorderMissions
  };
};
