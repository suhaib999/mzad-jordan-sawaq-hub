
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CitySearchDropdown from '@/components/seller/address/CitySearchDropdown';
import NeighborhoodDropdown from '@/components/seller/address/NeighborhoodDropdown';
import { ProductFormValues } from '@/types/product';

interface LocationDropdownProps {
  form: UseFormReturn<ProductFormValues>;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({ form }) => {
  const city = form.watch('location.city') || '';
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="location.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <CitySearchDropdown 
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={!!form.formState.errors.location?.city}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location.neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Neighborhood <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <NeighborhoodDropdown
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={!!form.formState.errors.location?.neighborhood}
                  city={city}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="location.street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Enter street address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default LocationDropdown;
