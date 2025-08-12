import React from 'react';
import { Task, TaskTemplate } from '@/types/task';
import { ModernTaskForm } from '@/components/ModernTaskForm';

interface TaskFormWrapperProps {
  show: boolean;
  isDarkMode: boolean;
  missionId: string;
  selectedDate: Date;
  editingTask?: Task | null;
  parentId?: string;
  selectedTemplate: TaskTemplate;
  onSave: (task: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order'> | Task) => void;
  onClose: () => void;
}

export const TaskFormWrapper: React.FC<TaskFormWrapperProps> = ({
  show,
  isDarkMode,
  missionId,
  selectedDate,
  editingTask,
  parentId,
  selectedTemplate,
  onSave,
  onClose
}) => {
  if (!show) return null;

  return (
    <ModernTaskForm
      isDarkMode={isDarkMode}
      missionId={missionId}
      selectedDate={selectedDate}
      editingTask={editingTask}
      parentId={parentId}
      selectedTemplate={selectedTemplate}
      onSave={onSave}
      onClose={onClose}
    />
  );
};