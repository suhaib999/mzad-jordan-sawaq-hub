
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import CategoryFilter from './filters/CategoryFilter';
import ListingTypeFilter from './filters/ListingTypeFilter';
import PriceRangeFilter from './filters/PriceRangeFilter';
import ConditionFilter from './filters/ConditionFilter';
import LocationFilter from './filters/LocationFilter';
import ShippingFilter from './filters/ShippingFilter';
import SortOrderFilter from './filters/SortOrderFilter';

export type FilterValues = {
  category: string;
  listingType: 'all' | 'auction' | 'fixed';
  priceMin?: number;
  priceMax?: number;
  condition?: string[];
  location?: string;
  freeShippingOnly?: boolean;
  localPickupOnly?: boolean;
  sortOrder?: string;
};

type FilterSidebarProps = {
  filters: FilterValues;
  onFilterChange: (name: string, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  categories: string[];
  isFilterOpen: boolean;
};

const FilterSidebar = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  categories,
  isFilterOpen
}: FilterSidebarProps) => {
  // Calculate if any filters are active
  const hasActiveFilters = 
    filters.category !== 'all' || 
    filters.listingType !== 'all' ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    (filters.condition && filters.condition.length > 0) ||
    filters.location !== undefined ||
    filters.freeShippingOnly ||
    filters.localPickupOnly;

  return (
    <Card className={`w-full md:w-64 md:block ${isFilterOpen ? 'block' : 'hidden'}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Filters</CardTitle>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-xs flex items-center"
          >
            <X size={14} className="mr-1" /> Clear all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <CategoryFilter 
          value={filters.category}
          onChange={(value) => onFilterChange('category', value)}
          categories={categories}
        />
        
        <ListingTypeFilter 
          value={filters.listingType}
          onChange={(value) => onFilterChange('listingType', value)}
        />
        
        <PriceRangeFilter
          minPrice={filters.priceMin}
          maxPrice={filters.priceMax}
          onMinChange={(value) => onFilterChange('priceMin', value)}
          onMaxChange={(value) => onFilterChange('priceMax', value)}
        />
        
        <ConditionFilter 
          selectedConditions={filters.condition || []}
          onChange={(value) => onFilterChange('condition', value)}
        />
        
        <LocationFilter
          value={filters.location}
          onChange={(value) => onFilterChange('location', value)}
        />
        
        <ShippingFilter
          freeShippingOnly={filters.freeShippingOnly || false}
          localPickupOnly={filters.localPickupOnly || false}
          onFreeShippingChange={(value) => onFilterChange('freeShippingOnly', value)}
          onLocalPickupChange={(value) => onFilterChange('localPickupOnly', value)}
        />
        
        <SortOrderFilter
          value={filters.sortOrder || 'bestMatch'}
          onChange={(value) => onFilterChange('sortOrder', value)}
        />

        <Button 
          onClick={onApplyFilters}
          className="w-full md:hidden"
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;
