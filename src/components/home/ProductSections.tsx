
import React from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '@/components/product/ProductGrid';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, mapProductToCardProps } from '@/services/product';
import { placeholderFeaturedProducts, placeholderAuctionProducts } from '@/data/placeholderProducts';
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

  // Map products to card props
  const featuredProducts = featuredProductsData.products.map(mapProductToCardProps);
  const auctionProducts = auctionProductsData.products.map(mapProductToCardProps);

  // Show placeholder data while loading
  const showPlaceholders = isFeaturedLoading || isAuctionLoading || (featuredProducts.length === 0 && auctionProducts.length === 0);

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
        {showPlaceholders ? (
          <TabsContent value="featured">
            <ProductGrid 
              products={placeholderFeaturedProducts} 
              viewAllLink="/browse?type=fixed" 
            />
            
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="gap-2" asChild>
                <Link to="/browse?type=fixed">
                  View All Products <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </TabsContent>
        ) : (
          <>
            <TabsContent value="featured">
              {featuredProducts.length > 0 && (
                <>
                  <ProductGrid 
                    products={featuredProducts} 
                    viewAllLink="/browse?type=fixed" 
                  />
                  
                  <div className="flex justify-center mt-8">
                    <Button variant="outline" className="gap-2" asChild>
                      <Link to="/browse?type=fixed">
                        View All Products <ArrowRight size={16} />
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="auctions">
              {auctionProducts.length > 0 && (
                <>
                  <ProductGrid 
                    products={auctionProducts} 
                    viewAllLink="/browse?type=auction" 
                  />
                  
                  <div className="flex justify-center mt-8">
                    <Button variant="outline" className="gap-2" asChild>
                      <Link to="/browse?type=auction">
                        View All Auctions <ArrowRight size={16} />
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="recently">
              {featuredProducts.length > 0 && (
                <>
                  <ProductGrid 
                    products={[...featuredProducts].sort(() => Math.random() - 0.5).slice(0, 6)} 
                    viewAllLink="/browse?sort=newest" 
                  />
                  
                  <div className="flex justify-center mt-8">
                    <Button variant="outline" className="gap-2" asChild>
                      <Link to="/browse?sort=newest">
                        View Recently Added <ArrowRight size={16} />
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ProductSections;
