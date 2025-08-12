import React from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskTemplate } from '@/types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  isDarkMode: boolean;
  template: TaskTemplate;
  allCollapsed?: boolean;
  onTaskSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddSubTask: (parentId: string) => void;
  onToggleExpanded: (taskId: string) => void;
  onTaskMove: (activeId: string, overId: string) => void;
  showDragHandle?: boolean;
  showSubTaskToggle?: boolean;
  variant?: 'kanban' | 'matrix' | 'timeline' | 'calendar' | 'default';
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTaskId,
  isDarkMode,
  template,
  allCollapsed = false,
  onTaskSelect,
  onEdit,
  onDelete,
  onAddSubTask,
  onToggleExpanded,
  onTaskMove,
  showDragHandle = true,
  showSubTaskToggle = true,
  variant = 'default'
}) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    onTaskMove(active.id as string, over.id as string);
  };

  const renderTask = (task: Task, level: number = 0) => {
    if (allCollapsed && level === 0) return null;

    return (
      <div key={task.id}>
        <TaskCard
          task={task}
          isSelected={selectedTaskId === task.id}
          isDarkMode={isDarkMode}
          template={template}
          level={level}
          onTaskSelect={onTaskSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubTask={onAddSubTask}
          onToggleExpanded={onToggleExpanded}
          showDragHandle={showDragHandle}
          showSubTaskToggle={showSubTaskToggle}
          variant={variant}
        />
        
        {task.isExpanded && task.subTasks.length > 0 && (
          <div className="ml-2 sm:ml-4">
            <SortableContext items={task.subTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {task.subTasks.map((subTask) => renderTask(subTask, level + 1))}
            </SortableContext>
          </div>
        )}
      </div>
    );
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => renderTask(task))}
      </SortableContext>
    </DndContext>
  );
};