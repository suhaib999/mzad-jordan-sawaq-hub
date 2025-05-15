
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import ProductGrid from '@/components/product/ProductGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Badge as LucideTag } from 'lucide-react';
import { fetchProducts, mapProductToCardProps } from '@/services/product';

const TodaysDealsSection = () => {
  // Fetch today's deals (featured products with a discount)
  const { data: dealsData = {products: [], count: 0}, isLoading } = useQuery({
    queryKey: ['todaysDeals'],
    queryFn: async () => {
      // In a real app, you might have a specific API for deals or filter for discounted products
      return fetchProducts(5, 0, { is_auction: false });
    }
  });

  // Map deals to card props
  const deals = dealsData.products.map(product => ({
    ...mapProductToCardProps(product),
    // Add a discount percentage (this would typically come from your real data)
    discountPercentage: Math.floor(Math.random() * 50) + 5 // 5-55% discount for demo
  }));

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <LucideTag className="mr-2 text-mzad-primary" size={20} />
          Today's Deals
        </h2>
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          Limited Time
        </Badge>
      </div>
      
      {!isLoading && deals.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {deals.map((deal) => (
            <Card key={deal.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="relative">
                  <img 
                    src={deal.imageUrl} 
                    alt={deal.title} 
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded-bl-md">
                    {deal.discountPercentage}% OFF
                  </div>
                </div>
                <h3 className="mt-2 font-medium text-gray-900 truncate">{deal.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-mzad-primary">{deal.price.toFixed(2)} JOD</span>
                  <span className="text-sm text-gray-500 line-through">
                    {(deal.price / (1 - deal.discountPercentage/100)).toFixed(2)} JOD
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isLoading ? (
        // Show skeleton loaders while loading
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="w-full h-48 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mt-3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mt-2"></div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2 mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No deals available right now. Check back soon!</p>
        </div>
      )}
      
      <div className="mt-4 text-right">
        <a href="/browse?deals=true" className="text-mzad-primary hover:underline">
          See all deals
        </a>
      </div>
    </div>
  );
};

export default TodaysDealsSection;
