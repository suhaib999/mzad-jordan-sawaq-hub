
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AddressFormValues } from './addressFormSchema';
import CitySearchDropdown from './CitySearchDropdown';
import LocationPickerButton from './LocationPickerButton';
import NeighborhoodDropdown from './NeighborhoodDropdown';

interface AddressFormFieldsProps {
  form: UseFormReturn<AddressFormValues>;
  onMapOpen: () => void;
}

const AddressFormFields: React.FC<AddressFormFieldsProps> = ({ form, onMapOpen }) => {
  const city = form.watch('city');
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="street_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input placeholder="Enter street address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <CitySearchDropdown 
                  value={field.value}
                  onChange={field.onChange}
                  error={!!form.formState.errors.city}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Neighborhood</FormLabel>
              <FormControl>
                <NeighborhoodDropdown
                  value={field.value}
                  onChange={field.onChange}
                  error={!!form.formState.errors.neighborhood}
                  city={city}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal/ZIP Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter postal/ZIP code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Enter country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="latitude"
        render={({ field }) => (
          <LocationPickerButton
            latitude={field.value}
            longitude={form.watch("longitude")}
            onClick={onMapOpen}
          />
        )}
      />
    </div>
  );
};

export default AddressFormFields;
