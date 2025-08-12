import { useCallback } from 'react';

interface UseWorkspaceHandlersProps {
  selectedWorkspace: any;
  selectedMission: any;
  selectedHabit: any;
  selectedFolder: any;
  descriptionPanelItem: any;
  descriptionPanelType: string;
  setSelectedMission: (mission: any) => void;
  setSelectedFolder: (folder: any) => void;
  updateState: (updates: any) => void;
  deleteMission: (missionId: string, deleteTasksByMissionIds: (ids: string[]) => void) => void;
  deleteMissionsByWorkspaceId: (workspaceId: string) => string[];
  deleteTasksByMissionIds: (ids: string[]) => void;
  deleteHabitsByWorkspaceId: (workspaceId: string) => void;
  deleteFoldersByWorkspaceId: (workspaceId: string) => void;
  deleteWorkspace: (id: string, onDeleteCallback: (id: string) => void) => void;
}

export const useWorkspaceHandlers = ({
  selectedWorkspace,
  selectedMission,
  selectedHabit,
  selectedFolder,
  descriptionPanelItem,
  descriptionPanelType,
  setSelectedMission,
  setSelectedFolder,
  updateState,
  deleteMission,
  deleteMissionsByWorkspaceId,
  deleteTasksByMissionIds,
  deleteHabitsByWorkspaceId,
  deleteFoldersByWorkspaceId,
  deleteWorkspace
}: UseWorkspaceHandlersProps) => {

  const handleMissionToggle = useCallback((mission: any) => {
    setSelectedMission(selectedMission?.id === mission.id ? null : mission);
  }, [selectedMission, setSelectedMission]);

  const handleHabitToggle = useCallback((habit: any) => {
    updateState({ 
      selectedHabit: selectedHabit?.id === habit.id ? null : habit 
    });
  }, [selectedHabit, updateState]);

  const handleFolderToggle = useCallback((folder: any) => {
    setSelectedFolder(selectedFolder?.id === folder.id ? null : folder);
  }, [selectedFolder, setSelectedFolder]);

  const handleDescriptionToggle = useCallback((type: 'mission' | 'task' | 'category', item: any) => {
    if (descriptionPanelItem?.id === item.id && descriptionPanelType === type) {
      updateState({
        descriptionPanelItem: null,
        descriptionPanelType: ''
      });
    } else {
      updateState({
        descriptionPanelItem: item,
        descriptionPanelType: type
      });
    }
  }, [descriptionPanelItem, descriptionPanelType, updateState]);

  const handleDeleteMission = useCallback((missionId: string) => {
    deleteMission(missionId, deleteTasksByMissionIds);
  }, [deleteMission, deleteTasksByMissionIds]);

  const handleDeleteWorkspace = useCallback((workspaceId: string) => {
    // Get all mission IDs from this workspace first (including sub-missions)
    const missionIdsToDelete = deleteMissionsByWorkspaceId(workspaceId);
    
    // Delete all tasks belonging to these missions
    if (missionIdsToDelete.length > 0) {
      deleteTasksByMissionIds(missionIdsToDelete);
    }
    
    // Delete all habits belonging to this workspace
    deleteHabitsByWorkspaceId(workspaceId);
    
    // Delete all folders and notes belonging to this workspace
    deleteFoldersByWorkspaceId(workspaceId);
  }, [deleteMissionsByWorkspaceId, deleteTasksByMissionIds, deleteHabitsByWorkspaceId, deleteFoldersByWorkspaceId]);

  const handleThemeChange = useCallback((theme: any) => {
    updateState({ currentTheme: theme });
  }, [updateState]);

  return {
    handleMissionToggle,
    handleHabitToggle,
    handleFolderToggle,
    handleDescriptionToggle,
    handleDeleteMission,
    handleDeleteWorkspace,
    handleThemeChange
  };
};