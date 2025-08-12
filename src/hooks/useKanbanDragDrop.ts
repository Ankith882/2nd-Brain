import { useState, useCallback } from 'react';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
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

interface UseKanbanDragDropProps {
  tasks: Task[];
  columns: KanbanColumn[];
  taskColumnMapping: TaskColumnMapping;
  setTaskColumnMapping: (mapping: TaskColumnMapping | ((prev: TaskColumnMapping) => TaskColumnMapping)) => void;
  setDraggableTaskId: (id: string | null) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskMove: (taskId: string, newColumnId: string) => void;
}

export const useKanbanDragDrop = ({
  tasks,
  columns,
  taskColumnMapping,
  setTaskColumnMapping,
  setDraggableTaskId,
  onTaskUpdate,
  onTaskMove
}: UseKanbanDragDropProps) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = useCallback((event: any) => {
    const task = tasks.find(t => t.id === event.active.id);
    setDraggedTask(task || null);
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumnId = over.id as string;
    
    if (activeTask && columns.find(col => col.id === overColumnId)) {
      setTaskColumnMapping(prev => {
        const newMapping = { ...prev };
        newMapping[activeTask.id] = overColumnId;
        return newMapping;
      });
    }
  }, [tasks, columns, setTaskColumnMapping]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) {
      setDraggedTask(null);
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumnId = over.id as string;
    const targetColumn = columns.find(col => col.id === overColumnId);

    if (activeTask && targetColumn) {
      const wasInCompleted = taskColumnMapping[activeTask.id] === 'completed';
      const goingToCompleted = targetColumn.id === 'completed';
      
      setTaskColumnMapping(prev => {
        const newMapping = { ...prev };
        newMapping[activeTask.id] = targetColumn.id;
        return newMapping;
      });
      
      // Handle global completion logic
      if (!wasInCompleted && goingToCompleted) {
        // Task is being moved TO completed column
        const originalColumn = taskColumnMapping[activeTask.id] || 'todo';
        onTaskUpdate(activeTask.id, { 
          completed: true, 
          originalKanbanColumn: originalColumn,
          kanbanColumn: targetColumn.id 
        });
      } else if (wasInCompleted && !goingToCompleted) {
        // Task is being moved OUT OF completed column
        onTaskUpdate(activeTask.id, { 
          completed: false, 
          originalKanbanColumn: undefined,
          kanbanColumn: targetColumn.id 
        });
      } else {
        // Regular move between non-completed columns
        onTaskUpdate(activeTask.id, { kanbanColumn: targetColumn.id });
      }
      
      onTaskMove(activeTask.id, targetColumn.id);
    }
    
    setDraggedTask(null);
    setDraggableTaskId(null);
  }, [tasks, columns, taskColumnMapping, setTaskColumnMapping, setDraggableTaskId, onTaskUpdate, onTaskMove]);

  return {
    draggedTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
};