import { useCallback } from 'react';
import { SearchResult } from '@/types/search';

interface UseSearchNavigationProps {
  // Navigation handlers
  onNavigateToMissions: () => void;
  onNavigateToHabits: (view: 'active' | 'completed') => void;
  onNavigateToNotes: () => void;
  
  // Selection handlers
  onSelectMission: (mission: any) => void;
  onSelectHabit: (habit: any) => void;
  onSelectFolder: (folder: any) => void;
  
  // Highlight handlers
  onHighlightMission: (id: string) => void;
  onHighlightHabit: (id: string) => void;
  onHighlightNote: (id: string) => void;
  onHighlightTask: (taskId: string) => void;
  
  // Date navigation for tasks
  onNavigateToDate: (date: Date) => void;
  
  // Task expansion for sub-tasks
  onExpandParentTasks: (taskId: string) => void;
  
  // Workspace switching
  onSelectWorkspace: (workspaceId: string) => void;
  selectedWorkspaceId?: string;
  
  // Close search
  onCloseSearch: () => void;
  
  // Data access
  folders: any[];
  missions: any[];
  workspaces: any[];
}

export const useSearchNavigation = ({
  onNavigateToMissions,
  onNavigateToHabits,
  onNavigateToNotes,
  onSelectMission,
  onSelectHabit,
  onSelectFolder,
  onHighlightMission,
  onHighlightHabit,
  onHighlightNote,
  onHighlightTask,
  onNavigateToDate,
  onExpandParentTasks,
  onSelectWorkspace,
  selectedWorkspaceId,
  onCloseSearch,
  folders,
  missions,
  workspaces
}: UseSearchNavigationProps) => {

  // Helper function to determine and switch workspace if needed
  const switchToItemWorkspace = useCallback((result: SearchResult) => {
    let targetWorkspaceId: string | undefined;

    switch (result.type) {
      case 'task': {
        // For tasks, get workspace from mission
        if (result.missionId && result.missionId !== 'default') {
          const mission = missions.find(m => m.id === result.missionId);
          targetWorkspaceId = mission?.workspaceId;
        }
        break;
      }
      case 'mission': {
        targetWorkspaceId = result.originalItem.workspaceId;
        break;
      }
      case 'habit': {
        targetWorkspaceId = result.originalItem.workspaceId;
        break;
      }
      case 'note': {
        const folder = folders.find(f => f.id === result.originalItem.folderId);
        targetWorkspaceId = folder?.workspaceId;
        break;
      }
    }

    // Switch workspace if different from current
    if (targetWorkspaceId && targetWorkspaceId !== selectedWorkspaceId) {
      console.log('Switching workspace from', selectedWorkspaceId, 'to', targetWorkspaceId);
      onSelectWorkspace(targetWorkspaceId);
      return true; // Workspace was switched
    }
    
    return false; // No workspace switch needed
  }, [selectedWorkspaceId, onSelectWorkspace, missions, folders]);

  const navigateToResult = useCallback((result: SearchResult) => {
    console.log('Navigating to search result:', result);

    // Close search modal first
    onCloseSearch();

    // Check if workspace switch is needed
    const workspaceSwitched = switchToItemWorkspace(result);
    const delay = workspaceSwitched ? 300 : 100; // Longer delay if workspace switched

    switch (result.type) {
      case 'task': {
        // Navigate to task's date if it exists
        if (result.originalItem?.date) {
          setTimeout(() => {
            onNavigateToDate(new Date(result.originalItem.date));
          }, delay);
        }
        
        // If task has missionId, navigate to missions and select the mission
        if (result.missionId && result.missionId !== 'default') {
          const mission = missions.find(m => m.id === result.missionId);
          if (mission) {
            setTimeout(() => {
              onNavigateToMissions();
              // Additional delay for mission selection
              setTimeout(() => {
                onSelectMission(mission);
                onHighlightMission(mission.id);
                // Expand parent tasks and highlight the task after mission is selected
                setTimeout(() => {
                  if (result.originalItem?.parentId) {
                    console.log('Expanding parent tasks for sub-task:', result.originalItem.id);
                    onExpandParentTasks(result.originalItem.id);
                    // Wait longer for expansion to complete before highlighting
                    setTimeout(() => {
                      console.log('Highlighting sub-task after expansion:', result.originalItem.id);
                      onHighlightTask(result.originalItem.id);
                    }, 500);
                  } else {
                    console.log('Highlighting top-level task:', result.originalItem.id);
                    onHighlightTask(result.originalItem.id);
                  }
                }, 200);
              }, 100);
            }, delay);
          }
        } else {
          // For tasks without missions, still expand parents and highlight the task
          setTimeout(() => {
            if (result.originalItem?.parentId) {
              console.log('Expanding parent tasks for sub-task (no mission):', result.originalItem.id);
              onExpandParentTasks(result.originalItem.id);
              // Wait longer for expansion to complete before highlighting
              setTimeout(() => {
                console.log('Highlighting sub-task after expansion (no mission):', result.originalItem.id);
                onHighlightTask(result.originalItem.id);
              }, 500);
            } else {
              console.log('Highlighting top-level task (no mission):', result.originalItem.id);
              onHighlightTask(result.originalItem.id);
            }
          }, delay + 100);
        }
        break;
      }

      case 'mission': {
        setTimeout(() => {
          onNavigateToMissions();
          // Use timeout to ensure UI updates before selecting
          setTimeout(() => {
            onSelectMission(result.originalItem);
            onHighlightMission(result.originalItem.id);
          }, 100);
        }, delay);
        break;
      }

      case 'habit': {
        const habit = result.originalItem;
        const view = habit.isCompleted ? 'completed' : 'active';
        
        setTimeout(() => {
          onNavigateToHabits(view);
          // Use timeout to ensure UI updates before selecting
          setTimeout(() => {
            onSelectHabit(habit);
            onHighlightHabit(habit.id);
          }, 100);
        }, delay);
        break;
      }

      case 'note': {
        setTimeout(() => {
          // First navigate to notes
          onNavigateToNotes();
          
          // Find the folder for this note
          const folder = folders.find(f => f.id === result.originalItem.folderId);
          if (folder) {
            // Use timeout to ensure UI updates before selecting
            setTimeout(() => {
              onSelectFolder(folder);
              // Highlight the note after folder is selected
              setTimeout(() => {
                onHighlightNote(result.originalItem.id);
              }, 100);
            }, 100);
          }
        }, delay);
        break;
      }

      default:
        console.warn('Unknown search result type:', result.type);
    }
  }, [
    onNavigateToMissions,
    onNavigateToHabits,
    onNavigateToNotes,
    onSelectMission,
    onSelectHabit,
    onSelectFolder,
    onHighlightMission,
    onHighlightHabit,
    onHighlightNote,
    onHighlightTask,
    onNavigateToDate,
    onExpandParentTasks,
    onCloseSearch,
    switchToItemWorkspace,
    folders,
    missions
  ]);

  return { navigateToResult };
};