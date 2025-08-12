export interface SearchResult {
  id: string;
  type: 'task' | 'mission' | 'habit' | 'note';
  title: string;
  description?: string;
  snippet?: string;
  category?: string;
  priority?: string;
  parentId?: string;
  missionId?: string;
  createdAt?: Date | string;
  isCompleted?: boolean;
  originalItem: any;
}

export interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  type: 'task' | 'mission' | 'habit' | 'note';
  parentId?: string;
  missionId?: string;
  createdAt?: Date | string;
  isCompleted?: boolean;
  originalItem: any;
}

export type SearchFilter = 'all' | 'task' | 'habit' | 'note';

export interface SearchState {
  query: string;
  filter: SearchFilter;
  results: SearchResult[];
  isSearching: boolean;
  isOpen: boolean;
}

export interface UseGlobalSearchReturn {
  searchState: SearchState;
  setQuery: (query: string) => void;
  setFilter: (filter: SearchFilter) => void;
  openSearch: () => void;
  closeSearch: () => void;
}