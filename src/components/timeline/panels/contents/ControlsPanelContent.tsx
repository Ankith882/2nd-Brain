import React from 'react';
import { Button } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, PieChart, Circle, Eye, EyeOff, GripVertical } from 'lucide-react';

interface ControlsPanelContentProps {
  data: {
    chartType: string;
    timeMode: string;
    showDetails: boolean;
  };
  onAction?: (action: string, payload?: any) => void;
  isDarkMode?: boolean;
}

export const ControlsPanelContent: React.FC<ControlsPanelContentProps> = ({
  data,
  onAction
}) => {
  const { chartType, timeMode, showDetails } = data;

  const chartOptions = [
    { value: 'circular', label: 'Circular', icon: PieChart },
    { value: '3d-cylinder', label: 'Cylinder', icon: BarChart3 },
    { value: 'bubble', label: 'Bubble', icon: Circle }
  ];

  const timeModeOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
    { value: 'selected', label: 'Selected' }
  ];

  return (
    <div className="p-2">
      <div className="flex items-center gap-2">
        {/* Drag Handle */}
        <div className="flex items-center text-muted-foreground/60 p-1 bg-white/5 dark:bg-black/10 backdrop-blur-sm rounded-full border border-white/10">
          <GripVertical className="h-3 w-3" />
        </div>
        
        {/* Chart Type Buttons */}
        <div className="flex gap-1">
          {chartOptions.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={chartType === value ? 'default' : 'secondary'}
              size="sm"
              onClick={() => onAction?.('setChartType', value)}
              className="w-8 h-8 p-0 rounded-full"
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>

        {/* Time Period Select */}
        <Select value={timeMode} onValueChange={(value) => onAction?.('setTimeMode', value)}>
          <SelectTrigger className="w-20 h-8 text-xs rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeModeOptions.map(({ value, label }) => (
              <SelectItem key={value} value={value} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Details Toggle */}
        <Button
          variant={showDetails ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onAction?.('toggleDetails')}
          className="w-8 h-8 p-0 rounded-full"
          title={showDetails ? 'Hide Details' : 'Show Details'}
        >
          {showDetails ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
};