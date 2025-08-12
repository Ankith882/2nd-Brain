import React, { memo, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Task } from '@/types/task';
import { TaskBlock as TaskBlockType } from '@/hooks/useTimelineCalculations';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { useTaskHelpers } from '@/hooks/useTaskHelpers';

interface TaskBlockProps {
  block: TaskBlockType;
  level: number;
  dayWidth: number;
  isExpanded: boolean;
  subtaskCount: number;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleExpansion: (taskId: string) => void;
}

// Shared components
const TaskIndicator = memo(({ isShort, color }: { isShort: boolean; color: string }) => 
  isShort ? (
    <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: color, borderColor: color }} />
  ) : (
    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: color }} />
  )
);

const LevelConnector = memo(({ level }: { level: number }) => 
  level > 0 ? (
    <div className="absolute left-0 top-0 bottom-0 flex items-center">
      <div className="w-4 h-px bg-muted-foreground/30" />
      <div className="w-px h-4 bg-muted-foreground/30" />
    </div>
  ) : null
);

const ToggleButton = memo(({ 
  isExpanded, 
  onClick, 
  isCompact 
}: { 
  isExpanded: boolean; 
  onClick: (e: React.MouseEvent) => void;
  isCompact?: boolean;
}) => (
  <button 
    onClick={onClick}
    className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-sm transition-colors ${
      isCompact ? 'bg-black/10 hover:bg-black/20' : 'bg-white/20 hover:bg-white/40'
    }`}
  >
    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
  </button>
));

const TaskContent = memo(({ 
  task, 
  taskTime, 
  isCompact, 
  subtaskCount, 
  getCategoryById 
}: {
  task: any;
  taskTime: any;
  isCompact: boolean;
  subtaskCount: number;
  getCategoryById: (id: string) => any;
}) => {
  const category = task.categoryId && task.categoryId !== 'no-category' ? getCategoryById(task.categoryId) : null;
  
  return (
    <div className="flex-1 min-w-0">
      <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-foreground truncate flex items-center gap-1`}>
        <span className="truncate">
          {task.title}
        </span>
        {category && (
          <span 
            className="text-xs px-1 py-0.5 rounded text-white font-medium"
            style={{ backgroundColor: category.color }}
          >
            {category.title}
          </span>
        )}
        {subtaskCount > 0 && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${isCompact ? 'bg-black/10' : 'bg-white/30'}`}>
            {subtaskCount}
          </span>
        )}
      </div>
      <div className={`text-xs text-muted-foreground ${isCompact ? 'font-normal' : ''}`}>
        {typeof taskTime === 'string' ? taskTime : 
          taskTime.isMultiMonth ? taskTime.displayText :
          taskTime.isMultiWeek ? (
            <div>
              <div>{taskTime.timeRange}</div>
              <div>{taskTime.dateRange}</div>
            </div>
          ) : taskTime.time}
      </div>
      {typeof taskTime === 'object' && taskTime.dates && !taskTime.isMultiMonth && !taskTime.isMultiWeek && (
        <div className="text-xs text-muted-foreground opacity-75">
          {taskTime.dates}
        </div>
      )}
    </div>
  );
});


export const TaskBlock = memo<TaskBlockProps>(({
  block,
  level,
  dayWidth,
  isExpanded,
  subtaskCount,
  tasks,
  onTaskClick,
  onToggleExpansion
}) => {
  const { getCategoryById } = useCategoryManager();
  const { getTaskColor, formatTaskTime, getTaskDurationInMinutes } = useTaskHelpers(tasks);
  
  const { task, left, width, dayIndex, top } = block;
  const durationMinutes = getTaskDurationInMinutes(task);
  const isCompact = durationMinutes < 60;
  const isMinimal = durationMinutes < 30;
  
  const taskTime = formatTaskTime(task, task.isWeekSegment || false);
  
  const getTaskForAction = useCallback(() => 
    task.isWeekSegment ? tasks.find(t => t.id === task.id.split('_week_')[0]) || task : task,
    [task, tasks]
  );

  const handleTaskClick = useCallback(() => onTaskClick(getTaskForAction()), [onTaskClick, getTaskForAction]);
  
  const handleToggleExpansion = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpansion(task.id);
  }, [onToggleExpansion, task.id]);

  const baseStyle = {
    left: `${dayIndex * dayWidth + left + level * 20}px`,
    top: `${top}px`,
    width: `${width - level * 20}px`,
    height: `${block.height}px`,
    zIndex: 5 + level,
    opacity: level > 0 ? 0.95 : 1,
    transition: 'left 0.2s ease, width 0.2s ease, transform 0.2s ease'
  };

  

  if (isCompact) {
    return (
      <div 
        className="absolute cursor-pointer hover:shadow-lg group flex items-center gap-2" 
        style={baseStyle}
        onClick={handleTaskClick}
      >
        <LevelConnector level={level} />
        <TaskIndicator isShort={isMinimal} color={task.color} />
        
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {subtaskCount > 0 && (
            <ToggleButton isExpanded={isExpanded} onClick={handleToggleExpansion} isCompact />
          )}
          <TaskContent 
            task={task} 
            taskTime={taskTime} 
            isCompact 
            subtaskCount={subtaskCount} 
            getCategoryById={getCategoryById} 
          />
        </div>
        
      </div>
    );
  }

  return (
    <div 
      className="absolute rounded-xl cursor-pointer shadow-lg border border-white/20 backdrop-blur-md transition-all hover:shadow-xl hover:scale-[1.02] group overflow-hidden" 
      style={{
        ...baseStyle,
        background: `linear-gradient(135deg, ${getTaskColor(task)} 0%, ${getTaskColor(task)}dd 50%, ${getTaskColor(task)}bb 100%)`,
        backdropFilter: 'blur(16px)',
        boxShadow: `0 8px 32px 0 ${getTaskColor(task)}60, inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`,
        color: 'white',
        filter: 'saturate(1.3) brightness(1.1)'
      }}
      onClick={handleTaskClick}
    >
      {level > 0 && (
        <>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center">
            <div className="w-4 h-px bg-white/30" />
            <div className="w-px h-4 bg-white/30" />
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 rounded-l-xl" style={{ marginLeft: '-3px' }} />
        </>
      )}
      
      <div className="p-3 h-full flex flex-col justify-center relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {subtaskCount > 0 && (
              <ToggleButton isExpanded={isExpanded} onClick={handleToggleExpansion} />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-white drop-shadow-lg truncate flex items-center gap-1 tracking-tight">
                <span className="truncate font-black text-white" style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  fontWeight: '900',
                  letterSpacing: '-0.025em'
                }}>
                  {task.title}
                </span>
                {task.categoryId && task.categoryId !== 'no-category' && getCategoryById(task.categoryId) && (
                  <span 
                    className="text-xs px-1.5 py-0.5 rounded text-white font-black backdrop-blur-sm shadow-lg"
                    style={{ 
                      backgroundColor: getCategoryById(task.categoryId)?.color,
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      fontWeight: '900'
                    }}
                  >
                    {getCategoryById(task.categoryId)?.title}
                  </span>
                )}
                {subtaskCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/40 font-black text-white shadow-lg" style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    fontWeight: '900'
                  }}>
                    {subtaskCount}
                  </span>
                )}
              </div>
              <div className="text-xs text-white font-light drop-shadow-md tracking-wide" style={{
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                fontWeight: '300',
                letterSpacing: '0.025em'
              }}>
                {typeof taskTime === 'string' ? taskTime : 
                  taskTime.isMultiMonth ? taskTime.displayText :
                  taskTime.isMultiWeek ? (
                    <div className="space-y-0.5">
                      <div className="font-light">{taskTime.timeRange}</div>
                      <div className="font-light opacity-90">{taskTime.dateRange}</div>
                    </div>
                  ) : taskTime.time}
              </div>
              {typeof taskTime === 'object' && taskTime.dates && !taskTime.isMultiMonth && !taskTime.isMultiWeek && (
                <div className="text-xs text-white/90 opacity-85 font-light tracking-wide" style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  fontWeight: '300',
                  letterSpacing: '0.025em'
                }}>
                  {taskTime.dates}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Enhanced glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none rounded-xl" />
    </div>
  );
});