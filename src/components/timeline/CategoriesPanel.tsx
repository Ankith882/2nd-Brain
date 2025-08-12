import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, ScrollArea } from '@/components/ui';
import { FolderPlus, X } from 'lucide-react';
import { Category, useCategoryManager } from '@/hooks/useCategoryManager';
import { DraggableAddButton } from '@/components/extra-panel/DraggableAddButton';
import { OverlayDescriptionPanel } from '@/components/OverlayDescriptionPanel';
import { CategoryForm } from './CategoryForm';
import { CategoryItem } from './CategoryItem';

interface CategoriesPanelProps {
  isDarkMode: boolean;
  onClose?: () => void;
}

export const CategoriesPanel: React.FC<CategoriesPanelProps> = ({ isDarkMode, onClose }) => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[calc(100vh-4rem)] bg-background/10 backdrop-blur-xl border-border/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Categories Management</CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <div className="flex gap-4 h-full">
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
              
              <ScrollArea className="h-[calc(100vh-16rem)]">
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
              <div className="w-80">
                <CategoryForm
                  initialData={editingCategory || undefined}
                  parentId={addingSubCategoryParent || undefined}
                  onSave={handleSaveCategory}
                  onCancel={handleCancelForm}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Draggable Add Button for Categories */}
      <DraggableAddButton
        onClick={() => setShowForm(true)}
        isDarkMode={isDarkMode}
      />

      {/* Overlay Description Panel for Categories */}
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