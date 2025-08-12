import React from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { ChevronDown, ChevronRight, GripVertical, FileText } from 'lucide-react';
import { Task, TaskTemplate } from '@/types/task';
import { getPriorityColor, getTaskBackgroundColor } from '@/utils/taskCalculations';
import { UnifiedTaskDropdown } from '@/components/shared/UnifiedTaskDropdown';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  isDarkMode: boolean;
  template: TaskTemplate;
  level?: number;
  onTaskSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddSubTask: (parentId: string) => void;
  onToggleExpanded: (taskId: string) => void;
  showDragHandle?: boolean;
  showSubTaskToggle?: boolean;
  variant?: 'kanban' | 'matrix' | 'timeline' | 'calendar' | 'default';
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected,
  isDarkMode,
  template,
  level = 0,
  onTaskSelect,
  onEdit,
  onDelete,
  onAddSubTask,
  onToggleExpanded,
  showDragHandle = true,
  showSubTaskToggle = true,
  variant = 'default'
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskSelect(task);
  };

  const handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded(task.id);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={level > 0 ? `ml-${level * 2}` : ''}
    >
      <Card 
        className={`mb-2 cursor-pointer transition-all duration-200 group ${
          isSelected 
            ? 'border-2 border-blue-400/50 shadow-lg' 
            : 'border border-white/20 hover:brightness-110'
        }`}
        style={{
          backgroundColor: getTaskBackgroundColor(task, isSelected)
        }}
        onClick={handleCardClick}
      >
        <CardContent className="ql-read-mode p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              {showDragHandle && (
                <div {...attributes} {...listeners} className="cursor-grab flex-shrink-0">
                </div>
              )}
              
              {showSubTaskToggle && task.subTasks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpanded}
                  className="p-0.5 sm:p-1 flex-shrink-0"
                >
                  {task.isExpanded ? 
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  }
                </Button>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  {template === 'notes' && (
                    <svg className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="4" y="6" width="16" height="2" rx="1"/>
                      <rect x="4" y="11" width="16" height="2" rx="1"/>
                      <rect x="4" y="16" width="10" height="2" rx="1"/>
                    </svg>
                  )}
                  {task.priority && task.priority.trim() !== '' && task.priority !== 'P7' && (
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                  )}
                  <h4 className={`font-medium text-xs sm:text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {task.title}
                  </h4>
                  {task.subTasks.length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-blue-500/20 flex-shrink-0 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      {task.subTasks.length}
                    </span>
                  )}
                </div>
                {task.description && (
                  <div className={`ql-read-mode text-xs mt-0.5 sm:mt-1 max-h-4 overflow-hidden line-clamp-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                       style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
                       dangerouslySetInnerHTML={{ __html: task.description }} />
                )}
              </div>
            </div>
            
            <UnifiedTaskDropdown
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubTask={onAddSubTask}
              variant={variant === 'default' ? 'kanban' : variant}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};