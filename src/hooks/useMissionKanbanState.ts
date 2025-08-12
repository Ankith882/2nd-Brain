import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/task';

interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  noteContent?: string;
  isNoteMode?: boolean;
}

interface TaskColumnMapping {
  [taskId: string]: string;
}

interface GridConfig {
  columns: number;
  rows: number;
  kanbanColumns: KanbanColumn[];
}

interface MissionKanbanConfig {
  [missionId: string]: GridConfig;
}

const MISSION_KANBAN_STORAGE_KEY = 'mission-kanban-configs';

const loadMissionKanbanConfigs = (): MissionKanbanConfig => {
  try {
    const saved = localStorage.getItem(MISSION_KANBAN_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveMissionKanbanConfigs = (configs: MissionKanbanConfig) => {
  try {
    localStorage.setItem(MISSION_KANBAN_STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // Silent fail for localStorage issues
  }
};

const getDefaultGridConfig = (): GridConfig => ({
  columns: 3,
  rows: 1,
  kanbanColumns: [
    { id: 'todo', name: 'To Do', color: '#3B82F6' },
    { id: 'in-progress', name: 'In Progress', color: '#F59E0B' },
    { id: 'completed', name: 'Completed', color: '#10B981' }
  ]
});

export const useMissionKanbanState = (tasks: Task[], missionId: string) => {
  // Load all mission kanban configs
  const [missionConfigs, setMissionConfigs] = useState<MissionKanbanConfig>(() => 
    loadMissionKanbanConfigs()
  );

  // Get current mission's config or default
  const [gridConfig, setGridConfig] = useState<GridConfig>(() => {
    return missionConfigs[missionId] || getDefaultGridConfig();
  });

  const [columns, setColumns] = useState<KanbanColumn[]>(gridConfig.kanbanColumns);
  
  const [taskColumnMapping, setTaskColumnMapping] = useState<TaskColumnMapping>(() => {
    const mapping: TaskColumnMapping = {};
    const firstColumnId = gridConfig.kanbanColumns[0]?.id || 'todo';
    
    tasks.forEach(task => {
      if (task.completed) {
        mapping[task.id] = 'completed';
      } else if (task.kanbanColumn && gridConfig.kanbanColumns.find(col => col.id === task.kanbanColumn)) {
        mapping[task.id] = task.kanbanColumn;
      } else {
        mapping[task.id] = firstColumnId;
      }
    });
    return mapping;
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showOverlayPanel, setShowOverlayPanel] = useState(false);
  const [draggableTaskId, setDraggableTaskId] = useState<string | null>(null);

  // Update grid config when mission changes
  useEffect(() => {
    const missionConfig = missionConfigs[missionId] || getDefaultGridConfig();
    setGridConfig(missionConfig);
    setColumns(missionConfig.kanbanColumns);
  }, [missionId]);

  // Save mission-specific config whenever columns change (but not on initial load)
  useEffect(() => {
    // Skip initial render to prevent infinite loops
    if (columns.length === 0) return;
    
    const newConfig: GridConfig = {
      columns: gridConfig.columns,
      rows: gridConfig.rows,
      kanbanColumns: columns
    };
    
    const newMissionConfigs = {
      ...missionConfigs,
      [missionId]: newConfig
    };
    
    setMissionConfigs(newMissionConfigs);
    saveMissionKanbanConfigs(newMissionConfigs);
  }, [columns, gridConfig.columns, gridConfig.rows, missionId]);

  // Sync task completion state with column mapping
  useEffect(() => {
    const newMapping = { ...taskColumnMapping };
    let hasChanges = false;
    const firstColumnId = columns[0]?.id || 'todo';
    
    tasks.forEach(task => {
      if (task.completed && newMapping[task.id] !== 'completed') {
        newMapping[task.id] = 'completed';
        hasChanges = true;
      } else if (!task.completed && newMapping[task.id] === 'completed') {
        const originalColumn = task.originalKanbanColumn && columns.find(col => col.id === task.originalKanbanColumn) 
          ? task.originalKanbanColumn 
          : firstColumnId;
        newMapping[task.id] = originalColumn;
        hasChanges = true;
      } else if (!newMapping[task.id]) {
        newMapping[task.id] = task.completed ? 'completed' : firstColumnId;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setTaskColumnMapping(newMapping);
    }
  }, [tasks, taskColumnMapping, columns]);

  const handleColumnUpdate = useCallback((columnId: string, updates: Partial<KanbanColumn>) => {
    setColumns(prev => {
      const updated = prev.map(col => col.id === columnId ? { ...col, ...updates } : col);
      return updated;
    });
  }, []);

  const handleColumnDelete = useCallback((columnId: string) => {
    if (columnId === 'completed') return;
    
    setColumns(prev => {
      const updated = prev.filter(col => col.id !== columnId);
      
      // Move tasks from deleted column to first available column
      const firstColumnId = updated[0]?.id;
      if (firstColumnId) {
        setTaskColumnMapping(prevMapping => {
          const newMapping = { ...prevMapping };
          Object.keys(newMapping).forEach(taskId => {
            if (newMapping[taskId] === columnId) {
              newMapping[taskId] = firstColumnId;
            }
          });
          return newMapping;
        });
      }
      
      return updated;
    });
  }, []);

  const createGrid = useCallback((gridColumns: number, gridRows: number, currentTasks: Task[]) => {
    const totalColumns = gridColumns * gridRows;
    const newColumns: KanbanColumn[] = [];
    
    for (let i = 0; i < totalColumns - 1; i++) {
      newColumns.push({
        id: `column-${i}`,
        name: `Column ${i + 1}`,
        color: '#3B82F6'
      });
    }
    
    // Always add completed column at the end
    newColumns.push({
      id: 'completed',
      name: 'Completed',
      color: '#10B981'
    });
    
    setColumns(newColumns);
    
    // Update grid config for this mission
    const newConfig: GridConfig = {
      columns: gridColumns,
      rows: gridRows,
      kanbanColumns: newColumns
    };
    setGridConfig(newConfig);
    
    // Update task mapping - ensure completed tasks stay in completed, others go to first column
    const newMapping = { ...taskColumnMapping };
    const firstColumnId = newColumns[0]?.id;
    
    currentTasks.forEach(task => {
      if (task.completed) {
        newMapping[task.id] = 'completed';
      } else if (!newColumns.find(col => col.id === newMapping[task.id]) || newMapping[task.id] === 'completed') {
        newMapping[task.id] = firstColumnId || 'column-0';
      }
    });
    
    setTaskColumnMapping(newMapping);
  }, [taskColumnMapping]);

  const handleTaskClick = useCallback((task: Task) => {
    // Task click handler - can be customized
  }, []);

  const handleTaskLowerPortionClick = useCallback((task: Task) => {
    if (task.description && task.description !== 'Click to add description...') {
      if (selectedTask?.id === task.id && showOverlayPanel) {
        setShowOverlayPanel(false);
        setSelectedTask(null);
      } else {
        setSelectedTask(task);
        setShowOverlayPanel(true);
      }
    }
  }, [selectedTask, showOverlayPanel]);

  const handleTaskDoubleClick = useCallback((task: Task) => {
    setDraggableTaskId(prev => prev === task.id ? null : task.id);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setShowOverlayPanel(false);
    setSelectedTask(null);
  }, []);

  return {
    columns,
    taskColumnMapping,
    selectedTask,
    showOverlayPanel,
    draggableTaskId,
    gridConfig,
    setTaskColumnMapping,
    setDraggableTaskId,
    handleColumnUpdate,
    handleColumnDelete,
    createGrid,
    handleTaskClick,
    handleTaskLowerPortionClick,
    handleTaskDoubleClick,
    handleCloseOverlay,
    setSelectedTask
  };
};