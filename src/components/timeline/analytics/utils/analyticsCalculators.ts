import { Task } from '@/types/task';
import { AnalyticsData } from '@/types/analytics';

export const calculateTotalTime = (analyticsData: AnalyticsData[]): number => {
  return analyticsData.reduce((sum, item) => sum + item.totalDuration, 0);
};

export const calculateTotalTasks = (analyticsData: AnalyticsData[]): number => {
  return analyticsData.reduce((sum, item) => sum + item.taskCount, 0);
};

export const calculateAverageTaskDuration = (analyticsData: AnalyticsData[]): number => {
  const totalTime = calculateTotalTime(analyticsData);
  const totalTasks = calculateTotalTasks(analyticsData);
  return totalTasks > 0 ? Math.round(totalTime / totalTasks) : 0;
};

export const calculateCategoryPercentages = (analyticsData: AnalyticsData[]): Array<AnalyticsData & { percentage: number }> => {
  const totalTime = calculateTotalTime(analyticsData);
  
  return analyticsData.map(item => ({
    ...item,
    percentage: totalTime > 0 ? Math.round((item.totalDuration / totalTime) * 100) : 0
  }));
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
};

export const formatTaskTime = (task: Task): string => {
  if (!task.startTime || !task.endTime) return '';
  
  const start = new Date(task.startTime);
  const end = new Date(task.endTime);
  
  return `${start.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })} – ${end.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })}`;
};

export const getTopCategories = (analyticsData: AnalyticsData[], limit: number = 5): AnalyticsData[] => {
  return [...analyticsData]
    .sort((a, b) => b.totalDuration - a.totalDuration)
    .slice(0, limit);
};

export const getLeastActiveCategories = (analyticsData: AnalyticsData[], limit: number = 5): AnalyticsData[] => {
  return [...analyticsData]
    .sort((a, b) => a.totalDuration - b.totalDuration)
    .slice(0, limit);
};