import React from 'react';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui';
import { SearchResultGroup } from './SearchResultGroup';
import { UseGlobalSearchReturn, SearchResult } from '@/types/search';

interface SearchResultsProps {
  searchHook: UseGlobalSearchReturn;
  onNavigateToResult?: (result: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ searchHook, onNavigateToResult }) => {
  const { searchState } = searchHook;
  const { results, query, isSearching } = searchState;
  
  console.log('SearchResults render:', { resultsCount: results.length, query, isSearching });

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <div className="text-muted-foreground font-medium">Searching...</div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-primary/60" />
        </div>
        <div className="text-muted-foreground font-medium text-lg mb-2">Start your search</div>
        <div className="text-muted-foreground/70 text-sm max-w-md">
          Type to search across tasks, missions, habits, and notes
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <div className="text-muted-foreground font-medium text-lg mb-2">No results found</div>
        <div className="text-muted-foreground/70 text-sm">
          No matches for "<span className="font-medium text-foreground">{query}</span>"
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        <div className="text-xs text-muted-foreground/80 font-medium bg-muted/20 px-2.5 py-1 rounded-md inline-block">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </div>
        {Object.entries(groupedResults).map(([type, typeResults]) => (
          <SearchResultGroup
            key={type}
            type={type as any}
            results={typeResults}
            searchHook={searchHook}
            onNavigateToResult={onNavigateToResult}
          />
        ))}
      </div>
    </ScrollArea>
  );
};