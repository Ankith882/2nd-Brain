import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Circle, Calendar, Grid3x3, Dot } from 'lucide-react';
import { Button } from '@/components/ui';
import { Task } from '@/types/task';


interface LiveTaskCounterProps {
  missionId: string;
  tasks: Task[] | undefined;
  isDarkMode: boolean;
  selectedDate: Date;
  showControls?: boolean;
}

interface TaskCounts {
  mainTasks: number;          // Only main tasks (no parent)
  directSubTasks: number;     // Direct sub-tasks (level 1)
  nestedTasks: number;        // Tasks under sub-tasks (level 2+)
}

type FilterMode = 'all' | 'month' | 'week' | 'date';

const calculateTaskCounts = (
  tasks: Task[] | undefined, 
  missionId: string, 
  selectedDate: Date, 
  filterMode: FilterMode
): TaskCounts => {
  const counts: TaskCounts = {
    mainTasks: 0,
    directSubTasks: 0,
    nestedTasks: 0
  };

  // Handle undefined or null tasks
  if (!tasks || !Array.isArray(tasks)) {
    return counts;
  }

  // Get all tasks for this mission
  let missionTasks = tasks.filter(task => task && task.missionId === missionId);

  // Apply date filtering based on mode
  if (filterMode !== 'all') {
    missionTasks = missionTasks.filter(task => {
      const taskDate = task.startTime || task.date;
      
      switch (filterMode) {
        case 'month':
          return taskDate.getMonth() === selectedDate.getMonth() && 
                 taskDate.getFullYear() === selectedDate.getFullYear();
        case 'week':
          const weekStart = new Date(selectedDate);
          weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return taskDate >= weekStart && taskDate <= weekEnd;
        case 'date':
          return taskDate.toDateString() === selectedDate.toDateString();
        default:
          return true;
      }
    });
  }

  // Count main tasks (no parentId)
  counts.mainTasks = missionTasks.filter(task => !task.parentId).length;

  // For each main task, count its direct sub-tasks and nested tasks
  missionTasks.forEach(task => {
    if (!task.parentId) {
      // This is a main task, count its sub-tasks
      counts.directSubTasks += task.subTasks?.length || 0;
      
      // Count nested tasks (tasks under sub-tasks)
      if (task.subTasks) {
        task.subTasks.forEach(subTask => {
          counts.nestedTasks += countNestedTasks(subTask);
        });
      }
    }
  });

  return counts;
};

const countNestedTasks = (task: Task): number => {
  let count = task.subTasks?.length || 0;
  
  // Recursively count all nested levels
  if (task.subTasks) {
    task.subTasks.forEach(subTask => {
      count += countNestedTasks(subTask);
    });
  }
  
  return count;
};

export const LiveTaskCounter: React.FC<LiveTaskCounterProps> = ({
  missionId,
  tasks,
  isDarkMode,
  selectedDate,
  showControls = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const taskCounts = useMemo(() => 
    calculateTaskCounts(tasks, missionId, selectedDate, filterMode), 
    [tasks, missionId, selectedDate, filterMode]
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleFilterCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Add visual feedback with a brief animation
    const button = e.currentTarget as HTMLButtonElement;
    button.style.transform = 'scale(0.95)';
    button.style.transition = 'transform 0.1s ease-in-out';
    
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
    
    setFilterMode(prev => {
      switch (prev) {
        case 'all': return 'month';
        case 'month': return 'week';
        case 'week': return 'date';
        case 'date': return 'all';
        default: return 'all';
      }
    });
  };

  const getFilterIcon = () => {
    switch (filterMode) {
      case 'all': return Circle;
      case 'month': return Calendar;
      case 'week': return Grid3x3;
      case 'date': return Dot;
      default: return Circle;
    }
  };

  const getFilterLabel = () => {
    const now = selectedDate;
    switch (filterMode) {
      case 'all': return 'All';
      case 'month': return `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)}`;
      case 'week': {
        // Calculate week of the month (1st, 2nd, 3rd, 4th week)
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const weekOfMonth = Math.ceil((now.getDate() + firstDayOfMonth.getDay()) / 7);
        const getOrdinal = (n: number) => {
          const s = ['th', 'st', 'nd', 'rd'];
          const v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        return `${getOrdinal(weekOfMonth)} Week`;
      }
      case 'date': return `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear().toString().slice(-2)}`;
      default: return 'All';
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/30 backdrop-blur-sm border border-border/30">
      {showControls && (
        <Button
          variant="ghost"
          size="sm"
          className="p-0.5 h-5 w-5 hover:bg-accent/30 rounded"
          onClick={handleToggle}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-foreground/70" />
          ) : (
            <ChevronRight className="h-3 w-3 text-foreground/70" />
          )}
        </Button>
      )}

      <div className="flex flex-col gap-1 flex-1">
        {!isExpanded ? (
          // Minimized view - only main tasks count
          <div className="flex items-center gap-1.5">
            {showControls && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0.5 h-5 w-5 rounded-full border border-border/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110 active:scale-95 group"
                onClick={handleFilterCycle}
              >
                {React.createElement(getFilterIcon(), { className: "h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors duration-200" })}
              </Button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-foreground">
                {taskCounts.mainTasks}
              </span>
              {showControls && (
                <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted/40 rounded">
                  {getFilterLabel()}
                </span>
              )}
            </div>
          </div>
        ) : (
          // Maximized view - detailed breakdown
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 pb-1 border-b border-border/30">
              {showControls && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0.5 h-5 w-5 rounded-full border border-border/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110 active:scale-95 group"
                  onClick={handleFilterCycle}
                >
                  {React.createElement(getFilterIcon(), { className: "h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors duration-200" })}
                </Button>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-foreground">
                  Tasks
                </span>
                {showControls && (
                  <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted/40 rounded">
                    {getFilterLabel()}
                  </span>
                )}
              </div>
            </div>
            
            {/* Task Statistics - Vertical Layout */}
            <div className="flex flex-col gap-1">
              {/* Main Tasks */}
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                <span className="text-[10px] font-medium text-foreground/70">
                  Main Tasks
                </span>
                <span className="text-xs font-semibold text-primary">
                  {taskCounts.mainTasks}
                </span>
              </div>

              {/* Sub-Tasks */}
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-medium text-foreground/70">
                  Sub-tasks
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {taskCounts.directSubTasks}
                </span>
              </div>

              {/* Nested Tasks */}
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                <span className="text-[10px] font-medium text-foreground/70">
                  Nested Tasks
                </span>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {taskCounts.nestedTasks}
                </span>
              </div>
            </div>

            {taskCounts.mainTasks === 0 && taskCounts.directSubTasks === 0 && taskCounts.nestedTasks === 0 && (
              <div className="flex items-center justify-center py-1 px-2 rounded bg-muted/20 border border-dashed border-border/30">
                <span className="text-[10px] text-muted-foreground">
                  No tasks yet
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};