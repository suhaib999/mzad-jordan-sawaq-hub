
// Export all product service functions and types from this index file
export * from './types';
export * from './mappers';
export * from './queryBuilders';

// Export functions from productService but exclude the duplicated functions
// that are also exported from mappers.ts
export { 
  fetchProducts,
  fetchProductsBySellerId,
  fetchProductById,
  fetchFeaturedProductsByCategory,
  searchProducts,
  fetchCategoriesFromDb,
  fetchProductShippingOptions
} from './productService';

// Export createOrUpdateProduct directly from its file
// This resolves the naming conflict with productService.ts
export { createOrUpdateProduct } from './createOrUpdateProduct';

// Re-export specific types to ensure compatibility
import { ProductWithImages, Product, ShippingOption } from './types';
export type { ProductWithImages, Product, ShippingOption };

// Re-export ProductCardProps from types directly to avoid ambiguity
export type { ProductCardProps } from './types';
