
import React from 'react';
import ProductCard from './ProductCard';
import { ProductCardProps } from '@/services/product/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
  products: ProductCardProps[];
  title?: string;
  viewAllLink?: string;
  showBranding?: boolean;
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  title, 
  viewAllLink, 
  showBranding = false,
  isLoading = false
}) => {
  // Render skeleton loaders if loading
  if (isLoading) {
    return (
      <div className="mb-10">
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            {viewAllLink && (
              <a href={viewAllLink} className="text-mzad-primary hover:underline">
                See all
              </a>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden shadow-sm">
              <AspectRatio ratio={1}>
                <Skeleton className="w-full h-full" />
              </AspectRatio>
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no products, show a message
  if (products.length === 0) {
    return (
      <div className="mb-10">
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <div className="border rounded-lg p-8 text-center">
          <p className="text-gray-500">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {viewAllLink && (
            <a href={viewAllLink} className="text-mzad-primary hover:underline">
              See all
            </a>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            id={product.id}
            title={product.title}
            price={product.price}
            imageUrl={product.imageUrl}
            condition={product.condition}
            isAuction={product.isAuction}
            location={product.location as string}
            endTime={product.endTime}
            shipping={product.shipping}
            brand={product.brand}
            model={product.model}
            currency={product.currency}
            showBranding={showBranding} 
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
