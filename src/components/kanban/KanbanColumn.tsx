import React, { useState, memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreVertical, Edit3, Palette, StickyNote, Trash2 } from 'lucide-react';
import { Button, Input, Textarea, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Task } from '@/types/task';
import { KanbanTask } from './KanbanTask';

interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  noteContent?: string;
  isNoteMode?: boolean;
}

interface TaskColumnMapping {
  [taskId: string]: string;
}

interface KanbanColumnProps {
  column: KanbanColumn;
  tasks: Task[];
  taskColumnMapping: TaskColumnMapping;
  onColumnUpdate: (columnId: string, updates: Partial<KanbanColumn>) => void;
  onColumnDelete: (columnId: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskHeaderDoubleClick: (task: Task) => void;
  onTaskLowerPortionClick: (task: Task) => void;
  onAddSubTask?: (parentId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  isDarkMode: boolean;
  draggableTaskId: string | null;
}

export const KanbanColumn = memo<KanbanColumnProps>(({ 
  column, 
  tasks, 
  taskColumnMapping, 
  onColumnUpdate, 
  onColumnDelete, 
  onTaskClick, 
  onTaskHeaderDoubleClick, 
  onTaskLowerPortionClick, 
  onAddSubTask, 
  onDeleteTask, 
  onEditTask, 
  isDarkMode, 
  draggableTaskId 
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(column.name);

  const handleNameSave = () => {
    onColumnUpdate(column.id, { name: newName });
    setEditingName(false);
  };

  const handleNoteUpdate = (noteContent: string) => {
    onColumnUpdate(column.id, { noteContent });
  };

  const toggleNoteMode = () => {
    onColumnUpdate(column.id, { isNoteMode: !column.isNoteMode });
  };

  const columnTasks = tasks.filter(task => taskColumnMapping[task.id] === column.id);

  return (
    <div className="flex flex-col h-full w-full min-w-[200px]">
      {/* Column Header */}
      <div 
        className="p-3 border-b border-white/20 flex items-center justify-between flex-shrink-0"
        style={{ backgroundColor: `${column.color}20` }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: column.color }}
          />
          {editingName ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
              onBlur={handleNameSave}
              className="bg-white/10 border-white/20 text-sm h-6"
              autoFocus
            />
          ) : (
            <h3 className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {column.name}
            </h3>
          )}
          
          {column.noteContent && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 hover:bg-white/20 rounded-full transition-all"
              onClick={toggleNoteMode}
              style={{ 
                backgroundColor: column.isNoteMode ? `${column.color}40` : 'transparent',
                border: column.isNoteMode ? `1px solid ${column.color}60` : 'none'
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" style={{ color: column.isNoteMode ? column.color : '#9CA3AF' }}>
                <rect x="4" y="6" width="16" height="2" rx="1"/>
                <rect x="4" y="11" width="16" height="2" rx="1"/>
                <rect x="4" y="16" width="10" height="2" rx="1"/>
              </svg>
            </Button>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white/20 border border-white/20 shadow-xl rounded-lg p-1 min-w-[140px]">
            <DropdownMenuItem 
              onClick={() => setEditingName(true)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/30 transition-all cursor-pointer text-xs"
            >
              <Edit3 className="h-3 w-3" />
              <span>Rename</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setShowColorPicker(true)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/30 transition-all cursor-pointer text-xs"
            >
              <Palette className="h-3 w-3" />
              <span>Change Color</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={toggleNoteMode}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/30 transition-all cursor-pointer text-xs"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                <rect x="4" y="6" width="16" height="2" rx="1"/>
                <rect x="4" y="11" width="16" height="2" rx="1"/>
                <rect x="4" y="16" width="10" height="2" rx="1"/>
              </svg>
              <span>Note</span>
            </DropdownMenuItem>
            
            <div className="my-1 h-px bg-white/20" />
            
            <DropdownMenuItem 
              onClick={() => onColumnDelete(column.id)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-red-500/20 transition-all cursor-pointer text-xs text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Column Content */}
      <div 
        ref={setNodeRef}
        className={`flex-1 p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto transition-all duration-200 ${
          isOver ? 'bg-white/10 border-2 border-dashed border-white/30' : ''
        }`}
      >
        {column.isNoteMode ? (
          <div className="h-full">
            <Textarea
              value={column.noteContent || ''}
              onChange={(e) => handleNoteUpdate(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full h-full min-h-[300px] bg-white/10 border-white/20 text-gray-800 placeholder:text-gray-500 resize-none"
            />
          </div>
        ) : (
          <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <KanbanTask
                  key={task.id}
                  task={task}
                  isDarkMode={isDarkMode}
                  zIndex={1}
                  onClick={() => onTaskClick(task)}
                  onHeaderDoubleClick={() => onTaskHeaderDoubleClick(task)}
                  onLowerPortionClick={() => onTaskLowerPortionClick(task)}
                  onAddSubTask={onAddSubTask}
                  onDeleteTask={onDeleteTask}
                  onEditTask={onEditTask}
                  onTaskClick={onTaskClick}
                  isDraggable={draggableTaskId === task.id}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {/* Color Picker */}
      {showColorPicker && (
        <ColorPicker
          isDarkMode={isDarkMode}
          onColorSelect={(color) => {
            onColumnUpdate(column.id, { color });
            setShowColorPicker(false);
          }}
          selectedColor={column.color || '#EF4444'}
        />
      )}
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';