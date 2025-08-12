import React, { memo } from 'react';
import { Grip } from 'lucide-react';
import { Task } from '@/types/task';
import { DraggablePanel } from '@/components/timeline/DraggablePanel';
import { FloatingPanelHeader } from './FloatingPanelHeader';
import { FloatingPanelContent } from './FloatingPanelContent';
import { useFloatingPanel } from '@/hooks/useFloatingPanel';

interface FloatingPanelProps {
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
  position: { x: number; y: number };
  size: { width: number; height: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  onMinimize: () => void;
}

export const FloatingPanel = memo<FloatingPanelProps>(({
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
  position,
  size,
  onPositionChange,
  onSizeChange,
  onMinimize
}) => {
  const { isNotesMode, showCompleted, showHoldTasks, notes, toggleMode, updateNotes } = useFloatingPanel();

  return (
    <DraggablePanel
      title=""
      icon={Grip}
      initialPosition={position}
      initialSize={size}
      minSize={{ width: 300, height: 200 }}
      className="bg-white/10 backdrop-blur-xl border-white/20"
    >
      {/* Custom Header with controls */}
      <div className="flex items-center justify-between mb-3 px-3 pt-3">
        <div className="text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">Panel Controls</div>
        <FloatingPanelHeader
          isNotesMode={isNotesMode}
          showCompleted={showCompleted}
          showHoldTasks={showHoldTasks}
          onToggleMode={toggleMode}
          onMinimize={onMinimize}
        />
      </div>

      {/* Panel Content - Full Height */}
      <div className="flex-1 px-3 pb-3">
        <FloatingPanelContent
          isNotesMode={isNotesMode}
          showCompleted={showCompleted}
          showHoldTasks={showHoldTasks}
          notes={notes}
          onNotesChange={updateNotes}
          tasks={tasks}
          isDarkMode={isDarkMode}
          onTaskClick={onTaskClick}
          onTaskHeaderDoubleClick={onTaskHeaderDoubleClick}
          onAddSubTask={onAddSubTask}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
          onToggleComplete={onToggleComplete}
          onTaskUpdate={onTaskUpdate}
          draggableTaskId={draggableTaskId}
          contentHeight={size.height - 120}
        />
      </div>
    </DraggablePanel>
  );
});