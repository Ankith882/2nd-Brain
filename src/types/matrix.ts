import { Task } from '@/types/task';

export interface QuadrantConfig {
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const QUADRANT_CONFIG: Record<string, QuadrantConfig> = {
  'urgent-important': {
    title: 'Do First',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300'
  },
  'not-urgent-important': {
    title: 'Schedule', 
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300'
  },
  'urgent-unimportant': {
    title: 'Delegate',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300'
  },
  'not-urgent-unimportant': {
    title: 'Eliminate',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-400'
  }
};

export const getTaskCardColor = (task: Task): string => {
  if (task.color) return task.color;
  
  const colorMap: Record<string, string> = {
    'urgent-important': 'bg-red-100 border-red-200',
    'not-urgent-important': 'bg-blue-100 border-blue-200', 
    'urgent-unimportant': 'bg-green-100 border-green-200',
    'not-urgent-unimportant': 'bg-gray-100 border-gray-200'
  };
  
  return colorMap[task.quadrant] || 'bg-yellow-100 border-yellow-200';
};

export const getQuadrantDescription = (id: string): string => {
  const descriptions: Record<string, string> = {
    'urgent-important': 'Urgent and important',
    'not-urgent-important': 'Less urgent but important',
    'urgent-unimportant': 'Urgent but less important', 
    'not-urgent-unimportant': 'Neither urgent nor important',
    'hold': 'Tasks on hold',
    'completed': 'Completed tasks'
  };
  
  return descriptions[id] || '';
};