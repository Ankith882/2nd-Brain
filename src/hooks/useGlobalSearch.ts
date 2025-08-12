import { useState, useCallback, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import { SearchResult, SearchableItem, SearchFilter, SearchState, UseGlobalSearchReturn } from '@/types/search';
import { Task } from '@/types/task';
import { getAllTasksRecursively } from '@/utils/taskUtils';

// Global search hook - updated to handle all workspace habits and better note categorization

export const useGlobalSearch = (
  tasks: Task[] = [],
  missions: any[] = [],
  allHabits: any[] = [], // Changed from habits to allHabits to include all workspace habits
  notes: any[] = [],
  folders: any[] = [], // Add folders parameter
  workspaces: any[] = [],
  selectedWorkspaceId?: string
): UseGlobalSearchReturn => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    filter: 'all',
    results: [],
    isSearching: false,
    isOpen: false
  });

  // Aggregate all searchable data
  const searchableData = useMemo(() => {
    const items: SearchableItem[] = [];
    
    console.log('Aggregating search data:', { 
      tasksCount: tasks.length, 
      missionsCount: missions.length, 
      habitsCount: allHabits.length, 
      notesCount: notes.length,
      workspacesCount: workspaces.length 
    });

    // Helper function to get workspace name from task - ALWAYS show actual workspace
    const getWorkspaceNameForTask = (task: Task): string => {
      // Find the mission this task belongs to
      if (task.missionId && task.missionId !== 'default') {
        const mission = missions.find(m => m.id === task.missionId);
        if (mission && mission.workspaceId) {
          // Find the workspace by ID - this will work regardless of selected workspace
          const workspace = workspaces.find(w => w.id === mission.workspaceId);
          if (workspace) return workspace.name;
        }
      }
      
      // If no mission connection found, return unassigned
      return 'Unassigned';
    };

    // Add tasks (including subtasks recursively)
    const allTasks = getAllTasksRecursively(tasks);
    allTasks.forEach(task => {
      items.push({
        id: task.id,
        title: task.title,
        description: task.description,
        category: getWorkspaceNameForTask(task), // Use workspace name instead of task.category
        priority: task.priority,
        type: 'task',
        parentId: task.parentId,
        missionId: task.missionId,
        createdAt: task.createdAt,
        isCompleted: task.completed,
        originalItem: task
      });
    });

    // Add missions - ALWAYS show actual workspace
    missions.forEach(mission => {
      // Find workspace by ID regardless of selected workspace
      const workspace = workspaces.find(w => w.id === mission.workspaceId);
      items.push({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        category: workspace?.name || 'Unassigned Workspace',
        type: 'mission',
        createdAt: mission.createdAt,
        originalItem: mission
      });
    });

    // Add habits - ALWAYS show actual workspace
    allHabits.forEach(habit => {
      // Find workspace by ID regardless of selected workspace
      const workspace = workspaces.find(w => w.id === habit.workspaceId);
      items.push({
        id: habit.id,
        title: habit.name,
        description: '',
        category: workspace?.name || 'Unassigned Workspace',
        type: 'habit',
        createdAt: habit.createdAt,
        isCompleted: habit.isCompleted,
        originalItem: habit
      });
    });

    // Add notes - ALWAYS show actual workspace
    notes.forEach(note => {
      const folder = folders.find(f => f.id === note.folderId);
      // Find workspace by ID regardless of selected workspace
      const workspace = folder ? workspaces.find(w => w.id === folder.workspaceId) : null;
      
      items.push({
        id: note.id,
        title: note.title,
        description: note.content,
        category: `${folder?.name || note.folderId} • ${workspace?.name || 'Unassigned Workspace'}`,
        type: 'note',
        createdAt: note.createdAt,
        originalItem: note
      });
    });

    console.log('Total searchable items:', items.length);
    return items;
  }, [tasks, missions, allHabits, notes, folders, workspaces, selectedWorkspaceId]);

  // Configure Fuse.js
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'description', weight: 0.3 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    };

    return new Fuse(searchableData, options);
  }, [searchableData]);

  // Debounced search function
  const performSearch = useCallback((query: string, filter: SearchFilter) => {
    console.log('Performing search:', { query, filter, dataLength: searchableData.length });
    
    if (!query.trim()) {
      setSearchState(prev => ({ ...prev, results: [], isSearching: false }));
      return;
    }

    setSearchState(prev => ({ ...prev, isSearching: true }));

    // Perform fuzzy search
    const searchResults = fuse.search(query);
    console.log('Fuse search results:', searchResults.length);

    // Filter by type if not 'all'
    const filteredResults = searchResults.filter(result => {
      if (filter === 'all') return true;
      return result.item.type === filter;
    });

    // Convert to SearchResult format
    const results: SearchResult[] = filteredResults.map(result => {
      const item = result.item;
      const snippet = item.description 
        ? item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '')
        : undefined;

      return {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        snippet,
        category: item.category,
        priority: item.priority,
        parentId: item.parentId,
        missionId: item.missionId,
        createdAt: item.createdAt,
        isCompleted: item.isCompleted,
        originalItem: item.originalItem
      };
    });

    setSearchState(prev => ({ 
      ...prev, 
      results: results.slice(0, 50), // Limit to 50 results
      isSearching: false 
    }));
  }, [fuse]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchState.query, searchState.filter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchState.query, searchState.filter, performSearch]);

  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  }, []);

  const setFilter = useCallback((filter: SearchFilter) => {
    setSearchState(prev => ({ ...prev, filter }));
  }, []);

  const openSearch = useCallback(() => {
    console.log('Opening search modal');
    setSearchState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const closeSearch = useCallback(() => {
    console.log('Closing search modal');
    setSearchState(prev => ({ 
      ...prev, 
      isOpen: false, 
      query: '', 
      results: [],
      filter: 'all'
    }));
  }, []);


  return {
    searchState,
    setQuery,
    setFilter,
    openSearch,
    closeSearch
  };
};