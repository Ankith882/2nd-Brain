
import { useState, useEffect } from 'react';

interface Workspace {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
}

export const useWorkspaceManager = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('workspaces');
    const savedSelectedWorkspace = localStorage.getItem('selectedWorkspace');
    
    if (savedWorkspaces) {
      const parsedWorkspaces = JSON.parse(savedWorkspaces);
      setWorkspaces(parsedWorkspaces);
      
      if (savedSelectedWorkspace && parsedWorkspaces.find((w: Workspace) => w.id === savedSelectedWorkspace)) {
        setSelectedWorkspace(savedSelectedWorkspace);
      } else if (parsedWorkspaces.length > 0) {
        setSelectedWorkspace(parsedWorkspaces[0].id);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem('workspaces', JSON.stringify(workspaces));
    }
  }, [workspaces]);

  useEffect(() => {
    if (selectedWorkspace) {
      localStorage.setItem('selectedWorkspace', selectedWorkspace);
    }
  }, [selectedWorkspace]);

  const addWorkspace = (workspace: Omit<Workspace, 'id'>) => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      ...workspace
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
  };

  const updateWorkspace = (id: string, updates: Omit<Workspace, 'id'>) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWorkspace = (id: string, onCascadeDelete?: (workspaceId: string) => void) => {
    // Call cascade delete callback to clean up related data
    if (onCascadeDelete) {
      onCascadeDelete(id);
    }
    
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    if (selectedWorkspace === id) {
      const remainingWorkspaces = workspaces.filter(w => w.id !== id);
      setSelectedWorkspace(remainingWorkspaces.length > 0 ? remainingWorkspaces[0].id : null);
    }
  };

  const selectWorkspace = (id: string) => {
    setSelectedWorkspace(id);
  };

  const getSelectedWorkspace = () => {
    return workspaces.find(w => w.id === selectedWorkspace) || null;
  };

  return {
    workspaces,
    selectedWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    getSelectedWorkspace
  };
};
