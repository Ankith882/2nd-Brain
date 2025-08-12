import { useMemo } from 'react';
import { Task } from '@/types/task';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useSearchNavigation } from '@/hooks/useSearchNavigation';
import { findTaskById } from '@/utils/taskUtils';

interface UseSearchManagerProps {
  tasks: Task[];
  missions: any[];
  habits: any[];
  notes: any[];
  folders: any[];
  workspaces: any[];
  selectedWorkspace: string | null;
  onNavigateToMissions: () => void;
  onNavigateToHabits: (view: 'active' | 'completed') => void;
  onNavigateToNotes: () => void;
  onSelectMission: (mission: any) => void;
  onSelectHabit: (habit: any) => void;
  onSelectFolder: (folder: any) => void;
  onHighlightMission: (id?: string) => void;
  onHighlightHabit: (id?: string) => void;
  onHighlightNote: (id?: string) => void;
  onSelectTask: (task: Task) => void;
  onSelectDate: (date: Date) => void;
  onExpandParentTasks: (taskId: string) => void;
  onSelectWorkspace: (id: string) => void;
}

export const useSearchManager = ({
  tasks,
  missions,
  habits,
  notes,
  folders,
  workspaces,
  selectedWorkspace,
  onNavigateToMissions,
  onNavigateToHabits,
  onNavigateToNotes,
  onSelectMission,
  onSelectHabit,
  onSelectFolder,
  onHighlightMission,
  onHighlightHabit,
  onHighlightNote,
  onSelectTask,
  onSelectDate,
  onExpandParentTasks,
  onSelectWorkspace
}: UseSearchManagerProps) => {
  // Filter workspace-specific data
  const workspaceData = useMemo(() => {
    if (!selectedWorkspace) return { missions: [], notes: [] };
    
    const workspaceMissions = missions.filter(m => m.workspaceId === selectedWorkspace);
    const workspaceFolders = folders.filter(f => f.workspaceId === selectedWorkspace);
    const workspaceNotes = workspaceFolders.length > 0 
      ? notes.filter(note => workspaceFolders.some(folder => folder.id === note.folderId))
      : notes;
    
    return { missions: workspaceMissions, notes: workspaceNotes };
  }, [missions, notes, folders, selectedWorkspace]);

  // Initialize global search with ALL data (not filtered by workspace)
  // This allows search to show items from all workspaces with correct workspace names
  const searchHook = useGlobalSearch(
    tasks,
    missions,  // ALL missions, not filtered
    habits,    // ALL habits, not filtered  
    notes,     // ALL notes, not filtered
    folders,   // ALL folders for workspace resolution
    workspaces,
    selectedWorkspace
  );

  // Initialize search navigation
  const searchNavigation = useSearchNavigation({
    onNavigateToMissions,
    onNavigateToHabits,
    onNavigateToNotes,
    onSelectMission,
    onSelectHabit,
    onSelectFolder,
    onHighlightMission,
    onHighlightHabit,
    onHighlightNote,
    onHighlightTask: (taskId: string) => {
      const task = findTaskById(tasks, taskId);
      if (task) {
        onSelectTask(task);
      } else {
        console.warn('Task not found for highlighting:', taskId);
      }
    },
    onNavigateToDate: onSelectDate,
    onExpandParentTasks,
    onSelectWorkspace,
    selectedWorkspaceId: selectedWorkspace,
    onCloseSearch: searchHook.closeSearch,
    folders,
    missions,
    workspaces
  });

  return {
    searchHook,
    searchNavigation
  };
};