import React from 'react';
import { calculateTotalTime, calculateTotalTasks, formatDuration } from '../../analytics/utils/analyticsCalculators';

interface SummaryPanelContentProps {
  data: {
    analyticsData: any[];
  };
  onAction?: (action: string, payload?: any) => void;
  isDarkMode?: boolean;
}

const SummaryCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="p-3 bg-white/5 dark:bg-black/10 backdrop-blur-sm rounded-lg border border-white/10">
    <div className="text-lg font-bold text-foreground/90">{value}</div>
    <div className="text-xs text-muted-foreground/80 font-medium">{label}</div>
  </div>
);

export const SummaryPanelContent: React.FC<SummaryPanelContentProps> = ({
  data
}) => {
  const { analyticsData } = data;
  
  const totalTime = calculateTotalTime(analyticsData);
  const totalTasks = calculateTotalTasks(analyticsData);
  const totalCategories = analyticsData.length;

  return (
    <div className="p-4 space-y-3">
      <SummaryCard 
        value={formatDuration(totalTime)} 
        label="Total Time" 
      />
      <SummaryCard 
        value={totalTasks.toString()} 
        label="Total Tasks" 
      />
      <SummaryCard 
        value={totalCategories.toString()} 
        label="Categories" 
      />
    </div>
  );
};