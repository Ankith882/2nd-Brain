import React from 'react';
import { Button, ScrollArea } from '@/components/ui';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { Category } from '@/hooks/useCategoryManager';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategorySelect: (categoryId: string) => void;
  onToggleExpanded: (categoryId: string) => void;
  getCategoryById: (id: string) => Category | undefined;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  onToggleExpanded,
  getCategoryById
}) => {
  const renderCategoryTree = (categoryList: Category[], level: number = 0): React.ReactNode => {
    return categoryList
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((category, index) => (
        <div key={`${category.id}-${level}-${index}`} className="mb-1">
          <div 
            className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedCategoryId === category.id 
                ? 'bg-primary/30 border border-primary/40 shadow-lg backdrop-blur-sm' 
                : 'hover:bg-white/10 backdrop-blur-sm'
            }`}
            style={{ 
              marginLeft: `${level * 20}px`,
              background: selectedCategoryId === category.id 
                ? 'rgba(59, 130, 246, 0.15)' 
                : 'rgba(255, 255, 255, 0.05)'
            }}
            onClick={() => onCategorySelect(category.id)}
          >
            {category.subCategories.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpanded(category.id);
                }}
                className="p-1 h-6 w-6 flex-shrink-0 hover:bg-white/10"
              >
                {category.isExpanded ? 
                  <ChevronDown className="h-3 w-3" /> : 
                  <ChevronRight className="h-3 w-3" />
                }
              </Button>
            )}
            
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0 border border-white/20 shadow-sm"
              style={{ backgroundColor: category.color }}
            />
            
            <span className="text-sm flex-1 font-medium text-white/90">
              {category.title}
            </span>
            
            {category.subCategories.length > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 backdrop-blur-sm">
                {category.subCategories.length}
              </span>
            )}
            
            {selectedCategoryId === category.id && (
              <div className="w-2 h-2 bg-primary rounded-full shadow-lg" />
            )}
          </div>
          
          {category.isExpanded && category.subCategories.length > 0 && (
            <div className="mt-1">
              {renderCategoryTree(category.subCategories, level + 1)}
            </div>
          )}
        </div>
      ));
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />
        
        <div className="relative p-4">
          <h3 className="text-sm font-semibold mb-4 text-white/90">Select Category</h3>
          
          {selectedCategoryId && (
            <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center gap-3 mb-4 shadow-lg">
              <div 
                className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: getCategoryById(selectedCategoryId)?.color }}
              />
              <span className="text-sm font-medium text-white/90 flex-1">
                {getCategoryById(selectedCategoryId)?.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onCategorySelect('')}
                className="p-1 h-6 w-6 hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <ScrollArea className="h-64 pr-2">
            <div className="space-y-1">
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedCategoryId === '' 
                    ? 'bg-white/20 border border-white/30 shadow-lg backdrop-blur-sm' 
                    : 'hover:bg-white/10 backdrop-blur-sm'
                }`}
                onClick={() => onCategorySelect('')}
              >
                <div className="w-4 h-4 rounded-full bg-gray-400/80 border border-white/20 shadow-sm" />
                <span className="text-sm font-medium text-white/90 flex-1">No Category</span>
                {selectedCategoryId === '' && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                )}
              </div>
              
              {renderCategoryTree(categories)}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};