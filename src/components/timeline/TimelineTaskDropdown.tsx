import React from 'react';
import { TemplateTaskDropdown } from '../shared/TemplateTaskDropdown';
import { Task } from '@/types/task';

interface TimelineTaskDropdownProps {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  onAddSubTask?: (parentId: string) => void;
  showAddSubTask?: boolean;
  isCompact?: boolean;
}

export const TimelineTaskDropdown: React.FC<TimelineTaskDropdownProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onAddSubTask, 
  showAddSubTask = true,
  isCompact = false
}) => {
  return (
    <TemplateTaskDropdown
      task={task}
      onEdit={(task) => task && onEdit(task)}
      onDelete={(taskId) => onDelete(taskId)}
      onAddSubTask={onAddSubTask ? (parentId) => onAddSubTask(parentId) : undefined}
      showAddSubTask={showAddSubTask}
      variant="timeline"
      triggerClassName={`${isCompact ? 'bg-black/10 hover:bg-black/20' : 'bg-black/20 hover:bg-black/40'} ${!isCompact ? 'text-white' : ''}`}
    />
  );
};