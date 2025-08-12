import React from 'react';
import { Clock } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';

interface DraggableSummaryPanelProps {
  totalTime: number;
  totalTasks: number;
  totalCategories: number;
  isDarkMode: boolean;
}

const SummaryCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="p-2 bg-white/5 dark:bg-black/10 backdrop-blur-sm rounded-lg border border-white/10">
    <div className="text-lg font-bold text-foreground/90">{value}</div>
    <div className="text-xs text-muted-foreground/80 font-medium">{label}</div>
  </div>
);

export const DraggableSummaryPanel: React.FC<DraggableSummaryPanelProps> = ({
  totalTime,
  totalTasks,
  totalCategories
}) => (
  <DraggablePanel
    title="Summary"
    icon={Clock}
    initialPosition={{ x: 20, y: 80 }}
    initialSize={{ width: 280, height: 240 }}
    minSize={{ width: 200, height: 150 }}
  >
    <div className="space-y-2">
      <SummaryCard 
        value={`${Math.round(totalTime / 60)}h ${totalTime % 60}m`} 
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
  </DraggablePanel>
);