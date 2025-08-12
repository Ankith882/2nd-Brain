import { Task, TaskFormData } from '@/types/task';

export const validateTaskTitle = (title: string): boolean => {
  return title.trim().length > 0;
};

export const validateTaskDescription = (description: string): boolean => {
  return description.trim() !== '' && description !== 'Click to add description...';
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


export const validateTaskFormData = (formData: TaskFormData): string[] => {
  const errors: string[] = [];
  
  if (!validateTaskTitle(formData.title)) {
    errors.push('Task title is required');
  }
  
  const dateTimeError = validateDateTime(formData.startTime, formData.endTime);
  if (dateTimeError) {
    errors.push(dateTimeError);
  }
  
  return errors;
};

export const hasValidDescription = (task: Task): boolean => {
  return validateTaskDescription(task.description);
};