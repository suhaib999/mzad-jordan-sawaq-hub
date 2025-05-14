
// Export all product service functions and types from this index file
export * from './types';
export * from './queryBuilders';

// Re-export mappers explicitly to avoid ambiguity
export { processProductData, mapProductToCardProps } from './mappers';

// Export functions from productService
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
export { createOrUpdateProduct } from './createOrUpdateProduct';

// Re-export specific types to ensure compatibility
import { ProductWithImages, Product, ShippingOption, ProductCardProps } from './types';
export type { ProductWithImages, Product, ShippingOption, ProductCardProps };

