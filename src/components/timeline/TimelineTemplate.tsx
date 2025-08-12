
import React, { useMemo, useState } from 'react';
import { NotionTimelineTemplate } from './NotionTimelineTemplate';
import { Task } from '@/types/task';
import { CalendarTask } from '../calendar/CalendarTemplate';
import { DraggableMenuButton } from './DraggableMenuButton';
import { CategoriesPanel } from './CategoriesPanel';
import { EnhancedAnalyticsPanel } from './EnhancedAnalyticsPanel';

interface TimelineTemplateProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskMove: (taskId: string, newColumnId: string) => void;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onAddSubTask: (parentId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  isDarkMode: boolean;
  selectedDate?: Date;
}

export const TimelineTemplate: React.FC<TimelineTemplateProps> = (props) => {
  const [menuMode, setMenuMode] = useState<'analytics' | 'categories'>('analytics');
  const [showPanel, setShowPanel] = useState(false);
  // Convert tasks to calendar format and separate scheduled/unscheduled
  const { scheduledTasks, unscheduledTasks } = useMemo(() => {
    const convertToCalendarTasks = (taskList: Task[]): { 
      scheduledTasks: Task[], 
      unscheduledTasks: CalendarTask[] 
    } => {
      const scheduledResult: Task[] = [];
      const unscheduledResult: CalendarTask[] = [];
      
      const convertTaskToCalendarTask = (task: Task): CalendarTask => {
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: task.priority,
          color: task.color,
          startTime: task.startTime ? new Date(task.startTime) : new Date(),
          endTime: task.endTime ? new Date(task.endTime) : new Date(),
          attachments: task.attachments,
          date: task.date,
          missionId: task.missionId,
          parentId: task.parentId,
          order: task.order,
          subTasks: task.subTasks.map(convertTaskToCalendarTask),
          isExpanded: task.isExpanded
        };
      };
      
      const processTask = (task: Task) => {
        // Tasks without start/end time are unscheduled
        if (!task.startTime || !task.endTime) {
          const calendarTask = convertTaskToCalendarTask(task);
          unscheduledResult.push(calendarTask);
          
          // Add all subtasks recursively to unscheduled list
          const addSubTasksToUnscheduled = (parentTask: Task) => {
            parentTask.subTasks?.forEach(subTask => {
              const subCalendarTask = convertTaskToCalendarTask(subTask);
              unscheduledResult.push(subCalendarTask);
              addSubTasksToUnscheduled(subTask);
            });
          };
          addSubTasksToUnscheduled(task);
        } else {
          scheduledResult.push(task);
        }
      };
      
      taskList.forEach(task => processTask(task));
      return { scheduledTasks: scheduledResult, unscheduledTasks: unscheduledResult };
    };
    
    return convertToCalendarTasks(props.tasks);
  }, [props.tasks]);

  const handleTaskEdit = (task: CalendarTask) => {
    // Find the original task and call onEditTask
    const originalTask = props.tasks.find(t => t.id === task.id);
    if (originalTask) {
      props.onEditTask(originalTask);
    }
  };

  const handleTaskDelete = (taskId: string) => {
    props.onDeleteTask(taskId);
  };

  const handleAddSubTask = (task: CalendarTask) => {
    props.onAddSubTask(task.id);
  };

  const handleModeChange = (mode: 'analytics' | 'categories') => {
    setMenuMode(mode);
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
  };

  return (
    <>
      <NotionTimelineTemplate 
        {...props} 
        tasks={scheduledTasks}
        unscheduledTasks={unscheduledTasks}
        onUnscheduledTaskEdit={handleTaskEdit}
        onUnscheduledTaskDelete={handleTaskDelete}
        onUnscheduledAddSubTask={handleAddSubTask}
        selectedDate={props.selectedDate}
      />
      
      {/* Draggable Menu Button - Hidden when analytics panel is open */}
      {!showPanel && (
        <DraggableMenuButton
          onModeChange={handleModeChange}
          currentMode={menuMode}
          isDarkMode={props.isDarkMode}
        />
      )}
      
      {/* Analytics Panel */}
      {showPanel && menuMode === 'analytics' && (
        <EnhancedAnalyticsPanel
          tasks={props.tasks}
          isDarkMode={props.isDarkMode}
          onClose={handleClosePanel}
        />
      )}
      
      {/* Categories Panel */}
      {showPanel && menuMode === 'categories' && (
        <CategoriesPanel
          isDarkMode={props.isDarkMode}
          onClose={handleClosePanel}
        />
      )}
    </>
  );
};
