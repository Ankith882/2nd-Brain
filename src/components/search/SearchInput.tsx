import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui';
import { UseGlobalSearchReturn } from '@/types/search';

interface SearchInputProps {
  searchHook: UseGlobalSearchReturn;
}

export const SearchInput: React.FC<SearchInputProps> = ({ searchHook }) => {
  const { searchState, setQuery } = searchHook;

  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200" />
      <Input
        type="text"
        placeholder="Search..."
        value={searchState.query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-3 h-9 text-sm bg-background/60 border-border/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/10 rounded-lg transition-all duration-200 focus:bg-background/90"
        autoFocus
      />
    </div>
  );
};