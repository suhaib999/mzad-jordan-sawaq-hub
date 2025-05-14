
import { ProductWithImages, ProductCardProps, ProductImage } from './types';

// Map product to card props
export const mapProductToCardProps = (product: ProductWithImages): ProductCardProps => {
  // Find the main image (display_order 0) or the first available image
  let mainImage = '';
  
  if (product.images && product.images.length > 0) {
    // Sort images by display_order and take the first one
    const sortedImages = [...product.images].sort((a, b) => {
      return (a.display_order || 0) - (b.display_order || 0);
    });
    mainImage = sortedImages[0].image_url;
  } else if (product.main_image_url) {
    // Use the precomputed main image if available
    mainImage = product.main_image_url;
  }

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
    brand: product.brand,
    model: product.model,
    shipping: product.shipping,
    currency: product.currency
  };
};

// Helper function to process product data
export const processProductData = (data: any[]): ProductWithImages[] => {
  return data.map(product => {
    const images = product.images || [];
    // Fix the sorting function to handle undefined display_order values
    const sortedImages = [...images].sort((a: ProductImage, b: ProductImage) => {
      const orderA = typeof a.display_order === 'number' ? a.display_order : 0;
      const orderB = typeof b.display_order === 'number' ? b.display_order : 0;
      return orderA - orderB;
    });
    
    const mainImageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : '';
    
    return {
      ...product,
      main_image_url: mainImageUrl
    };
  });
};
