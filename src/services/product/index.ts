
// Export all product service functions and types from this index file
export * from './types';
export * from './mappers';
export * from './productService';
export * from './queryBuilders';

// Re-export types to ensure compatibility
import { ProductWithImages, Product, ProductCardProps } from './types';
export type { ProductWithImages, Product, ProductCardProps };
