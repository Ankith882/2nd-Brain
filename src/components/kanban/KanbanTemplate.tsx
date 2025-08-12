import React, { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Button, Card, ScrollArea } from '@/components/ui';
import { Task } from '@/types/task';
import { OverlayDescriptionPanel } from '../OverlayDescriptionPanel';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTask } from './KanbanTask';
import { KanbanGridDialog } from './KanbanGridDialog';
import { useMissionKanbanState } from '@/hooks/useMissionKanbanState';
import { useKanbanDragDrop } from '@/hooks/useKanbanDragDrop';

interface KanbanTemplateProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskMove: (taskId: string, newColumnId: string) => void;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onAddSubTask?: (parentId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  isDarkMode: boolean;
  onDescriptionUpdate?: (description: string, attachments?: Array<{url: string, text: string, type: 'link' | 'file', color: string}>, comments?: Array<{id: string, text: string, color: string, createdAt: Date, taskId: string}>) => void;
  onSettingsClick?: () => void;
  onWorkspaceClick?: () => void;
  onSignOut?: () => void;
  missionId: string;
}

export const KanbanTemplate: React.FC<KanbanTemplateProps> = ({
  tasks,
  onTaskUpdate,
  onTaskMove,
  onAddTask,
  onTaskClick,
  onAddSubTask,
  onDeleteTask,
  onEditTask,
  isDarkMode,
  onDescriptionUpdate,
  onSettingsClick,
  onWorkspaceClick,
  onSignOut,
  missionId
}) => {
  const {
    columns,
    taskColumnMapping,
    selectedTask,
    showOverlayPanel,
    draggableTaskId,
    gridConfig,
    setTaskColumnMapping,
    setDraggableTaskId,
    handleColumnUpdate,
    handleColumnDelete,
    createGrid,
    handleTaskClick: handleTaskClickInternal,
    handleTaskLowerPortionClick,
    handleTaskDoubleClick,
    handleCloseOverlay,
    setSelectedTask
  } = useMissionKanbanState(tasks, missionId);

  const [showAddGrid, setShowAddGrid] = useState(false);
  const [gridColumns, setGridColumns] = useState<number | string>(gridConfig.columns);
  const [gridRows, setGridRows] = useState<number | string>(gridConfig.rows);

  const { draggedTask, handleDragStart, handleDragOver, handleDragEnd } = useKanbanDragDrop({
    tasks,
    columns,
    taskColumnMapping,
    setTaskColumnMapping,
    setDraggableTaskId,
    onTaskUpdate,
    onTaskMove
  });

  const handleTaskClickCombined = (task: Task) => {
    handleTaskClickInternal(task);
    onTaskClick(task);
  };

  const handleDescriptionUpdate = (description: string, attachments?: Array<{url: string, text: string, type: 'link' | 'file', color: string}>, comments?: Array<{id: string, text: string, color: string, createdAt: Date, taskId: string}>) => {
    if (selectedTask && onDescriptionUpdate) {
      // Ensure we're updating the exact task that was selected
      const updatedTask = { ...selectedTask, description };
      if (attachments && attachments.length > 0) {
        updatedTask.attachments = attachments.map(att => ({
          ...att,
          id: Date.now().toString() + Math.random()
        }));
      }
      onDescriptionUpdate(description, attachments, comments);
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
      setSelectedTask(updatedTask);
    }
  };

  const handleGridCreate = () => {
    const cols = typeof gridColumns === 'string' ? parseInt(gridColumns) || 1 : gridColumns;
    const rows = typeof gridRows === 'string' ? parseInt(gridRows) || 1 : gridRows;
    createGrid(cols, rows, tasks);
    setShowAddGrid(false);
  };

  return (
    <div className="h-full">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="bg-transparent p-4 min-h-full relative">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Kanban Board
            </h2>
            <Button
              onClick={() => setShowAddGrid(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Grid
            </Button>
          </div>

          {/* Main Content */}
          <div className="w-full overflow-x-auto">
            <DndContext 
              onDragStart={handleDragStart} 
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div 
                className="grid gap-4 w-max min-w-full"
                style={{ 
                  gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(300px, 1fr))`,
                  gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`
                }}
              >
                {columns.map((column) => (
                  <Card 
                    key={column.id}
                    className="bg-transparent border-white/20 min-h-[400px] flex flex-col"
                  >
                    <KanbanColumn
                      column={column}
                      tasks={tasks}
                      taskColumnMapping={taskColumnMapping}
                      onColumnUpdate={handleColumnUpdate}
                      onColumnDelete={handleColumnDelete}
                      onTaskClick={handleTaskClickCombined}
                      onTaskHeaderDoubleClick={handleTaskDoubleClick}
                      onTaskLowerPortionClick={handleTaskLowerPortionClick}
                      onAddSubTask={onAddSubTask}
                      onDeleteTask={onDeleteTask}
                      onEditTask={onEditTask}
                      isDarkMode={isDarkMode}
                      draggableTaskId={draggableTaskId}
                    />
                  </Card>
                ))}
              </div>
              
              <DragOverlay>
                {draggedTask && (
                  <KanbanTask
                    task={draggedTask}
                    isDarkMode={isDarkMode}
                    zIndex={9999}
                    onClick={() => {}}
                    onHeaderDoubleClick={() => {}}
                    onLowerPortionClick={() => {}}
                    isDraggable={true}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </ScrollArea>

      {/* Overlay Panel */}
      <OverlayDescriptionPanel
        selectedTask={selectedTask}
        isDarkMode={isDarkMode}
        isVisible={showOverlayPanel}
        onClose={handleCloseOverlay}
        onDescriptionUpdate={handleDescriptionUpdate}
        onSettingsClick={onSettingsClick || (() => {})}
        onWorkspaceClick={onWorkspaceClick || (() => {})}
        onSignOut={onSignOut || (() => {})}
      />

      {/* Grid Dialog */}
      <KanbanGridDialog
        isOpen={showAddGrid}
        onClose={() => setShowAddGrid(false)}
        gridColumns={gridColumns}
        gridRows={gridRows}
        onGridColumnsChange={setGridColumns}
        onGridRowsChange={setGridRows}
        onCreateGrid={handleGridCreate}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};