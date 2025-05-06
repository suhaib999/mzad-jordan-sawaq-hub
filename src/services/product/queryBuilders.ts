
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { ProductFilterParams } from './types';

// Apply filters to a Supabase query based on filter parameters
export const applyFilters = <T>(
  query: PostgrestFilterBuilder<any, any, any, T>,
  filterParams: ProductFilterParams
): PostgrestFilterBuilder<any, any, any, T> => {
  let filteredQuery = query.eq('status', 'active'); // Always filter for active products

  // Filter by category
  if (filterParams.category && filterParams.category !== 'all') {
    filteredQuery = filteredQuery.ilike('category', `%${filterParams.category}%`);
  }

  // Filter by condition
  if (filterParams.condition && filterParams.condition.length > 0) {
    filteredQuery = filteredQuery.in('condition', filterParams.condition);
  }

  // Filter by price range
  if (filterParams.price_min !== undefined) {
    filteredQuery = filteredQuery.gte('price', filterParams.price_min);
  }

  if (filterParams.price_max !== undefined && filterParams.price_max > 0) {
    filteredQuery = filteredQuery.lte('price', filterParams.price_max);
  }

  // Filter by location
  if (filterParams.location && filterParams.location.length > 0) {
    filteredQuery = filteredQuery.in('location', filterParams.location);
  }

  // Filter by auction/fixed price
  if (filterParams.is_auction !== undefined) {
    filteredQuery = filteredQuery.eq('is_auction', filterParams.is_auction);
  }

  // Filter by shipping availability
  if (filterParams.with_shipping === true) {
    filteredQuery = filteredQuery.not('shipping', 'is', null);
  }

  // Search by keyword (in title and description)
  if (filterParams.query) {
    const searchTerm = filterParams.query.toLowerCase();
    filteredQuery = filteredQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  // Sort results
  if (filterParams.sort_by) {
    switch (filterParams.sort_by) {
      case 'price_asc':
        filteredQuery = filteredQuery.order('price', { ascending: true });
        break;
      case 'price_desc':
        filteredQuery = filteredQuery.order('price', { ascending: false });
        break;
      case 'newest':
        filteredQuery = filteredQuery.order('created_at', { ascending: false });
        break;
      case 'oldest':
        filteredQuery = filteredQuery.order('created_at', { ascending: true });
        break;
      default:
        filteredQuery = filteredQuery.order('created_at', { ascending: false });
    }
  } else {
    // Default sort by newest first
    filteredQuery = filteredQuery.order('created_at', { ascending: false });
  }

  return filteredQuery;
};

// Apply pagination to a query
export const applyPagination = <T>(
  query: PostgrestFilterBuilder<any, any, any, T>,
  limit?: number,
  offset?: number
): PostgrestFilterBuilder<any, any, any, T> => {
  let paginatedQuery = query;

  if (limit !== undefined) {
    paginatedQuery = paginatedQuery.limit(limit);
  }

  if (offset !== undefined) {
    paginatedQuery = paginatedQuery.range(offset, offset + (limit || 10) - 1);
  }

  return paginatedQuery;
};
