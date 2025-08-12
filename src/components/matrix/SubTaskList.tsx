import React, { useState, memo } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui';
import { UnifiedTaskDropdown } from '../shared/UnifiedTaskDropdown';
import { Task } from '@/types/task';

interface SubTaskListProps {
  subTasks: Task[];
  depth: number;
  isDarkMode: boolean;
  onTaskClick: (task: Task) => void;
  onAddSubTask?: (parentId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

const SubTaskItem = memo<{
  task: Task;
  depth: number;
  isDarkMode: boolean;
  onTaskClick: (task: Task) => void;
  onAddSubTask?: (parentId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleExpanded: (taskId: string) => void;
  isExpanded: boolean;
  totalSubTasks: number;
}>(({ task, depth, isDarkMode, onTaskClick, onAddSubTask, onEditTask, onDeleteTask, onToggleExpanded, isExpanded, totalSubTasks }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskClick(task);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded(task.id);
  };

  return (
    <div>
      <div 
        className="flex flex-col gap-1 text-xs p-2 rounded border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
        style={{ backgroundColor: `${task.color}20` }}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {totalSubTasks > 0 && (
              <button onClick={handleToggle} className="hover:bg-white/20 p-1 rounded">
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            )}
            <span className="truncate font-medium">{task.title}</span>
            {totalSubTasks > 0 && (
              <span className="text-xs text-gray-400 bg-white/10 px-1 rounded">
                {totalSubTasks}
              </span>
            )}
          </div>
          
          <UnifiedTaskDropdown
            task={task}
            onEdit={(task) => onEditTask && task && onEditTask(task)}
            onDelete={(taskId) => onDeleteTask && onDeleteTask(taskId)}
            onAddSubTask={onAddSubTask ? (parentId) => onAddSubTask(parentId) : undefined}
            showAddSubTask={!!onAddSubTask}
            variant="matrix"
            className="relative"
          />
        </div>
        
        {task.description && (
          <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>
            {task.description.length > 80 ? `${task.description.substring(0, 80)}...` : task.description}
          </div>
        )}
      </div>
      
      {isExpanded && (
        <SubTaskList
          subTasks={task.subTasks}
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
});

export const SubTaskList = memo<SubTaskListProps>(({ subTasks, depth, isDarkMode, onTaskClick, onAddSubTask, onEditTask, onDeleteTask }) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleExpanded = (taskId: string) => {
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

  const getSubTaskCount = (task: Task): number => {
    return task.subTasks.length + task.subTasks.reduce((count, subTask) => count + getSubTaskCount(subTask), 0);
  };

  if (!subTasks?.length) return null;

  return (
    <div className={`space-y-1 ${depth > 0 ? 'ml-4 pl-2 border-l border-white/20' : ''}`}>
      {subTasks.map(subTask => (
        <SubTaskItem
          key={subTask.id}
          task={subTask}
          depth={depth}
          isDarkMode={isDarkMode}
          onTaskClick={onTaskClick}
          onAddSubTask={onAddSubTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onToggleExpanded={toggleExpanded}
          isExpanded={expandedTasks.has(subTask.id)}
          totalSubTasks={getSubTaskCount(subTask)}
        />
      ))}
    </div>
  );
});