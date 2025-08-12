import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, Move, X } from 'lucide-react';
import { CalendarTask } from './CalendarTemplate';
import { UnifiedTaskDropdown } from '../shared/UnifiedTaskDropdown';
import { formatTaskTime } from '@/utils/calendarUtils';

interface CalendarSubtaskDropdownProps {
  task: CalendarTask;
  isExpanded: boolean;
  onTaskClick: (task: CalendarTask) => void;
  onToggleExpansion: (taskId: string) => void;
  onEditTask: (task: CalendarTask) => void;
  onAddSubTask: (task: CalendarTask) => void;
  onDeleteTask: (taskId: string) => void;
  position: {
    top: string;
    left: string;
    width: string;
  };
}

export const CalendarSubtaskDropdown: React.FC<CalendarSubtaskDropdownProps> = ({
  task,
  isExpanded,
  onTaskClick,
  onToggleExpansion,
  onEditTask,
  onAddSubTask,
  onDeleteTask,
  position
}) => {
  // Local state for managing expansion of nested subtasks
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());
  
  // Calculate smart positioning relative to parent task
  const calculateSmartPosition = () => {
    const parentLeft = parseInt(position.left) || 0;
    const parentTop = parseInt(position.top) || 0;
    const parentWidth = parseInt(position.width) || 300;
    
    // Dropdown dimensions
    const dropdownWidth = 350;
    const dropdownHeight = 300;
    
    // Check available space below the parent task
    const spaceBelow = window.innerHeight - (parentTop + 100); // Assuming parent task height ~100px
    const spaceRight = window.innerWidth - (parentLeft + parentWidth);
    
    let finalX = parentLeft;
    let finalY = parentTop;
    
    // Position logic: try below first, then overlapping if no space
    if (spaceBelow >= dropdownHeight + 20) {
      // Enough space below - position with 8px gap
      finalY = parentTop + 100 + 8;
    } else {
      // Not enough space below - position overlapping with offset
      finalY = parentTop + 20;
    }
    
    // Ensure it doesn't go off-screen horizontally
    if (spaceRight < dropdownWidth) {
      finalX = Math.max(10, parentLeft + parentWidth - dropdownWidth);
    }
    
    // Ensure minimum margins from screen edges
    finalX = Math.max(10, Math.min(finalX, window.innerWidth - dropdownWidth - 10));
    finalY = Math.max(10, Math.min(finalY, window.innerHeight - dropdownHeight - 10));
    
    return { x: finalX, y: finalY };
  };

  // Dragging state and functionality similar to FloatingTaskProgress
  const [dropdownPosition, setDropdownPosition] = useState(calculateSmartPosition());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      e.preventDefault();
      setIsDragging(true);
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      e.preventDefault();
      setIsDragging(true);
      
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
      }
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport with margins
      const margin = 10;
      const dropdownWidth = Math.max(parseInt(position.width) || 350, 350);
      const dropdownHeight = 300;
      const maxX = window.innerWidth - dropdownWidth - margin;
      const maxY = window.innerHeight - dropdownHeight - margin;
      
      setDropdownPosition({
        x: Math.max(margin, Math.min(newX, maxX)),
        y: Math.max(margin, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset, position.width]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (isDragging) {
      e.preventDefault();
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      
      // Constrain to viewport with margins
      const margin = 10;
      const dropdownWidth = Math.max(parseInt(position.width) || 350, 350);
      const dropdownHeight = 300;
      const maxX = window.innerWidth - dropdownWidth - margin;
      const maxY = window.innerHeight - dropdownHeight - margin;
      
      setDropdownPosition({
        x: Math.max(margin, Math.min(newX, maxX)),
        y: Math.max(margin, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset, position.width]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);


  // Effect for handling drag events
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  if (!isExpanded || !task.subTasks || task.subTasks.length === 0) {
    return null;
  }

  const toggleSubtaskExpansion = (subtaskId: string) => {
    setExpandedSubtasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subtaskId)) {
        newSet.delete(subtaskId);
      } else {
        newSet.add(subtaskId);
      }
      return newSet;
    });
  };

  const getTotalSubtaskCount = (subtasks: CalendarTask[]): number => {
    let count = subtasks.length;
    subtasks.forEach(subtask => {
      if (subtask.subTasks && subtask.subTasks.length > 0) {
        count += getTotalSubtaskCount(subtask.subTasks);
      }
    });
    return count;
  };

  const renderSubtaskHierarchy = (subtasks: CalendarTask[], level: number = 0): React.ReactNode => {
    return subtasks.map((subTask) => {
      const hasSubtasks = subTask.subTasks && subTask.subTasks.length > 0;
      const isSubtaskExpanded = expandedSubtasks.has(subTask.id);
      const indentationPx = level * 16;
      const subtaskCount = hasSubtasks ? getTotalSubtaskCount(subTask.subTasks!) : 0;

      return (
        <div key={subTask.id} className="space-y-1">
          <div
            className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/10 border border-white/10 backdrop-blur-sm group"
            style={{ 
              marginLeft: `${indentationPx}px`,
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              borderLeft: `3px solid ${subTask.color}`,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onTaskClick(subTask);
            }}
          >
            {/* Hierarchy lines for visual connection */}
            {level > 0 && (
              <>
                <div 
                  className="absolute border-l border-border"
                  style={{
                    left: `${-8 - (level - 1) * 16}px`,
                    top: '0px',
                    height: '100%',
                    width: '1px'
                  }}
                />
                <div 
                  className="absolute border-t border-border"
                  style={{
                    left: `${-8 - (level - 1) * 16}px`,
                    top: '50%',
                    width: '8px',
                    height: '1px'
                  }}
                />
              </>
            )}

            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Expansion toggle for subtasks */}
              {hasSubtasks && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubtaskExpansion(subTask.id);
                  }}
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-200 border border-border backdrop-blur-sm"
                >
                  {isSubtaskExpanded ? (
                    <ChevronDown className="w-3 h-3 text-foreground" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-foreground" />
                  )}
                </button>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-foreground/90 truncate">
                    {subTask.title}
                  </div>
                  {hasSubtasks && (
                    <span className="text-xs bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-foreground/80 px-2 py-0.5 rounded-full font-medium border border-border backdrop-blur-sm">
                      {subtaskCount}
                    </span>
                  )}
                </div>
                
                {/* Show time range if available */}
                {subTask.startTime && subTask.endTime && (
                  <div className="text-xs text-muted-foreground font-mono">
                    {formatTaskTime(subTask.startTime)} – {formatTaskTime(subTask.endTime)}
                  </div>
                )}
                
                {/* Show description if available */}
                {subTask.description && subTask.description !== 'Click to add description...' && (
                  <div className="text-xs text-muted-foreground/70 truncate mt-1 max-h-4 overflow-hidden">
                    {subTask.description.length > 60 ? `${subTask.description.substring(0, 60)}...` : subTask.description}
                  </div>
                )}
              </div>
            </div>

            {/* Dropdown menu for subtask actions */}
            <UnifiedTaskDropdown
              task={subTask}
              onEdit={(task) => task && onEditTask(task)}
              onDelete={(taskId) => onDeleteTask(taskId)}
              onAddSubTask={(parentId) => onAddSubTask(subTask)}
              showAddSubTask={true}
              variant="calendar"
              triggerClassName="flex-shrink-0 p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-all duration-200 hover:bg-secondary/20 border border-border backdrop-blur-sm"
            />
          </div>

          {/* Recursive rendering of nested subtasks - INFINITE DEPTH */}
          {hasSubtasks && isSubtaskExpanded && (
            <div className="space-y-1">
              {renderSubtaskHierarchy(subTask.subTasks!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const totalSubtasks = getTotalSubtaskCount(task.subTasks);

  return createPortal(
    <div
      ref={containerRef}
      className={`fixed z-[100] rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-black/20 animate-fade-in select-none ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
      style={{
        left: `${dropdownPosition.x}px`,
        top: `${dropdownPosition.y}px`,
        width: Math.max(parseInt(position.width) || 350, 350),
        maxWidth: '450px',
        maxHeight: '300px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isDragging 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transition: isDragging ? 'none' : 'all 0.2s ease-out',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Draggable Header */}
      <div 
        className="drag-handle flex items-center justify-between p-3 border-b border-white/10 cursor-grab active:cursor-grabbing rounded-t-2xl"
      >
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-foreground/60" />
          <span className="text-xs text-foreground/80 font-medium">
            Drag to move
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpansion(task.id);
            }}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Close dropdown"
          >
            <X className="w-3 h-3 text-foreground/60" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="text-sm font-semibold text-foreground mb-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-sm"></div>
            <span className="text-foreground/90">Sub-tasks for "{task.title}"</span>
          </div>
          <span className="text-xs bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-foreground/90 px-3 py-1 rounded-full font-medium border border-border backdrop-blur-sm">
            {totalSubtasks} total
          </span>
        </div>
        <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent pr-2">
          {renderSubtaskHierarchy(task.subTasks)}
        </div>
      </div>
    </div>,
    document.body
  );
};