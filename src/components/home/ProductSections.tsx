
import React from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '@/components/product/ProductGrid';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/services/product/productService';
import { mapProductToCardProps } from '@/services/product/mappers';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProductSections = () => {
  const [activeTab, setActiveTab] = React.useState<string>("featured");
  
  // Fetch featured (non-auction) products
  const { data: featuredProductsData = {products: [], count: 0}, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      return fetchProducts(8, 0, { is_auction: false });
    }
  });

  // Fetch auction products
  const { data: auctionProductsData = {products: [], count: 0}, isLoading: isAuctionLoading } = useQuery({
    queryKey: ['auctionProducts'],
    queryFn: async () => {
      return fetchProducts(8, 0, { is_auction: true });
    }
  });

  // Fetch recent products
  const { data: recentProductsData = {products: [], count: 0}, isLoading: isRecentLoading } = useQuery({
    queryKey: ['recentProducts'],
    queryFn: async () => {
      return fetchProducts(8, 0, { sort_by: "newest" });
    }
  });

  // Map products to card props
  const featuredProducts = featuredProductsData.products.map(mapProductToCardProps);
  const auctionProducts = auctionProductsData.products.map(mapProductToCardProps);
  const recentProducts = recentProductsData.products.map(mapProductToCardProps);

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <div className="w-[400px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="featured">
            <TabsList>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="auctions">Hot Auctions</TabsTrigger>
              <TabsTrigger value="recently">Recently Added</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="featured">
        <TabsContent value="featured">
          <ProductGrid 
            products={featuredProducts} 
            viewAllLink="/browse?type=fixed" 
            isLoading={isFeaturedLoading}
          />
          
          {!isFeaturedLoading && featuredProducts.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="gap-2" asChild>
                <Link to="/browse?type=fixed">
                  View All Products <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="auctions">
          <ProductGrid 
            products={auctionProducts} 
            viewAllLink="/browse?type=auction" 
            isLoading={isAuctionLoading}
          />
          
          {!isAuctionLoading && auctionProducts.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="gap-2" asChild>
                <Link to="/browse?type=auction">
                  View All Auctions <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recently">
          <ProductGrid 
            products={recentProducts} 
            viewAllLink="/browse?sort=newest" 
            isLoading={isRecentLoading}
          />
          
          {!isRecentLoading && recentProducts.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="gap-2" asChild>
                <Link to="/browse?sort=newest">
                  View Recently Added <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductSections;
