
import React, { useState, useEffect } from 'react';
import { smartphoneBrands, SmartphoneBrand, SmartphoneModel } from '@/data/smartphones';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Info, Smartphone, Tablet } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PhoneSpecsSelectorProps {
  categoryPath: string;
}

const PhoneSpecsSelector: React.FC<PhoneSpecsSelectorProps> = ({ categoryPath }) => {
  const form = useFormContext();
  const [selectedBrand, setSelectedBrand] = useState<SmartphoneBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<SmartphoneModel | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);
  
  // Check if current category is related to phones or tablets
  const isPhoneCategory = categoryPath && 
    (categoryPath.toLowerCase().includes('phone') || 
     categoryPath.toLowerCase().includes('mobile'));
  
  const isTabletCategory = categoryPath && 
    categoryPath.toLowerCase().includes('tablet');

  const isDeviceCategory = isPhoneCategory || isTabletCategory;
  
  useEffect(() => {
    if (!isDeviceCategory) {
      setShowSpecs(false);
      return;
    }
    
    setShowSpecs(true);
    
    // Get values from form
    const brandId = form.getValues('brand');
    const modelId = form.getValues('model');
    
    if (brandId) {
      const brand = smartphoneBrands.find(b => b.id === brandId);
      if (brand) {
        setSelectedBrand(brand);
        
        if (modelId) {
          const model = brand.models.find(m => m.id === modelId);
          if (model) {
            setSelectedModel(model);
          }
        }
      }
    }
  }, [categoryPath, form, isDeviceCategory]);
  
  if (!showSpecs) return null;
  
  // Define common screen sizes based on device type
  const getCommonScreenSizes = () => {
    if (isPhoneCategory) {
      return ['4.7"', '5.5"', '5.8"', '6.1"', '6.5"', '6.7"', '6.8"', '7.0"'];
    }
    if (isTabletCategory) {
      return ['7.9"', '8.3"', '8.7"', '9.7"', '10.2"', '10.9"', '11"', '12.9"', '14.6"'];
    }
    return [];
  };
  
  const deviceIcon = isTabletCategory ? <Tablet className="h-5 w-5 mr-2" /> : <Smartphone className="h-5 w-5 mr-2" />;
  const deviceType = isTabletCategory ? "Tablet" : "Phone";
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm text-blue-700 mb-4">
        <div className="flex">
          {deviceIcon}
          <p>{deviceType} specifications help buyers find your listing more easily.</p>
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand*</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                const brand = smartphoneBrands.find(b => b.id === value);
                setSelectedBrand(brand || null);
                setSelectedModel(null);
                form.setValue('model', '');
                form.setValue('storage', '');
                form.setValue('color', '');
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {smartphoneBrands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {selectedBrand && (
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model*</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  const model = selectedBrand.models.find(m => m.id === value);
                  setSelectedModel(model || null);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectedBrand.models
                    .sort((a, b) => b.year - a.year)
                    .map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} ({model.year})
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {selectedModel?.storageOptions && selectedModel.storageOptions.length > 0 && (
        <FormField
          control={form.control}
          name="storage"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Storage Capacity*</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-wrap gap-2"
                >
                  {selectedModel.storageOptions.map((storage) => (
                    <div key={storage} className="flex items-center space-x-2 border rounded-md p-2 hover:bg-gray-50">
                      <RadioGroupItem value={storage} id={`storage-${storage}`} />
                      <Label htmlFor={`storage-${storage}`} className="cursor-pointer">{storage}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {selectedModel?.colorOptions && selectedModel.colorOptions.length > 0 && (
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color*</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectedModel.colorOptions.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {/* Add Screen Size field */}
      <FormField
        control={form.control}
        name="screen_size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Screen Size*</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select screen size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {getCommonScreenSizes().map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom size</SelectItem>
              </SelectContent>
            </Select>
            {field.value === "custom" && (
              <Input 
                className="mt-2" 
                placeholder='Enter screen size (e.g. "6.5"")' 
                onChange={(e) => form.setValue("screen_size", e.target.value)} 
              />
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PhoneSpecsSelector;
