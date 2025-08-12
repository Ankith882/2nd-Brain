import React from 'react';
import { Button } from '@/components/ui';
import { SearchFilter, UseGlobalSearchReturn } from '@/types/search';

interface SearchFiltersProps {
  searchHook: UseGlobalSearchReturn;
}

const filterOptions: { value: SearchFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'task', label: 'Tasks' },
  { value: 'habit', label: 'Habits' },
  { value: 'note', label: 'Notes' }
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({ searchHook }) => {
  const { searchState, setFilter } = searchHook;

  return (
    <div className="flex gap-1">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={searchState.filter === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter(option.value)}
          className={`h-7 px-2 text-xs rounded-md transition-all duration-200 ${
            searchState.filter === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};