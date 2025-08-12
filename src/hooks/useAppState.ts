import { useState, useCallback } from 'react';

export interface AppState {
  isDarkMode: boolean;
  currentTheme: any;
  showSettings: boolean;
  showWorkspaceManager: boolean;
  showMissions: boolean;
  showAddMission: boolean;
  showHabitTracker: boolean;
  showAddHabit: boolean;
  editingHabit: any;
  selectedHabit: any;
  habitView: 'active' | 'completed';
  showQuickNotes: boolean;
  showAddNotesFolder: boolean;
  descriptionPanelItem: any;
  descriptionPanelType: string;
  highlightedMissionId?: string;
  highlightedHabitId?: string;
  highlightedNoteId?: string;
}

const initialState: AppState = {
  isDarkMode: false,
  currentTheme: null,
  showSettings: false,
  showWorkspaceManager: false,
  showMissions: false,
  showAddMission: false,
  showHabitTracker: false,
  showAddHabit: false,
  editingHabit: null,
  selectedHabit: null,
  habitView: 'active',
  showQuickNotes: false,
  showAddNotesFolder: false,
  descriptionPanelItem: null,
  descriptionPanelType: '',
  highlightedMissionId: undefined,
  highlightedHabitId: undefined,
  highlightedNoteId: undefined,
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(initialState);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
    document.documentElement.classList.toggle('dark');
  }, []);

  const resetSelectedItems = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedHabit: null,
      editingHabit: null,
      descriptionPanelItem: null,
      descriptionPanelType: '',
      highlightedMissionId: undefined,
      highlightedHabitId: undefined,
      highlightedNoteId: undefined,
    }));
  }, []);

  const togglePanel = useCallback((panel: 'missions' | 'habits' | 'notes') => {
    setState(prev => {
      const newState = { ...prev };
      
      switch (panel) {
        case 'missions':
          newState.showMissions = !prev.showMissions;
          if (newState.showMissions) {
            newState.showHabitTracker = false;
            newState.showQuickNotes = false;
          }
          break;
        case 'habits':
          newState.showHabitTracker = !prev.showHabitTracker;
          if (newState.showHabitTracker) {
            newState.showMissions = false;
            newState.showQuickNotes = false;
          }
          break;
        case 'notes':
          newState.showQuickNotes = !prev.showQuickNotes;
          if (newState.showQuickNotes) {
            newState.showMissions = false;
            newState.showHabitTracker = false;
          }
          break;
      }
      
      return newState;
    });
  }, []);

  return {
    ...state,
    updateState,
    toggleTheme,
    resetSelectedItems,
    togglePanel
  };
};