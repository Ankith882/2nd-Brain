import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Category {
  id: string;
  user_id: string;
  workspace_id: string;
  parent_id?: string;
  title: string;
  color: string;
  description?: string;
  created_at: string;
  updated_at: string;
  sub_categories?: Category[];
}

export const useSupabaseCategories = (workspaceId?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch categories with hierarchical structure
  const fetchCategories = async () => {
    if (!user || !workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Build hierarchical structure
      const categoryMap = new Map<string, Category>();
      const rootCategories: Category[] = [];

      data?.forEach(category => {
        categoryMap.set(category.id, { ...category, sub_categories: [] });
      });

      data?.forEach(category => {
        const categoryObj = categoryMap.get(category.id)!;
        if (category.parent_id) {
          const parent = categoryMap.get(category.parent_id);
          if (parent) {
            parent.sub_categories!.push(categoryObj);
          }
        } else {
          rootCategories.push(categoryObj);
        }
      });

      setCategories(rootCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Add category
  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sub_categories'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCategories();
      toast.success('Category created successfully');
      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to create category');
    }
  };

  // Update category
  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchCategories();
      toast.success('Category updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  // Delete category (cascades to sub-categories)
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user || !workspaceId) return;

    fetchCategories();

    const channel = supabase
      .channel('categories-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'categories',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, workspaceId]);

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  };
};