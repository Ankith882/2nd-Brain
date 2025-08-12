import { AnalyticsData } from '@/types/analytics';

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  categoryId: string;
  hasSubcategories?: boolean;
}

export const transformAnalyticsToChartData = (analyticsData: AnalyticsData[]): ChartDataPoint[] => {
  return analyticsData.map(item => ({
    name: item.categoryTitle,
    value: item.totalDuration,
    color: item.categoryColor,
    categoryId: item.categoryId,
    hasSubcategories: item.hasSubcategories
  }));
};

export const createColorSet = (data: ChartDataPoint[]): string[] => {
  return data.map(item => item.color);
};

export const generateChartTooltip = (dataPoint: ChartDataPoint): string => {
  const hours = Math.floor(dataPoint.value / 60);
  const minutes = dataPoint.value % 60;
  const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  
  return `${dataPoint.name}: ${timeString}`;
};

export const calculateChartDimensions = (containerSize: { width: number; height: number }) => {
  const padding = 40;
  const chartWidth = containerSize.width - (padding * 2);
  const chartHeight = containerSize.height - (padding * 2);
  
  return {
    width: Math.max(chartWidth, 200),
    height: Math.max(chartHeight, 200),
    padding
  };
};

export const getChartColors = (itemCount: number): string[] => {
  const baseColors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#EC4899', // pink-500
    '#6366F1'  // indigo-500
  ];
  
  if (itemCount <= baseColors.length) {
    return baseColors.slice(0, itemCount);
  }
  
  // Generate additional colors if needed
  const additionalColors = [];
  for (let i = baseColors.length; i < itemCount; i++) {
    const hue = (i * 137.508) % 360; // Golden angle for better color distribution
    additionalColors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return [...baseColors, ...additionalColors];
};