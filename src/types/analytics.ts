import { Task } from '@/types/task';

export interface AnalyticsData {
  categoryId: string;
  categoryTitle: string;
  categoryColor: string;
  totalDuration: number; // in minutes
  taskCount: number;
  tasks?: Task[];
  hasSubcategories: boolean;
  parentId?: string;
  level: number;
}

export interface BaseChartProps {
  data: AnalyticsData[];
  onCategoryDoubleClick?: (categoryId: string) => void;
}

export interface ChartDataPoint {
  category: string;
  displayName: string;
  value: number;
  taskCount: number;
  color: string;
  categoryId: string;
  hasSubcategories: boolean;
  hierarchyLevel: string;
}