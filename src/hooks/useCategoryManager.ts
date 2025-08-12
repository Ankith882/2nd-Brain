import { useState, useEffect, useCallback } from 'react';

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

const initialCategories: Category[] = [];

export const useCategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem('task-categories');
    return stored ? JSON.parse(stored).map((cat: any) => ({
      ...cat,
      createdAt: new Date(cat.createdAt),
      subCategories: cat.subCategories || [],
      isExpanded: cat.isExpanded ?? true,
      order: cat.order ?? 0
    })) : initialCategories;
  });

  // Save to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem('task-categories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'subCategories' | 'isExpanded' | 'order'>) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      createdAt: new Date(),
      subCategories: [],
      isExpanded: true,
      order: categories.length,
      ...categoryData
    };

    if (categoryData.parentId) {
      const addSubCategoryRecursively = (categoryList: Category[], parentId: string): Category[] => {
        return categoryList.map(category => {
          if (category.id === parentId) {
            return { ...category, subCategories: [...category.subCategories, newCategory] };
          }
          return { ...category, subCategories: addSubCategoryRecursively(category.subCategories, parentId) };
        });
      };
      setCategories(prev => addSubCategoryRecursively(prev, categoryData.parentId!));
    } else {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updateCategoryRecursively = (categoryList: Category[]): Category[] => {
      return categoryList.map(category => {
        if (category.id === id) {
          return { ...category, ...updates };
        }
        return { ...category, subCategories: updateCategoryRecursively(category.subCategories) };
      });
    };
    setCategories(prev => updateCategoryRecursively(prev));
  };

  const deleteCategory = (id: string) => {
    const deleteCategoryRecursively = (categoryList: Category[]): Category[] => {
      return categoryList.filter(category => category.id !== id).map(category => ({
        ...category,
        subCategories: deleteCategoryRecursively(category.subCategories)
      }));
    };
    setCategories(prev => deleteCategoryRecursively(prev));
  };

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

  const toggleCategoryExpanded = (id: string) => {
    const toggleRecursively = (categoryList: Category[]): Category[] => {
      return categoryList.map(category => {
        if (category.id === id) {
          return { ...category, isExpanded: !category.isExpanded };
        }
        return { ...category, subCategories: toggleRecursively(category.subCategories) };
      });
    };
    setCategories(prev => toggleRecursively(prev));
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    toggleCategoryExpanded
  };
};