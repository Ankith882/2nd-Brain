import React from 'react';
import { ScrollArea } from '@/components/ui';
import { Layers3 } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';
import { AnalyticsData } from '@/types/analytics';
interface DraggableCategoryPanelProps {
  analyticsData: AnalyticsData[];
  onCategoryDoubleClick: (categoryId: string) => void;
  isDarkMode: boolean;
}
const CategoryItem: React.FC<{
  item: AnalyticsData;
  onDoubleClick: () => void;
}> = ({
  item,
  onDoubleClick
}) => <div className="space-y-1 p-2 bg-white/5 dark:bg-black/10 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full shadow-lg border border-white/20" style={{
      backgroundColor: item.categoryColor
    }} />
      <span className={`text-xs font-medium text-foreground/90 flex-1 ${item.hasSubcategories ? 'cursor-pointer hover:text-primary transition-colors duration-200' : ''}`} onDoubleClick={item.hasSubcategories ? onDoubleClick : undefined} style={{
      paddingLeft: `${item.level * 8}px`
    }} title={item.hasSubcategories ? 'Double-click to explore subcategories' : ''}>
        {item.categoryTitle}
      </span>
      {item.hasSubcategories && <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary shadow-lg animate-pulse" />
          <span className="text-xs text-primary/80 font-medium">Sub</span>
        </div>}
    </div>
    <div className="text-xs text-muted-foreground/70 font-medium bg-white/5 dark:bg-black/10 px-2 py-0.5 rounded backdrop-blur-sm" style={{
    paddingLeft: `${item.level * 8 + 20}px`
  }}>
      {item.level === 0 ? 'Main' : item.level === 1 ? 'Sub' : 'Nested'} • {Math.round(item.totalDuration / 60)}h {item.totalDuration % 60}m • {item.taskCount} task{item.taskCount !== 1 ? 's' : ''}
      {item.hasSubcategories}
    </div>
  </div>;
export const DraggableCategoryPanel: React.FC<DraggableCategoryPanelProps> = ({
  analyticsData,
  onCategoryDoubleClick
}) => <DraggablePanel title="Category Details" icon={Layers3} initialPosition={{
  x: window.innerWidth - 320,
  y: window.innerHeight - 280
}} initialSize={{
  width: 300,
  height: 260
}} minSize={{
  width: 250,
  height: 200
}}>
    <ScrollArea className="h-full">
      <div className="space-y-2">
        {analyticsData.map(item => <CategoryItem key={item.categoryId} item={item} onDoubleClick={() => onCategoryDoubleClick(item.categoryId)} />)}
      </div>
    </ScrollArea>
  </DraggablePanel>;