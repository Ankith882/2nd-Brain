import React, { useState, useMemo } from 'react';
import { Task } from '@/types/task';
import { CalendarTask } from '../calendar/CalendarTemplate';
import { NotionTimelineTemplate } from './NotionTimelineTemplate';
import { PanelFactory } from './panels/PanelFactory';
import { useAnalyticsData } from './analytics/hooks/useAnalyticsData';
import { useTimeRangeFilter } from './analytics/hooks/useTimeRangeFilter';

interface OptimizedTimelineTemplateProps {
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

export const OptimizedTimelineTemplate: React.FC<OptimizedTimelineTemplateProps> = (props) => {
  const [activePanel, setActivePanel] = useState<'analytics' | 'categories' | null>(null);
  const [showMenuButton, setShowMenuButton] = useState(true);

  // Convert tasks to calendar format (simplified)
  const { scheduledTasks, unscheduledTasks } = useMemo(() => {
    const scheduled = props.tasks.filter(task => task.startTime && task.endTime);
    const unscheduled = props.tasks
      .filter(task => !task.startTime || !task.endTime)
      .map(task => ({
        ...task,
        startTime: task.startTime ? new Date(task.startTime) : new Date(),
        endTime: task.endTime ? new Date(task.endTime) : new Date(),
      })) as CalendarTask[];
    
    return { scheduledTasks: scheduled, unscheduledTasks: unscheduled };
  }, [props.tasks]);

  const handlePanelAction = (action: string, payload?: any) => {
    switch (action) {
      case 'close':
        setActivePanel(null);
        setShowMenuButton(true);
        break;
      default:
        break;
    }
  };

  const handleModeChange = (mode: 'analytics' | 'categories') => {
    setActivePanel(mode);
    setShowMenuButton(false);
  };

  return (
    <>
      <NotionTimelineTemplate 
        {...props} 
        tasks={scheduledTasks}
        unscheduledTasks={unscheduledTasks}
        onUnscheduledTaskEdit={(task) => props.onEditTask(task as any)}
        onUnscheduledTaskDelete={props.onDeleteTask}
        onUnscheduledAddSubTask={(task) => props.onAddSubTask(task.id)}
        selectedDate={props.selectedDate}
      />
      
      {/* Simplified Menu Button */}
      {showMenuButton && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex gap-2">
            <button 
              onClick={() => handleModeChange('analytics')}
              className="px-4 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
            >
              Analytics
            </button>
            <button 
              onClick={() => handleModeChange('categories')}
              className="px-4 py-2 bg-secondary text-white rounded-lg shadow-lg hover:bg-secondary/90 transition-colors"
            >
              Categories
            </button>
          </div>
        </div>
      )}
      
      {/* Unified Panels */}
      {activePanel === 'analytics' && (
        <PanelFactory
          type="analytics"
          data={{ tasks: props.tasks }}
          onClose={() => handlePanelAction('close')}
          onAction={handlePanelAction}
          isDarkMode={props.isDarkMode}
        />
      )}
      
      {activePanel === 'categories' && (
        <PanelFactory
          type="categories"
          onClose={() => handlePanelAction('close')}
          onAction={handlePanelAction}
          isDarkMode={props.isDarkMode}
        />
      )}
    </>
  );
};