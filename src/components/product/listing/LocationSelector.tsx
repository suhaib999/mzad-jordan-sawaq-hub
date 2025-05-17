
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface LocationSelectorProps {
  form: any;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="location.city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City*</FormLabel>
            <FormControl>
              <Input placeholder="Enter city" {...field} />
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
            <FormLabel>Neighborhood</FormLabel>
            <FormControl>
              <Input placeholder="Enter neighborhood" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="location.street"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
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

export default LocationSelector;
