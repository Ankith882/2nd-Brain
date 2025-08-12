import React from 'react';
import { CalendarTask } from './CalendarTemplate';
import { TaskDropdownMenu } from './TaskDropdownMenu';
import { Button } from '@/components/ui';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';


import { getTaskDurationMinutes, formatTaskDateRange, getTaskColor, calculateTaskPosition } from '@/utils/calendarUtils';
export type TaskRenderMode = 'day' | 'week' | 'month' | 'modal';
interface TaskRendererProps {
  task: CalendarTask;
  mode: TaskRenderMode;
  currentDay?: Date;
  overlappingTasks?: CalendarTask[];
  taskIndex?: number;
  hasSubtasks?: boolean;
  subtaskCount?: number;
  isExpanded?: boolean;
  onTaskSelect: (task: CalendarTask) => void;
  onTaskEdit: (task: CalendarTask) => void;
  onTaskDelete: (taskId: string) => void;
  onAddSubTask?: (task: CalendarTask) => void;
  onToggleExpansion: (taskId: string) => void;
  onDragStart?: (task: CalendarTask, event: React.DragEvent) => void;
  showAddSubTask?: boolean;
}
export const TaskRenderer: React.FC<TaskRendererProps> = ({
  task,
  mode,
  currentDay,
  overlappingTasks = [],
  taskIndex = 0,
  hasSubtasks = task.subTasks.length > 0,
  subtaskCount = task.subTasks.length,
  isExpanded = task.isExpanded,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onAddSubTask,
  onToggleExpansion,
  onDragStart,
  showAddSubTask = false
}) => {
  const durationMinutes = getTaskDurationMinutes(task);
  const timeRange = formatTaskDateRange(task, currentDay);
  const taskColor = getTaskColor(task);
  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX <= 16) return; // Ignore clicks on drag handle
    }
    onTaskSelect(task);
  };
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(task, e);
    }
  };

  const renderExpandButton = () => {
    if (!hasSubtasks) return null;
    return <Button variant="ghost" size="sm" onClick={e => {
      e.stopPropagation();
      onToggleExpansion(task.id);
    }} className={`p-1 ml-2 flex-shrink-0 ${mode === 'month' ? 'h-6 w-6 text-black hover:bg-white/20' : mode === 'modal' ? 'h-6 w-6 text-black' : 'h-6 w-6 text-black hover:bg-white/20 bg-white/10 border border-white/20'}`}>
        {isExpanded ? <ChevronDown className={mode === 'modal' ? 'h-4 w-4' : 'h-4 w-4'} /> : <ChevronRight className={mode === 'modal' ? 'h-4 w-4' : 'h-4 w-4'} />}
      </Button>;
  };
  const renderSubtaskBadge = () => {
    if (!hasSubtasks) return null;
    return <span className={`text-xs px-1 rounded ml-1 flex-shrink-0 ${mode === 'modal' ? 'bg-blue-500/20 py-0.5' : 'bg-white/20'}`}>
        {subtaskCount}
      </span>;
  };

  // Day and Week view rendering (with positioning)
  if ((mode === 'day' || mode === 'week') && currentDay && overlappingTasks.length > 0) {
    const position = calculateTaskPosition(task, currentDay, overlappingTasks, taskIndex);
    if (durationMinutes < 30) {
      // Dot rendering
      return <div className="absolute flex items-start cursor-pointer hover:opacity-80 transition-opacity group" style={{
        top: position.top,
        left: position.left,
        width: position.width,
        height: mode === 'day' ? '32px' : '24px',
        zIndex: position.zIndex || 10
      }} draggable onDragStart={handleDragStart} onClick={handleClick}>
          <div className={`rounded-full mr-2 flex-shrink-0 mt-0.5 ${mode === 'day' ? 'w-3 h-3' : 'w-2 h-2'}`} style={{
          backgroundColor: taskColor
        }} />
          <div className="text-xs flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center min-w-0 flex-1">
                <span className="truncate font-medium">{task.title}</span>
                {renderExpandButton()}
                {renderSubtaskBadge()}
              </div>
            </div>
            <div className="text-xs opacity-75">
              {timeRange.time}
            </div>
            {timeRange.dates && <div className="opacity-60 text-xs">
                {timeRange.dates}
              </div>}
            {task.description && task.description !== 'Click to add description...' && <div className="ql-read-mode opacity-60 text-xs max-h-4 overflow-hidden line-clamp-1" style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical'
          }} dangerouslySetInnerHTML={{
            __html: task.description
          }} />}
          </div>
          <TaskDropdownMenu task={task} onEdit={onTaskEdit} onDelete={onTaskDelete} onAddSubTask={onAddSubTask} showAddSubTask={showAddSubTask} />
        </div>;
    } else if (durationMinutes >= 30 && durationMinutes <= 60) {
      // Line rendering
      return <div className="absolute flex items-start cursor-pointer hover:opacity-80 transition-opacity group" style={{
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
        zIndex: position.zIndex || 10
      }} draggable onDragStart={handleDragStart} onClick={handleClick}>
          <div className="w-1 h-full mr-2 flex-shrink-0 rounded-full" style={{
          backgroundColor: taskColor
        }} />
          <div className="text-xs flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center min-w-0 flex-1">
                <span className="truncate font-medium">{task.title}</span>
                {renderExpandButton()}
                {renderSubtaskBadge()}
              </div>
            </div>
            <div className="text-xs opacity-75">
              {timeRange.time}
            </div>
            {timeRange.dates && <div className="opacity-60 text-xs truncate">
                {timeRange.dates}
              </div>}
            {task.description && task.description !== 'Click to add description...' && <div className="ql-read-mode opacity-60 text-xs max-h-4 overflow-hidden line-clamp-1" style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical'
          }} dangerouslySetInnerHTML={{
            __html: task.description
          }} />}
          </div>
          <TaskDropdownMenu task={task} onEdit={onTaskEdit} onDelete={onTaskDelete} onAddSubTask={onAddSubTask} showAddSubTask={showAddSubTask} />
        </div>;
    } else {
      // Block rendering - Glass morphic design with bold dark colors
      return <div draggable onDragStart={handleDragStart} onClick={handleClick} className="absolute rounded-xl p-3 cursor-pointer shadow-lg border border-white/20 transition-all hover:shadow-xl hover:scale-[1.02] group overflow-hidden" style={{
        ...position,
        background: `linear-gradient(135deg, ${taskColor} 0%, ${taskColor}95 50%, ${taskColor}90 100%)`,
        backdropFilter: 'none',
        boxShadow: `0 8px 32px 0 ${taskColor}40, inset 0 1px 0 0 rgba(255, 255, 255, 0.15)`,
        color: 'white',
        zIndex: position.zIndex || 10
      }}>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center min-w-0 flex-1">
                <div className="text-sm font-bold truncate text-white drop-shadow-sm">
                  {task.title}
                </div>
                {renderExpandButton()}
                {renderSubtaskBadge()}
              </div>
              <TaskDropdownMenu task={task} onEdit={onTaskEdit} onDelete={onTaskDelete} onAddSubTask={onAddSubTask} showAddSubTask={showAddSubTask} />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white font-semibold drop-shadow-sm">
                {timeRange.time}
              </div>
              {timeRange.dates && <div className="text-xs text-white/90 font-medium">
                  {timeRange.dates}
                </div>}
              {task.description && task.description !== 'Click to add description...' && <div className="ql-read-mode text-xs text-white/90 mt-2 max-h-8 overflow-hidden line-clamp-2 drop-shadow-sm" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }} dangerouslySetInnerHTML={{
              __html: task.description
            }} />}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-xl" />
        </div>;
    }
  }

  // Month view rendering
  if (mode === 'month') {
    if (durationMinutes < 30) {
      // Dot
      return <div className="flex items-center text-xs p-1 rounded cursor-pointer transition-all hover:shadow-sm truncate group relative" onClick={handleClick}>
          <div className="w-2 h-2 rounded-full mr-1 flex-shrink-0" style={{
          backgroundColor: taskColor
        }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <span className="font-medium truncate">{task.title}</span>
                {renderExpandButton()}
                {renderSubtaskBadge()}
              </div>
              <TaskDropdownMenu task={task} onEdit={onTaskEdit} onDelete={onTaskDelete} />
            </div>
            <div className="opacity-75 text-xs truncate">
              {timeRange.time}
            </div>
          </div>
        </div>;
    } else if (durationMinutes >= 30 && durationMinutes <= 60) {
      // Line
      return <div className="flex items-center text-xs p-1 rounded cursor-pointer transition-all hover:shadow-sm group relative" onClick={handleClick}>
          <div className="w-1 h-8 mr-1 flex-shrink-0 rounded-full" style={{
          backgroundColor: taskColor
        }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <span className="font-medium truncate">{task.title}</span>
                {renderExpandButton()}
                {renderSubtaskBadge()}
              </div>
              <TaskDropdownMenu task={task} onEdit={onTaskEdit} onDelete={onTaskDelete} />
            </div>
            <div className="opacity-75 text-xs truncate">
              {timeRange.time}
            </div>
          </div>
        </div>;
    } else {
      // Block - Using same UI as Day/Week view
      return <div draggable onDragStart={handleDragStart} onClick={handleClick} className="absolute rounded-xl p-3 cursor-pointer shadow-lg border border-white/20 transition-all hover:shadow-xl hover:scale-[1.02] group overflow-hidden" style={{
        background: `linear-gradient(135deg, ${taskColor} 0%, ${taskColor}95 50%, ${taskColor}90 100%)`,
        backdropFilter: 'none',
        boxShadow: `0 8px 32px 0 ${taskColor}40, inset 0 1px 0 0 rgba(255, 255, 255, 0.15)`,
        color: 'white'
      }}>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center min-w-0 flex-1">
                <div className="text-sm font-bold truncate text-white drop-shadow-sm">
                  {task.title}
                </div>
                {renderExpandButton()}
                {renderSubtaskBadge()}
              </div>
              <TaskDropdownMenu task={task} onEdit={onTaskEdit} onDelete={onTaskDelete} onAddSubTask={onAddSubTask} showAddSubTask={showAddSubTask} />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white font-semibold drop-shadow-sm">
                {timeRange.time}
              </div>
              {timeRange.dates && <div className="text-xs text-white/90 font-medium">
                  {timeRange.dates}
                </div>}
              {task.description && task.description !== 'Click to add description...' && <div className="ql-read-mode text-xs text-white/90 mt-2 max-h-8 overflow-hidden line-clamp-2 drop-shadow-sm" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }} dangerouslySetInnerHTML={{
              __html: task.description
            }} />}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-xl" />
        </div>;
    }
  }

  // Modal view rendering
  if (mode === 'modal') {
    return <div className="flex items-center gap-3 p-3 hover:bg-muted rounded-md cursor-pointer group relative" onClick={handleClick}>
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{
        backgroundColor: taskColor
      }} />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate flex items-center">
            {task.title}
            {renderExpandButton()}
            {renderSubtaskBadge()}
          </div>
          <div className="text-sm text-foreground/80">
            {timeRange.time}
          </div>
        </div>
        <TaskDropdownMenu task={task} onEdit={onTaskEdit} onDelete={onTaskDelete} />
      </div>;
  }
  return null;
};