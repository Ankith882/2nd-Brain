import { useMemo } from 'react';
import { Task } from '@/types/task';
import { AnalyticsData } from '@/types/analytics';
import { useCategoryManager } from '@/hooks/useCategoryManager';
import { isWithinInterval } from 'date-fns';

export type TimeMode = 'weekly' | 'monthly' | 'yearly' | 'custom' | 'selected';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AnalyticsFilters {
  timeMode: TimeMode;
  dateRange: DateRange;
  selectedDates: Date[];
  hierarchyStack: string[];
}

const getAllTasksRecursively = (tasks: Task[]): Task[] => {
  const result: Task[] = [];
  const addTask = (task: Task) => {
    result.push(task);
    task.subTasks?.forEach(addTask);
  };
  tasks.forEach(addTask);
  return result;
};

const filterTasksByDate = (tasks: Task[], filters: AnalyticsFilters): Task[] => {
  const { timeMode, dateRange, selectedDates } = filters;
  
  return tasks.filter(task => {
    if (!task.startTime || !task.endTime || !task.categoryId || task.categoryId === 'no-category') {
      return false;
    }
    
    const taskStart = new Date(task.startTime);
    
    if (timeMode === 'selected' && selectedDates.length > 0) {
      return selectedDates.some(date => taskStart.toDateString() === date.toDateString());
    }
    
    return isWithinInterval(taskStart, dateRange);
  });
};

const getTargetCategoryIds = (
  hierarchyStack: string[],
  categories: any[],
  getCategoryById: (id: string) => any
): string[] => {
  const currentLevelCategoryId = hierarchyStack[hierarchyStack.length - 1] || null;
  
  if (currentLevelCategoryId) {
    const currentCategory = getCategoryById(currentLevelCategoryId);
    return currentCategory?.subCategories.map((sub: any) => sub.id) || [];
  }
  
  return categories.map(cat => cat.id);
};

const findTaskTargetCategory = (
  taskCategoryId: string,
  hierarchyStack: string[],
  categories: any[],
  getCategoryById: (id: string) => any
): string => {
  const currentLevelCategoryId = hierarchyStack[hierarchyStack.length - 1] || null;
  
  if (currentLevelCategoryId) {
    // Find direct subcategory of current level
    const findDirectSubcategory = (catId: string): string | null => {
      const currentLevelCategory = getCategoryById(currentLevelCategoryId);
      if (!currentLevelCategory) return null;
      
      // Check if it's a direct subcategory
      if (currentLevelCategory.subCategories.some((sub: any) => sub.id === catId)) {
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
    
    return findDirectSubcategory(taskCategoryId) || taskCategoryId;
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
    
    return findTopLevel(taskCategoryId);
  }
};

export const useAnalyticsData = (tasks: Task[], filters: AnalyticsFilters): AnalyticsData[] => {
  const { categories, getCategoryById } = useCategoryManager();
  
  return useMemo(() => {
    const allTasks = getAllTasksRecursively(tasks);
    const filteredTasks = filterTasksByDate(allTasks, filters);
    const targetCategoryIds = getTargetCategoryIds(filters.hierarchyStack, categories, getCategoryById);
    
    // Group tasks by target category
    const categoryMap = new Map<string, AnalyticsData>();
    
    filteredTasks.forEach(task => {
      const targetCategoryId = findTaskTargetCategory(
        task.categoryId!,
        filters.hierarchyStack,
        categories,
        getCategoryById
      );
      
      if (!targetCategoryIds.includes(targetCategoryId)) return;
      
      const targetCategory = getCategoryById(targetCategoryId);
      if (!targetCategory) return;
      
      const duration = Math.round(
        (new Date(task.endTime!).getTime() - new Date(task.startTime!).getTime()) / 60000
      );
      
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
          level: filters.hierarchyStack.length
        });
      }
      
      const categoryData = categoryMap.get(targetCategoryId)!;
      categoryData.totalDuration += duration;
      categoryData.taskCount += 1;
      categoryData.tasks.push(task);
    });
    
    return Array.from(categoryMap.values())
      .filter(data => data.totalDuration > 0)
      .sort((a, b) => a.categoryTitle.localeCompare(b.categoryTitle));
  }, [tasks, categories, filters, getCategoryById]);
};