import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Pause, CheckCircle, Maximize } from 'lucide-react';
import { Button } from '@/components/ui';
import { Task } from '@/types/task';
import { QuadrantConfig, getQuadrantDescription } from '@/types/matrix';
import { TaskCard } from './TaskCard';

interface QuadrantProps {
  id: string;
  title: string;
  config: QuadrantConfig;
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
  isMinimized?: boolean;
  onMaximize?: () => void;
  isFloatingContent?: boolean;
  showRevertButton?: boolean;
  onTitleClick?: () => void;
}

export const Quadrant = memo<QuadrantProps>(({
  id,
  title,
  config,
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
  isMinimized,
  onMaximize,
  isFloatingContent,
  showRevertButton,
  onTitleClick
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Minimized state for floating panel
  if (isMinimized) {
    return (
      <div 
        ref={setNodeRef}
        className={`
          w-full h-full rounded-lg backdrop-blur-sm border transition-all
          ${isOver ? 'border-orange-400 bg-orange-100/30' : 'border-white/20 bg-orange-500/20'}
        `}
      >
        <div className="flex items-center justify-between p-2 h-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-orange-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{tasks.length}</span>
            </div>
            <span className="text-xs font-medium text-white">Hold</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMaximize} 
            className="h-6 w-6 p-0 rounded hover:bg-white/20 transition-all" 
            title="Expand Hold Tasks"
          >
            <Maximize className="h-3 w-3 text-white" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef}
      className={`
        h-full transition-all border rounded-lg p-4
        ${config.bgColor} ${config.borderColor}
        ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
        ${isFloatingContent ? 'bg-transparent border-none' : ''}
      `}
    >
      <div className="mb-4">
        <h3 
          className={`
            text-sm font-medium text-white px-3 py-2 rounded-lg inline-block
            cursor-pointer hover:opacity-80 transition-opacity ${config.color}
          `}
          onClick={onTitleClick}
        >
          {title}
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          {getQuadrantDescription(id)}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg">
            {id === 'hold' && <Pause className="h-4 w-4 text-orange-600" />}
            {id === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
            
            <TaskCard
              task={task}
              isDarkMode={isDarkMode}
              onClick={() => onTaskClick(task)}
              onTaskClick={onTaskClick}
              onHeaderDoubleClick={() => onTaskHeaderDoubleClick(task)}
              onAddSubTask={onAddSubTask}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
              onToggleComplete={onToggleComplete}
              isDraggable={draggableTaskId === task.id}
            />

            {showRevertButton && id === 'hold' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const originalQuadrant = (task as any).originalQuadrant || 'urgent-important';
                  onTaskUpdate?.(task.id, { 
                    quadrant: originalQuadrant,
                    originalQuadrant: undefined 
                  });
                }}
                className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800 bg-white/50 rounded-full"
                title="Revert to original quadrant"
              >
                ↶
              </Button>
            )}
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-8 w-full">
            {id === 'hold' 
              ? 'Drop tasks here to hold them' 
              : 'Drop tasks here or double-click a task to enable dragging'
            }
          </div>
        )}
      </div>
    </div>
  );
});