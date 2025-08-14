import { useCallback } from 'react';
import { useSupabaseCategories, Category, SupabaseCategory } from './useSupabaseCategories';
import { useSupabaseWorkspaces } from './useSupabaseWorkspaces';

export type { Category } from './useSupabaseCategories';

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

export const useCategoryManager = () => {
  const { selectedWorkspace } = useSupabaseWorkspaces();
  const workspaceId = selectedWorkspace?.id;
  
  const {
    categories: supabaseCategories,
    addCategory: addSupabaseCategory,
    updateCategory: updateSupabaseCategory,
    deleteCategory: deleteSupabaseCategory
  } = useSupabaseCategories(workspaceId);

  // Convert Supabase categories to legacy format
  const categories = supabaseCategories.map(convertSupabaseCategoryToLegacy);

  const addCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'createdAt' | 'subCategories' | 'isExpanded' | 'order'>) => {
    if (!workspaceId) return;

    const supabaseCategoryData: Omit<SupabaseCategory, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sub_categories'> = {
      workspace_id: workspaceId,
      title: categoryData.title,
      description: categoryData.description,
      color: categoryData.color,
      parent_id: categoryData.parentId
    };

    await addSupabaseCategory(supabaseCategoryData);
  }, [workspaceId, addSupabaseCategory]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const supabaseUpdates: Partial<SupabaseCategory> = {
      title: updates.title,
      description: updates.description,
      color: updates.color,
      parent_id: updates.parentId
    };

    await updateSupabaseCategory(id, supabaseUpdates);
  }, [updateSupabaseCategory]);

  const deleteCategory = useCallback(async (id: string) => {
    await deleteSupabaseCategory(id);
  }, [deleteSupabaseCategory]);

  const getCategoryById = useCallback((id: string): Category | null => {
    const findCategoryRecursively = (categoryList: Category[]): Category | null => {
      for (const category of categoryList) {
        if (category.id === id) return category;
        const found = findCategoryRecursively(category.subCategories);
        if (found) return found;
      }
      return null;
    };
    return findCategoryRecursively(categories);
  }, [categories]);

  const toggleCategoryExpanded = useCallback(() => {
    // This is handled in the UI state, not persisted to database
    console.log('toggleCategoryExpanded not implemented for Supabase');
  }, []);

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    toggleCategoryExpanded
  };
};