import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui';
import { SearchInput } from './SearchInput';
import { SearchFilters } from './SearchFilters';
import { SearchResults } from './SearchResults';
import { UseGlobalSearchReturn, SearchResult } from '@/types/search';

interface SearchModalProps {
  searchHook: UseGlobalSearchReturn;
  onNavigateToResult?: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ searchHook, onNavigateToResult }) => {
  const { searchState, closeSearch } = searchHook;
  
  console.log('SearchModal render - isOpen:', searchState.isOpen);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && searchState.isOpen) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchState.isOpen, closeSearch]);

  return (
    <Dialog open={searchState.isOpen} onOpenChange={(open) => !open && closeSearch()}>
      <DialogOverlay className="fixed inset-0 z-50 bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-xl" />
      <DialogContent className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-3xl p-0 overflow-hidden ring-1 ring-primary/20" aria-describedby="search-description">
        <div id="search-description" className="sr-only">Global search dialog for finding tasks, missions, habits, and notes</div>
        
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-50 animate-pulse" />
        <div className="relative bg-background/95 backdrop-blur-2xl rounded-3xl border border-border/30">
          <div className="flex flex-col h-[75vh] max-h-[700px]">
            {/* Compact Header */}
            <div className="relative px-6 py-4 border-b border-border/20 bg-background/80 backdrop-blur-sm">
              <div className="space-y-3">
                <SearchInput searchHook={searchHook} />
                <SearchFilters searchHook={searchHook} />
              </div>
            </div>
            
            {/* Expanded Results Area */}
            <div className="flex-1 overflow-hidden">
              <SearchResults searchHook={searchHook} onNavigateToResult={onNavigateToResult} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};