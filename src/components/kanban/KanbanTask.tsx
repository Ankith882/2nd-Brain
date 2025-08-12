import React, { memo } from 'react';
import { Task } from '@/types/task';
import { UnifiedTaskCard } from '../shared/UnifiedTaskCard';

interface KanbanTaskProps {
  task: Task;
  isDarkMode: boolean;
  zIndex: number;
  onClick: () => void;
  onHeaderDoubleClick: () => void;
  onLowerPortionClick: () => void;
  onAddSubTask?: (parentId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
  isDraggable: boolean;
}

export const KanbanTask = memo<KanbanTaskProps>(({ 
  task, 
  isDarkMode, 
  zIndex, 
  onClick, 
  onHeaderDoubleClick, 
  onLowerPortionClick,
  onAddSubTask, 
  onDeleteTask, 
  onEditTask, 
  onTaskClick,
  isDraggable
}) => {
  return (
    <UnifiedTaskCard
      task={task}
      isDarkMode={isDarkMode}
      variant="kanban"
      zIndex={zIndex}
      onClick={onClick}
      onHeaderDoubleClick={onHeaderDoubleClick}
      onLowerPortionClick={onLowerPortionClick}
      onTaskClick={onTaskClick}
      onAddSubTask={onAddSubTask}
      onDeleteTask={onDeleteTask}
      onEditTask={onEditTask}
      isDraggable={isDraggable}
    />
  );
});

KanbanTask.displayName = 'KanbanTask';