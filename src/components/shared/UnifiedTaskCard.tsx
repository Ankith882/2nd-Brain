import React, { useState, useRef, memo, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Grip, Check } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { Checkbox } from '@/components/ui';
import { Task } from '@/types/task';
import { UnifiedTaskDropdown } from './UnifiedTaskDropdown';
import { UnifiedSubTaskManager } from './UnifiedSubTaskManager';

interface UnifiedTaskCardProps {
  task: Task;
  isDarkMode: boolean;
  variant: 'kanban' | 'matrix' | 'timeline';
  zIndex?: number;
  onClick: () => void;
  onHeaderDoubleClick?: () => void;
  onLowerPortionClick?: () => void;
  onTaskClick?: (task: Task) => void;
  onAddSubTask?: (parentId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onToggleComplete?: (taskId: string) => void;
  isDraggable: boolean;
  // Timeline specific props
  dayWidth?: number;
  level?: number;
  block?: any;
  // Matrix specific props
  getTaskCardColor?: (task: Task) => string;
  // Kanban specific props
  showCloseButton?: boolean;
}

const PRIORITY_COLORS = {
  P1: 'bg-red-500',
  P2: 'bg-orange-500', 
  P3: 'bg-yellow-500',
  P4: 'bg-green-500',
  P5: 'bg-blue-500',
  P6: 'bg-purple-500',
  P7: 'bg-gray-500'
} as const;

export const UnifiedTaskCard = memo<UnifiedTaskCardProps>(({ 
  task, 
  isDarkMode, 
  variant,
  zIndex = 1,
  onClick, 
  onHeaderDoubleClick, 
  onLowerPortionClick,
  onTaskClick,
  onAddSubTask, 
  onDeleteTask, 
  onEditTask, 
  onToggleComplete,
  isDraggable,
  dayWidth,
  level = 0,
  block,
  getTaskCardColor,
  showCloseButton = false
}) => {
  const [showSubTasks, setShowSubTasks] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !isDraggable,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : zIndex,
  } : { zIndex };

  const isInLeftCorner = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return false;
    const rect = cardRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    const leftCornerWidth = variant === 'matrix' ? 40 : 40;
    const upperPortionHeight = rect.height * 0.6;
    return relativeX <= leftCornerWidth && relativeY <= upperPortionHeight;
  }, [variant]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current || isInLeftCorner(e.clientX, e.clientY)) return;
    
    if (variant === 'kanban' && onLowerPortionClick) {
      const rect = cardRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const upperPortionHeight = rect.height * 0.6;
      clickY <= upperPortionHeight ? onClick() : onLowerPortionClick();
    } else {
      onClick();
      if (onTaskClick) onTaskClick(task);
    }
  }, [onClick, onLowerPortionClick, onTaskClick, isInLeftCorner, variant, task]);

  const handleCardDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current || !onHeaderDoubleClick) return;
    
    if (isInLeftCorner(e.clientX, e.clientY)) {
      onHeaderDoubleClick();
      return;
    }
    
    const rect = cardRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    if (clickY <= rect.height * 0.6) onHeaderDoubleClick();
  }, [onHeaderDoubleClick, isInLeftCorner]);

  // Render Kanban variant
  if (variant === 'kanban') {
    return (
      <Card
        ref={(el) => {
          setNodeRef(el);
          cardRef.current = el;
        }}
        {...(isDraggable ? { ...listeners, ...attributes } : {})}
        className={`transition-all duration-200 border border-white/20 hover:shadow-lg ${
          isDraggable ? 'cursor-grab active:cursor-grabbing shadow-xl scale-105 touch-manipulation' : 'cursor-pointer'
        } ${isDragging ? 'opacity-70 shadow-2xl' : ''} w-full min-h-[80px]`}
        style={{
          ...style,
          touchAction: isDraggable ? 'none' : 'auto',
        }}
        onClick={handleCardClick}
        onDoubleClick={handleCardDoubleClick}
      >
        <CardContent className="p-3 h-full" style={{ backgroundColor: `${task.color}20` }}>
          <div className="space-y-2 h-full flex flex-col">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-6 flex-shrink-0 flex items-center">
                  {task.priority && task.priority !== 'P7' && (
                    <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-500'}`} />
                  )}
                </div>
                <h4 className={`font-medium text-sm break-words hyphens-auto leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '150px' }}>
                  {task.title}
                </h4>
              </div>
              
              <UnifiedTaskDropdown
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onAddSubTask={onAddSubTask}
                variant="kanban"
              />
            </div>
            
            <div className="flex-1 space-y-2">
              {task.description && (
                <div className={`ql-read-mode text-xs leading-tight max-h-8 overflow-hidden ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                     style={{ maxWidth: '180px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                     dangerouslySetInnerHTML={{ __html: task.description }} />
              )}
              
              {task.subTasks?.length > 0 && (
                <div className="space-y-2 mt-auto">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSubTasks(!showSubTasks);
                    }}
                  >
                    {showSubTasks ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    <span className="text-xs text-gray-400">
                      {task.subTasks.length} subtask{task.subTasks.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {showSubTasks && (
                    <UnifiedSubTaskManager
                      subTasks={task.subTasks}
                      depth={0}
                      isDarkMode={isDarkMode}
                      variant="kanban"
                      onTaskClick={onTaskClick}
                      onAddSubTask={onAddSubTask}
                      onEditTask={onEditTask}
                      onDeleteTask={onDeleteTask}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Matrix variant
  if (variant === 'matrix') {
    return (
      <div
        ref={(el) => {
          setNodeRef(el);
          cardRef.current = el;
        }}
        {...(isDraggable ? listeners : {})}
        {...(isDraggable ? attributes : {})}
        className={`
          transition-all duration-200 border border-gray-200 hover:shadow-lg
          ${getTaskCardColor ? getTaskCardColor(task) : 'bg-white'}
          ${isDraggable ? 'cursor-grab active:cursor-grabbing shadow-xl scale-105 touch-manipulation' : 'cursor-pointer'}
          ${isDragging ? 'opacity-70 shadow-2xl' : ''}
          w-40 ${showSubTasks && task.subTasks?.length ? 'h-auto' : 'h-24'} 
          p-3 rounded-lg shadow-md relative
        `}
        style={{
          ...style,
          touchAction: isDraggable ? 'none' : 'auto',
        }}
        onDoubleClick={handleCardDoubleClick}
      >
        {/* Drag handle */}
        <div className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center">
          <Grip className="h-4 w-4 text-gray-400" />
        </div>
        
        {/* Custom Completion checkbox with tick mark */}
        {onToggleComplete && (
          <div className="absolute top-2 right-2">
            <div 
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task.id);
              }}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                task.completed 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                {task.completed && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Task content */}
        <div className="mt-6 pr-6">
          <h4 
            className={`
              font-medium text-xs leading-tight
              ${isDarkMode ? 'text-gray-800' : 'text-gray-800'}
              ${task.completed ? 'line-through text-gray-500' : ''}
            `}
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            onClick={handleCardClick}
          >
            {task.title}
          </h4>

          {task.description && (
            <div 
              className={`ql-read-mode text-xs mt-1 leading-tight max-h-6 overflow-hidden ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}
              style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
              dangerouslySetInnerHTML={{ __html: task.description }}
            />
          )}
        </div>

        {/* Subtasks indicator */}
        {task.subTasks?.length > 0 && !showSubTasks && (
          <div className="absolute bottom-1 right-2 flex items-center gap-1 z-10 bg-white rounded-full px-1 shadow-sm">
            <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">
              {task.subTasks.length}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowSubTasks(!showSubTasks);
              }}
              className="text-blue-600 hover:text-blue-800 transition-colors p-1"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
            <UnifiedTaskDropdown
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onAddSubTask={onAddSubTask}
              variant="matrix"
              className="relative"
            />
          </div>
        )}

        {/* Actions menu when no subtasks */}
        {(!task.subTasks?.length || task.subTasks.length === 0) && (
          <UnifiedTaskDropdown
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onAddSubTask={onAddSubTask}
            variant="matrix"
          />
        )}

        {/* Subtasks toggle when expanded */}
        {task.subTasks?.length > 0 && showSubTasks && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-600 font-medium">
              {task.subTasks.length} subtask{task.subTasks.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSubTasks(!showSubTasks);
                }}
                className="text-blue-600 hover:text-blue-800 transition-colors p-1 flex items-center gap-1"
              >
                <ChevronDown className="h-3 w-3" />
                <span className="text-xs">Collapse</span>
              </button>
              <UnifiedTaskDropdown
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onAddSubTask={onAddSubTask}
                variant="matrix"
                className="relative"
              />
            </div>
          </div>
        )}

        {/* Expanded subtasks */}
        {showSubTasks && task.subTasks?.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 bg-gray-50 rounded-b-lg -mx-3 -mb-3 px-3 pb-3">
            <UnifiedSubTaskManager
              subTasks={task.subTasks}
              depth={0}
              isDarkMode={isDarkMode}
              variant="matrix"
              onTaskClick={onTaskClick}
              onAddSubTask={onAddSubTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          </div>
        )}
      </div>
    );
  }

  // Timeline variant would be handled separately due to its unique rendering requirements
  return null;
});

UnifiedTaskCard.displayName = 'UnifiedTaskCard';