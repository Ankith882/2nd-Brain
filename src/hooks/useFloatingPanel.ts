import { useState, useCallback } from 'react';

interface UseFloatingPanelState {
  isNotesMode: boolean;
  showCompleted: boolean;
  showHoldTasks: boolean;
  notes: string;
}

export const useFloatingPanel = () => {
  const [state, setState] = useState<UseFloatingPanelState>({
    isNotesMode: false,
    showCompleted: false,
    showHoldTasks: false,
    notes: ''
  });

  const toggleMode = useCallback((mode: 'notes' | 'completed' | 'hold') => {
    setState(prev => ({
      ...prev,
      isNotesMode: mode === 'notes',
      showCompleted: mode === 'completed',
      showHoldTasks: mode === 'hold'
    }));
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setState(prev => ({ ...prev, notes }));
  }, []);

  return {
    ...state,
    toggleMode,
    updateNotes
  };
};