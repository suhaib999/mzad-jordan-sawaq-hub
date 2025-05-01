
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { fetchProducts, mapProductToCardProps } from '@/services/productService';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchIcon, Filter, X } from 'lucide-react';

const categories = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Vehicles",
  "Collectibles",
  "Toys & Games",
  "Sports",
  "Real Estate",
  "Services",
  "Other"
];

const BrowseProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';
  const initialListingType = searchParams.get('type') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [listingType, setListingType] = useState<'all' | 'auction' | 'fixed'>(initialListingType as any || 'all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', category, listingType, searchQuery],
    queryFn: async () => {
      const isAuction = listingType === 'all' ? undefined : listingType === 'auction';
      const result = await fetchProducts(50, 0, category || undefined, isAuction, searchQuery || undefined);
      return result.map(mapProductToCardProps);
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams();
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    if (category) {
      params.set('category', category);
    }
    
    if (listingType !== 'all') {
      params.set('type', listingType);
    }
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setListingType('all');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || category || listingType !== 'all';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Browse Products</h1>
          
          <form onSubmit={handleSearch} className="w-full md:w-auto flex gap-2">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <SearchIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            <Button 
              type="button"
              variant="outline" 
              size="icon"
              className="md:hidden"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={18} />
            </Button>
            
            <Button type="submit">Search</Button>
          </form>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Card className={`w-full md:w-64 md:block ${isFilterOpen ? 'block' : 'hidden'}`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-xs flex items-center"
                >
                  <X size={14} className="mr-1" /> Clear all
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Listing Type</Label>
                <RadioGroup value={listingType} onValueChange={(value: 'all' | 'auction' | 'fixed') => setListingType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auction" id="auction" />
                    <Label htmlFor="auction" className="cursor-pointer">Auction Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="cursor-pointer">Fixed Price Only</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                onClick={() => {
                  updateSearchParams();
                  setIsFilterOpen(false);
                }}
                className="w-full md:hidden"
              >
                Apply Filters
              </Button>
            </CardContent>
          </Card>

          <div className="flex-grow">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-mzad-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium">No products found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrowseProducts;
