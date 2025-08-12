import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { BarChart3, X, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { Task } from '@/types/task';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { EnhancedDatePicker } from '@/components/extra-panel/EnhancedDatePicker';
import { CircularChart } from './CircularChart';
import { CylinderChart } from './CylinderChart';
import { HighchartsBubbleChart } from './HighchartsBubbleChart';
import { DraggableFooterControls } from './DraggableFooterControls';
import { DraggableSummaryPanel } from './DraggableSummaryPanel';
import { DraggableCategoryPanel } from './DraggableCategoryPanel';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { AnalyticsData } from '@/types/analytics';
interface EnhancedAnalyticsPanelProps {
  tasks: Task[];
  isDarkMode: boolean;
  onClose?: () => void;
}
type ChartType = 'circular' | '3d-cylinder' | 'bubble';
type TimeMode = 'weekly' | 'monthly' | 'yearly' | 'custom' | 'selected';
const TIME_MODE_OPTIONS = [{
  value: 'weekly',
  label: 'Weekly'
}, {
  value: 'monthly',
  label: 'Monthly'
}, {
  value: 'yearly',
  label: 'Yearly'
}, {
  value: 'custom',
  label: 'Custom Dates'
}, {
  value: 'selected',
  label: 'Selected Dates'
}] as const;
export const EnhancedAnalyticsPanel: React.FC<EnhancedAnalyticsPanelProps> = ({
  tasks,
  isDarkMode,
  onClose
}) => {
  const {
    categories,
    getCategoryById
  } = useCategoryManager();
  const [chartType, setChartType] = useState<ChartType>('circular');
  const [timeMode, setTimeMode] = useState<TimeMode>('weekly');
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [hierarchyStack, setHierarchyStack] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(true);

  // Utility functions
  const getDateRange = () => {
    const now = new Date();
    switch (timeMode) {
      case 'weekly':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        };
      case 'monthly':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'yearly':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        };
      case 'custom':
        return {
          start: customStartDate,
          end: customEndDate
        };
      case 'selected':
        if (selectedDates.length === 0) return {
          start: new Date(0),
          end: new Date()
        };
        const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
        return {
          start: sorted[0],
          end: sorted[sorted.length - 1]
        };
      default:
        return {
          start: new Date(0),
          end: new Date()
        };
    }
  };

  // Simplified analytics data
  const analyticsData = useMemo(() => {
    const dateRange = getDateRange();
    const currentLevelCategoryId = hierarchyStack[hierarchyStack.length - 1] || null;

    // Get all tasks including subtasks
    const getAllTasks = (taskList: Task[]): Task[] => {
      const result: Task[] = [];
      const addTask = (task: Task) => {
        result.push(task);
        task.subTasks?.forEach(addTask);
      };
      taskList.forEach(addTask);
      return result;
    };
    const allTasks = getAllTasks(tasks);

    // Filter tasks by date and valid category
    const filteredTasks = allTasks.filter(task => {
      if (!task.startTime || !task.endTime || !task.categoryId || task.categoryId === 'no-category') return false;
      const taskStart = new Date(task.startTime);
      return timeMode === 'selected' && selectedDates.length > 0 ? selectedDates.some(date => taskStart.toDateString() === date.toDateString()) : isWithinInterval(taskStart, dateRange);
    });

    // Get target categories based on hierarchy level
    const targetCategoryIds = currentLevelCategoryId ? getCategoryById(currentLevelCategoryId)?.subCategories.map(sub => sub.id) || [] : categories.map(cat => cat.id);

    // Group tasks by target category
    const categoryMap = new Map<string, AnalyticsData>();
    filteredTasks.forEach(task => {
      const category = getCategoryById(task.categoryId!);
      if (!category) return;

      // Find which target category this task belongs to
      let targetCategoryId = task.categoryId!;
      if (currentLevelCategoryId) {
        // Find direct subcategory of current level
        const findDirectSubcategory = (catId: string): string | null => {
          const currentLevelCategory = getCategoryById(currentLevelCategoryId);
          if (!currentLevelCategory) return null;

          // Check if it's a direct subcategory
          if (currentLevelCategory.subCategories.some(sub => sub.id === catId)) {
            return catId;
          }

          // Check nested subcategories
          for (const subCat of currentLevelCategory.subCategories) {
            const findInNested = (nestedCat: any): string | null => {
              if (nestedCat.id === catId) return subCat.id;
              for (const nested of nestedCat.subCategories || []) {
                const result = findInNested(nested);
                if (result) return result;
              }
              return null;
            };
            const result = findInNested(subCat);
            if (result) return result;
          }
          return null;
        };
        const foundTarget = findDirectSubcategory(task.categoryId!);
        if (!foundTarget) return;
        targetCategoryId = foundTarget;
      } else {
        // Find top-level category
        const findTopLevel = (catId: string): string => {
          for (const topCat of categories) {
            if (topCat.id === catId) return catId;
            const searchSubcategories = (subcats: any[]): string | null => {
              for (const subCat of subcats) {
                if (subCat.id === catId) return topCat.id;
                const result = searchSubcategories(subCat.subCategories || []);
                if (result) return result;
              }
              return null;
            };
            const result = searchSubcategories(topCat.subCategories);
            if (result) return result;
          }
          return catId;
        };
        targetCategoryId = findTopLevel(task.categoryId!);
      }
      if (!targetCategoryIds.includes(targetCategoryId)) return;
      const targetCategory = getCategoryById(targetCategoryId);
      if (!targetCategory) return;
      const duration = Math.round((new Date(task.endTime!).getTime() - new Date(task.startTime!).getTime()) / 60000);
      if (!categoryMap.has(targetCategoryId)) {
        categoryMap.set(targetCategoryId, {
          categoryId: targetCategoryId,
          categoryTitle: targetCategory.title,
          categoryColor: targetCategory.color,
          totalDuration: 0,
          taskCount: 0,
          tasks: [],
          hasSubcategories: targetCategory.subCategories.length > 0,
          parentId: undefined,
          level: hierarchyStack.length
        });
      }
      const categoryData = categoryMap.get(targetCategoryId)!;
      categoryData.totalDuration += duration;
      categoryData.taskCount += 1;
      categoryData.tasks.push(task);
    });
    const result = Array.from(categoryMap.values()).filter(data => data.totalDuration > 0).sort((a, b) => a.categoryTitle.localeCompare(b.categoryTitle));
    console.log('Analytics data recalculated:', {
      taskCount: tasks.length,
      resultCount: result.length,
      hierarchyStack: hierarchyStack.length,
      deps: [timeMode, customStartDate?.toISOString(), customEndDate?.toISOString(), selectedDates.length]
    });
    return result;
  }, [tasks, categories, timeMode, customStartDate, customEndDate, selectedDates, hierarchyStack, getCategoryById]);

  // Event handlers (memoized to prevent infinite re-renders)
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

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs = [{
      id: '',
      title: 'All Categories'
    }];
    hierarchyStack.forEach(categoryId => {
      const category = getCategoryById(categoryId);
      if (category) crumbs.push({
        id: categoryId,
        title: category.title
      });
    });
    return crumbs;
  }, [hierarchyStack, getCategoryById]);

  // Memoized chart props to prevent infinite re-renders
  const chartProps = useMemo(() => ({
    data: analyticsData,
    onCategoryDoubleClick: handleCategoryDoubleClick
  }), [analyticsData, handleCategoryDoubleClick]);

  // Chart renderer
  const renderChart = () => {
    if (analyticsData.length === 0) {
      return <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          
          <p>No data available for the selected period</p>
          
        </div>;
    }
    switch (chartType) {
      case 'circular':
        return <CircularChart {...chartProps} />;
      case '3d-cylinder':
        return <CylinderChart {...chartProps} />;
      case 'bubble':
        return <HighchartsBubbleChart {...chartProps} expandedCategories={{}} />;
      default:
        return <CircularChart {...chartProps} />;
    }
  };
  const totalTime = useMemo(() => analyticsData.reduce((sum, item) => sum + item.totalDuration, 0), [analyticsData]);
  const totalTasks = useMemo(() => analyticsData.reduce((sum, item) => sum + item.taskCount, 0), [analyticsData]);
  return <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50">
      <DraggableFooterControls chartType={chartType} onChartTypeChange={type => setChartType(type as ChartType)} timeMode={timeMode} onTimeModeChange={mode => setTimeMode(mode as TimeMode)} showDetails={showDetails} onToggleDetails={() => setShowDetails(!showDetails)} isDarkMode={isDarkMode} />

      <Card className="w-full h-full bg-background/95 backdrop-blur-xl border-0 shadow-none rounded-none overflow-hidden">
        <CardHeader className="pb-1 px-4 py-2 bg-white/5 dark:bg-black/10 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground/90">
                <div className="p-1 bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm rounded-lg border border-primary/30">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                Enhanced Task Analytics
              </CardTitle>
              
              <div className="flex items-center gap-1">
                {breadcrumbs.map((breadcrumb, index) => <div key={breadcrumb.id || 'root'} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
                    <Button variant={index === breadcrumbs.length - 1 ? "default" : "ghost"} size="sm" onClick={() => {
                  if (index === 0) handleNavigateToRoot();else if (index < breadcrumbs.length - 1) setHierarchyStack(prev => prev.slice(0, index));
                }} className="h-6 px-2 text-xs text-foreground bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg">
                      {breadcrumb.title}
                    </Button>
                  </div>)}
                
                {hierarchyStack.length > 0 && <Button variant="outline" size="sm" onClick={handleNavigateBack} className="h-6 w-6 p-0 ml-2 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg" title="Go back">
                    <ChevronDown className="h-3 w-3 rotate-90" />
                  </Button>}
              </div>
            </div>
            {onClose && <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg">
                <X className="h-3 w-3" />
              </Button>}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 h-full">
          {timeMode === 'custom' && <div className="absolute top-16 left-4 right-4 z-10 flex gap-3 p-3 bg-white/5 dark:bg-black/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div>
                <label className="text-xs text-muted-foreground/80 mb-1 block font-medium">Start Date</label>
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                  <EnhancedDatePicker selectedDate={customStartDate} onDateSelect={setCustomStartDate} isDarkMode={isDarkMode} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground/80 mb-1 block font-medium">End Date</label>
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                  <EnhancedDatePicker selectedDate={customEndDate} onDateSelect={setCustomEndDate} isDarkMode={isDarkMode} />
                </div>
              </div>
            </div>}

          {timeMode === 'selected' && <div className="absolute top-16 left-4 right-4 z-10 p-3 bg-white/5 dark:bg-black/10 backdrop-blur-sm rounded-xl border border-white/20">
              <label className="text-xs text-muted-foreground/80 mb-2 block font-medium">Select Individual Dates</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {selectedDates.map((date, index) => <div key={index} className="flex items-center gap-1 bg-primary/10 backdrop-blur-sm text-primary px-2 py-1 rounded-lg text-xs font-medium border border-primary/20">
                    {format(date, 'MMM dd')}
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => removeDateAtIndex(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>)}
              </div>
              <EnhancedDatePicker selectedDate={new Date()} onDateSelect={addSelectedDate} isDarkMode={isDarkMode} />
            </div>}

          <div className="flex-1 h-full w-full">
            {renderChart()}
          </div>
        </CardContent>
      </Card>

      {showDetails && <>
          <DraggableSummaryPanel totalTime={totalTime} totalTasks={totalTasks} totalCategories={analyticsData.length} isDarkMode={isDarkMode} />
          <DraggableCategoryPanel analyticsData={analyticsData} onCategoryDoubleClick={handleCategoryDoubleClick} isDarkMode={isDarkMode} />
        </>}
    </div>;
};