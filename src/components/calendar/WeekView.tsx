import React from 'react';
import { CalendarTask } from './CalendarTemplate';
import { TaskRenderer } from './TaskRenderer';
import { CalendarSubtaskDropdown } from './CalendarSubtaskDropdown';
import { useCalendarShared } from '@/hooks/useCalendarShared';
import { formatHour, isToday } from '@/utils/taskFormatting';
import { 
  calculateTaskPosition, 
  formatTaskDateRange, 
  getTaskDurationMinutes,
  getTaskColor,
  calculateOverlappingTasks 
} from '@/utils/calendarUtils';

interface WeekViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  isDarkMode: boolean;
  onTaskUpdate: (taskId: string, updates: Partial<CalendarTask>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskSelect: (task: CalendarTask) => void;
  onTaskEdit: (task: CalendarTask) => void;
  onDateChange: (date: Date) => void;
  onAddSubTask?: (parentTask: CalendarTask) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  tasks,
  isDarkMode,
  onTaskUpdate,
  onTaskDelete,
  onTaskSelect,
  onTaskEdit,
  onAddSubTask
}) => {
  const {
    expandedTasks,
    hasSubtasks,
    getSubtaskCount,
    toggleTaskExpansion: globalToggleTaskExpansion,
    handleTaskDrag,
    createDropHandler,
  } = useCalendarShared(tasks);

  // Track expanded tasks by day for multi-day tasks
  const [expandedTasksByDay, setExpandedTasksByDay] = React.useState<Map<string, Set<string>>>(new Map());

  const toggleTaskExpansionForDay = (taskId: string, day: Date) => {
    const dayKey = day.toDateString();
    setExpandedTasksByDay(prev => {
      const newMap = new Map(prev);
      const dayExpanded = newMap.get(dayKey) || new Set();
      
      if (dayExpanded.has(taskId)) {
        dayExpanded.delete(taskId);
      } else {
        dayExpanded.add(taskId);
      }
      
      newMap.set(dayKey, dayExpanded);
      return newMap;
    });
  };

  const isTaskExpandedForDay = (taskId: string, day: Date): boolean => {
    const dayKey = day.toDateString();
    const dayExpanded = expandedTasksByDay.get(dayKey);
    return dayExpanded?.has(taskId) || false;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get week start (Sunday)
  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startTime);
      const taskEnd = new Date(task.endTime);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      return taskStart <= dayEnd && taskEnd >= dayStart;
    });
  };

  const handleDrop = createDropHandler(onTaskUpdate);

  const renderTask = (task: CalendarTask, day: Date, overlappingTasks: CalendarTask[], taskIndex: number) => {
    const position = calculateTaskPosition(task, day, overlappingTasks, taskIndex);
    const isExpandedForThisDay = isTaskExpandedForDay(task.id, day);
    
    return (
      <div key={`task-group-${task.id}`} className="pointer-events-auto">
        <TaskRenderer
          task={task}
          mode="week"
          currentDay={day}
          overlappingTasks={overlappingTasks}
          taskIndex={taskIndex}
          hasSubtasks={task.subTasks.length > 0}
          subtaskCount={task.subTasks.length}
          isExpanded={isExpandedForThisDay}
          onTaskSelect={onTaskSelect}
          onTaskEdit={onTaskEdit}
          onTaskDelete={onTaskDelete}
          onAddSubTask={onAddSubTask}
          onToggleExpansion={(taskId) => toggleTaskExpansionForDay(taskId, day)}
          onDragStart={handleTaskDrag}
          showAddSubTask={true}
        />
      
        {/* Subtask Dropdown - Only show for this specific day if expanded */}
        {isExpandedForThisDay && (
          <CalendarSubtaskDropdown
            task={task}
            isExpanded={isExpandedForThisDay}
            onTaskClick={onTaskSelect}
            onToggleExpansion={(taskId) => toggleTaskExpansionForDay(taskId, day)}
            onEditTask={onTaskEdit}
            onAddSubTask={onAddSubTask || (() => {})}
            onDeleteTask={onTaskDelete}
            position={{
              top: position.top,
              left: `calc(${position.left} + ${position.width} * 0.6)`,
              width: position.width
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto">
      <div className="relative">
        {/* Header with Days */}
        <div className="flex border-b-2 border-foreground/30 sticky top-0 z-10" style={{ backgroundColor: 'transparent', backdropFilter: 'none', filter: 'none' }}>
          <div className="w-12 sm:w-20 flex-shrink-0 border-r-2 border-foreground/30" style={{ backgroundColor: 'transparent', backdropFilter: 'none', filter: 'none' }}></div>
          {weekDays.map((day, index) => (
            <div 
              key={day.toISOString()} 
              className="flex-1 p-1 sm:p-3 text-center border-r-2 border-foreground/30 min-w-0"
            >
              <div className="text-xs text-muted-foreground">{dayNames[index]}</div>
              <div className={`text-xs sm:text-sm font-medium ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                {day.getDate()}
              </div>
              {isToday(day) && (
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-primary rounded-full mx-auto mt-1 flex items-center justify-center text-primary-foreground text-xs">
                  {day.getDate()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="flex">
          {/* Time Column */}
          <div className="w-12 sm:w-20 flex-shrink-0 border-r-2 border-foreground/30" style={{ backgroundColor: 'transparent', backdropFilter: 'none', filter: 'none' }}>
            {hours.map(hour => (
              <div 
                key={hour} 
                className="h-12 sm:h-16 border-b-2 border-foreground/20 text-xs text-foreground p-1 sm:p-2 flex items-start"
                style={{ minHeight: window.innerWidth < 640 ? '48px' : '64px' }}
              >
                <span className="font-medium text-xs sm:text-sm">{formatHour(hour)}</span>
              </div>
            ))}
          </div>
          
          {/* Day Columns */}
          {weekDays.map(day => {
            const dayTasks = getTasksForDay(day).filter(task => !task.parentId);
            const overlappingGroups = calculateOverlappingTasks(dayTasks);
            
              return (
                <div key={day.toISOString()} className="flex-1 border-r-2 border-foreground/30 relative min-w-0" style={{ height: `${24 * (window.innerWidth < 640 ? 48 : 64)}px`, filter: 'none', backdropFilter: 'none', background: 'transparent' }}>
                  {/* Hour Lines */}
                  {hours.map(hour => (
                    <div 
                      key={hour} 
                      className="h-12 sm:h-16 border-b-2 border-foreground/20 relative"
                      style={{ 
                        minHeight: window.innerWidth < 640 ? '48px' : '64px', 
                        filter: 'none', 
                        backdropFilter: 'none',
                        background: 'transparent',
                        boxShadow: 'none'
                      }}
                      onDrop={handleDrop(day, hour, 0)}
                      onDragOver={(e) => e.preventDefault()}
                    />
                  ))}
                
                {/* Tasks Overlay - Positioned absolutely over the hour grid */}
                <div className="absolute inset-0 pointer-events-none" style={{ filter: 'none', backdropFilter: 'none' }}>
                  {overlappingGroups.map((group, groupIndex) => 
                    group.map((task, taskIndex) => renderTask(task, day, group, taskIndex))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};