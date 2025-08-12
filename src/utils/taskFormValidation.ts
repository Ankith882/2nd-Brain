import { Task } from '@/types/task';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormData {
  title: string;
  description: string;
  color: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | '';
  startTime?: Date;
  startTimeHour: string;
  startTimeMinutes: string;
  startTimeAM: boolean;
  endTime?: Date;
  endTimeHour: string;
  endTimeMinutes: string;
  endTimeAM: boolean;
  attachments: Array<{
    id: string;
    url: string;
    text: string;
    type: 'link' | 'file' | 'image';
    color: string;
  }>;
  categoryId: string;
  completed: boolean;
}

export const validateTaskForm = (formData: FormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Title validation
  if (!formData.title.trim()) {
    errors.push({ field: 'title', message: 'Task title is required' });
  }

  // Color validation
  if (formData.color && !isValidColor(formData.color)) {
    errors.push({ field: 'color', message: 'Invalid color format' });
  }

  // Time validation - Ensure end date/time is not earlier than start date/time
  if (formData.startTime && formData.endTime) {
    const timeError = validateDateTime(formData.startTime, formData.endTime);
    if (timeError) {
      errors.push({ field: 'time', message: timeError });
    }
  }

  // Priority validation
  const validPriorities = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', ''];
  if (formData.priority && !validPriorities.includes(formData.priority)) {
    errors.push({ field: 'priority', message: 'Invalid priority level' });
  }

  return errors;
};

export const validateDateTime = (startTime?: Date, endTime?: Date): string | null => {
  if (!startTime || !endTime) return null;

  // Check if dates are on different days
  if (startTime.toDateString() !== endTime.toDateString()) {
    if (startTime > endTime) {
      return "End date cannot be earlier than start date";
    }
  } else {
    // Same day - check time
    if (startTime.getTime() >= endTime.getTime()) {
      return "End time cannot be earlier than start time";
    }
  }

  return null;
};


export const isValidColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const createTaskFromForm = (
  formData: FormData,
  editingTask: Task | null,
  parentId?: string,
  selectedDate: Date = new Date(),
  missionId: string = 'default'
): Partial<Task> => {
  return {
    ...(editingTask || {}),
    title: formData.title,
    description: formData.description || '',
    color: formData.color || (parentId ? '#10B981' : '#3B82F6'),
    startTime: formData.startTime,
    endTime: formData.endTime,
    priority: formData.priority || 'P7',
    date: selectedDate,
    missionId,
    parentId: editingTask?.parentId || parentId,
    completed: formData.completed || false,
    attachments: formData.attachments,
    categoryId: formData.categoryId,
    isExpanded: editingTask?.isExpanded || false,
    order: editingTask?.order || 0,
    subTasks: editingTask?.subTasks || []
  };
};