import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { ScrollArea } from '@/components/ui';
import { Task } from '@/types/task';
import { DraggableAddButton } from '../extra-panel/DraggableAddButton';
import { QUADRANT_CONFIG } from '@/types/matrix';
import { Quadrant } from './Quadrant';
import { FloatingPanel } from './FloatingPanel';
import { TaskCard } from './TaskCard';

interface MatrixTemplateProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskMove: (taskId: string, newQuadrant: string) => void;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onAddSubTask?: (parentId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  isDarkMode: boolean;
  missionId: string;
}

export const MatrixTemplate: React.FC<MatrixTemplateProps> = ({
  tasks,
  onTaskUpdate,
  onTaskMove,
  onAddTask,
  onTaskClick,
  onAddSubTask,
  onDeleteTask,
  onEditTask,
  onToggleComplete,
  isDarkMode,
  missionId
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggableTaskId, setDraggableTaskId] = useState<string | null>(null);
  const [expandedQuadrant, setExpandedQuadrant] = useState<string | null>(null);
  const [floatingPosition, setFloatingPosition] = useState({
    x: window.innerWidth - 400,
    y: window.innerHeight - 200
  });
  const [floatingSize, setFloatingSize] = useState({
    width: 300,
    height: 400
  });
  const [isMinimized, setIsMinimized] = useState(true);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDraggableTaskId(null);
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newQuadrant = over.id as string;
    const task = tasks.find(t => t.id === taskId);
    
    if (newQuadrant === 'completed') {
      const originalQuadrant = task?.quadrant || 'urgent-important';
      onTaskUpdate(taskId, {
        completed: true,
        originalQuadrant
      });
    } else if (newQuadrant === 'hold') {
      const originalQuadrant = task?.quadrant || 'urgent-important';
      onTaskUpdate(taskId, {
        quadrant: 'hold',
        originalQuadrant
      });
    } else if (['urgent-important', 'not-urgent-important', 'urgent-unimportant', 'not-urgent-unimportant'].includes(newQuadrant)) {
      onTaskMove(taskId, newQuadrant);
    }
  }, [tasks, onTaskUpdate, onTaskMove]);

  const getTasksByQuadrant = useCallback((quadrant: string) => {
    if (quadrant === 'completed') {
      return tasks.filter(task => task.completed);
    }
    if (quadrant === 'hold') {
      return tasks.filter(task => task.quadrant === 'hold' && !task.completed);
    }
    return tasks.filter(task => 
      (task.quadrant === quadrant || (!task.quadrant && quadrant === 'urgent-important')) && 
      !task.completed && 
      task.quadrant !== 'hold'
    );
  }, [tasks]);

  const handleTaskHeaderDoubleClick = useCallback((task: Task) => {
    setDraggableTaskId(task.id);
  }, []);

  const handleQuadrantTitleClick = useCallback((quadrantId: string) => {
    setExpandedQuadrant(prev => prev === quadrantId ? null : quadrantId);
  }, []);

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  return (
    <DndContext 
      onDragStart={({ active }) => setActiveId(active.id as string)} 
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-4 min-h-full relative" style={{ backgroundColor: 'transparent', backdropFilter: 'none', filter: 'none' }}>
          {/* Main Grid */}
          {expandedQuadrant ? (
            <div className="h-full">
              <Quadrant 
                key={expandedQuadrant} 
                id={expandedQuadrant} 
                title={QUADRANT_CONFIG[expandedQuadrant].title} 
                config={QUADRANT_CONFIG[expandedQuadrant]} 
                tasks={getTasksByQuadrant(expandedQuadrant)} 
                isDarkMode={isDarkMode} 
                onTaskClick={onTaskClick} 
                onTaskHeaderDoubleClick={handleTaskHeaderDoubleClick} 
                onAddSubTask={onAddSubTask} 
                onDeleteTask={onDeleteTask} 
                onEditTask={onEditTask} 
                onToggleComplete={onToggleComplete}
                onTaskUpdate={onTaskUpdate} 
                draggableTaskId={draggableTaskId}
                onTitleClick={() => handleQuadrantTitleClick(expandedQuadrant)}
              />
            </div>
          ) : (
            <div className="space-y-4 h-full">
              <div className="grid grid-cols-2 gap-4 h-1/2">
                <Quadrant 
                  key="urgent-important" 
                  id="urgent-important" 
                  title={QUADRANT_CONFIG['urgent-important'].title} 
                  config={QUADRANT_CONFIG['urgent-important']} 
                  tasks={getTasksByQuadrant('urgent-important')} 
                  isDarkMode={isDarkMode} 
                  onTaskClick={onTaskClick} 
                  onTaskHeaderDoubleClick={handleTaskHeaderDoubleClick} 
                  onAddSubTask={onAddSubTask} 
                  onDeleteTask={onDeleteTask} 
                  onEditTask={onEditTask} 
                  onToggleComplete={onToggleComplete}
                  onTaskUpdate={onTaskUpdate} 
                  draggableTaskId={draggableTaskId}
                  onTitleClick={() => handleQuadrantTitleClick('urgent-important')}
                />
                <Quadrant 
                  key="not-urgent-important" 
                  id="not-urgent-important" 
                  title={QUADRANT_CONFIG['not-urgent-important'].title} 
                  config={QUADRANT_CONFIG['not-urgent-important']} 
                  tasks={getTasksByQuadrant('not-urgent-important')} 
                  isDarkMode={isDarkMode} 
                  onTaskClick={onTaskClick} 
                  onTaskHeaderDoubleClick={handleTaskHeaderDoubleClick} 
                  onAddSubTask={onAddSubTask} 
                  onDeleteTask={onDeleteTask} 
                  onEditTask={onEditTask} 
                  onToggleComplete={onToggleComplete}
                  onTaskUpdate={onTaskUpdate} 
                  draggableTaskId={draggableTaskId}
                  onTitleClick={() => handleQuadrantTitleClick('not-urgent-important')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 h-1/2">
                <Quadrant 
                  key="urgent-unimportant" 
                  id="urgent-unimportant" 
                  title={QUADRANT_CONFIG['urgent-unimportant'].title} 
                  config={QUADRANT_CONFIG['urgent-unimportant']} 
                  tasks={getTasksByQuadrant('urgent-unimportant')} 
                  isDarkMode={isDarkMode} 
                  onTaskClick={onTaskClick} 
                  onTaskHeaderDoubleClick={handleTaskHeaderDoubleClick} 
                  onAddSubTask={onAddSubTask} 
                  onDeleteTask={onDeleteTask} 
                  onEditTask={onEditTask} 
                  onToggleComplete={onToggleComplete}
                  onTaskUpdate={onTaskUpdate} 
                  draggableTaskId={draggableTaskId}
                  onTitleClick={() => handleQuadrantTitleClick('urgent-unimportant')}
                />
                <Quadrant 
                  key="not-urgent-unimportant" 
                  id="not-urgent-unimportant" 
                  title={QUADRANT_CONFIG['not-urgent-unimportant'].title} 
                  config={QUADRANT_CONFIG['not-urgent-unimportant']} 
                  tasks={getTasksByQuadrant('not-urgent-unimportant')} 
                  isDarkMode={isDarkMode} 
                  onTaskClick={onTaskClick} 
                  onTaskHeaderDoubleClick={handleTaskHeaderDoubleClick} 
                  onAddSubTask={onAddSubTask} 
                  onDeleteTask={onDeleteTask} 
                  onEditTask={onEditTask} 
                  onToggleComplete={onToggleComplete}
                  onTaskUpdate={onTaskUpdate} 
                  draggableTaskId={draggableTaskId}
                  onTitleClick={() => handleQuadrantTitleClick('not-urgent-unimportant')}
                />
              </div>
            </div>
          )}

          {/* Floating Panel */}
          {isMinimized ? (
            <div 
              className="fixed z-40 flex items-center justify-center"
              style={{
                right: '20px',
                bottom: '20px', 
                width: '120px',
                height: '60px'
              }}
            >
              <Quadrant
                key="hold-minimized"
                id="hold"
                title="Hold Tasks"
                config={{
                  title: 'Hold Tasks',
                  bgColor: 'bg-orange-100/80',
                  borderColor: 'border-orange-200/50',
                  color: 'bg-orange-500'
                }}
                tasks={getTasksByQuadrant('hold')}
                isDarkMode={isDarkMode}
                onTaskClick={onTaskClick}
                onTaskHeaderDoubleClick={handleTaskHeaderDoubleClick}
                onAddSubTask={onAddSubTask}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
                onToggleComplete={onToggleComplete}
                onTaskUpdate={onTaskUpdate}
                draggableTaskId={draggableTaskId}
                isMinimized={true}
                onMaximize={() => setIsMinimized(false)}
              />
            </div>
          ) : (
            <FloatingPanel
              tasks={tasks}
              isDarkMode={isDarkMode}
              onTaskClick={onTaskClick}
              onTaskHeaderDoubleClick={handleTaskHeaderDoubleClick}
              onAddSubTask={onAddSubTask}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
              onToggleComplete={onToggleComplete}
              onTaskUpdate={onTaskUpdate}
              draggableTaskId={draggableTaskId}
              position={floatingPosition}
              size={floatingSize}
              onPositionChange={setFloatingPosition}
              onSizeChange={setFloatingSize}
              onMinimize={() => setIsMinimized(true)}
            />
          )}

          <DraggableAddButton onClick={onAddTask} isDarkMode={isDarkMode} />

          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                isDarkMode={isDarkMode}
                onClick={() => {}}
                onTaskClick={onTaskClick}
                onHeaderDoubleClick={() => {}}
                onAddSubTask={onAddSubTask}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
                onToggleComplete={onToggleComplete}
                isDraggable={true}
              />
            )}
          </DragOverlay>
        </div>
      </ScrollArea>
    </DndContext>
  );
};