
// Export all product service functions and types from this index file
export * from './types';
export * from './mappers';
export * from './productService';
export * from './queryBuilders';
export * from './createOrUpdateProduct';

// Re-export specific types to ensure compatibility
import { ProductWithImages, Product, ProductCardProps, ShippingOption } from './types';
export type { ProductWithImages, Product, ProductCardProps, ShippingOption };
