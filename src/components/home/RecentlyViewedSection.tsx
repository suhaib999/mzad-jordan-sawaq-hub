
import React, { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductCardProps } from '@/services/product/types';
import { fetchProductById } from '@/services/product';

const RecentlyViewedSection = () => {
  const [recentlyViewed] = useLocalStorage<string[]>('recentlyViewedProducts', []);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      if (recentlyViewed.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Take only the last 5 viewed products
        const recentIds = recentlyViewed.slice(-5).reverse();
        
        const productPromises = recentIds.map(id => fetchProductById(id));
        const productResults = await Promise.all(productPromises);
        
        // Filter out null results and map to card props
        const validProducts = productResults
          .filter(product => product !== null)
          .map(product => ({
            id: product!.id,
            title: product!.title,
            price: product!.is_auction ? (product!.current_bid || product!.price) : product!.price,
            imageUrl: product!.main_image_url || '',
            condition: product!.condition,
            isAuction: product!.is_auction,
            location: product!.location,
            endTime: product!.end_time
          }));
        
        setProducts(validProducts);
      } catch (error) {
        console.error('Error loading recently viewed products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [recentlyViewed]);

  // Don't show the section if there are no recently viewed products
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <ProductGrid 
        title="Recently Viewed" 
        products={products} 
        viewAllLink="/browse"
      />
    </div>
  );
};

export default RecentlyViewedSection;
