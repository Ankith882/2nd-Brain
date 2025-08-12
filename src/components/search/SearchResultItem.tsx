import React from 'react';
import { ChevronRight, ArrowDownRight, CornerDownRight } from 'lucide-react';
import { Badge } from '@/components/ui';
import { SearchResult, UseGlobalSearchReturn } from '@/types/search';

interface SearchResultItemProps {
  result: SearchResult;
  searchHook: UseGlobalSearchReturn;
  onNavigateToResult?: (result: SearchResult) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ 
  result, 
  searchHook,
  onNavigateToResult 
}) => {

  const handleClick = () => {
    if (onNavigateToResult) {
      onNavigateToResult(result);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'P1': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'P2': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'P3': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getTaskHierarchyInfo = () => {
    if (result.type !== 'task' || !result.originalItem?.parentId) {
      return null;
    }

    // Count nesting level by checking if there are multiple levels
    // This is a simple approach - in a full implementation you'd traverse the hierarchy
    const hasParent = !!result.originalItem.parentId;
    
    return hasParent ? 'Sub Task' : null;
  };

  const taskHierarchy = getTaskHierarchyInfo();

  return (
    <div
      onClick={handleClick}
      className="group relative p-3 bg-card/40 rounded-lg border border-border/40 hover:bg-card/80 hover:border-border/60 hover:shadow-md transition-all duration-200 backdrop-blur-sm cursor-pointer overflow-hidden"
    >
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title and Priority Row */}
          <div className="flex items-center gap-2.5">
            <h4 className="font-semibold text-foreground group-hover:text-primary truncate text-sm leading-tight transition-colors">
              {result.title}
            </h4>
            {result.priority && (
              <Badge
                variant="secondary"
                className={`text-xs px-1.5 py-0.5 font-bold border ${getPriorityColor(result.priority)}`}
              >
                {result.priority}
              </Badge>
            )}
          </div>
          
          {/* Description */}
          {result.snippet && (
            <div 
              className="ql-read-mode text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
              dangerouslySetInnerHTML={{ __html: result.snippet }}
            />
          )}
          
          {/* Category and Date Row */}
          <div className="flex items-center justify-between">
            {result.category && (
              <Badge
                variant="outline"
                className="text-xs font-medium text-muted-foreground/80 border-border/50 bg-muted/30 px-1.5 py-0.5 max-w-[140px] truncate"
                title={result.category}
              >
                {result.category}
              </Badge>
            )}
            
            {/* Date */}
            {result.type === 'task' ? (
              result.originalItem?.date && (
                <span className="text-xs font-bold text-foreground/80">
                  {new Date(result.originalItem.date).toLocaleDateString()}
                </span>
              )
            ) : (
              result.createdAt && (
                <span className="text-xs font-bold text-foreground/80">
                  {new Date(result.createdAt).toLocaleDateString()}
                </span>
              )
            )}
          </div>
        </div>
        {/* Right side - Sub-task indicator or chevron */}
        <div className="flex flex-col items-end gap-1.5 ml-2">
          {/* Sub-task indicator */}
          {taskHierarchy ? (
            <div 
              className="flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded text-xs text-muted-foreground border border-border/30" 
              title="Sub Task"
            >
              <span className="font-medium">⚪ Sub</span>
            </div>
          ) : (
            /* Navigation chevron for non-sub tasks */
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/30 group-hover:bg-primary/20 transition-all duration-200 mt-auto">
              <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          )}
        </div>
      </div>
      
      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-lg border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
};