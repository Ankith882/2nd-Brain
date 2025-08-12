import React, { useMemo, useState } from 'react';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { DraggableAddButton } from '../extra-panel/DraggableAddButton';
import { OverlayDescriptionPanel } from '../OverlayDescriptionPanel';
import { Task as TaskManagerTask } from '@/types/task';
import { TaskAttachment } from '@/types/task';

export type CalendarViewType = 'day' | 'week' | 'month';

export interface CalendarTask {
  id: string;
  title: string;
  description: string;
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7';
  color: string;
  date: Date;
  missionId: string;
  order: number;
  attachments?: TaskAttachment[];
  parentId?: string;
  subTasks: CalendarTask[];
  isExpanded: boolean;
}

interface CalendarTemplateProps {
  tasks: TaskManagerTask[];
  onTaskUpdate: (taskId: string, updates: Partial<TaskManagerTask>) => void;
  onTaskMove: (taskId: string, newParentId?: string) => void;
  onAddTask: () => void;
  onTaskClick: (task: TaskManagerTask) => void;
  onAddSubTask: (parentId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: TaskManagerTask) => void;
  isDarkMode: boolean;
  missionId?: string;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  currentView?: CalendarViewType;
  onViewChange?: (view: CalendarViewType) => void;
}

export const CalendarTemplate: React.FC<CalendarTemplateProps> = ({
  tasks,
  onTaskUpdate,
  onTaskMove,
  onAddTask,
  onTaskClick,
  onAddSubTask,
  onDeleteTask,
  onEditTask,
  isDarkMode,
  missionId = "1",
  selectedDate,
  onDateSelect,
  currentView: externalCurrentView,
  onViewChange
}) => {
  const [internalCurrentView, setInternalCurrentView] = useState<CalendarViewType>('week');
  const currentView = externalCurrentView || internalCurrentView;
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [showDescriptionPanel, setShowDescriptionPanel] = useState(false);
  
  // Sync internal date state with external selectedDate prop
  React.useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  // Convert TaskManagerTask to CalendarTask format preserving hierarchy
  const { calendarTasks, unscheduledTasks } = useMemo(() => {
    const convertToCalendarTasks = (taskList: TaskManagerTask[]): { 
      calendarTasks: CalendarTask[], 
      unscheduledTasks: CalendarTask[] 
    } => {
      const scheduledResult: CalendarTask[] = [];
      const unscheduledResult: CalendarTask[] = [];
      
      // Create a map for quick lookup
      const taskMap = new Map<string, CalendarTask>();
      
      // First pass: create all tasks without subtasks
      const processTaskFirst = (task: TaskManagerTask): CalendarTask => {
        const taskData: CalendarTask = {
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
          subTasks: [], // Will be populated in second pass
          isExpanded: task.isExpanded || false
        };
        
        taskMap.set(task.id, taskData);
        return taskData;
      };
      
      // Process all tasks first
      const allTasks = taskList.map(processTaskFirst);
      
      // Second pass: build hierarchy and categorize
      allTasks.forEach(task => {
        const originalTask = taskList.find(t => t.id === task.id);
        if (originalTask?.subTasks) {
          // Recursively convert subtasks
          const convertSubTasks = (subTaskList: TaskManagerTask[]): CalendarTask[] => {
            return subTaskList.map(subTask => {
              const convertedSubTask = processTaskFirst(subTask);
              convertedSubTask.subTasks = convertSubTasks(subTask.subTasks || []);
              return convertedSubTask;
            });
          };
          task.subTasks = convertSubTasks(originalTask.subTasks);
        }
        
        // MODIFIED: Only add root tasks (no parentId) to results
        // This ensures subtasks don't appear as individual blocks
        if (!task.parentId) {
          if (!originalTask?.startTime || !originalTask?.endTime) {
            unscheduledResult.push(task);
            
            // Add all subtasks recursively to unscheduled list (copied from TimelineTemplate)
            const addSubTasksToUnscheduled = (parentTask: CalendarTask) => {
              parentTask.subTasks?.forEach(subTask => {
                unscheduledResult.push(subTask);
                addSubTasksToUnscheduled(subTask);
              });
            };
            addSubTasksToUnscheduled(task);
          } else {
            scheduledResult.push(task);
          }
        }
      });
      
      console.log('Converted calendar tasks with hierarchy (root tasks only):', {
        scheduled: scheduledResult.length,
        unscheduled: unscheduledResult.length,
        exampleTask: scheduledResult[0],
        originalTasks: tasks.length,
        firstTaskSubtasks: tasks[0]?.subTasks?.length || 0
      });
      
      return { calendarTasks: scheduledResult, unscheduledTasks: unscheduledResult };
    };
    
    return convertToCalendarTasks(tasks);
  }, [tasks]);

  const handleTaskEdit = (task: CalendarTask) => {
    // Convert CalendarTask back to TaskManagerTask format preserving sub-tasks
    const convertSubTasks = (calendarSubTasks: CalendarTask[]): TaskManagerTask[] => {
      return calendarSubTasks.map(subTask => ({
        ...subTask,
        categoryId: undefined,
        createdAt: new Date(),
        subTasks: convertSubTasks(subTask.subTasks)
      }));
    };

    const taskManagerTask: TaskManagerTask = {
      ...task,
      categoryId: undefined,
      createdAt: new Date(),
      subTasks: convertSubTasks(task.subTasks), // Preserve sub-task hierarchy
      isExpanded: task.isExpanded // Preserve expansion state
    };
    onEditTask(taskManagerTask);
  };

  const handleAddSubTask = (parentTask: CalendarTask) => {
    onAddSubTask(parentTask.id);
  };

  const handleTaskDelete = (taskId: string) => {
    // Find all subtasks and delete them recursively
    const deleteTaskAndSubtasks = (tasks: CalendarTask[], targetId: string): string[] => {
      const idsToDelete: string[] = [];
      const findSubtasks = (parentId: string) => {
        tasks.forEach(task => {
          if (task.parentId === parentId) {
            idsToDelete.push(task.id);
            findSubtasks(task.id);
          }
        });
      };
      idsToDelete.push(targetId);
      findSubtasks(targetId);
      return idsToDelete;
    };
    const idsToDelete = deleteTaskAndSubtasks(calendarTasks, taskId);
    idsToDelete.forEach(id => onDeleteTask(id));
  };

  // Enhanced task selection handler - only show description panel in Day View
  const handleTaskSelect = (task: CalendarTask) => {
    console.log('Task selected:', task.title, 'Has description:', !!task.description, 'Current view:', currentView);

    // Only show description panel in Day View for tasks/subtasks with description
    if (currentView === 'day' && task.description && task.description !== 'Click to add description...') {
      if (selectedTask?.id === task.id && showDescriptionPanel) {
        setShowDescriptionPanel(false);
        setSelectedTask(null);
      } else {
        setSelectedTask(task);
        setShowDescriptionPanel(true);
      }
    } else {
      // Default selection for tasks without descriptions or in other views
      setSelectedTask(task);
      setShowDescriptionPanel(false);
    }
  };

  const renderCurrentView = () => {
    const commonProps = {
      currentDate,
      tasks: calendarTasks,
      isDarkMode,
      onTaskUpdate,
      onTaskDelete: handleTaskDelete,
      onTaskSelect: handleTaskSelect,
      onTaskEdit: handleTaskEdit,
      onDateChange: (date: Date) => {
        setCurrentDate(date);
        if (onDateSelect) {
          onDateSelect(date);
        }
      },
      ...(currentView === 'day' && {
        onAddSubTask: handleAddSubTask
      })
    };
    
    switch (currentView) {
      case 'day':
        return <DayView {...commonProps} onAddSubTask={handleAddSubTask} unscheduledTasks={unscheduledTasks} onUnscheduledTaskEdit={handleTaskEdit} onUnscheduledAddSubTask={handleAddSubTask} />;
      case 'week':
        return <WeekView {...commonProps} onAddSubTask={handleAddSubTask} />;
      case 'month':
        return <MonthView {...commonProps} onViewChange={(view) => {
          if (onViewChange) {
            onViewChange(view);
          } else {
            setInternalCurrentView(view);
          }
        }} onAddSubTask={handleAddSubTask} />;
      default:
        return <WeekView {...commonProps} />;
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'transparent', backdropFilter: 'none', filter: 'none' }}>
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-2 sm:p-4 border-b border-white/20 gap-2 sm:gap-4" style={{ backgroundColor: 'transparent', backdropFilter: 'none', filter: 'none' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <h1 className="text-lg sm:text-2xl font-semibold text-foreground">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              ...(currentView === 'day' && {
                day: 'numeric'
              })
            })}
          </h1>
          <div className="flex gap-1 sm:gap-2">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - (currentView === 'day' ? 1 : currentView === 'week' ? 7 : 30))))} 
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              ←
            </button>
            <button 
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                if (onDateSelect) {
                  onDateSelect(today);
                }
              }} 
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + (currentView === 'day' ? 1 : currentView === 'week' ? 7 : 30))))} 
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              →
            </button>
          </div>
        </div>
        
        {/* View Buttons */}
        <div className="flex bg-white/20 rounded-lg p-0.5 sm:p-1 w-full sm:w-auto">
          <button
            onClick={() => {
              const newView = 'month';
              if (onViewChange) {
                onViewChange(newView);
              } else {
                setInternalCurrentView(newView);
              }
            }}
            className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all flex-1 sm:flex-none ${
              currentView === 'month'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => {
              const newView = 'week';
              if (onViewChange) {
                onViewChange(newView);
              } else {
                setInternalCurrentView(newView);
              }
            }}
            className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all flex-1 sm:flex-none ${
              currentView === 'week'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => {
              const newView = 'day';
              if (onViewChange) {
                onViewChange(newView);
              } else {
                setInternalCurrentView(newView);
              }
            }}
            className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all flex-1 sm:flex-none ${
              currentView === 'day'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      {/* Main Calendar Content */}
      <div className="flex-1 overflow-hidden relative">
        {renderCurrentView()}
      </div>

      {/* Draggable Add Button */}
      <DraggableAddButton 
        onClick={onAddTask} 
        isDarkMode={isDarkMode} 
      />

      {/* Description Panel - Only for Day View */}
      {currentView === 'day' && (
        <OverlayDescriptionPanel 
          selectedTask={selectedTask} 
          isDarkMode={isDarkMode} 
          isVisible={showDescriptionPanel} 
          onClose={() => {
            setShowDescriptionPanel(false);
            setSelectedTask(null);
          }} 
          onDescriptionUpdate={(description, attachments, comments) => {
            if (selectedTask) {
              const updateData: any = { description };
              if (attachments && attachments.length > 0) {
                updateData.attachments = attachments.map(att => ({
                  ...att,
                  id: Date.now().toString() + Math.random()
                }));
              }
              if (comments) {
                updateData.comments = comments;
              }
              onTaskUpdate(selectedTask.id, updateData);
            }
          }}
          onSettingsClick={() => {}} 
          onWorkspaceClick={() => {}} 
          onSignOut={() => {}} 
        />
      )}
    </div>
  );
};