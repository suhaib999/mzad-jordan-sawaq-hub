
import { ProductWithImages, ProductCardProps } from './types';

// Map product to card props 
export const mapProductToCardProps = (product: ProductWithImages): ProductCardProps => {
  // Find the main image (display_order 0) or the first available image
  const mainImage = product.images && product.images.length > 0
    ? product.images.sort((a, b) => a.display_order - b.display_order)[0].image_url
    : product.main_image_url || '';

  return {
    id: product.id,
    title: product.title,
    price: product.is_auction ? (product.current_bid || product.start_price || 0) : product.price,
    imageUrl: mainImage,
    condition: product.condition,
    isAuction: product.is_auction,
    location: product.location,
    endTime: product.end_time,
    quantity: product.quantity,
    brand: product.brand
  };
};
