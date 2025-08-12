import React, { useState } from 'react';
import { CalendarTask } from './CalendarTemplate';
import { TaskDropdownMenu } from './TaskDropdownMenu';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';

interface UnscheduledTaskIconProps {
  unscheduledTasks: CalendarTask[];
  onTaskEdit: (task: CalendarTask) => void;
  onTaskDelete: (taskId: string) => void;
  onAddSubTask: (task: CalendarTask) => void;
}

export const UnscheduledTaskIcon: React.FC<UnscheduledTaskIconProps> = ({
  unscheduledTasks,
  onTaskEdit,
  onTaskDelete,
  onAddSubTask
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  if (unscheduledTasks.length === 0) return null;

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getSubtasks = (parentId: string): CalendarTask[] => {
    return unscheduledTasks.filter(task => task.parentId === parentId);
  };

  const hasSubtasks = (taskId: string): boolean => {
    return unscheduledTasks.some(task => task.parentId === taskId);
  };

  const getSubtaskCount = (taskId: string): number => {
    return unscheduledTasks.filter(task => task.parentId === taskId).length;
  };

  const renderSubtasks = (parentTask: CalendarTask, level: number = 0): React.ReactNode => {
    const subtasks = getSubtasks(parentTask.id);
    if (!subtasks.length || !expandedTasks.has(parentTask.id)) return null;

    return (
      <div className="ml-4 mt-1 space-y-1">
        {subtasks.map((subtask) => {
          const hasChildren = hasSubtasks(subtask.id);
          
          return (
            <div key={`unscheduled-subtask-${subtask.id}`}>
              <div 
                className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-foreground hover:bg-muted/80 transition-colors"
                style={{ 
                  paddingLeft: `${(level + 1) * 12}px`,
                }}
              >
                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskExpansion(subtask.id);
                    }}
                    className="p-1 hover:bg-accent rounded-sm"
                  >
                    {expandedTasks.has(subtask.id) ? 
                      <ChevronDown className="h-3 w-3" /> : 
                      <ChevronRight className="h-3 w-3" />
                    }
                  </button>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{subtask.title}</div>
                  {subtask.description && subtask.description !== 'Click to add description...' && (
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {subtask.description}
                    </div>
                  )}
                </div>
                
                {hasChildren && (
                  <span className="text-xs bg-accent px-1 py-0.5 rounded">
                    {getSubtaskCount(subtask.id)}
                  </span>
                )}
                
                <TaskDropdownMenu
                  task={subtask}
                  onEdit={onTaskEdit}
                  onDelete={onTaskDelete}
                  onAddSubTask={onAddSubTask}
                  showAddSubTask={true}
                />
              </div>
              
              {/* Render nested subtasks */}
              {renderSubtasks(subtask, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  // Filter root tasks (tasks without parent)
  const rootTasks = unscheduledTasks.filter(task => !task.parentId);

  return (
    <div className="relative">
      {/* Unscheduled Task Icon */}
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm"
        title={`${unscheduledTasks.length} unscheduled task${unscheduledTasks.length > 1 ? 's' : ''}`}
      >
        {unscheduledTasks.length}
      </button>

      {/* Popup with unscheduled tasks */}
      {showPopup && (
        <>
          {/* Backdrop to close popup */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowPopup(false)}
          />
          
          {/* Popup content */}
          <div className="absolute right-0 top-8 z-20 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl min-w-64 max-w-80 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-border">
              <h3 className="font-medium text-sm text-foreground">
                Unscheduled Tasks ({unscheduledTasks.length})
              </h3>
            </div>
            
            <div className="p-2 space-y-1">
              {rootTasks.map((task) => {
                const hasChildren = hasSubtasks(task.id);
                
                return (
                  <div key={`unscheduled-task-${task.id}`}>
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/80 text-foreground transition-colors">
                      {hasChildren && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskExpansion(task.id);
                          }}
                          className="p-1 hover:bg-accent rounded-sm"
                        >
                          {expandedTasks.has(task.id) ? 
                            <ChevronDown className="h-3 w-3" /> : 
                            <ChevronRight className="h-3 w-3" />
                          }
                        </button>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{task.title}</div>
                        {task.description && task.description !== 'Click to add description...' && (
                          <div className="ql-read-mode text-xs text-muted-foreground max-h-4 overflow-hidden line-clamp-1 mt-1"
                               style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
                               dangerouslySetInnerHTML={{ __html: task.description }} />
                        )}
                      </div>
                      
                      {hasChildren && (
                        <span className="text-xs bg-accent px-1 py-0.5 rounded">
                          {getSubtaskCount(task.id)}
                        </span>
                      )}
                      
                      <TaskDropdownMenu
                        task={task}
                        onEdit={onTaskEdit}
                        onDelete={onTaskDelete}
                        onAddSubTask={onAddSubTask}
                        showAddSubTask={true}
                      />
                    </div>
                    
                    {/* Render subtasks */}
                    {renderSubtasks(task)}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};