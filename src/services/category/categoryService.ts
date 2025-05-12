
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  created_at: string;
  updated_at: string;
  path?: string;
  is_leaf?: boolean;
}

export interface CategoryWithChildren extends DatabaseCategory {
  children?: CategoryWithChildren[];
}

export async function fetchCategories(): Promise<CategoryWithChildren[]> {
  try {
    // Fetch all categories
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Convert flat list to hierarchical structure
    return buildCategoryTree(data);
  } catch (error) {
    console.error("Error in fetchCategories:", error);
    return [];
  }
}

export async function fetchCategoryBySlug(slug: string): Promise<DatabaseCategory | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      console.error("Error fetching category by slug:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchCategoryBySlug:", error);
    return null;
  }
}

export async function fetchSubcategories(parentId: string): Promise<DatabaseCategory[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching child categories:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error in fetchChildCategories:", error);
    return [];
  }
}

// Function to fetch all descendant categories including the parent
export async function fetchCategoryAndDescendants(categoryId: string): Promise<DatabaseCategory[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_category_hierarchy', { category_id: categoryId });

    if (error) {
      console.error("Error fetching category hierarchy:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Convert the RPC result to match the DatabaseCategory type
    return data.map(item => ({
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_leaf: item.path?.split('/').length > 1 || false
    }));
  } catch (error) {
    console.error("Error in fetchCategoryAndDescendants:", error);
    return [];
  }
}

// Function to fetch all subcategories by parent slug
export async function fetchSubcategoriesBySlug(parentSlug: string): Promise<DatabaseCategory[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_subcategories', { parent_slug: parentSlug });

    if (error) {
      console.error("Error fetching subcategories by slug:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Convert the RPC result to match the DatabaseCategory type
    return data.map(item => ({
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_leaf: item.path?.split('/').length > 1 || false
    }));
  } catch (error) {
    console.error("Error in fetchSubcategoriesBySlug:", error);
    return [];
  }
}

// Helper function to build a category tree from flat data
function buildCategoryTree(categories: DatabaseCategory[]): CategoryWithChildren[] {
  // Create a map of id to category with empty children array
  const categoryMap: Record<string, CategoryWithChildren> = {};
  
  categories.forEach(category => {
    categoryMap[category.id] = { ...category, children: [] };
  });
  
  // Build the tree structure
  const rootCategories: CategoryWithChildren[] = [];
  
  categories.forEach(category => {
    if (category.parent_id && categoryMap[category.parent_id]) {
      // Add as child to parent
      categoryMap[category.parent_id].children?.push(categoryMap[category.id]);
    } else {
      // Top-level category
      rootCategories.push(categoryMap[category.id]);
    }
  });
  
  return rootCategories;
}
