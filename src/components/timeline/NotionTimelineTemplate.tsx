import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui';
import { Task } from '@/types/task';
import { CalendarTask } from '../calendar/CalendarTemplate';
import { useTimelineCalculations } from '@/hooks/useTimelineCalculations';
import { useTaskHelpers } from '@/hooks/useTaskHelpers';
import { TimelineHeader } from './TimelineHeader';
import { TimelineTaskBlock } from './TimelineTaskBlock';
import { SubtaskDropdown } from './SubtaskDropdown';
import { startOfWeek, endOfWeek, isSameDay, isToday } from 'date-fns';

interface NotionTimelineTemplateProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskMove: (taskId: string, newColumnId: string) => void;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onAddSubTask: (parentId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  isDarkMode: boolean;
  unscheduledTasks?: CalendarTask[];
  onUnscheduledTaskEdit?: (task: CalendarTask) => void;
  onUnscheduledTaskDelete?: (taskId: string) => void;
  onUnscheduledAddSubTask?: (task: CalendarTask) => void;
  selectedDate?: Date;
}

export const NotionTimelineTemplate: React.FC<NotionTimelineTemplateProps> = ({
  tasks,
  onTaskUpdate,
  onTaskMove,
  onAddTask,
  onTaskClick,
  onAddSubTask,
  onDeleteTask,
  onEditTask,
  isDarkMode,
  unscheduledTasks = [],
  onUnscheduledTaskEdit,
  onUnscheduledTaskDelete,
  onUnscheduledAddSubTask,
  selectedDate
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const dateToUse = selectedDate || new Date();
    return startOfWeek(dateToUse, { weekStartsOn: 0 });
  });
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [focusedTimeBlock, setFocusedTimeBlock] = useState<{
    date: Date;
    hour: number;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { 
    weekDates, 
    taskBlocks, 
    DAY_WIDTH, 
    HOUR_WIDTH, 
    MINUTE_WIDTH, 
    TASK_HEIGHT 
  } = useTimelineCalculations(tasks, currentWeekStart, isZoomedIn);

  const { getSubtaskCount, getTotalSubtaskCount } = useTaskHelpers(tasks);

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getUnscheduledTasksForDate = (date: Date): CalendarTask[] => {
    return unscheduledTasks.filter(task => {
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, date);
    });
  };

  // Generate time markers based on zoom level
  const timeMarkers = [];
  if (isZoomedIn) {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const totalMinutes = hour * 60 + minute;
        const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeMarkers.push({
          hour,
          minute,
          label: timeLabel,
          position: totalMinutes * MINUTE_WIDTH
        });
      }
    }
  } else {
    for (let hour = 0; hour < 24; hour += 4) {
      const timeLabel = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
      timeMarkers.push({
        hour,
        label: timeLabel,
        position: hour * HOUR_WIDTH
      });
    }
  }

  const scrollToTimeBlock = (date: Date, hour: number, zoomState: boolean = isZoomedIn) => {
    if (!scrollRef.current) return;
    const dayIndex = weekDates.findIndex(d => isSameDay(d, date));
    if (dayIndex === -1) return;

    const hourWidth = zoomState ? 240 : 40;
    const minuteWidth = zoomState ? 4 : 0;
    const timePosition = zoomState ? hour * 60 * minuteWidth : hour * hourWidth;
    const dayWidth = hourWidth * 24;
    const scrollLeft = dayIndex * dayWidth + timePosition - scrollRef.current.clientWidth / 2;
    const clampedScrollLeft = Math.max(0, scrollLeft);
    
    scrollRef.current.scrollLeft = clampedScrollLeft;
  };

  const handleTimeBlockDoubleClick = (date: Date, hour: number) => {
    setFocusedTimeBlock({ date, hour });
    const newZoomState = !isZoomedIn;
    setIsZoomedIn(newZoomState);

    setTimeout(() => {
      scrollToTimeBlock(date, hour, newZoomState);
    }, 200);
  };

  // Effect to handle selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const selectedWeekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });

      if (selectedWeekStart.getTime() !== currentWeekStart.getTime()) {
        setCurrentWeekStart(selectedWeekStart);
      }

      setTimeout(() => {
        const dayIndex = weekDates.findIndex(d => isSameDay(d, selectedDate));
        if (dayIndex !== -1 && scrollRef.current) {
          const dayPosition = dayIndex * DAY_WIDTH + DAY_WIDTH / 2;
          const scrollLeft = dayPosition - scrollRef.current.clientWidth / 2;
          scrollRef.current.scrollLeft = Math.max(0, scrollLeft);
        }
      }, 100);
    }
  }, [selectedDate, currentWeekStart, weekDates, DAY_WIDTH]);

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="min-h-full flex flex-col" style={{ backgroundColor: 'transparent', backdropFilter: 'none', filter: 'none' }}>
        <div className="flex-1 overflow-hidden">
          <div 
            ref={scrollRef} 
            className="h-full overflow-x-auto overflow-y-auto" 
            style={{ scrollBehavior: 'smooth' }}
          >
            <div style={{ minWidth: `${weekDates.length * DAY_WIDTH}px` }}>
              <TimelineHeader
                weekDates={weekDates}
                selectedDate={selectedDate}
                isZoomedIn={isZoomedIn}
                timeMarkers={timeMarkers}
                dayWidth={DAY_WIDTH}
                hourWidth={HOUR_WIDTH}
                minuteWidth={MINUTE_WIDTH}
                unscheduledTasks={unscheduledTasks}
                onUnscheduledTaskEdit={onUnscheduledTaskEdit}
                onUnscheduledTaskDelete={onUnscheduledTaskDelete}
                onUnscheduledAddSubTask={onUnscheduledAddSubTask}
                onTimeBlockDoubleClick={handleTimeBlockDoubleClick}
                getUnscheduledTasksForDate={getUnscheduledTasksForDate}
              />

              <div className="relative" style={{ height: '600px' }}>
                {/* Background grid */}
                <div className="absolute inset-0" style={{ backdropFilter: 'none', filter: 'none' }}>
                  {weekDates.map((_, index) => (
                    <div 
                      key={index} 
                      className="absolute top-0 bottom-0 border-r border-transparent" 
                      style={{
                        left: `${index * DAY_WIDTH}px`,
                        width: `${DAY_WIDTH}px`,
                        backgroundColor: 'transparent',
                        backdropFilter: 'none',
                        filter: 'none'
                      }}
                    >
                      {Array.from({ length: 24 }, (_, hour) => (
                        <div 
                          key={hour} 
                          className="absolute top-0 bottom-0 border-r border-border/10" 
                          style={{ left: `${hour * HOUR_WIDTH}px` }} 
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Task blocks */}
                {taskBlocks.map((block) => {
                  const subtaskCount = getSubtaskCount(block.task.id);
                  const isExpanded = expandedTasks.has(block.task.id);
                  const level = 0; // Root tasks only

                  return (
                    <TimelineTaskBlock
                      key={block.task.id}
                      block={block}
                      level={level}
                      dayWidth={DAY_WIDTH}
                      isExpanded={isExpanded}
                      subtaskCount={subtaskCount}
                      tasks={tasks}
                      onTaskClick={onTaskClick}
                      onToggleExpansion={toggleTaskExpansion}
                      onEditTask={onEditTask}
                      onAddSubTask={onAddSubTask}
                      onDeleteTask={onDeleteTask}
                    />
                  );
                })}

                {/* Subtask dropdowns */}
                {taskBlocks.map((block) => (
                  <SubtaskDropdown
                    key={`subtasks-${block.task.id}`}
                    block={block}
                    tasks={tasks}
                    expandedTasks={expandedTasks}
                    currentWeekStart={currentWeekStart}
                    dayWidth={DAY_WIDTH}
                    taskHeight={TASK_HEIGHT}
                    onTaskClick={onTaskClick}
                    onToggleExpansion={toggleTaskExpansion}
                    onEditTask={onEditTask}
                    onAddSubTask={onAddSubTask}
                    onDeleteTask={onDeleteTask}
                    getTotalSubtaskCount={getTotalSubtaskCount}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};