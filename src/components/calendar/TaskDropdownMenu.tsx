
import { TemplateTaskDropdown } from '../shared/TemplateTaskDropdown';
import { CalendarTask } from './CalendarTemplate';

interface TaskDropdownMenuProps {
  task: CalendarTask;
  onEdit: (task: CalendarTask) => void;
  onDelete: (taskId: string) => void;
  onAddSubTask?: (task: CalendarTask) => void;
  showAddSubTask?: boolean;
}

export const TaskDropdownMenu = ({ 
  task, 
  onEdit, 
  onDelete, 
  onAddSubTask, 
  showAddSubTask = false 
}: TaskDropdownMenuProps) => {
  return (
    <TemplateTaskDropdown
      task={task}
      onEdit={(task) => task && onEdit(task)}
      onDelete={(taskId) => onDelete(taskId)}
      onAddSubTask={onAddSubTask ? (parentId) => onAddSubTask(task) : undefined}
      showAddSubTask={showAddSubTask}
      variant="calendar"
    />
  );
};
