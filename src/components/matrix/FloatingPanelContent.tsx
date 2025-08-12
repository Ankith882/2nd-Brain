import React from 'react';
import { Textarea } from '@/components/ui';
import { Task } from '@/types/task';
import { Quadrant } from './Quadrant';

interface FloatingPanelContentProps {
  isNotesMode: boolean;
  showCompleted: boolean;
  showHoldTasks: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
  tasks: Task[];
  isDarkMode: boolean;
  onTaskClick: (task: Task) => void;
  onTaskHeaderDoubleClick: (task: Task) => void;
  onAddSubTask?: (parentId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  draggableTaskId: string | null;
  contentHeight: number;
}

export const FloatingPanelContent: React.FC<FloatingPanelContentProps> = ({
  isNotesMode,
  showCompleted,
  showHoldTasks,
  notes,
  onNotesChange,
  tasks,
  isDarkMode,
  onTaskClick,
  onTaskHeaderDoubleClick,
  onAddSubTask,
  onDeleteTask,
  onEditTask,
  onToggleComplete,
  onTaskUpdate,
  draggableTaskId,
  contentHeight
}) => {
  const getFilteredTasks = () => {
    if (showCompleted) return tasks.filter(task => task.completed);
    if (showHoldTasks) return tasks.filter(task => task.quadrant === 'hold' && !task.completed);
    return [];
  };

  const getQuadrantConfig = () => {
    if (showCompleted) return { title: 'Completed', color: 'bg-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-300' };
    if (showHoldTasks) return { title: 'Hold', color: 'bg-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' };
    return null;
  };

  if (isNotesMode) {
    return (
      <div className="h-full flex flex-col">
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add your notes here..."
          className="w-full flex-1 resize-none bg-white/50 backdrop-blur-sm border-0 outline-none focus:ring-0 rounded-lg p-3"
        />
      </div>
    );
  }

  if (showCompleted || showHoldTasks) {
    const config = getQuadrantConfig()!;
    const filteredTasks = getFilteredTasks();
    
    return (
      <div className="h-full p-3">
        <Quadrant
          id={showCompleted ? "completed" : "hold"}
          title={config.title + " Tasks"}
          config={config}
          tasks={filteredTasks}
          isDarkMode={isDarkMode}
          onTaskClick={onTaskClick}
          onTaskHeaderDoubleClick={onTaskHeaderDoubleClick}
          onAddSubTask={onAddSubTask}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
          onToggleComplete={onToggleComplete}
          onTaskUpdate={onTaskUpdate}
          draggableTaskId={draggableTaskId}
          isFloatingContent={true}
          showRevertButton={showHoldTasks}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-3">
      <p className="text-gray-500 text-center">
        Select a mode from the header buttons
      </p>
    </div>
  );
};