
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import { fetchProducts, mapProductToCardProps } from '@/services/product';
import { placeholderFeaturedProducts } from '@/data/placeholderProducts';

const TrendingSection = () => {
  // Fetch trending products - for now we'll just get the newest products
  // In a real app, this might use a different endpoint or parameters to get actually trending items
  const { data: trendingProductsData = {products: [], count: 0}, isLoading } = useQuery({
    queryKey: ['trendingProducts'],
    queryFn: async () => {
      return fetchProducts(5, 0, { sort_by: 'newest' });
    }
  });

  // Map products to card props
  const trendingProducts = trendingProductsData.products.map(mapProductToCardProps);

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-mzad-secondary" />
        <h2 className="text-xl font-bold">Trending Now</h2>
      </div>
      
      {isLoading ? (
        <ProductGrid 
          products={placeholderFeaturedProducts} 
          viewAllLink="/browse?sort_by=trending" 
        />
      ) : (
        <ProductGrid 
          products={trendingProducts} 
          viewAllLink="/browse?sort_by=trending" 
        />
      )}
    </div>
  );
};

export default TrendingSection;
