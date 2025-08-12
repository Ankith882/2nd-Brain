import { Task } from './task';

export type TaskTemplate = 'notes' | 'task' | 'kanban' | 'timeline' | 'calendar' | 'matrix';

export interface TemplateProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskMove: (activeId: string, overId: string | null) => void;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onAddSubTask: (parentId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  isDarkMode: boolean;
}

export interface KanbanTemplateProps extends TemplateProps {}

export interface TimelineTemplateProps extends TemplateProps {
  selectedDate: Date;
}

export interface CalendarTemplateProps extends TemplateProps {
  missionId: string;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export interface MatrixTemplateProps extends TemplateProps {
  onToggleComplete: (taskId: string) => void;
  missionId: string;
}

export interface TaskTemplateProps extends TemplateProps {
  onToggleComplete: (taskId: string) => void;
  onToggleExpanded: (taskId: string) => void;
}