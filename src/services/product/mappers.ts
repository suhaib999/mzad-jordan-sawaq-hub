
import { ProductWithImages, ProductCardProps } from './types';

// Process raw product data from API
export const processProductData = (data: any[]): ProductWithImages[] => {
  return data.map(product => {
    // Sort images by display_order
    const images = product.images || [];
    const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
    const mainImageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : null;

    // Parse shipping data if stored as a string
    let shippingData = [];
    if (product.shipping && typeof product.shipping === 'string') {
      try {
        shippingData = JSON.parse(product.shipping);
      } catch (e) {
        console.error("Error parsing shipping data:", e);
      }
    }

    return {
      ...product,
      images: sortedImages,
      main_image_url: mainImageUrl || product.main_image_url,
      shipping_data: shippingData
    };
  });
};

// Map product data to card props
export const mapProductToCardProps = (product: ProductWithImages): ProductCardProps => {
  // Default shipping text based on properties
  let shippingText = '';
  if (product.free_shipping) {
    shippingText = 'Free shipping';
  } else if (product.local_pickup) {
    shippingText = 'Local pickup available';
  } else if (product.shipping_data && product.shipping_data.length > 0) {
    const lowestPrice = Math.min(
      ...product.shipping_data.map((opt: any) => Number(opt.price) || 0)
    );
    shippingText = lowestPrice > 0 ? `+${lowestPrice.toFixed(2)} shipping` : 'Shipping available';
  }

  return {
    id: product.id,
    title: product.title,
    price: product.is_auction ? (product.current_bid || product.start_price || product.price || 0) : (product.price || 0),
    imageUrl: product.main_image_url || (product.images && product.images[0]?.image_url) || '',
    condition: product.condition || '',
    isAuction: product.is_auction || false,
    location: product.location || '',
    endTime: product.end_time ? formatEndTime(product.end_time) : undefined,
    shipping: shippingText,
    brand: product.brand,
    model: product.model,
    currency: product.currency || 'JOD'
  };
};

// Format end time string for auctions
function formatEndTime(endTimeStr: string): string {
  try {
    const endTime = new Date(endTimeStr);
    const now = new Date();
    const diffMs = endTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h left`;
    } else if (diffHours > 0) {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m left`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? `${diffMinutes}m left` : 'Ending soon';
    }
  } catch (e) {
    console.error("Error formatting end time:", e);
    return 'Auction ending';
  }
}
