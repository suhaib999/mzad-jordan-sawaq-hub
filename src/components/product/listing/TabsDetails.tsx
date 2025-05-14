
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductFormValues } from '@/types/product';
import CategorySelector from '@/components/category/CategorySelector';
import CategorySelectDialog from '@/components/category/CategorySelectDialog';
import PhoneSpecsSelector from '@/components/product/PhoneSpecsSelector';
import DynamicAttributesForm from '@/components/product/DynamicAttributesForm';
import { findCategoryById } from '@/data/categories';

interface TabsDetailsProps {
  form: UseFormReturn<ProductFormValues>;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  customAttributes: { name: string; value: string }[];
  setCustomAttributes: React.Dispatch<React.SetStateAction<{ name: string; value: string }[]>>;
  handleCategorySelect: (category: any) => void;
  setActiveTab: (tab: string) => void;
}

const TabsDetails: React.FC<TabsDetailsProps> = ({ 
  form, 
  selectedCategory, 
  setSelectedCategory, 
  customAttributes, 
  setCustomAttributes,
  handleCategorySelect,
  setActiveTab
}) => {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  
  const onCategorySelect = (category: any) => {
    console.log("Category selected:", category);
    handleCategorySelect(category);
    
    // Store both the category ID and full path
    form.setValue('category', category.slug);
    form.setValue('category_id', category.id);
    
    // If this is a subcategory, also set the parent category ID
    if (category.parent_id) {
      form.setValue('subcategory', category.slug);
      form.setValue('subcategory_id', category.id);
    }
    
    setSelectedCategory(category.id);
  };

  // Get the category name from the ID for display
  const getCategoryDisplayName = () => {
    if (!selectedCategory) return "Select category";
    const category = findCategoryById(selectedCategory);
    return category ? category.name : "Select category";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormDescription>
                  Clear title describing your item (10-100 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your item in detail" 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Detailed description (30-5000 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Category - Updated to use dialog */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <div>
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setCategoryDialogOpen(true)}
                    >
                      {getCategoryDisplayName()}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <CategorySelectDialog
                      open={categoryDialogOpen}
                      onOpenChange={setCategoryDialogOpen}
                      onCategorySelect={onCategorySelect}
                      initialCategoryId={field.value}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Condition */}
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition <span className="text-red-500">*</span></FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="for_parts">For Parts</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      
      {/* Category-specific Attributes */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Item Specifics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Brand */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brand name" 
                      {...field} 
                      value={field.value?.toString() || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Model */}
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Model number" 
                      {...field} 
                      value={field.value?.toString() || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Render category-specific form fields */}
            {selectedCategory === 'mobile-phones' && (
              <PhoneSpecsSelector 
                categoryPath={selectedCategory}
              />
            )}
            
            {/* For other categories */}
            {selectedCategory && selectedCategory !== 'mobile-phones' && (
              <DynamicAttributesForm
                category={{ 
                  id: selectedCategory, 
                  name: selectedCategory, 
                  slug: selectedCategory 
                }}
                form={form}
                customAttributes={customAttributes}
                setCustomAttributes={setCustomAttributes}
              />
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className="flex items-center"
          >
            Next: Pricing <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TabsDetails;
