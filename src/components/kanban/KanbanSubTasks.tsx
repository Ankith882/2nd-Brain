import React, { useState, memo } from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { UnifiedTaskDropdown } from '../shared/UnifiedTaskDropdown';
import { Task } from '@/types/task';

interface KanbanSubTasksProps {
  subTasks: Task[];
  depth: number;
  isDarkMode: boolean;
  onTaskClick: (task: Task) => void;
  onAddSubTask?: (parentId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

const getSubTaskCount = (task: Task): number => {
  let count = task.subTasks.length;
  for (const subTask of task.subTasks) {
    count += getSubTaskCount(subTask);
  }
  return count;
};

export const KanbanSubTasks = memo<KanbanSubTasksProps>(({ 
  subTasks, 
  depth, 
  isDarkMode, 
  onTaskClick, 
  onAddSubTask, 
  onEditTask, 
  onDeleteTask 
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      newSet.has(taskId) ? newSet.delete(taskId) : newSet.add(taskId);
      return newSet;
    });
  };

  if (!subTasks?.length) return null;

  return (
    <div className={`space-y-1 ${depth > 0 ? 'ml-4 pl-2 border-l border-white/20' : ''}`}>
      {subTasks.map((subTask) => {
        const isExpanded = expandedTasks.has(subTask.id);
        const totalSubTasks = getSubTaskCount(subTask);
        
        return (
          <div key={subTask.id}>
            <div
              className="flex flex-col gap-1 text-xs p-2 rounded border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
              style={{ backgroundColor: `${subTask.color}20` }}
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick(subTask);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {totalSubTasks > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-4 w-4 hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(subTask.id);
                      }}
                    >
                      {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                  )}
                  <span className="truncate font-medium">{subTask.title}</span>
                  {totalSubTasks > 0 && (
                    <span className="text-xs text-gray-400 bg-white/10 px-1 rounded">
                      {totalSubTasks}
                    </span>
                  )}
                </div>
                
                <UnifiedTaskDropdown
                  task={subTask}
                  onEdit={(task) => onEditTask && task && onEditTask(task)}
                  onDelete={(taskId) => onDeleteTask && onDeleteTask(taskId)}
                  onAddSubTask={onAddSubTask ? (parentId) => onAddSubTask(parentId) : undefined}
                  showAddSubTask={!!onAddSubTask}
                  variant="kanban"
                />
              </div>
              
              {subTask.description && (
                <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                  {subTask.description.length > 80 ? `${subTask.description.substring(0, 80)}...` : subTask.description}
                </div>
              )}
            </div>
            
            {isExpanded && (
              <KanbanSubTasks
                subTasks={subTask.subTasks}
                depth={depth + 1}
                isDarkMode={isDarkMode}
                onTaskClick={onTaskClick}
                onAddSubTask={onAddSubTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

KanbanSubTasks.displayName = 'KanbanSubTasks';