import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { fetchProducts } from '@/services/product/productService';
import { ProductFilterParams } from '@/services/product/types';
import { mapProductToCardProps } from '@/services/product/mappers';
import SearchBar from './components/SearchBar';
import FilterSidebar, { FilterValues } from './components/FilterSidebar';
import ProductResults from './components/ProductResults';
import ActiveFiltersBar from './components/ActiveFiltersBar';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

const BrowseProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Parse initial filters from URL params
  const initialFilters: FilterValues = {
    category: searchParams.get('category') || undefined,
    listingType: (searchParams.get('type') as 'all' | 'auction' | 'fixed') || 'all',
    searchQuery: searchParams.get('q') || '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
    condition: searchParams.get('condition') ? searchParams.get('condition')!.split(',') : [],
    location: searchParams.get('location') || undefined,
    freeShippingOnly: searchParams.get('freeShipping') === 'true',
    localPickupOnly: searchParams.get('localPickup') === 'true',
    sortOrder: (searchParams.get('sort') || 'newest') as 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'bestMatch'
  };

  // State for filters
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  useEffect(() => {
    setSearchQuery(initialFilters.searchQuery || '');
  }, [initialFilters.searchQuery]);
  
  // Query for products
  const { data: productsData = { products: [], count: 0 }, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      // Convert filters to API parameters
      const apiParams: ProductFilterParams = {
        category: filters.category,
        is_auction: filters.listingType === 'all' ? undefined : filters.listingType === 'auction',
        query: filters.searchQuery || undefined,
        price_min: filters.priceMin,
        price_max: filters.priceMax,
        condition: filters.condition && filters.condition.length > 0 ? filters.condition : undefined,
        location: filters.location ? [filters.location] : undefined,
        with_shipping: filters.freeShippingOnly,
        sort_by: filters.sortOrder === 'bestMatch' ? 'newest' : filters.sortOrder as 'price_asc' | 'price_desc' | 'newest' | 'oldest'
      };
      
      console.log("Applying filters:", apiParams);
      return fetchProducts(50, 0, apiParams);
    }
  });

  // Map products to card props
  const products = productsData.products.map(mapProductToCardProps);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, searchQuery }));
    updateSearchParams({ ...filters, searchQuery });
  };

  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle sort change
  const handleSortChange = (sortOrder: string) => {
    const newFilters = { ...filters, sortOrder };
    setFilters(newFilters);
    updateSearchParams(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    updateSearchParams(filters);
    setIsFilterOpen(false);
  };

  // Update URL search parameters
  const updateSearchParams = (currentFilters: FilterValues) => {
    const params = new URLSearchParams();
    
    if (currentFilters.searchQuery) {
      params.set('q', currentFilters.searchQuery);
    }
    
    if (currentFilters.category) {
      params.set('category', currentFilters.category);
    }
    
    if (currentFilters.listingType !== 'all') {
      params.set('type', currentFilters.listingType);
    }

    if (currentFilters.priceMin !== undefined) {
      params.set('priceMin', currentFilters.priceMin.toString());
    }
    
    if (currentFilters.priceMax !== undefined) {
      params.set('priceMax', currentFilters.priceMax.toString());
    }
    
    if (currentFilters.condition && currentFilters.condition.length > 0) {
      params.set('condition', currentFilters.condition.join(','));
    }
    
    if (currentFilters.location) {
      params.set('location', currentFilters.location);
    }
    
    if (currentFilters.freeShippingOnly) {
      params.set('freeShipping', 'true');
    }
    
    if (currentFilters.localPickupOnly) {
      params.set('localPickup', 'true');
    }
    
    if (currentFilters.sortOrder && currentFilters.sortOrder !== 'bestMatch') {
      params.set('sort', currentFilters.sortOrder);
    }
    
    setSearchParams(params);
    
    // Debug: log the current filter parameters
    console.log("Updated search params:", Object.fromEntries(params.entries()));
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters: FilterValues = {
      category: undefined,
      listingType: 'all',
      searchQuery: '',
      priceMin: undefined,
      priceMax: undefined,
      condition: [],
      location: undefined,
      freeShippingOnly: false,
      localPickupOnly: false,
      sortOrder: 'newest'
    };
    
    setFilters(emptyFilters);
    setSearchQuery('');
    setSearchParams({});
  };

  // Remove a single filter
  const removeFilter = (name: string) => {
    if (name === 'searchQuery') {
      setSearchQuery('');
    }
    
    setFilters(prev => {
      const updated = { ...prev };
      
      if (name === 'category') {
        updated.category = undefined;
      } else if (name === 'listingType') {
        updated.listingType = 'all';
      } else if (name === 'priceMin' || name === 'priceMax') {
        updated[name] = undefined;
      } else if (name === 'condition') {
        updated.condition = [];
      } else if (name === 'freeShippingOnly' || name === 'localPickupOnly') {
        updated[name] = false;
      } else {
        updated[name] = undefined;
      }
      
      updateSearchParams(updated);
      return updated;
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="sticky top-0 z-10 bg-white pb-4 border-b mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold hidden md:block">Browse Products</h1>
            
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
              onToggleFilters={() => setIsFilterOpen(!isFilterOpen)}
            />

            <Button 
              variant="outline"
              className="w-full md:w-auto flex items-center gap-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={16} />
              <span>Filters</span>
              {isFilterOpen && (
                <X size={16} className="ml-1" />
              )}
            </Button>
          </div>

          <ActiveFiltersBar 
            filters={{ ...filters, searchQuery }}
            onRemoveFilter={removeFilter}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            isFilterOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />

          <div className="flex-grow">
            <ProductResults 
              products={products} 
              isLoading={isLoading} 
              totalCount={productsData.count}
              searchTerm={filters.searchQuery}
              selectedCategory={filters.category}
              onSortChange={handleSortChange}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrowseProducts;
