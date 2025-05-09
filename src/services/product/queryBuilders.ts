
import { ProductFilterParams } from './types';

// Helper function to apply filters
export function applyFilters(query: any, filterParams: ProductFilterParams) {
  let result = query.eq('status', 'active');
  
  const { 
    category_id, 
    condition, 
    price_min, 
    price_max, 
    location, 
    is_auction, 
    with_shipping,
    query: searchQuery
  } = filterParams;

  // Apply category filter
  if (category_id) {
    // Check if it's in category or subcategory
    result = result.eq('category_id', category_id);
  }

  // Apply condition filter
  if (condition && condition.length > 0) {
    result = result.in('condition', condition);
  }

  // Apply price range filters
  if (price_min !== undefined) {
    result = result.gte('price', price_min);
  }

  if (price_max !== undefined) {
    result = result.lte('price', price_max);
  }

  // Apply location filter
  if (location && location.length > 0) {
    // Using .ilike for partial matches in location
    const locationFilters = location.map(loc => `%${loc}%`);
    if (locationFilters.length === 1) {
      result = result.ilike('location', locationFilters[0]);
    } else {
      // For multiple locations, use or condition
      result = result.or(
        locationFilters.map(loc => `location.ilike.${loc}`).join(',')
      );
    }
  }

  // Apply auction filter
  if (is_auction !== undefined) {
    result = result.eq('is_auction', is_auction);
  }

  // Apply shipping filter
  if (with_shipping) {
    result = result.eq('free_shipping', true);
  }

  // Apply search query filter
  if (searchQuery) {
    result = result.ilike('title', `%${searchQuery}%`);
  }

  return result;
}

// Helper function to apply sorting
export function applySorting(
  query: any, 
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest'
) {
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
