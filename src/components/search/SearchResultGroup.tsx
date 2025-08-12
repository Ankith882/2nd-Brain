import React from 'react';
import { SearchResultItem } from './SearchResultItem';
import { SearchResult, UseGlobalSearchReturn } from '@/types/search';

interface SearchResultGroupProps {
  type: 'task' | 'mission' | 'habit' | 'note';
  results: SearchResult[];
  searchHook: UseGlobalSearchReturn;
  onNavigateToResult?: (result: SearchResult) => void;
}

const typeLabels = {
  task: 'Tasks',
  mission: 'Missions',
  habit: 'Habits',
  note: 'Notes'
};

const typeIcons = {
  task: '✓',
  mission: '⭐',
  habit: '🔄',
  note: '📝'
};

const typeColors = {
  task: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  mission: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  habit: 'from-green-500/20 to-green-600/20 border-green-500/30',
  note: 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
};

export const SearchResultGroup: React.FC<SearchResultGroupProps> = ({ 
  type, 
  results, 
  searchHook,
  onNavigateToResult 
}) => {
  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r ${typeColors[type]} border backdrop-blur-sm`}>
        <div className="w-5 h-5 rounded-md bg-background/60 flex items-center justify-center text-xs">
          {typeIcons[type]}
        </div>
        <div className="flex-1">
          <span className="font-medium text-foreground text-sm">{typeLabels[type]}</span>
          <span className="ml-2 text-muted-foreground text-xs">
            {results.length}
          </span>
        </div>
      </div>
      
      <div className="space-y-1.5">
        {results.map((result) => (
          <SearchResultItem
            key={result.id}
            result={result}
            searchHook={searchHook}
            onNavigateToResult={onNavigateToResult}
          />
        ))}
      </div>
    </div>
  );
};