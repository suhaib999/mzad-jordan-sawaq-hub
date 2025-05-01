
import React from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, mapProductToCardProps } from '@/services/productService';
import { placeholderFeaturedProducts, placeholderAuctionProducts } from '@/data/placeholderProducts';

const ProductSections = () => {
  // Fetch featured (non-auction) products
  const { data: featuredProducts = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const products = await fetchProducts(5, 0, { isAuction: false });
      return products.map(mapProductToCardProps);
    }
  });

  // Fetch auction products
  const { data: auctionProducts = [], isLoading: isAuctionLoading } = useQuery({
    queryKey: ['auctionProducts'],
    queryFn: async () => {
      const products = await fetchProducts(5, 0, { isAuction: true });
      return products.map(mapProductToCardProps);
    }
  });

  // Show placeholder data while loading
  const showPlaceholders = isFeaturedLoading || isAuctionLoading || (featuredProducts.length === 0 && auctionProducts.length === 0);

  return (
    <div className="mt-12">
      {showPlaceholders ? (
        <>
          <ProductGrid 
            title="Featured Products" 
            products={placeholderFeaturedProducts} 
            viewAllLink="/browse?type=fixed" 
          />
          
          <ProductGrid 
            title="Hot Auctions" 
            products={placeholderAuctionProducts} 
            viewAllLink="/browse?type=auction" 
          />
        </>
      ) : (
        <>
          {featuredProducts.length > 0 && (
            <ProductGrid 
              title="Featured Products" 
              products={featuredProducts} 
              viewAllLink="/browse?type=fixed" 
            />
          )}
          
          {auctionProducts.length > 0 && (
            <ProductGrid 
              title="Hot Auctions" 
              products={auctionProducts} 
              viewAllLink="/browse?type=auction" 
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProductSections;
