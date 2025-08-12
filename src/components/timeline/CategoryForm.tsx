import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea } from '@/components/ui';
import { Category } from '@/hooks/useCategoryManager';

interface CategoryFormProps {
  initialData?: Category;
  parentId?: string;
  onSave: (data: { title: string; description: string; color: string }, parentId?: string) => void;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ 
  initialData, 
  parentId, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    color: initialData?.color || '#3B82F6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData, parentId);
    }
  };

  return (
    <Card className="bg-background/10 backdrop-blur-xl border-border/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          {initialData ? 'Edit Category' : parentId ? 'Add Subcategory' : 'Add Category'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Category title"
            className="bg-background/10 border-border/20"
            required
          />
          
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description (optional)"
            className="bg-background/10 border-border/20 h-16 resize-none"
          />
          
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-12 h-8 rounded border border-border/20"
            />
            <Input
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              placeholder="#000000"
              className="bg-background/10 border-border/20 flex-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">
              {initialData ? 'Update' : 'Add'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};