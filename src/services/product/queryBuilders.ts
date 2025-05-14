
import { ProductFilterParams } from './types';
import { SupabaseClient } from '@supabase/supabase-js';

// Apply filters to a query
export const applyFilters = (query: any, filterParams: ProductFilterParams = {}) => {
  let filteredQuery = query.eq('status', 'active');
  
  const { 
    category, 
    condition, 
    price_min, 
    price_max, 
    location, 
    is_auction, 
    with_shipping,
    query: searchQuery
  } = filterParams;

  if (category) {
    // First check if this is a top-level category with subcategories we need to include
    if (category === 'vehicles') {
      // For top-level categories, we need to match either the exact category
      // or any category that starts with this category/ (to include subcategories)
      filteredQuery = filteredQuery.or(`category.eq.${category},category_path.cs.{"${category}"}`);
    } 
    // Check if we have a full path or just a slug
    else if (Array.isArray(category)) {
      // If it's an array, use contains for full path match
      filteredQuery = filteredQuery.contains('category_path', category);
    } else {
      // For single category slug, check if it's in the category_path array
      // This ensures we find products in this category AND its subcategories
      filteredQuery = filteredQuery.contains('category_path', [category]);
    }
  }

  if (condition && condition.length > 0) {
    filteredQuery = filteredQuery.in('condition', condition);
  }

  if (price_min !== undefined) {
    filteredQuery = filteredQuery.gte('price', price_min);
  }

  if (price_max !== undefined) {
    filteredQuery = filteredQuery.lte('price', price_max);
  }

  if (location && Array.isArray(location) && location.length > 0) {
    filteredQuery = filteredQuery.in('location', location);
  }

  if (is_auction !== undefined) {
    filteredQuery = filteredQuery.eq('is_auction', is_auction);
  }

  if (with_shipping) {
    filteredQuery = filteredQuery.not('shipping', 'is', null);
  }

  if (searchQuery) {
    filteredQuery = filteredQuery.ilike('title', `%${searchQuery}%`);
  }

  return filteredQuery;
};

// Apply sorting to a query
export const applySorting = (query: any, sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest') => {
  if (!query) return query;
  
  try {
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
  } catch (error) {
    console.error('Error applying sorting:', error);
    return query; // Return the original query if sorting fails
  }
};

// Apply pagination to a query
export const applyPagination = (query: any, limit?: number, offset?: number) => {
  if (limit !== undefined) {
    if (offset !== undefined) {
      return query.range(offset, offset + limit - 1);
    } else {
      return query.limit(limit);
    }
  }
  return query;
};
