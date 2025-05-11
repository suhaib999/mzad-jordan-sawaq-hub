
import { useState } from 'react';
import { ProductCardProps } from '@/services/product/types';
import ProductCard from '@/components/product/ProductCard';
import ProductGrid from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { Grid2x2, List } from 'lucide-react';

interface ProductResultsProps {
  products: ProductCardProps[];
  isLoading: boolean;
  totalCount?: number;
  searchTerm?: string;
  selectedCategory?: string;
}

const ProductResults = ({ 
  products, 
  isLoading, 
  totalCount = 0,
  searchTerm,
  selectedCategory 
}: ProductResultsProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Helper function to format location
  const formatLocation = (location: string | { city: string; neighborhood: string; street?: string; }) => {
    if (typeof location === 'string') {
      return location;
    } else {
      return `${location.city}${location.neighborhood ? `, ${location.neighborhood}` : ''}`;
    }
  };

  const renderHeader = () => {
    const hasSearchTerm = searchTerm && searchTerm.trim() !== '';
    const hasCategoryFilter = selectedCategory && selectedCategory !== 'all';
    
    let title = 'Products';
    
    if (hasSearchTerm && hasCategoryFilter) {
      title = `"${searchTerm}" in ${selectedCategory}`;
    } else if (hasSearchTerm) {
      title = `Results for "${searchTerm}"`;
    } else if (hasCategoryFilter) {
      title = `${selectedCategory}`;
    }
    
    return (
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading products...' : `${totalCount} product${totalCount !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewMode === 'grid' ? "secondary" : "outline"}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid2x2 size={16} />
          </Button>
          <Button 
            variant={viewMode === 'list' ? "secondary" : "outline"}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div>
        {renderHeader()}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 h-[300px]">
              <div className="w-full h-[150px] bg-gray-200 rounded-md animate-pulse mb-3"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3 mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        {renderHeader()}
        <div className="p-8 text-center border rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search term to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderHeader()}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl}
              condition={product.condition}
              isAuction={product.isAuction}
              location={product.location}
              endTime={product.endTime}
              shipping={product.shipping}
              brand={product.brand}
              model={product.model}
              currency={product.currency}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex border rounded-lg overflow-hidden">
              <div className="w-40 h-40">
                <img 
                  src={product.imageUrl || '/placeholder.svg'} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-medium line-clamp-2 mb-2">
                  {product.title}
                </h3>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-mzad-primary">
                      {product.price} {product.currency}
                    </div>
                    {product.isAuction && product.endTime && (
                      <div className="text-sm text-muted-foreground">
                        Ends in {new Date(product.endTime).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col text-sm text-muted-foreground mt-2 sm:mt-0 sm:text-right">
                    <span>{product.condition}</span>
                    {product.location && <span>{formatLocation(product.location)}</span>}
                    {product.shipping && <span className="text-mzad-secondary">{product.shipping}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductResults;
