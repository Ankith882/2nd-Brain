import React, { useState, useEffect } from 'react';
import { Mission } from '@/hooks/useMissionManager';
import { Task, TaskTemplate } from '@/types/task';
import { useUnifiedTaskManager } from '@/hooks/useUnifiedTaskManager';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { calculateProgressForDate } from '@/utils/taskCalculations';
import { getProgressColor } from '@/utils/progressColors';
import { hasValidDescription } from '@/utils/taskValidation';
import { CalendarViewType } from './calendar/CalendarTemplate';

import { MissionHeaderContainer } from './mission/MissionHeaderContainer';
import { TaskTemplateOrchestrator } from './TaskTemplateOrchestrator';
import { TaskFormWrapper } from './task/TaskFormWrapper';
import { OverlayDescriptionPanel } from './OverlayDescriptionPanel';

interface TaskManagerProps {
  selectedMission: Mission | null;
  isDarkMode: boolean;
  onUpdateMission: (id: string, updates: Partial<Mission>) => void;
  taskState?: ReturnType<typeof useUnifiedTaskManager>;
}

export const TaskManagerSimplified: React.FC<TaskManagerProps> = ({ 
  selectedMission, 
  isDarkMode, 
  onUpdateMission,
  taskState: externalTaskState
}) => {
  // Use external task state if provided, otherwise use local state
  const localTaskState = useUnifiedTaskManager();
  const taskState = externalTaskState || localTaskState;
  const {
    tasks,
    selectedTask,
    showAddTask,
    editingTask,
    addingSubTaskParent,
    selectedDate,
    actions,
    setShowAddTask,
    setEditingTask,
    setAddingSubTaskParent
  } = taskState;

  const { filteredTasks, getTasksForDate } = useTaskFilters({
    tasks,
    selectedDate,
    missionId: selectedMission?.id || 'default',
    template: selectedMission?.template as TaskTemplate || 'notes'
  });

  // Use the enhanced handlers from the unified hook
  const {
    handleTaskEdit,
    handleTaskDelete,
    handleSubTaskAdd,
    handleTaskMove,
    handleTaskComplete
  } = taskState;

  // Description panel state
  const [showDescriptionPanel, setShowDescriptionPanel] = useState(false);
  const [selectedTaskForDescription, setSelectedTaskForDescription] = useState<Task | null>(null);
  const [lastClickedTaskId, setLastClickedTaskId] = useState<string | null>(null);
  const [dateColors, setDateColors] = useState<{[key: string]: string}>({});
  
  // Calendar view state - persisted per mission
  const [calendarView, setCalendarView] = useState<CalendarViewType>('week');

  // Sync selectedTaskForDescription with the updated task from the main tasks array
  useEffect(() => {
    if (selectedTaskForDescription) {
      // Find the updated task in the main tasks array
      const findTaskRecursively = (taskList: Task[], targetId: string): Task | null => {
        for (const task of taskList) {
          if (task.id === targetId) return task;
          if (task.subTasks?.length) {
            const found = findTaskRecursively(task.subTasks, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const updatedTask = findTaskRecursively(tasks, selectedTaskForDescription.id);
      if (updatedTask) {
        setSelectedTaskForDescription(updatedTask);
      }
    }
  }, [tasks, selectedTaskForDescription?.id]);

  const handleTaskSelect = (task: Task) => {
    actions.setSelectedTask(task);
    
    if (hasValidDescription(task)) {
      if (lastClickedTaskId === task.id && showDescriptionPanel) {
        setShowDescriptionPanel(false);
        setSelectedTaskForDescription(null);
        setLastClickedTaskId(null);
      } else {
        setShowDescriptionPanel(true);
        setSelectedTaskForDescription(task);
        setLastClickedTaskId(task.id);
      }
    } else {
      setShowDescriptionPanel(false);
      setSelectedTaskForDescription(null);
      setLastClickedTaskId(task?.id || null);
    }
  };

  const handleTaskDescriptionUpdate = (description: string, attachments?: Array<{url: string, text: string, type: 'link' | 'file', color: string}>, comments?: Array<{id: string, text: string, color: string, createdAt: Date, taskId: string}>) => {
    if (selectedTaskForDescription) {
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
      actions.updateTask(selectedTaskForDescription.id, updateData);
      const updatedTask = { ...selectedTaskForDescription, description };
      if (attachments && attachments.length > 0) {
        updatedTask.attachments = updateData.attachments;
      }
      if (comments) {
        updatedTask.comments = comments;
      }
      setSelectedTaskForDescription(updatedTask);
      
      if (!hasValidDescription(updatedTask)) {
        setShowDescriptionPanel(false);
        setSelectedTaskForDescription(null);
        setLastClickedTaskId(null);
      }
    }
  };

  const handleAddTask = () => {
    setShowAddTask(true);
  };

  const handleAddSubTask = (parentId: string) => {
    setAddingSubTaskParent(parentId);
    setShowAddTask(true);
  };

  const handleFormSave = (taskData: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order'> | Task) => {
    if ('id' in taskData) {
      // Editing existing task
      actions.updateTask(taskData.id, taskData);
    } else {
      // Adding new task
      if (addingSubTaskParent) {
        actions.addSubTask(addingSubTaskParent, taskData);
      } else {
        actions.addTask(taskData);
      }
    }
    
    setShowAddTask(false);
    setEditingTask(null);
    setAddingSubTaskParent(null);
  };

  const handleFormClose = () => {
    setShowAddTask(false);
    setEditingTask(null);
    setAddingSubTaskParent(null);
  };

  // Calculate date colors for Task Template only
  const getDateColorsForTaskTemplate = () => {
    const colors: {[key: string]: string} = {};
    const today = new Date();
    
    if (selectedMission?.template === 'task') {
      const uniqueDates = [...new Set(tasks.map(task => task.date.toDateString()))];
      
      uniqueDates.forEach(dateString => {
        const date = new Date(dateString);
        if (date <= today) {
          const progress = calculateProgressForDate(tasks, date);
          const dateKey = date.toISOString().split('T')[0];
          colors[dateKey] = getProgressColor(progress);
        }
      });
    }
    
    return colors;
  };

  const progressDateColors = getDateColorsForTaskTemplate();

  if (!selectedMission) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className={`text-lg ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
          Select a mission to manage tasks
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <MissionHeaderContainer
        mission={selectedMission}
        selectedDate={selectedDate}
        onDateSelect={actions.setSelectedDate}
        isDarkMode={isDarkMode}
        onTemplateSelect={(missionId, template) => onUpdateMission(missionId, { template })}
        tasksData={tasks}
        dateColors={selectedMission.template === 'task' ? progressDateColors : dateColors}
        getTasksForDate={getTasksForDate}
        onPreviousDate={() => {
          const newDate = new Date(selectedDate);
          newDate.setDate(newDate.getDate() - 1);
          actions.setSelectedDate(newDate);
        }}
        onNextDate={() => {
          const newDate = new Date(selectedDate);
          newDate.setDate(newDate.getDate() + 1);
          actions.setSelectedDate(newDate);
        }}
        onDateColorChange={(dateKey: string, color: string) => {
          setDateColors(prev => ({
            ...prev,
            [dateKey]: color
          }));
        }}
      >
        <TaskTemplateOrchestrator
          template={selectedMission.template as TaskTemplate}
          tasks={filteredTasks}
          selectedTaskId={selectedTask?.id || null}
          isDarkMode={isDarkMode}
          selectedDate={selectedDate}
          missionId={selectedMission.id}
          onTaskUpdate={actions.updateTask}
          onTaskMove={handleTaskMove}
          onAddTask={handleAddTask}
          onTaskClick={handleTaskSelect}
          onAddSubTask={handleAddSubTask}
          onDeleteTask={actions.deleteTask}
          onEditTask={setEditingTask}
          onToggleComplete={actions.toggleTaskComplete}
          onToggleExpanded={actions.toggleTaskExpanded}
          onDateSelect={actions.setSelectedDate}
          calendarView={calendarView}
          onCalendarViewChange={setCalendarView}
        />
      </MissionHeaderContainer>

      <TaskFormWrapper
        show={showAddTask}
        isDarkMode={isDarkMode}
        missionId={selectedMission.id}
        selectedDate={selectedDate}
        editingTask={editingTask}
        parentId={addingSubTaskParent || undefined}
        selectedTemplate={selectedMission.template as TaskTemplate}
        onSave={handleFormSave}
        onClose={handleFormClose}
      />

      <TaskFormWrapper
        show={!!editingTask}
        isDarkMode={isDarkMode}
        missionId={selectedMission.id}
        selectedDate={selectedDate}
        editingTask={editingTask}
        selectedTemplate={selectedMission.template as TaskTemplate}
        onSave={handleFormSave}
        onClose={handleFormClose}
      />

      {showDescriptionPanel && selectedTaskForDescription && (
        <OverlayDescriptionPanel
          selectedTask={selectedTaskForDescription}
          isDarkMode={isDarkMode}
          isVisible={showDescriptionPanel}
          onDescriptionUpdate={handleTaskDescriptionUpdate}
          onClose={() => {
            setShowDescriptionPanel(false);
            setSelectedTaskForDescription(null);
            setLastClickedTaskId(null);
          }}
          onSettingsClick={() => {}}
          onWorkspaceClick={() => {}}
          onSignOut={() => {}}
        />
      )}
    </div>
  );
};