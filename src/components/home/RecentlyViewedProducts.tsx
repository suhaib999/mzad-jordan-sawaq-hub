
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductCardProps } from '@/services/product/types';
import { useQuery } from '@tanstack/react-query';
import { fetchProductById, mapProductToCardProps } from '@/services/product';

const RecentlyViewedProducts = () => {
  const [recentlyViewedIds] = useLocalStorage<string[]>('recently-viewed', []);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProducts = async () => {
      if (recentlyViewedIds.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Limit to most recent 5 items
        const recentIds = recentlyViewedIds.slice(0, 5);
        const productPromises = recentIds.map(id => fetchProductById(id));
        const results = await Promise.all(productPromises);
        
        // Filter out null values and map to card props
        const validProducts = results
          .filter(product => product !== null)
          .map(product => mapProductToCardProps(product!));
        
        setProducts(validProducts);
      } catch (error) {
        console.error('Error fetching recently viewed products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProducts();
  }, [recentlyViewedIds]);

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>;
  }

  if (products.length === 0) {
    return null; // Don't show section if no recently viewed products
  }

  return (
    <div className="mt-12">
      <ProductGrid 
        title="Recently Viewed" 
        products={products} 
        viewAllLink="/recently-viewed" 
      />
    </div>
  );
};

export default RecentlyViewedProducts;
