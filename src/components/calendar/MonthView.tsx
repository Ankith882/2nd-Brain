import React, { useState } from 'react';
import { CalendarTask } from './CalendarTemplate';
import { TaskRenderer } from './TaskRenderer';
import { CalendarSubtaskDropdown } from './CalendarSubtaskDropdown';
import { TaskDropdownMenu } from './TaskDropdownMenu';
import { useCalendarShared } from '@/hooks/useCalendarShared';
import { formatTaskDateRangeForDay, isToday } from '@/utils/taskFormatting';
import { getTaskDurationMinutes, getTaskColor } from '@/utils/calendarUtils';
import { Button, ScrollArea } from '@/components/ui';
import { ChevronLeft, ChevronRight, X, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  isDarkMode: boolean;
  onTaskUpdate: (taskId: string, updates: Partial<CalendarTask>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskSelect: (task: CalendarTask) => void;
  onTaskEdit: (task: CalendarTask) => void;
  onDateChange: (date: Date) => void;
  onViewChange?: (view: 'day' | 'week' | 'month') => void;
  onAddSubTask?: (parentTask: CalendarTask) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  tasks,
  isDarkMode,
  onTaskUpdate,
  onTaskDelete,
  onTaskSelect,
  onTaskEdit,
  onDateChange,
  onViewChange,
  onAddSubTask
}) => {
  const [selectedDayTasks, setSelectedDayTasks] = useState<{ date: Date; tasks: CalendarTask[] } | null>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [expandedTasksByDay, setExpandedTasksByDay] = useState<Map<string, Set<string>>>(new Map());

  const {
    expandedTasks,
    getTaskDurationMinutes,
    getTaskColor,
    handleTaskDrag,
    createDropHandler,
    toggleTaskExpansion: globalToggleTaskExpansion,
  } = useCalendarShared(tasks);

  // Create a day-specific key for tracking expansions
  const getDayTaskKey = (day: Date, taskId: string) => {
    return `${day.toDateString()}-${taskId}`;
  };

  // Toggle expansion for a specific day
  const toggleTaskExpansionForDay = (day: Date, taskId: string) => {
    const dayKey = day.toDateString();
    const newExpandedTasksByDay = new Map(expandedTasksByDay);
    
    if (!newExpandedTasksByDay.has(dayKey)) {
      newExpandedTasksByDay.set(dayKey, new Set());
    }
    
    const dayExpansions = newExpandedTasksByDay.get(dayKey)!;
    
    if (dayExpansions.has(taskId)) {
      dayExpansions.delete(taskId);
    } else {
      dayExpansions.add(taskId);
    }
    
    setExpandedTasksByDay(newExpandedTasksByDay);
  };

  // Check if a task is expanded for a specific day
  const isTaskExpandedForDay = (day: Date, taskId: string) => {
    const dayKey = day.toDateString();
    const dayExpansions = expandedTasksByDay.get(dayKey);
    return dayExpansions ? dayExpansions.has(taskId) : false;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentMonth = currentDate.getMonth();

  // Get month grid
  const getMonthStart = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    start.setDate(start.getDate() - start.getDay());
    return start;
  };

  const monthStart = getMonthStart(currentDate);
  const monthDays = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(monthStart);
    day.setDate(monthStart.getDate() + i);
    return day;
  });

  const getTasksForDay = (day: Date) => {
    const dayTasks = tasks.filter(task => {
      const taskStart = new Date(task.startTime);
      const taskEnd = new Date(task.endTime);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      
      return taskStart <= dayEnd && taskEnd >= dayStart && !task.parentId;
    });

    return dayTasks.sort((a, b) => {
      const aIsMultiDay = a.startTime.toDateString() !== a.endTime.toDateString();
      const bIsMultiDay = b.startTime.toDateString() !== b.endTime.toDateString();
      
      if (aIsMultiDay && !bIsMultiDay) return -1;
      if (!aIsMultiDay && bIsMultiDay) return 1;
      return 0;
    });
  };

  const getVisibleTasksForDay = (day: Date) => {
    return getTasksForDay(day).slice(0, 4); // Show up to 4 tasks
  };

  const getMoreTasksCount = (day: Date) => {
    return Math.max(0, getTasksForDay(day).length - 4); // +More for tasks beyond 4
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const handleDayClick = (day: Date) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      onDateChange(day);
      if (onViewChange) {
        onViewChange('day');
      }
    } else {
      const timeout = setTimeout(() => {
        setClickTimeout(null);
        const dayTasks = getTasksForDay(day);
        if (dayTasks.length > 4) {
          setSelectedDayTasks({ date: day, tasks: dayTasks });
        }
      }, 300);
      setClickTimeout(timeout);
    }
  };

  const handleDrop = createDropHandler(onTaskUpdate);

  const renderTaskInMonth = (task: CalendarTask, currentDay: Date) => {
    const taskColor = getTaskColor(task);
    const taskHasSubtasks = task.subTasks.length > 0;
    const durationMinutes = getTaskDurationMinutes(task);

    const handleTaskDragStart = (e: React.DragEvent) => {
      handleTaskDrag(task, e);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task.id);
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onTaskSelect(task);
    };

    // Enhanced task blocks with similar styling to Day View but slimmer
    if (durationMinutes < 30) {
      // Dot style for short tasks (similar to Day View)
      return (
        <div 
          className="w-full h-full cursor-pointer group relative"
          draggable
          onDragStart={handleTaskDragStart}
          onClick={handleClick}
        >
          <div className="flex items-center p-1.5 rounded-sm hover:bg-muted/20 transition-all min-h-[24px]">
            <div 
              className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
              style={{ backgroundColor: taskColor }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className="text-xs font-medium truncate">{task.title}</span>
                {taskHasSubtasks && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskExpansionForDay(currentDay, task.id);
                      }}
                      className="ml-1 flex-shrink-0 w-4 h-4 flex items-center justify-center hover:bg-muted/40 rounded text-muted-foreground"
                    >
                      {isTaskExpandedForDay(currentDay, task.id) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRightIcon className="h-3 w-3" />
                      )}
                    </button>
                    <span className="ml-1 text-xs bg-muted/40 px-1 rounded text-muted-foreground">
                      {task.subTasks.length}
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate opacity-75">
                {formatTaskDateRangeForDay(task, currentDay)}
              </div>
            </div>
          </div>
          
          {/* Three dots dropdown menu */}
          <TaskDropdownMenu
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onAddSubTask={onAddSubTask ? () => onAddSubTask(task) : undefined}
            showAddSubTask={!!onAddSubTask}
          />
          
          {/* Subtask Dropdown */}
          {isTaskExpandedForDay(currentDay, task.id) && (
            <div className="absolute top-full left-0 z-50 mt-1">
              <CalendarSubtaskDropdown
                task={task}
                isExpanded={isTaskExpandedForDay(currentDay, task.id)}
                onTaskClick={onTaskSelect}
                onToggleExpansion={(taskId: string) => toggleTaskExpansionForDay(currentDay, taskId)}
                onEditTask={onTaskEdit}
                onAddSubTask={onAddSubTask || (() => {})}
                onDeleteTask={onTaskDelete}
                position={{
                  top: '0px',
                  left: '0px',
                  width: '280px'
                }}
              />
            </div>
          )}
        </div>
      );
    } else if (durationMinutes >= 30 && durationMinutes <= 60) {
      // Line style for medium tasks (similar to Day View)
      return (
        <div 
          className="w-full h-full cursor-pointer group relative"
          draggable
          onDragStart={handleTaskDragStart}
          onClick={handleClick}
        >
          <div className="flex items-center p-1.5 rounded-sm hover:bg-muted/20 transition-all min-h-[28px]">
            <div 
              className="w-1 h-6 mr-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: taskColor }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className="text-xs font-medium truncate">{task.title}</span>
                {taskHasSubtasks && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskExpansionForDay(currentDay, task.id);
                      }}
                      className="ml-1 flex-shrink-0 w-4 h-4 flex items-center justify-center hover:bg-muted/40 rounded text-muted-foreground"
                    >
                      {isTaskExpandedForDay(currentDay, task.id) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRightIcon className="h-3 w-3" />
                      )}
                    </button>
                    <span className="ml-1 text-xs bg-muted/40 px-1 rounded text-muted-foreground">
                      {task.subTasks.length}
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate opacity-75">
                {formatTaskDateRangeForDay(task, currentDay)}
              </div>
            </div>
          </div>
          
          {/* Three dots dropdown menu */}
          <TaskDropdownMenu
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onAddSubTask={onAddSubTask ? () => onAddSubTask(task) : undefined}
            showAddSubTask={!!onAddSubTask}
          />
          
          {/* Subtask Dropdown */}
          {isTaskExpandedForDay(currentDay, task.id) && (
            <div className="absolute top-full left-0 z-50 mt-1">
              <CalendarSubtaskDropdown
                task={task}
                isExpanded={isTaskExpandedForDay(currentDay, task.id)}
                onTaskClick={onTaskSelect}
                onToggleExpansion={(taskId: string) => toggleTaskExpansionForDay(currentDay, taskId)}
                onEditTask={onTaskEdit}
                onAddSubTask={onAddSubTask || (() => {})}
                onDeleteTask={onTaskDelete}
                position={{
                  top: '0px',
                  left: '0px',
                  width: '280px'
                }}
              />
            </div>
          )}
        </div>
      );
    } else {
      // Block style for longer tasks (glass morphic design like Day View but slimmer)
      return (
        <div 
          className="w-full h-full cursor-pointer group relative"
          draggable
          onDragStart={handleTaskDragStart}
          onClick={handleClick}
        >
          <div 
            className="w-full h-full rounded-md p-2 shadow-sm border border-white/20 transition-all hover:shadow-md hover:scale-[1.01] overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${taskColor} 0%, ${taskColor}95 50%, ${taskColor}90 100%)`,
              backdropFilter: 'none',
              boxShadow: `0 4px 16px 0 ${taskColor}30, inset 0 1px 0 0 rgba(255, 255, 255, 0.15)`,
              color: 'white',
              minHeight: '32px'
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center min-w-0 flex-1">
                <div className="text-xs font-semibold text-white drop-shadow-sm truncate">{task.title}</div>
                {taskHasSubtasks && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskExpansionForDay(currentDay, task.id);
                      }}
                      className="ml-1 flex-shrink-0 w-3 h-3 flex items-center justify-center hover:bg-white/20 rounded text-white"
                    >
                      {isTaskExpandedForDay(currentDay, task.id) ? (
                        <ChevronDown className="h-2 w-2" />
                      ) : (
                        <ChevronRightIcon className="h-2 w-2" />
                      )}
                    </button>
                    <span className="ml-1 text-xs bg-white/20 px-1 rounded text-white/90">
                      {task.subTasks.length}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-xs text-white/90 font-medium truncate">
              {formatTaskDateRangeForDay(task, currentDay)}
            </div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-md" />
          </div>
          
          {/* Three dots dropdown menu */}
          <TaskDropdownMenu
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onAddSubTask={onAddSubTask ? () => onAddSubTask(task) : undefined}
            showAddSubTask={!!onAddSubTask}
          />
          
          {/* Subtask Dropdown */}
          {isTaskExpandedForDay(currentDay, task.id) && (
            <div className="absolute top-full left-0 z-50 mt-1">
              <CalendarSubtaskDropdown
                task={task}
                isExpanded={isTaskExpandedForDay(currentDay, task.id)}
                onTaskClick={onTaskSelect}
                onToggleExpansion={(taskId: string) => toggleTaskExpansionForDay(currentDay, taskId)}
                onEditTask={onTaskEdit}
                onAddSubTask={onAddSubTask || (() => {})}
                onDeleteTask={onTaskDelete}
                position={{
                  top: '0px',
                  left: '0px',
                  width: '280px'
                }}
              />
            </div>
          )}
        </div>
      );
    }
  };

  const renderTaskInModal = (task: CalendarTask) => {
    const timeRange = formatTaskDateRangeForDay(task, new Date());
    const taskColor = getTaskColor(task);
    const taskHasSubtasks = task.subTasks.length > 0;

    return (
      <div key={`modal-task-${task.id}`} className="relative">
        <TaskRenderer
          task={task}
          mode="modal"
          hasSubtasks={taskHasSubtasks}
          subtaskCount={task.subTasks.length}
          isExpanded={expandedTasks.has(task.id)}
          onTaskSelect={(task) => {
            onTaskSelect(task);
            setSelectedDayTasks(null);
          }}
          onTaskEdit={onTaskEdit}
          onTaskDelete={onTaskDelete}
          onToggleExpansion={globalToggleTaskExpansion}
        />
        
        {/* Subtask Dropdown */}
        {expandedTasks.has(task.id) && (
          <CalendarSubtaskDropdown
            task={task}
            isExpanded={expandedTasks.has(task.id)}
            onTaskClick={(subTask) => {
              onTaskSelect(subTask);
              setSelectedDayTasks(null);
            }}
            onToggleExpansion={globalToggleTaskExpansion}
            onEditTask={onTaskEdit}
            onAddSubTask={onAddSubTask || (() => {})}
            onDeleteTask={onTaskDelete}
            position={{
              top: '100%',
              left: '0px',
              width: '400px'
            }}
          />
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-4 min-h-full relative" style={{ backgroundColor: 'transparent', backdropFilter: 'none', filter: 'none' }}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="grid grid-cols-7 border-b-2 border-foreground/30">
            {dayNames.map(day => (
              <div key={day} className="p-1 sm:p-3 text-center font-medium border-r-2 border-foreground/30 text-xs sm:text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 flex-1">
            {monthDays.map(day => {
              const dayTasks = getVisibleTasksForDay(day);
              const moreCount = getMoreTasksCount(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`border-r-2 border-b-2 border-foreground/20 p-1 sm:p-2 min-h-[120px] sm:min-h-[180px] cursor-pointer transition-colors hover:bg-muted/50 relative ${
                    !isCurrentMonth(day) ? 'bg-muted/20 text-muted-foreground opacity-50' : ''
                  } ${isToday(day) ? 'bg-primary/10 ring-2 ring-primary/50' : ''}`}
                  onClick={() => handleDayClick(day)}
                  onDrop={handleDrop(day, 0, 0)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isToday(day) ? 'text-primary' : ''}`}>
                    {day.getDate()}
                  </div>
                  
                  {/* Tasks for this day */}
                  <div className="space-y-0.5 sm:space-y-1">
                    {dayTasks.map((task, index) => (
                      <div key={`${day.toISOString()}-${task.id}-${index}`} className="relative min-h-[20px] sm:min-h-[28px]">
                        {renderTaskInMonth(task, day)}
                      </div>
                    ))}
                    
                    {/* More tasks indicator */}
                    {moreCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayTasks({ date: day, tasks: getTasksForDay(day) });
                        }}
                        className="text-xs text-primary hover:text-primary/80 font-medium w-full text-left px-1 py-0.5 sm:py-1 rounded hover:bg-muted/30 transition-colors"
                      >
                        +{moreCount} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal for day tasks */}
        {selectedDayTasks && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-medium text-foreground">
                  Tasks for {selectedDayTasks.date.toLocaleDateString()}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDayTasks(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
                {selectedDayTasks.tasks.map(task => renderTaskInModal(task))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};