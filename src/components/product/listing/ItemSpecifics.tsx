
import React, { useState, useEffect } from 'react';
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
import { ProductFormValues } from '@/types/product';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ItemSpecificsProps {
  form: UseFormReturn<ProductFormValues>;
  category?: string;
  subcategory?: string;
}

const ItemSpecifics: React.FC<ItemSpecificsProps> = ({
  form,
  category,
  subcategory,
}) => {
  const [specs, setSpecs] = useState<Array<{
    id: string;
    name: string;
    type: 'text' | 'select' | 'number';
    options?: string[];
    isRequired: boolean;
  }>>([]);

  useEffect(() => {
    // Load specs based on category and subcategory
    if (category) {
      let categorySpecs: Array<{
        id: string;
        name: string;
        type: 'text' | 'select' | 'number';
        options?: string[];
        isRequired: boolean;
      }> = [];

      // Common specs for all categories
      const commonSpecs = [
        {
          id: 'brand',
          name: 'Brand',
          type: 'text' as const,
          isRequired: false,
        },
        {
          id: 'model',
          name: 'Model',
          type: 'text' as const,
          isRequired: false,
        }
      ];

      // Category specific specs
      if (category === 'vehicles') {
        if (subcategory === 'vehicles/cars') {
          categorySpecs = [
            {
              id: 'year',
              name: 'Year',
              type: 'number' as const,
              isRequired: true,
            },
            {
              id: 'make',
              name: 'Make',
              type: 'text' as const,
              isRequired: true,
            },
            {
              id: 'model',
              name: 'Model',
              type: 'text' as const,
              isRequired: true,
            },
            {
              id: 'mileage',
              name: 'Mileage',
              type: 'number' as const,
              isRequired: false,
            },
            {
              id: 'fuel_type',
              name: 'Fuel Type',
              type: 'select' as const,
              options: ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Other'],
              isRequired: false,
            },
            {
              id: 'transmission',
              name: 'Transmission',
              type: 'select' as const,
              options: ['Manual', 'Automatic', 'Semi-automatic'],
              isRequired: false,
            },
            {
              id: 'color',
              name: 'Color',
              type: 'text' as const,
              isRequired: false,
            }
          ];
        } else if (subcategory === 'vehicles/motorcycles') {
          categorySpecs = [
            {
              id: 'year',
              name: 'Year',
              type: 'number' as const,
              isRequired: true,
            },
            {
              id: 'make',
              name: 'Make',
              type: 'text' as const,
              isRequired: true,
            },
            {
              id: 'model',
              name: 'Model',
              type: 'text' as const,
              isRequired: true,
            },
            {
              id: 'engine_size',
              name: 'Engine Size (cc)',
              type: 'number' as const,
              isRequired: false,
            },
            {
              id: 'mileage',
              name: 'Mileage',
              type: 'number' as const,
              isRequired: false,
            },
            {
              id: 'color',
              name: 'Color',
              type: 'text' as const,
              isRequired: false,
            }
          ];
        }
      } else if (category === 'electronics') {
        if (subcategory === 'electronics/mobile-phones-tablets/phones') {
          categorySpecs = [
            {
              id: 'brand',
              name: 'Brand',
              type: 'text' as const,
              isRequired: true,
            },
            {
              id: 'model',
              name: 'Model',
              type: 'text' as const,
              isRequired: true,
            },
            {
              id: 'storage',
              name: 'Storage (GB)',
              type: 'select' as const,
              options: ['8', '16', '32', '64', '128', '256', '512', '1TB', 'Other'],
              isRequired: false,
            },
            {
              id: 'color',
              name: 'Color',
              type: 'text' as const,
              isRequired: false,
            }
          ];
        } else if (subcategory === 'electronics/computers-laptops/laptops') {
          categorySpecs = [
            {
              id: 'brand',
              name: 'Brand',
              type: 'text' as const,
              isRequired: true,
            },
            {
              id: 'model',
              name: 'Model',
              type: 'text' as const,
              isRequired: true,
            },
            {
              id: 'processor',
              name: 'Processor',
              type: 'text' as const,
              isRequired: false,
            },
            {
              id: 'ram',
              name: 'RAM (GB)',
              type: 'select' as const,
              options: ['2', '4', '8', '16', '32', '64', 'Other'],
              isRequired: false,
            },
            {
              id: 'storage',
              name: 'Storage (GB)',
              type: 'select' as const,
              options: ['128', '256', '512', '1TB', '2TB', 'Other'],
              isRequired: false,
            },
            {
              id: 'screen_size',
              name: 'Screen Size (inches)',
              type: 'text' as const,
              isRequired: false,
            }
          ];
        }
      } else if (category === 'real-estate-sale' || category === 'real-estate-rent') {
        categorySpecs = [
          {
            id: 'property_type',
            name: 'Property Type',
            type: 'select' as const,
            options: ['Apartment', 'House', 'Villa', 'Land', 'Commercial', 'Other'],
            isRequired: true,
          },
          {
            id: 'bedrooms',
            name: 'Bedrooms',
            type: 'select' as const,
            options: ['Studio', '1', '2', '3', '4', '5+'],
            isRequired: false,
          },
          {
            id: 'bathrooms',
            name: 'Bathrooms',
            type: 'select' as const,
            options: ['1', '2', '3', '4', '5+'],
            isRequired: false,
          },
          {
            id: 'area',
            name: 'Area (m²)',
            type: 'number' as const,
            isRequired: false,
          }
        ];
      }

      // If no specific specs found, use common ones
      setSpecs(categorySpecs.length > 0 ? categorySpecs : commonSpecs);
    }
  }, [category, subcategory]);

  const renderField = (spec: {
    id: string;
    name: string;
    type: 'text' | 'select' | 'number';
    options?: string[];
    isRequired: boolean;
  }) => {
    const fieldName = `attributes.${spec.id}` as const;
    
    if (spec.type === 'select' && spec.options) {
      return (
        <FormField
          key={spec.id}
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {spec.name} {spec.isRequired && <span className="text-red-500">*</span>}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value as string}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${spec.name.toLowerCase()}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {spec.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    
    return (
      <FormField
        key={spec.id}
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {spec.name} {spec.isRequired && <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl>
              <Input
                type={spec.type === 'number' ? 'number' : 'text'}
                placeholder={`Enter ${spec.name.toLowerCase()}`}
                {...field}
                // Convert boolean values to string to avoid type error
                value={field.value != null ? String(field.value) : ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Item Specifics</h3>
      
      {specs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Select a category to see relevant specifications
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specs.map(renderField)}
        </div>
      )}
    </div>
  );
};

export default ItemSpecifics;
