
import { useState } from 'react';
import { ProductCardProps } from '@/services/product/types';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { 
  Grid2x2, 
  List, 
  ChevronDown, 
  ArrowDownAZ, 
  ArrowUpZA 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductResultsProps {
  products: ProductCardProps[];
  isLoading: boolean;
  totalCount?: number;
  searchTerm?: string;
  selectedCategory?: string;
  onSortChange?: (sortOrder: string) => void;
}

const ProductResults = ({ 
  products, 
  isLoading, 
  totalCount = 0,
  searchTerm,
  selectedCategory,
  onSortChange
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
      <div className="bg-white border-b pb-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? 'Loading products...' : `${totalCount.toLocaleString()} product${totalCount !== 1 ? 's' : ''} found`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 md:flex-none">
              <Select onValueChange={onSortChange}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newly Listed</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant={viewMode === 'grid' ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-none border-0"
              >
                <Grid2x2 size={18} />
              </Button>
              <Button 
                variant={viewMode === 'list' ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-none border-0"
              >
                <List size={18} />
              </Button>
            </div>
          </div>
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
            <div key={product.id} className="flex border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
              <div className="w-40 h-40 flex-shrink-0">
                <img 
                  src={product.imageUrl || '/placeholder.svg'} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-medium line-clamp-2 mb-1 hover:text-mzad-primary">
                  {product.title}
                </h3>
                
                {product.brand && (
                  <div className="text-sm text-gray-500">
                    {product.brand} {product.model && `• ${product.model}`}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:justify-between mt-2">
                  <div>
                    <div className="text-lg font-semibold text-mzad-primary">
                      {product.price.toFixed(2)} {product.currency}
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
