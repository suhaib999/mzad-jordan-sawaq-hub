
import { ProductFilterParams } from './types';

// Helper function to apply filters
export function applyFilters(query: any, filterParams: ProductFilterParams) {
  let result = query.eq('status', 'active');
  
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
    result = result.ilike('category', `%${category}%`);
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
}

// Helper function to apply pagination
export function applyPagination(query: any, limit?: number, offset?: number) {
  if (limit !== undefined) {
    query = query.limit(limit);
  }
  
  if (offset !== undefined) {
    query = query.offset(offset);
  }
  
  return query;
}

// Helper function to apply sorting
export function applySorting(query: any, sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest') {
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
}
