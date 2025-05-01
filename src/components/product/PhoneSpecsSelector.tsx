
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
import { Info } from 'lucide-react';

interface PhoneSpecsSelectorProps {
  categoryPath: string;
}

const PhoneSpecsSelector: React.FC<PhoneSpecsSelectorProps> = ({ categoryPath }) => {
  const form = useFormContext();
  const [selectedBrand, setSelectedBrand] = useState<SmartphoneBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<SmartphoneModel | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);
  
  // Check if current category is related to phones
  const isPhoneCategory = categoryPath && 
    (categoryPath.toLowerCase().includes('phone') || 
     categoryPath.toLowerCase().includes('mobile'));
  
  useEffect(() => {
    if (!isPhoneCategory) {
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
  }, [categoryPath, form]);
  
  if (!showSpecs) return null;
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm text-blue-700 mb-4">
        <div className="flex">
          <Info className="h-5 w-5 mr-2" />
          <p>Adding specific details about your device helps buyers find your listing.</p>
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
              <FormLabel>Storage Size*</FormLabel>
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
    </div>
  );
};

export default PhoneSpecsSelector;
