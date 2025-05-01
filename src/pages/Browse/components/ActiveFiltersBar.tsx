
import { X, Tag, DollarSign, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FilterValues } from './FilterSidebar';

type ActiveFiltersBarProps = {
  filters: FilterValues;
  onRemoveFilter: (name: string) => void;
};

const ActiveFiltersBar = ({ filters, onRemoveFilter }: ActiveFiltersBarProps) => {
  const hasActiveFilters = 
    filters.category !== 'all' || 
    filters.listingType !== 'all' ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    (filters.condition && filters.condition.length > 0) ||
    filters.location !== undefined ||
    filters.freeShippingOnly ||
    filters.localPickupOnly;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.category !== 'all' && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Tag className="h-3 w-3" />
          Category: {filters.category}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onRemoveFilter('category')} />
        </Badge>
      )}
      
      {filters.listingType !== 'all' && (
        <Badge variant="outline" className="flex items-center gap-1">
          Type: {filters.listingType === 'auction' ? 'Auction' : 'Fixed Price'}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onRemoveFilter('listingType')} />
        </Badge>
      )}
      
      {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
        <Badge variant="outline" className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          Price: {filters.priceMin || '0'} - {filters.priceMax || '∞'}
          <X 
            className="h-3 w-3 ml-1 cursor-pointer" 
            onClick={() => {
              onRemoveFilter('priceMin');
              onRemoveFilter('priceMax');
            }} 
          />
        </Badge>
      )}
      
      {filters.condition && filters.condition.length > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          Condition: {filters.condition.join(', ')}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onRemoveFilter('condition')} />
        </Badge>
      )}
      
      {filters.location && (
        <Badge variant="outline" className="flex items-center gap-1">
          Location: {filters.location}
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onRemoveFilter('location')} />
        </Badge>
      )}
      
      {filters.freeShippingOnly && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          Free Shipping
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onRemoveFilter('freeShippingOnly')} />
        </Badge>
      )}
      
      {filters.localPickupOnly && (
        <Badge variant="outline" className="flex items-center gap-1">
          Local Pickup
          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onRemoveFilter('localPickupOnly')} />
        </Badge>
      )}
    </div>
  );
};

export default ActiveFiltersBar;
