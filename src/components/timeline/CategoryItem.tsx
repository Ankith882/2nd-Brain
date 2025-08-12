import React from 'react';
import { Card, CardContent, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
import { ChevronDown, ChevronRight, Edit3, Trash2, Plus, MoreVertical } from 'lucide-react';
import { Category } from '@/hooks/useCategoryManager';

interface CategoryItemProps {
  category: Category;
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddSubCategory: (parentId: string) => void;
  onToggleExpanded: (id: string) => void;
  onShowDescription: (category: Category) => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({ 
  category, 
  level, 
  onEdit, 
  onDelete, 
  onAddSubCategory,
  onToggleExpanded,
  onShowDescription
}) => {
  const hasSubCategories = category.subCategories?.length > 0;

  return (
    <div className={`ml-${level * 4}`}>
      <Card className="mb-2 transition-all duration-200 bg-background/5 backdrop-blur-md border-border/20 hover:bg-background/10">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {hasSubCategories && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExpanded(category.id)}
                  className="p-1"
                >
                  {category.isExpanded ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              )}
              
              <div 
                className="w-4 h-4 rounded-full border border-border/20"
                style={{ backgroundColor: category.color }}
              />
              
              <div 
                className="flex-1 cursor-pointer" 
                onClick={() => category.description && onShowDescription(category)}
              >
                <h4 className="font-medium text-sm">{category.title}</h4>
                {category.description && (
                  <div 
                    className="text-xs text-muted-foreground mt-1 hover:text-primary transition-colors q1-read-mode max-h-4 overflow-hidden line-clamp-1"
                    dangerouslySetInnerHTML={{ __html: category.description }}
                  />
                )}
              </div>
              
              {hasSubCategories && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  {category.subCategories.length}
                </span>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/10 backdrop-blur-xl border-border/20">
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddSubCategory(category.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subcategory
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(category.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      {category.isExpanded && hasSubCategories && (
        <div className="ml-4">
          {category.subCategories.map((subCategory) => (
            <CategoryItem
              key={subCategory.id}
              category={subCategory}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubCategory={onAddSubCategory}
              onToggleExpanded={onToggleExpanded}
              onShowDescription={onShowDescription}
            />
          ))}
        </div>
      )}
    </div>
  );
};