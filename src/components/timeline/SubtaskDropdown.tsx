import React from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Edit3, Trash2, Plus } from 'lucide-react';

import { Task } from '@/types/task';
import { UnifiedTaskDropdown } from '../shared/UnifiedTaskDropdown';
import { TaskBlock as TaskBlockType, WeekSegmentTask } from '@/hooks/useTimelineCalculations';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { useTaskHelpers } from '@/hooks/useTaskHelpers';
import { endOfWeek } from 'date-fns';

interface SubtaskDropdownProps {
  block: TaskBlockType;
  tasks: Task[];
  expandedTasks: Set<string>;
  currentWeekStart: Date;
  dayWidth: number;
  taskHeight: number;
  onTaskClick: (task: Task) => void;
  onToggleExpansion: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onAddSubTask: (parentId: string) => void;
  onDeleteTask: (taskId: string) => void;
  getTotalSubtaskCount: (parentId: string) => number;
}

export const SubtaskDropdown: React.FC<SubtaskDropdownProps> = ({
  block,
  tasks,
  expandedTasks,
  currentWeekStart,
  dayWidth,
  taskHeight,
  onTaskClick,
  onToggleExpansion,
  onEditTask,
  onAddSubTask,
  onDeleteTask,
  getTotalSubtaskCount
}) => {
  const { getCategoryById } = useCategoryManager();
  const { formatTaskTime } = useTaskHelpers(tasks);
  
  const { task, left, width, dayIndex, top } = block;
  const isExpanded = expandedTasks.has(task.id);
  const originalTask = tasks.find(t => t.id === task.id);
  
  if (!isExpanded || !originalTask?.subTasks || originalTask.subTasks.length === 0) {
    return null;
  }
  
  // For multi-week task segments, show subtasks in all weeks where the task appears
  if (task.isWeekSegment && task.originalStartTime && task.originalEndTime) {
    const originalStartDate = new Date(task.originalStartTime);
    const originalEndDate = new Date(task.originalEndTime);
    const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
    
    const taskOverlapsCurrentWeek = originalStartDate <= currentWeekEnd && originalEndDate >= currentWeekStart;
    
    if (!taskOverlapsCurrentWeek) {
      return null;
    }
  }

  const renderSubtaskHierarchy = (subtasks: Task[], level: number = 0): React.ReactNode => {
    return subtasks.map((subTask) => {
      const hasSubtasks = subTask.subTasks && subTask.subTasks.length > 0;
      const isSubtaskExpanded = expandedTasks.has(subTask.id);
      const indentationPx = level * 16;

      return (
        <div key={subTask.id} className="space-y-2">
          <div
            className="group flex items-center justify-between p-2 bg-secondary/50 rounded border-l-2 hover:bg-secondary/70 cursor-pointer transition-colors"
            style={{ 
              borderLeftColor: subTask.color,
              marginLeft: `${indentationPx}px`,
              position: 'relative'
            }}
            onClick={() => onTaskClick(subTask)}
          >
            {level > 0 && (
              <>
                <div 
                  className="absolute border-l border-muted-foreground/30"
                  style={{
                    left: `${-8 - (level - 1) * 16}px`,
                    top: '0px',
                    height: '100%',
                    width: '1px'
                  }}
                />
                <div 
                  className="absolute border-t border-muted-foreground/30"
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
              {hasSubtasks && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion(subTask.id);
                  }}
                  className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-sm bg-black/10 hover:bg-black/20 transition-colors"
                >
                  {isSubtaskExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-foreground truncate flex items-center gap-1">
                    <span className="truncate">
                      {subTask.title}
                    </span>
                    {subTask.categoryId && subTask.categoryId !== 'no-category' && getCategoryById(subTask.categoryId) && (
                      <span 
                        className="text-xs px-1 py-0.5 rounded text-white font-medium"
                        style={{ backgroundColor: getCategoryById(subTask.categoryId)?.color }}
                      >
                        {getCategoryById(subTask.categoryId)?.title}
                      </span>
                    )}
                  </div>
                  {hasSubtasks && (
                    <span className="text-xs bg-black/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      {subTask.subTasks!.length}
                    </span>
                  )}
                </div>
                {subTask.startTime && subTask.endTime && (
                  <div className="text-xs text-muted-foreground">
                    {(() => {
                      const subTaskAsWeekSegment: WeekSegmentTask = {
                        ...subTask,
                        isWeekSegment: false
                      };
                      const subTaskTime = formatTaskTime(subTaskAsWeekSegment, false);
                      
                      if (typeof subTaskTime === 'string') {
                        return subTaskTime;
                      } else if ('isMultiMonth' in subTaskTime && subTaskTime.isMultiMonth) {
                        return subTaskTime.displayText;
                      } else if ('isMultiWeek' in subTaskTime && subTaskTime.isMultiWeek) {
                        return (
                          <div>
                            <div>{subTaskTime.timeRange}</div>
                            <div>{subTaskTime.dateRange}</div>
                          </div>
                        );
                      } else if ('time' in subTaskTime && 'dates' in subTaskTime && subTaskTime.time && subTaskTime.dates) {
                        return (
                          <div>
                            <div>{subTaskTime.time}</div>
                            <div>{subTaskTime.dates}</div>
                          </div>
                        );
                      } else if ('time' in subTaskTime) {
                        return subTaskTime.time;
                      } else {
                        return String(subTaskTime);
                      }
                    })()}
                  </div>
                )}
                {subTask.description && subTask.description !== 'Click to add description...' && (
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {subTask.description}
                  </div>
                )}
              </div>
            </div>

            <UnifiedTaskDropdown
              task={subTask}
              onEdit={(task) => task && onEditTask(task)}
              onDelete={(taskId) => onDeleteTask(taskId)}
              onAddSubTask={onAddSubTask ? (parentId) => onAddSubTask(parentId) : undefined}
              showAddSubTask={true}
              variant="timeline"
              className="flex-shrink-0"
            />

          </div>

          {hasSubtasks && isSubtaskExpanded && (
            <div className="space-y-2">
              {renderSubtaskHierarchy(subTask.subTasks!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className="absolute z-20 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-black/20 animate-fade-in"
      style={{
        left: `${dayIndex * dayWidth + left}px`,
        top: `${top + taskHeight + 8}px`,
        width: Math.max(width || 350, 350),
        maxWidth: '450px',
        maxHeight: '300px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="p-4">
        <div className="text-sm font-semibold text-foreground mb-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 shadow-sm"></div>
            <span className="text-foreground/90">Sub-tasks for "{originalTask.title}"</span>
          </div>
          <span className="text-xs bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-foreground/90 px-3 py-1 rounded-full font-medium border border-border backdrop-blur-sm">
            {getTotalSubtaskCount(originalTask.id)} total
          </span>
        </div>
        <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent pr-2">
          {renderSubtaskHierarchy(originalTask.subTasks)}
        </div>
      </div>
    </div>
  );
};