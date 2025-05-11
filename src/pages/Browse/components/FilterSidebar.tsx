
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
  category?: string;
  listingType: 'all' | 'auction' | 'fixed';
  searchQuery?: string;
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
  isFilterOpen: boolean;
  onClose?: () => void;
};

const FilterSidebar = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  isFilterOpen,
  onClose
}: FilterSidebarProps) => {
  // Calculate if any filters are active
  const hasActiveFilters = 
    filters.category !== undefined || 
    filters.listingType !== 'all' ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    (filters.condition && filters.condition.length > 0) ||
    filters.location !== undefined ||
    filters.freeShippingOnly ||
    filters.localPickupOnly;

  return (
    <div className={`${isFilterOpen ? 'fixed inset-0 z-50 bg-black/50 md:relative md:inset-auto md:bg-transparent' : 'hidden md:block'}`}>
      <div className="bg-white h-full w-[300px] md:w-64 overflow-y-auto md:h-auto">
        <Card className="h-full md:h-auto border-0 md:border rounded-none md:rounded-lg shadow-none md:shadow">
          <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
            <CardTitle className="text-lg">Filters</CardTitle>
            <div className="flex space-x-2">
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={onClose}
              >
                <X size={18} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 p-4">
            <CategoryFilter 
              value={filters.category}
              onChange={(value) => onFilterChange('category', value)}
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
              onClick={() => {
                onApplyFilters();
                onClose?.();
              }}
              className="w-full md:hidden"
            >
              Apply Filters
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FilterSidebar;
