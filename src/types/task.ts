export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7';
  
  createdAt: Date;
  color: string;
  startTime?: Date;
  endTime?: Date;
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  date: Date;
  missionId: string;
  parentId?: string;
  subTasks: Task[];
  isExpanded: boolean;
  order: number;
  quadrant?: string;
  originalQuadrant?: string;
  kanbanColumn?: string;
  originalKanbanColumn?: string;
  categoryId?: string;
}

export interface TaskAttachment {
  id: string;
  url: string;
  text: string;
  type: 'link' | 'file' | 'image';
  color: string;
}

export interface TaskComment {
  id: string;
  text: string;
  color: string;
  createdAt: Date;
  taskId: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  color: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | '';
  startTime?: Date;
  endTime?: Date;
  attachments: TaskAttachment[];
  categoryId: string;
  completed: boolean;
  date: Date;
  missionId: string;
  parentId?: string;
}

export type TaskTemplate = 'notes' | 'task' | 'kanban' | 'timeline' | 'calendar' | 'matrix';

export interface TaskManagerState {
  tasks: Task[];
  selectedTask: Task | null;
  showAddTask: boolean;
  editingTask: Task | null;
  addingSubTaskParent: string | null;
  selectedDate: Date;
}

export interface TaskActions {
  addTask: (taskData: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order'> | Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order' | 'categoryId' | 'createdAt'>) => Task | undefined;
  addSubTask: (parentId: string, taskData: Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order' | 'parentId'> | Omit<Task, 'id' | 'subTasks' | 'isExpanded' | 'order' | 'categoryId' | 'createdAt' | 'parentId'>) => Task | undefined;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  toggleTaskExpanded: (taskId: string) => void;
  moveTask: (taskId: string, newParentId?: string) => void;
  setSelectedTask: (task: Task | null) => void;
  setSelectedDate: (date: Date) => void;
  expandParentTasks: (taskId: string) => void;
}