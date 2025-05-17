
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
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCarMakes, getCarModels } from '@/utils/vehicleData';

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
    type: 'text' | 'select' | 'number' | 'searchableSelect';
    options?: string[];
    isRequired: boolean;
    dependsOn?: string;
    dependsOnValue?: string;
  }>>([]);

  const [selectedMake, setSelectedMake] = useState<string | undefined>(
    form.getValues()?.attributes?.make as string | undefined
  );

  const [carModels, setCarModels] = useState<string[]>([]);

  // Update models when make changes
  useEffect(() => {
    if (selectedMake) {
      const models = getCarModels(selectedMake);
      setCarModels(models);
    } else {
      setCarModels([]);
    }
  }, [selectedMake]);

  useEffect(() => {
    // Load specs based on category and subcategory
    if (category) {
      let categorySpecs: Array<{
        id: string;
        name: string;
        type: 'text' | 'select' | 'number' | 'searchableSelect';
        options?: string[];
        isRequired: boolean;
        dependsOn?: string;
        dependsOnValue?: string;
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
          const carMakes = getCarMakes();
          
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
              type: 'searchableSelect' as const,
              options: carMakes,
              isRequired: true,
            },
            {
              id: 'model',
              name: 'Model',
              type: 'searchableSelect' as const,
              options: carModels,
              isRequired: true,
              dependsOn: 'make',
            },
            {
              id: 'mileage',
              name: 'Mileage',
              type: 'number' as const,
              isRequired: false,
            },
            {
              id: 'engine_size',
              name: 'Engine Size (L)',
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
              id: 'body_type',
              name: 'Body Type',
              type: 'select' as const,
              options: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Wagon', 'Other'],
              isRequired: false,
            },
            {
              id: 'color',
              name: 'Color',
              type: 'text' as const,
              isRequired: false,
            },
            {
              id: 'doors',
              name: 'Doors',
              type: 'number' as const,
              isRequired: false,
            },
            {
              id: 'seats',
              name: 'Seats',
              type: 'number' as const,
              isRequired: false,
            },
            {
              id: 'drive_type',
              name: 'Drive Type',
              type: 'select' as const,
              options: ['FWD', 'RWD', 'AWD', '4WD'],
              isRequired: false,
            },
            {
              id: 'cylinders',
              name: 'Cylinders',
              type: 'number' as const,
              isRequired: false,
            },
            {
              id: 'wheel_side',
              name: 'Wheel Side',
              type: 'select' as const,
              options: ['Left', 'Right'],
              isRequired: false,
            },
            {
              id: 'interior_color',
              name: 'Interior Color',
              type: 'text' as const,
              isRequired: false,
            },
            {
              id: 'license_status',
              name: 'License Status',
              type: 'select' as const,
              options: ['Licensed', 'Not Licensed'],
              isRequired: false,
            },
            {
              id: 'chassis_number',
              name: 'Chassis Number',
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
              type: 'select' as const,
              options: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Google', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Nokia', 'Motorola', 'Sony', 'LG', 'HTC', 'Other'],
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
  }, [category, subcategory, carModels]);

  const renderField = (spec: {
    id: string;
    name: string;
    type: 'text' | 'select' | 'number' | 'searchableSelect';
    options?: string[];
    isRequired: boolean;
    dependsOn?: string;
    dependsOnValue?: string;
  }) => {
    const fieldName = `attributes.${spec.id}` as const;
    
    // Check if this field depends on another field
    if (spec.dependsOn) {
      const dependsOnValue = form.watch(`attributes.${spec.dependsOn}`);
      if (!dependsOnValue) {
        return null;
      }
    }

    // Searchable select fields (like Make/Model for vehicles)
    if (spec.type === 'searchableSelect' && spec.options) {
      return (
        <FormField
          key={spec.id}
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                {spec.name} {spec.isRequired && <span className="text-red-500">*</span>}
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? spec.options.find((option) => option === field.value)
                        : `Select ${spec.name}`}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={`Search ${spec.name.toLowerCase()}...`} />
                    <CommandEmpty>No {spec.name.toLowerCase()} found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {spec.options.map((option) => (
                        <CommandItem
                          value={option}
                          key={option}
                          onSelect={() => {
                            form.setValue(fieldName, option, { shouldValidate: true });
                            
                            // If this is a Make field, update the selected make for models
                            if (spec.id === 'make') {
                              setSelectedMake(option);
                              // Reset model when make changes
                              form.setValue('attributes.model', '', { shouldValidate: true });
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              option === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    
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

// Helper Button component needed for the ComboBox
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
      variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
      variant === "outline" && "border border-input hover:bg-accent hover:text-accent-foreground",
      className
    )}
    ref={ref}
    {...props}
  />
));
Button.displayName = "Button";

export default ItemSpecifics;
