import React from 'react';
import { CalendarTask } from './CalendarTemplate';
import { UnscheduledTaskIcon } from './UnscheduledTaskIcon';
import { TaskRenderer } from './TaskRenderer';
import { CalendarSubtaskDropdown } from './CalendarSubtaskDropdown';
import { TimeGrid } from './TimeGrid';
import { useCalendarLogic } from '@/hooks/useCalendarLogic';
import { calculateTaskPosition } from '@/utils/calendarUtils';

interface DayViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  unscheduledTasks?: CalendarTask[];
  isDarkMode: boolean;
  onTaskUpdate: (taskId: string, updates: Partial<CalendarTask>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskSelect: (task: CalendarTask) => void;
  onTaskEdit: (task: CalendarTask) => void;
  onDateChange: (date: Date) => void;
  onAddSubTask: (task: CalendarTask) => void;
  onUnscheduledTaskEdit?: (task: CalendarTask) => void;
  onUnscheduledAddSubTask?: (task: CalendarTask) => void;
}

export const DayView = ({ 
  currentDate, 
  tasks, 
  unscheduledTasks = [],
  isDarkMode, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskSelect,
  onTaskEdit,
  onAddSubTask,
  onUnscheduledTaskEdit,
  onUnscheduledAddSubTask
}: DayViewProps) => {
  const {
    hours,
    dayTasks,
    dayUnscheduledTasks,
    dayOverlappingGroups,
    hasSubtasks,
    getSubtasks,
    getSubtaskCount,
    toggleTaskExpansion,
    isExpanded,
    handleTaskDragStart,
    handleDrop,
    handleDragOver
  } = useCalendarLogic({
    tasks,
    unscheduledTasks,
    currentDate,
    currentView: 'day'
  });

  // All logic moved to hooks and utilities

  // All rendering logic moved to shared components

  return (
    <div className="h-full overflow-auto">
      <div className="relative">
        <div className="flex">
          {/* Time Column */}
          <TimeGrid 
            hours={hours}
            onDrop={(hour, minute, event) => handleDrop(currentDate, hour, minute, onTaskUpdate)(event)}
            onDragOver={handleDragOver}
          />
          
          {/* Day Column */}
          <div className="flex-1 relative min-w-0" style={{ height: `${24 * (window.innerWidth < 640 ? 48 : 64)}px` }}>
            {/* Hour Lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-12 sm:h-16 border-b-2 border-foreground/20 relative"
                style={{ minHeight: window.innerWidth < 640 ? '48px' : '64px' }}
                onDrop={handleDrop(currentDate, hour, 0, onTaskUpdate)}
                onDragOver={handleDragOver}
              >
                {/* Unscheduled Task Icon - Show only at 12 AM (hour 0) */}
                {hour === 0 && dayUnscheduledTasks.length > 0 && (
                  <div className="absolute bottom-2 right-2 z-10">
                    <UnscheduledTaskIcon
                      unscheduledTasks={dayUnscheduledTasks}
                      onTaskEdit={onUnscheduledTaskEdit || onTaskEdit}
                      onTaskDelete={onTaskDelete}
                      onAddSubTask={onUnscheduledAddSubTask || onAddSubTask}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {/* Tasks Overlay - Positioned absolutely over the hour grid */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Tasks with Overlap Support */}
              {dayOverlappingGroups.map((group, groupIndex) => 
                group.map((task, taskIndex) => {
                  console.log('Rendering task in DayView:', {
                    taskId: task.id,
                    title: task.title,
                    hasSubtasks: task.subTasks.length > 0,
                    subtaskCount: task.subTasks.length,
                    isExpanded: isExpanded(task.id)
                  });
                  
                  const taskPosition = calculateTaskPosition(task, currentDate, group, taskIndex);
                  
                  return (
                    <div key={`task-group-${task.id}`} className="pointer-events-auto">
                      <TaskRenderer
                        task={task}
                        mode="day"
                        currentDay={currentDate}
                        overlappingTasks={group}
                        taskIndex={taskIndex}
                        hasSubtasks={task.subTasks.length > 0}
                        subtaskCount={task.subTasks.length}
                        isExpanded={isExpanded(task.id)}
                        onTaskSelect={onTaskSelect}
                        onTaskEdit={onTaskEdit}
                        onTaskDelete={onTaskDelete}
                        onAddSubTask={onAddSubTask}
                        onToggleExpansion={toggleTaskExpansion}
                        onDragStart={handleTaskDragStart}
                        showAddSubTask={true}
                      />
                    
                      {/* Subtask Dropdown */}
                      <CalendarSubtaskDropdown
                        task={task}
                        isExpanded={isExpanded(task.id)}
                        onTaskClick={onTaskSelect}
                        onToggleExpansion={toggleTaskExpansion}
                        onEditTask={onTaskEdit}
                        onAddSubTask={onAddSubTask}
                        onDeleteTask={onTaskDelete}
                        position={{
                          top: taskPosition.top,
                          left: `calc(${taskPosition.left} + ${taskPosition.width} * 0.6)`,
                          width: taskPosition.width
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
