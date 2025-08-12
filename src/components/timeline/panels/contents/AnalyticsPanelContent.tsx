import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Task } from '@/types/task';
import { useAnalyticsData, TimeMode } from '../../analytics/hooks/useAnalyticsData';
import { useTimeRangeFilter } from '../../analytics/hooks/useTimeRangeFilter';
import { EnhancedDatePicker } from '@/components/extra-panel/EnhancedDatePicker';
import { CircularChart } from '../../../timeline/CircularChart';
import { CylinderChart } from '../../../timeline/CylinderChart';
import { format } from 'date-fns';
import { X } from 'lucide-react';

type ChartType = 'circular' | '3d-cylinder' | 'bubble';

const TIME_MODE_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom Dates' },
  { value: 'selected', label: 'Selected Dates' }
] as const;

interface AnalyticsPanelContentProps {
  data: {
    tasks: Task[];
  };
  onAction?: (action: string, payload?: any) => void;
  isDarkMode?: boolean;
}

export const AnalyticsPanelContent: React.FC<AnalyticsPanelContentProps> = ({
  data,
  onAction,
  isDarkMode
}) => {
  const { tasks } = data;
  
  const [chartType, setChartType] = useState<ChartType>('circular');
  const [timeMode, setTimeMode] = useState<TimeMode>('weekly');
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [hierarchyStack, setHierarchyStack] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(true);

  const dateRange = useTimeRangeFilter({
    timeMode,
    customStartDate,
    customEndDate,
    selectedDates
  });

  const analyticsFilters = useMemo(() => ({
    timeMode,
    dateRange,
    selectedDates,
    hierarchyStack
  }), [timeMode, dateRange, selectedDates, hierarchyStack]);

  const analyticsData = useAnalyticsData(tasks, analyticsFilters);

  const handleCategoryDoubleClick = useCallback((categoryId: string) => {
    const categoryData = analyticsData.find(data => data.categoryId === categoryId);
    if (categoryData?.hasSubcategories) {
      setHierarchyStack(prev => [...prev, categoryId]);
    }
  }, [analyticsData]);

  const handleNavigateBack = () => {
    setHierarchyStack(prev => prev.slice(0, -1));
  };

  const handleNavigateToRoot = () => {
    setHierarchyStack([]);
  };

  const removeDateAtIndex = (index: number) => {
    setSelectedDates(dates => dates.filter((_, i) => i !== index));
  };

  const addSelectedDate = (date: Date) => {
    setSelectedDates(dates => {
      if (dates.some(d => d.toDateString() === date.toDateString())) return dates;
      return [...dates, date];
    });
  };

  const chartProps = useMemo(() => ({
    data: analyticsData,
    onCategoryDoubleClick: handleCategoryDoubleClick
  }), [analyticsData, handleCategoryDoubleClick]);

  const renderChart = () => {
    if (analyticsData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
          <p>No data available for the selected period</p>
          <p className="text-xs">Tasks need both start and end times to be included in analytics</p>
        </div>
      );
    }
    
    switch (chartType) {
      case 'circular': return <CircularChart {...chartProps} />;
      case '3d-cylinder': return <CylinderChart {...chartProps} />;
      default: return <CircularChart {...chartProps} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circular">Circular</SelectItem>
              <SelectItem value="3d-cylinder">Cylinder</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeMode} onValueChange={(value) => setTimeMode(value as TimeMode)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_MODE_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant={showDetails ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Breadcrumbs */}
        {hierarchyStack.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Button variant="ghost" size="sm" onClick={handleNavigateToRoot}>
              All Categories
            </Button>
            {hierarchyStack.map((_, index) => (
              <div key={index} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHierarchyStack(prev => prev.slice(0, index + 1))}
                >
                  Level {index + 1}
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleNavigateBack}>
              <ChevronDown className="h-3 w-3 rotate-90" />
            </Button>
          </div>
        )}
      </div>

      {/* Date Pickers */}
      {timeMode === 'custom' && (
        <div className="p-4 border-b border-white/10 flex gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
            <EnhancedDatePicker
              selectedDate={customStartDate}
              onDateSelect={setCustomStartDate}
              isDarkMode={isDarkMode}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
            <EnhancedDatePicker
              selectedDate={customEndDate}
              onDateSelect={setCustomEndDate}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {timeMode === 'selected' && (
        <div className="p-4 border-b border-white/10">
          <label className="text-xs text-muted-foreground mb-2 block">Select Individual Dates</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {selectedDates.map((date, index) => (
              <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                {format(date, 'MMM dd')}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeDateAtIndex(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <EnhancedDatePicker
            selectedDate={new Date()}
            onDateSelect={addSelectedDate}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Chart Area */}
      <div className="flex-1 p-4">
        {renderChart()}
      </div>
    </div>
  );
};