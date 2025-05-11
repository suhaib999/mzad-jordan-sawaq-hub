
// Helper functions for building Supabase queries

import { ProductFilterParams } from './types';

// Apply filters to a Supabase query
export const applyFilters = (query: any, filterParams: ProductFilterParams) => {
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
    // This will match any product whose category path starts with this category's path
    // This effectively returns products in this category AND all its subcategories
    result = result.ilike('category', `${category}%`);
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
