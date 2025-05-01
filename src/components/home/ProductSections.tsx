
import React from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, mapProductToCardProps } from '@/services/product';
import { placeholderFeaturedProducts, placeholderAuctionProducts } from '@/data/placeholderProducts';

const ProductSections = () => {
  // Fetch featured (non-auction) products
  const { data: featuredProductsData = {products: [], count: 0}, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      return fetchProducts(5, 0, { is_auction: false });
    }
  });

  // Fetch auction products
  const { data: auctionProductsData = {products: [], count: 0}, isLoading: isAuctionLoading } = useQuery({
    queryKey: ['auctionProducts'],
    queryFn: async () => {
      return fetchProducts(5, 0, { is_auction: true });
    }
  });

  // Map products to card props
  const featuredProducts = featuredProductsData.products.map(mapProductToCardProps);
  const auctionProducts = auctionProductsData.products.map(mapProductToCardProps);

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
