
import { ProductFilterParams } from './types';
import { SupabaseClient } from '@supabase/supabase-js';

// Apply filters to a query
export const applyFilters = (query: any, filterParams: ProductFilterParams = {}) => {
  let filteredQuery = query.eq('status', 'active');
  
  const { 
    category, 
    category_id,
    subcategory_id,
    category_path,
    brand,
    condition, 
    price_min, 
    price_max, 
    location, 
    is_auction, 
    with_shipping,
    query: searchQuery,
    tags,
    seller_id
  } = filterParams;

  // Filter by category using different approaches
  if (category_path && Array.isArray(category_path) && category_path.length > 0) {
    // If we have a full category path array, use contains operator for exact path match
    filteredQuery = filteredQuery.contains('category_path', category_path);
  } else if (category) {
    // If we just have a category string, check if it's in the path array or matches the category field
    filteredQuery = filteredQuery.or(`category.eq.${category},category_path.cs.{"${category}"}`);
  }

  // Filter by category_id (specific category ID)
  if (category_id) {
    filteredQuery = filteredQuery.eq('category_id', category_id);
  }
  
  // Filter by subcategory_id (specific subcategory ID)
  if (subcategory_id) {
    filteredQuery = filteredQuery.eq('subcategory_id', subcategory_id);
  }
  
  // Filter by brand (separate from category)
  if (brand) {
    filteredQuery = filteredQuery.eq('brand', brand);
  }

  // Filter by condition
  if (condition && condition.length > 0) {
    filteredQuery = filteredQuery.in('condition', condition);
  }

  // Filter by price range
  if (price_min !== undefined) {
    filteredQuery = filteredQuery.gte('price', price_min);
  }

  if (price_max !== undefined) {
    filteredQuery = filteredQuery.lte('price', price_max);
  }

  // Filter by location
  if (location && Array.isArray(location) && location.length > 0) {
    filteredQuery = filteredQuery.in('location', location);
  }

  // Filter by listing type (auction/fixed price)
  if (is_auction !== undefined) {
    filteredQuery = filteredQuery.eq('is_auction', is_auction);
  }

  // Filter by shipping availability
  if (with_shipping) {
    filteredQuery = filteredQuery.not('shipping', 'is', null);
  }

  // Filter by seller ID
  if (seller_id) {
    filteredQuery = filteredQuery.eq('seller_id', seller_id);
  }

  // Filter by tags
  if (tags && Array.isArray(tags) && tags.length > 0) {
    // This checks if any of the tags in the filter are present in the product's tags array
    filteredQuery = filteredQuery.overlaps('tags', tags);
  }

  // Text search in title and description
  if (searchQuery) {
    // Basic search using ILIKE for both title and description
    filteredQuery = filteredQuery.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
    );
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
