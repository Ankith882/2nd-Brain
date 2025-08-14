import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SupabaseCategory {
  id: string;
  user_id: string;
  workspace_id: string;
  title: string;
  description?: string;
  color: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  sub_categories?: SupabaseCategory[];
}

export interface Category {
  id: string;
  title: string;
  description?: string;
  color: string;
  createdAt: Date;
  parentId?: string;
  subCategories: Category[];
  isExpanded: boolean;
  order: number;
}

// Convert SupabaseCategory to legacy Category format
const convertSupabaseCategoryToLegacy = (supabaseCategory: SupabaseCategory): Category => {
  return {
    id: supabaseCategory.id,
    title: supabaseCategory.title,
    description: supabaseCategory.description,
    color: supabaseCategory.color,
    createdAt: new Date(supabaseCategory.created_at),
    parentId: supabaseCategory.parent_id,
    subCategories: supabaseCategory.sub_categories?.map(convertSupabaseCategoryToLegacy) || [],
    isExpanded: true,
    order: 0
  };
};

export const useSupabaseCategories = (workspaceId?: string) => {
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
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
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Build hierarchical structure
      const categoryMap = new Map<string, SupabaseCategory>();
      const rootCategories: SupabaseCategory[] = [];

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
  const addCategory = async (category: Omit<SupabaseCategory, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sub_categories'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          workspace_id: category.workspace_id,
          title: category.title,
          description: category.description,
          color: category.color,
          parent_id: category.parent_id,
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
  const updateCategory = async (id: string, updates: Partial<SupabaseCategory>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchCategories();
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

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !workspaceId) return;

    fetchCategories();

    const categoriesChannel = supabase
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
      supabase.removeChannel(categoriesChannel);
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