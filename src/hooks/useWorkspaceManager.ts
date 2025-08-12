
import { useSupabaseWorkspaces } from './useSupabaseWorkspaces';

// Legacy compatibility wrapper - now using Supabase
export const useWorkspaceManager = () => {
  const {
    workspaces,
    selectedWorkspace,
    loading,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace
  } = useSupabaseWorkspaces();

  const getSelectedWorkspace = () => {
    return selectedWorkspace;
  };

  return {
    workspaces,
    selectedWorkspace: selectedWorkspace?.id || null,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    getSelectedWorkspace
  };
};
