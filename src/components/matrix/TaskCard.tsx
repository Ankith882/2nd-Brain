import React, { memo } from 'react';
import { Task } from '@/types/task';
import { getTaskCardColor } from '@/types/matrix';
import { UnifiedTaskCard } from '../shared/UnifiedTaskCard';

interface TaskCardProps {
  task: Task;
  isDarkMode: boolean;
  onClick: () => void;
  onTaskClick: (task: Task) => void;
  onHeaderDoubleClick: () => void;
  onAddSubTask?: (parentId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  isDraggable: boolean;
}

export const TaskCard = memo<TaskCardProps>(({ 
  task, 
  isDarkMode, 
  onClick, 
  onTaskClick, 
  onHeaderDoubleClick, 
  onAddSubTask, 
  onDeleteTask, 
  onEditTask, 
  onToggleComplete, 
  isDraggable 
}) => {
  return (
    <UnifiedTaskCard
      task={task}
      isDarkMode={isDarkMode}
      variant="matrix"
      onClick={onClick}
      onHeaderDoubleClick={onHeaderDoubleClick}
      onTaskClick={onTaskClick}
      onAddSubTask={onAddSubTask}
      onDeleteTask={onDeleteTask}
      onEditTask={onEditTask}
      onToggleComplete={onToggleComplete}
      isDraggable={isDraggable}
      getTaskCardColor={getTaskCardColor}
    />
  );
});