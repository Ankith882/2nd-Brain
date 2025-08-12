import React from 'react';
import { AnalyticsData, ChartDataPoint } from '@/types/analytics';

export const transformAnalyticsData = (data: AnalyticsData[]): ChartDataPoint[] => {
  return data.map(item => ({
    category: `${item.categoryTitle}-${item.categoryId}`,
    displayName: item.categoryTitle,
    value: item.totalDuration,
    taskCount: item.taskCount,
    color: item.categoryColor,
    categoryId: item.categoryId,
    hasSubcategories: item.hasSubcategories,
    hierarchyLevel: item.level === 0 ? 'Main Category' : 
                   item.level === 1 ? 'Sub Category' : 
                   'Recursive Sub Category'
  }));
};

export const createColorSet = (data: AnalyticsData[]) => {
  return data.map(item => item.categoryColor);
};

export const EmptyDataDisplay = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
      <div className="text-4xl mb-4">📊</div>
      <p>No data available for the selected period</p>
      <p className="text-xs">Tasks need both start and end times to be included in analytics</p>
    </div>
  );
};

export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};