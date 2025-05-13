
// Helper functions for building Supabase queries

import { ProductFilterParams } from './types';
import { supabase } from '@/integrations/supabase/client';
import { categories, findCategoryBySlug } from '@/data/categories';

// Apply filters to a Supabase query
export const applyFilters = async (query: any, filterParams: ProductFilterParams) => {
  let result = query.eq('status', 'active');
  
  const { 
    category_id, 
    category,
    condition, 
    price_min, 
    price_max, 
    location, 
    is_auction, 
    with_shipping,
    query: searchQuery
  } = filterParams;

  if (category_id) {
    result = result.eq('category_id', category_id);
  }

  if (category) {
    // Enhanced category filtering that handles the hierarchy
    // This will match both exact categories and their subcategories
    
    // First, gather all possible subcategory slugs that could match this category
    const possibleCategories = await getCategoryAndSubcategories(category);
    
    if (possibleCategories.length > 0) {
      // Use the "in" operator to match any of the possible categories
      result = result.in('category', possibleCategories);
    } else {
      // Fallback to the previous logic if we couldn't find subcategories
      // This will match both exact categories and their subcategories
      result = result.or(`category.eq.${category},category.like.${category}/%`);
    }
  }

  if (condition && condition.length > 0) {
    result = result.in('condition', condition);
  }

  if (price_min !== undefined) {
    result = result.gte('price', price_min);
  }

  if (price_max !== undefined) {
    result = result.lte('price', price_max);
  }

  if (location && location.length > 0) {
    result = result.in('location', location);
  }

  if (is_auction !== undefined) {
    result = result.eq('is_auction', is_auction);
  }

  if (with_shipping) {
    result = result.not('shipping', 'is', null);
  }

  if (searchQuery) {
    result = result.ilike('title', `%${searchQuery}%`);
  }

  return result;
};

// Helper function to get all subcategories for a given category slug
export async function getCategoryAndSubcategories(categorySlug: string): Promise<string[]> {
  // First try to fetch from DB
  try {
    const { data: dbCategories, error } = await supabase
      .rpc('get_subcategories', { parent_slug: categorySlug });
    
    if (!error && dbCategories && dbCategories.length > 0) {
      // Extract all the slugs from the result
      const allSlugs = dbCategories.map(cat => {
        // Get just the last part of the category path as that's what's stored in the DB
        const parts = cat.slug.split('/');
        return parts[parts.length - 1];
      });
      
      // Add the original category slug as well
      const mainCat = findCategoryBySlug(categorySlug);
      if (mainCat) {
        // Extract just the slug part
        const parts = mainCat.slug.split('/');
        const simplifiedSlug = parts[parts.length - 1];
        if (!allSlugs.includes(simplifiedSlug)) {
          allSlugs.push(simplifiedSlug);
        }
      }

      // Also add simplified versions of the category slug
      if (!allSlugs.includes(categorySlug)) {
        allSlugs.push(categorySlug);
      }
      
      // Ensure we have all variations of the category (with different casing)
      const variations = [];
      allSlugs.forEach(slug => {
        variations.push(slug);
        variations.push(slug.toLowerCase());
        if (slug.includes('-')) {
          variations.push(slug.replace(/-/g, ' '));
          variations.push(slug.replace(/-/g, ' ').toLowerCase());
        }
      });
      
      return [...new Set(variations)]; // Remove duplicates
    }
  } catch (err) {
    console.error("Error fetching subcategories from DB:", err);
  }
  
  // Fallback to client-side data
  return getCategoryHierarchyFromClientData(categorySlug);
}

// Fallback method that uses client-side category data
function getCategoryHierarchyFromClientData(categorySlug: string): string[] {
  const result = new Set<string>();
  
  // Add the main category
  result.add(categorySlug);
  
  // Find the category in our client-side data
  const category = findCategoryBySlug(categorySlug);
  if (!category) return Array.from(result);
  
  // Extract the last part of the slug, which is what's stored in the DB
  const parts = categorySlug.split('/');
  result.add(parts[parts.length - 1]);
  
  // Function to recursively collect all subcategory slugs
  function collectSubcategories(cat: any, results: Set<string>) {
    if (!cat) return;
    
    // Add the current category
    const slug = cat.slug;
    results.add(slug);
    
    // Add the last part of the slug
    const parts = slug.split('/');
    results.add(parts[parts.length - 1]);
    
    // Process all children
    if (cat.children && cat.children.length > 0) {
      for (const child of cat.children) {
        collectSubcategories(child, results);
      }
    }
  }
  
  // If this category has children, process them
  if (category.children && category.children.length > 0) {
    for (const child of category.children) {
      collectSubcategories(child, result);
    }
  }
  
  // Convert Set to Array and return
  return Array.from(result);
}

// Apply sorting to a Supabase query
export const applySorting = (query: any, sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest') => {
  switch (sortBy) {
    case 'price_asc':
      return query.order('price', { ascending: true });
    case 'price_desc':
      return query.order('price', { ascending: false });
    case 'oldest':
      return query.order('created_at', { ascending: true });
    case 'newest':
    default:
      return query.order('created_at', { ascending: false });
  }
};

// Apply pagination to a Supabase query
export const applyPagination = (query: any, limit?: number, offset?: number) => {
  let result = query;
  
  if (limit !== undefined && limit > 0) {
    result = result.limit(limit);
  }
  
  if (offset !== undefined && offset >= 0) {
    result = result.range(offset, offset + (limit || 10) - 1);
  }
  
  return result;
};
