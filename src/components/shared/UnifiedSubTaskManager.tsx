import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Task } from '@/types/task';
import { UnifiedTaskDropdown } from './UnifiedTaskDropdown';

interface UnifiedSubTaskManagerProps {
  subTasks: Task[];
  depth: number;
  isDarkMode: boolean;
  variant: 'kanban' | 'matrix' | 'timeline' | 'calendar';
  onTaskClick?: (task: Task) => void;
  onAddSubTask?: (parentId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  maxDepth?: number;
}

export const UnifiedSubTaskManager: React.FC<UnifiedSubTaskManagerProps> = ({
  subTasks,
  depth,
  isDarkMode,
  variant,
  onTaskClick,
  onAddSubTask,
  onEditTask,
  onDeleteTask,
  maxDepth = 3
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getIndentStyle = () => {
    const baseIndent = variant === 'matrix' ? 12 : 16;
    return { paddingLeft: `${depth * baseIndent}px` };
  };

  const getSubTaskStyle = () => {
    switch (variant) {
      case 'kanban':
        return `p-2 rounded border-l-2 ${isDarkMode ? 'bg-black/10 border-gray-400' : 'bg-white/20 border-gray-300'}`;
      case 'matrix':
        return `p-1 text-xs rounded ${isDarkMode ? 'bg-gray-100' : 'bg-gray-50'}`;
      case 'timeline':
        return 'p-1 bg-white/10 rounded border border-white/20';
      case 'calendar':
        return `p-2 rounded cursor-pointer transition-all hover:bg-white/30 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-800'}`;
      default:
        return 'p-2 rounded bg-white/10';
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'kanban':
        return `text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`;
      case 'matrix':
        return `text-xs ${isDarkMode ? 'text-gray-700' : 'text-gray-600'} font-medium`;
      case 'timeline':
        return 'text-xs text-white font-medium';
      case 'calendar':
        return `text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium`;
      default:
        return 'text-xs text-gray-700 font-medium';
    }
  };

  if (!subTasks?.length || depth >= maxDepth) return null;

  return (
    <div className="space-y-1">
      {subTasks.map((subTask) => {
        const isExpanded = expandedTasks.has(subTask.id);
        const hasSubTasks = subTask.subTasks && subTask.subTasks.length > 0;

        return (
          <div key={subTask.id} className="space-y-1">
            <div 
              className={`${getSubTaskStyle()} cursor-pointer hover:bg-white/30 transition-colors relative group`}
              style={getIndentStyle()}
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick?.(subTask);
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {hasSubTasks && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpansion(subTask.id);
                      }}
                      className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-sm bg-black/10 hover:bg-black/20 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className={getTextStyle()}>
                      <span className="truncate block">{subTask.title}</span>
                    </div>
                    {subTask.description && variant !== 'matrix' && (
                      <div className={`ql-read-mode text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 max-h-4 overflow-hidden`}
                           style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
                           dangerouslySetInnerHTML={{ __html: subTask.description }} />
                    )}
                  </div>
                </div>
                
                <UnifiedTaskDropdown
                  task={subTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onAddSubTask={onAddSubTask}
                  variant={variant}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            
            {isExpanded && hasSubTasks && (
              <UnifiedSubTaskManager
                subTasks={subTask.subTasks}
                depth={depth + 1}
                isDarkMode={isDarkMode}
                variant={variant}
                onTaskClick={onTaskClick}
                onAddSubTask={onAddSubTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                maxDepth={maxDepth}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};