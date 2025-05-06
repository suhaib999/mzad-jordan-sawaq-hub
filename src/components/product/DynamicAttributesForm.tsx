
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Category } from '@/data/categories';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/components/ui/form';
import { Plus, X } from 'lucide-react';

interface DynamicAttributesFormProps {
  category: Category;
  form: UseFormReturn<any>;
  customAttributes: { name: string; value: string }[];
  setCustomAttributes: React.Dispatch<React.SetStateAction<{ name: string; value: string }[]>>;
}

const DynamicAttributesForm: React.FC<DynamicAttributesFormProps> = ({ 
  category, 
  form,
  customAttributes,
  setCustomAttributes 
}) => {
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  const categoryPath = category.name.toLowerCase();
  
  // Determine which attributes to show based on category path
  const shouldShowElectronicsFields = 
    categoryPath.includes('electronics') || 
    categoryPath.includes('phone') || 
    categoryPath.includes('computer') ||
    categoryPath.includes('tablet') ||
    categoryPath.includes('camera');

  const shouldShowFashionFields = 
    categoryPath.includes('fashion') || 
    categoryPath.includes('clothing') || 
    categoryPath.includes('shoes') ||
    categoryPath.includes('accessories');
    
  const shouldShowVehicleFields =
    categoryPath.includes('car') ||
    categoryPath.includes('vehicle') ||
    categoryPath.includes('motorcycle');
    
  const shouldShowRealEstateFields =
    categoryPath.includes('real estate') ||
    categoryPath.includes('apartment') ||
    categoryPath.includes('house');

  const shouldShowFurnitureFields =
    categoryPath.includes('furniture') ||
    categoryPath.includes('home') ||
    categoryPath.includes('garden');

  // Add custom attribute
  const handleAddAttribute = () => {
    if (newAttrName && newAttrValue) {
      setCustomAttributes([...customAttributes, { 
        name: newAttrName, 
        value: newAttrValue 
      }]);
      setNewAttrName('');
      setNewAttrValue('');
    }
  };

  // Remove custom attribute
  const removeAttribute = (index: number) => {
    const newAttributes = [...customAttributes];
    newAttributes.splice(index, 1);
    setCustomAttributes(newAttributes);
  };

  return (
    <div className="space-y-4">
      {shouldShowElectronicsFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Apple, Samsung, Sony" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. iPhone 15 Pro, Galaxy S23" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
      
      {shouldShowElectronicsFields && categoryPath.includes('phone') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="storage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage capacity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="16GB">16GB</SelectItem>
                    <SelectItem value="32GB">32GB</SelectItem>
                    <SelectItem value="64GB">64GB</SelectItem>
                    <SelectItem value="128GB">128GB</SelectItem>
                    <SelectItem value="256GB">256GB</SelectItem>
                    <SelectItem value="512GB">512GB</SelectItem>
                    <SelectItem value="1TB">1TB</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="screen_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Screen Size</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 6.1 inches" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
      
      {shouldShowFashionFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Black, Red, Blue" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. S, M, L, XL, 42, 10.5" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
      
      {shouldShowVehicleFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 2023" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="mileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mileage</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 15000" {...field} />
                </FormControl>
                <FormDescription>In kilometers</FormDescription>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fuel_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transmission</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="semi-automatic">Semi-automatic</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      )}
      
      {shouldShowRealEstateFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="property_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Property size" {...field} />
                </FormControl>
                <FormDescription>In square meters</FormDescription>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Number of bedrooms" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Studio</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5+">5+</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Number of bathrooms" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      )}
      
      {shouldShowFurnitureFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="material"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Wood, Metal, Plastic" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dimensions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dimensions</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 120x80x75 cm" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
      
      {/* Custom attributes section */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-base font-medium mb-3">Custom Attributes</h4>
        
        <div className="space-y-3">
          {customAttributes.map((attr, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="bg-gray-50 rounded px-3 py-2 flex-grow flex justify-between items-center">
                <div>
                  <span className="font-medium">{attr.name}:</span> {attr.value}
                </div>
                <button 
                  type="button" 
                  onClick={() => removeAttribute(index)} 
                  className="text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="col-span-1">
              <Input
                placeholder="Attribute name"
                value={newAttrName}
                onChange={(e) => setNewAttrName(e.target.value)}
              />
            </div>
            <div className="col-span-1">
              <Input
                placeholder="Attribute value"
                value={newAttrValue}
                onChange={(e) => setNewAttrValue(e.target.value)}
              />
            </div>
            <div>
              <Button 
                type="button" 
                onClick={handleAddAttribute} 
                variant="outline"
                disabled={!newAttrName || !newAttrValue}
                className="w-full"
              >
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicAttributesForm;
