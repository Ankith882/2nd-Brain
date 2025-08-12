import React, { useState } from 'react';
import { Button, ScrollArea } from '@/components/ui';
import { FolderPlus } from 'lucide-react';
import { Category, useCategoryManager } from '@/hooks/useCategoryManager';
import { DraggableAddButton } from '@/components/extra-panel/DraggableAddButton';
import { OverlayDescriptionPanel } from '@/components/OverlayDescriptionPanel';
import { CategoryForm } from '../../../timeline/CategoryForm';
import { CategoryItem } from '../../../timeline/CategoryItem';

interface CategoriesPanelContentProps {
  onAction?: (action: string, payload?: any) => void;
  isDarkMode?: boolean;
}

export const CategoriesPanelContent: React.FC<CategoriesPanelContentProps> = ({
  onAction,
  isDarkMode
}) => {
  const { categories, addCategory, updateCategory, deleteCategory, toggleCategoryExpanded } = useCategoryManager();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [addingSubCategoryParent, setAddingSubCategoryParent] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleSaveCategory = (formData: { title: string; description: string; color: string }, parentId?: string) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory({ ...formData, parentId });
    }
    setShowForm(false);
    setEditingCategory(null);
    setAddingSubCategoryParent(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleAddSubCategory = (parentId: string) => {
    setAddingSubCategoryParent(parentId);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setAddingSubCategoryParent(null);
  };

  const handleShowDescription = (category: Category) => {
    if (category.description?.trim()) {
      const isSameCategory = selectedCategory?.id === category.id && showOverlay;
      setShowOverlay(!isSameCategory);
      setSelectedCategory(isSameCategory ? null : category);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 h-full p-4">
        {/* Categories List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Categories</h3>
            <Button 
              size="sm" 
              onClick={() => setShowForm(true)}
              className="gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="space-y-2">
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  level={0}
                  onEdit={handleEditCategory}
                  onDelete={deleteCategory}
                  onAddSubCategory={handleAddSubCategory}
                  onToggleExpanded={toggleCategoryExpanded}
                  onShowDescription={handleShowDescription}
                />
              ))}
              
              {categories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No categories yet</p>
                  <p className="text-xs">Click "Add Category" to create your first category</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Form Panel */}
        {showForm && (
          <div className="w-80 border-l border-white/10 pl-4">
            <CategoryForm
              initialData={editingCategory || undefined}
              parentId={addingSubCategoryParent || undefined}
              onSave={handleSaveCategory}
              onCancel={handleCancelForm}
            />
          </div>
        )}
      </div>

      {/* Draggable Add Button */}
      <DraggableAddButton
        onClick={() => setShowForm(true)}
        isDarkMode={isDarkMode}
      />

      {/* Overlay Description Panel */}
      <OverlayDescriptionPanel
        selectedCategory={selectedCategory}
        isDarkMode={isDarkMode}
        isVisible={showOverlay}
        onClose={() => {
          setShowOverlay(false);
          setSelectedCategory(null);
        }}
        onDescriptionUpdate={(description) => {
          if (selectedCategory) {
            updateCategory(selectedCategory.id, { description });
            setSelectedCategory({ ...selectedCategory, description });
          }
        }}
        onSettingsClick={() => {}}
        onWorkspaceClick={() => {}}
        onSignOut={() => {}}
      />
    </div>
  );
};