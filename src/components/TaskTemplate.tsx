import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, Checkbox, Progress, Button, ScrollArea } from '@/components/ui';
import { UnifiedTaskDropdown } from './shared/UnifiedTaskDropdown';
import { ChevronDown, ChevronRight, MoreVertical, GripVertical, Check } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { getProgressColor } from '@/utils/progressColors';
import { FloatingTaskProgress } from './extra-panel/FloatingTaskProgress';

interface TaskTemplateProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskMove: (activeId: string, overId: string | null) => void;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onAddSubTask: (parentId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleExpanded: (taskId: string) => void;
  isDarkMode: boolean;
}

const SortableTaskItem: React.FC<{
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddSubTask: (parentId: string) => void;
  onToggleExpanded: (taskId: string) => void;
  onTaskSelect: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  selectedTaskId: string | null;
  isDarkMode: boolean;
  level: number;
}> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onAddSubTask, 
  onToggleExpanded, 
  onTaskSelect, 
  onToggleComplete,
  selectedTaskId, 
  isDarkMode, 
  level 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-500';
      case 'P2': return 'bg-orange-500';
      case 'P3': return 'bg-yellow-500';
      case 'P4': return 'bg-green-500';
      case 'P5': return 'bg-blue-500';
      case 'P6': return 'bg-purple-500';
      case 'P7': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const isSelected = selectedTaskId === task.id;

  return (
    <>
      <div ref={setNodeRef} style={style} className={`ml-${level * 2}`}>
        <Card 
          className={`mb-2 cursor-pointer transition-all duration-200 ${
            isSelected 
              ? 'border-2 border-blue-400/50 shadow-lg' 
              : 'border border-white/20 hover:brightness-110'
          } ${task.completed ? 'opacity-60' : ''}`}
          style={{
            backgroundColor: isSelected 
              ? `${task.color}40` 
              : `${task.color}20`
          }}
          onClick={() => onTaskSelect(task)}
        >
          <CardContent className="ql-read-mode p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                <div {...attributes} {...listeners} className="cursor-grab flex-shrink-0">
                </div>
                
                {/* Custom Checkbox with Tick Mark */}
                <div 
                  className="flex-shrink-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-foreground/60 hover:border-foreground/80'
                  }`}>
                    {task.completed && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
                
                {task.subTasks.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpanded(task.id);
                    }}
                    className="p-0.5 sm:p-1 flex-shrink-0"
                  >
                    {task.isExpanded ? 
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    }
                  </Button>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2">
                    {task.priority && task.priority.trim() !== '' && task.priority !== 'P7' && (
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                    )}
                    <h4 className={`font-medium text-xs sm:text-sm truncate ${
                      task.completed ? 'line-through font-bold' : ''
                    } ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {task.title}
                    </h4>
                    {task.subTasks.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-blue-500/20 flex-shrink-0 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        {task.subTasks.length}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <div className={`ql-read-mode text-xs mt-0.5 sm:mt-1 max-h-4 overflow-hidden line-clamp-1 ${
                      task.completed ? 'line-through font-bold' : ''
                    } ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                         style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
                         dangerouslySetInnerHTML={{ __html: task.description }} />
                  )}
                </div>
              </div>
              
              <UnifiedTaskDropdown
                task={task}
                onEdit={(task) => task && onEdit(task)}
                onDelete={(taskId) => onDelete(taskId)}
                onAddSubTask={(parentId) => onAddSubTask(parentId)}
                showAddSubTask={true}
                variant="common"
              />
            </div>
          </CardContent>
        </Card>
        
        {task.isExpanded && task.subTasks.length > 0 && (
          <div className="ml-2 sm:ml-4">
            <SortableContext items={task.subTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {task.subTasks.map((subTask) => (
                <SortableTaskItem
                  key={subTask.id}
                  task={subTask}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddSubTask={onAddSubTask}
                  onToggleExpanded={onToggleExpanded}
                  onTaskSelect={onTaskSelect}
                  onToggleComplete={onToggleComplete}
                  selectedTaskId={selectedTaskId}
                  isDarkMode={isDarkMode}
                  level={level + 1}
                />
              ))}
            </SortableContext>
          </div>
        )}
      </div>
    </>
  );
};

// Helper function to calculate task progress
const calculateProgress = (tasks: Task[]): number => {
  const getAllTasks = (taskList: Task[]): Task[] => {
    const allTasks: Task[] = [];
    taskList.forEach(task => {
      allTasks.push(task);
      allTasks.push(...getAllTasks(task.subTasks));
    });
    return allTasks;
  };

  const allTasks = getAllTasks(tasks);
  if (allTasks.length === 0) return 0;
  
  const completedTasks = allTasks.filter(task => task.completed);
  return Math.round((completedTasks.length / allTasks.length) * 100);
};

// Helper function to sort tasks by completion and priority
const sortTasks = (tasks: Task[]): Task[] => {
  const sortRecursively = (taskList: Task[]): Task[] => {
    const sortedTasks = [...taskList].sort((a, b) => {
      // First sort by completion status (incomplete first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Then sort by priority (P1 highest, P7 lowest)
      const priorityOrder = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5, P6: 6, P7: 7 };
      const aPriority = priorityOrder[a.priority] || 7;
      const bPriority = priorityOrder[b.priority] || 7;
      
      return aPriority - bPriority;
    });

    // Recursively sort subtasks
    return sortedTasks.map(task => ({
      ...task,
      subTasks: sortRecursively(task.subTasks)
    }));
  };

  return sortRecursively(tasks);
};

export const TaskTemplate: React.FC<TaskTemplateProps> = ({
  tasks,
  onTaskUpdate,
  onTaskMove,
  onAddTask,
  onTaskClick,
  onAddSubTask,
  onDeleteTask,
  onEditTask,
  onToggleComplete,
  onToggleExpanded,
  isDarkMode
}) => {
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onTaskMove(active.id, over.id);
    }
  };

  // Sort tasks by completion and priority
  const sortedTasks = sortTasks(tasks);
  
  // Calculate progress
  const progress = calculateProgress(tasks);
  const progressColor = getProgressColor(progress);

  return (
    <div className="h-full">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4 min-h-full relative">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {sortedTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onAddSubTask={onAddSubTask}
                  onToggleExpanded={onToggleExpanded}
                  onTaskSelect={onTaskClick}
                  onToggleComplete={onToggleComplete}
                  selectedTaskId={null}
                  isDarkMode={isDarkMode}
                  level={0}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>

      {/* Floating Task Progress Bar */}
      <FloatingTaskProgress
        progress={progress}
        progressColor={progressColor}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};