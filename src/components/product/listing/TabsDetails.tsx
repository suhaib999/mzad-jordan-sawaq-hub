import React, { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductFormValues } from '@/types/product';
import CategorySelector from '@/components/product/listing/CategorySelector';
import ItemSpecifics from '@/components/product/listing/ItemSpecifics';
import { findCategoryById } from '@/data/categories';
import { toast } from '@/hooks/use-toast';
interface TabsDetailsProps {
  form: UseFormReturn<ProductFormValues>;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  customAttributes: {
    name: string;
    value: string;
  }[];
  setCustomAttributes: React.Dispatch<React.SetStateAction<{
    name: string;
    value: string;
  }[]>>;
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
  const [categoryValue, setCategoryValue] = useState<string>(form.getValues('category') || '');
  const [subcategoryValue, setSubcategoryValue] = useState<string>(form.getValues('subcategory') || '');
  const [brandValue, setBrandValue] = useState<string>(form.getValues('brand') || '');

  // Initialize from form values when component mounts
  useEffect(() => {
    const category = form.getValues('category');
    const subcategory = form.getValues('subcategory');
    const brand = form.getValues('brand');
    if (category) {
      setCategoryValue(category);
    }
    if (subcategory) {
      setSubcategoryValue(subcategory);
    }
    if (brand) {
      setBrandValue(brand);
    }
  }, [form]);
  const onCategorySelect = useCallback((category: any, subcategory?: any) => {
    try {
      // Always set category information
      form.setValue('category', category.slug, {
        shouldDirty: true,
        shouldValidate: true
      });
      form.setValue('category_id', category.id, {
        shouldDirty: true
      });
      setCategoryValue(category.slug);
      if (subcategory) {
        // Handle subcategory selection
        form.setValue('subcategory', subcategory.slug, {
          shouldDirty: true,
          shouldValidate: true
        });
        form.setValue('subcategory_id', subcategory.id, {
          shouldDirty: true
        });
        setSelectedCategory(subcategory.id);
        setSubcategoryValue(subcategory.slug);

        // Build category path array if both category and subcategory are selected
        const categoryPath = [category.slug, subcategory.slug];
        form.setValue('category_path', categoryPath, {
          shouldDirty: true
        });
      } else {
        // Handle main category selection only (no subcategory selected)
        form.setValue('subcategory', '', {
          shouldDirty: true
        });
        form.setValue('subcategory_id', '', {
          shouldDirty: true
        });
        setSelectedCategory(category.id);
        setSubcategoryValue('');

        // Set category path with just the main category
        form.setValue('category_path', [category.slug], {
          shouldDirty: true
        });
      }

      // Reset attributes when category changes to prevent data from previous categories
      form.setValue('attributes', {}, {
        shouldDirty: true
      });
    } catch (error) {
      console.error("Error in category selection:", error);
      toast({
        title: "Error",
        description: "There was a problem selecting the category. Please try again.",
        variant: "destructive"
      });
    }
  }, [form, setSelectedCategory]);

  // Handle brand input changes
  const handleBrandChange = (value: string) => {
    setBrandValue(value);
    form.setValue('brand', value, {
      shouldDirty: true
    });
  };
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <FormField control={form.control} name="title" render={({
          field
        }) => <FormItem>
                <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormDescription>
                  Clear title describing your item (10-100 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>} />
          
          {/* Description */}
          <FormField control={form.control} name="description" render={({
          field
        }) => <FormItem>
                <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe your item in detail" className="min-h-[120px]" {...field} />
                </FormControl>
                <FormDescription>
                  Detailed description (30-5000 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>} />
          
          {/* Category Selection */}
          <FormField control={form.control} name="category" render={({
          field
        }) => <FormItem>
                <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                <CategorySelector onCategorySelect={onCategorySelect} selectedCategory={categoryValue} selectedSubcategory={subcategoryValue} />
                <FormMessage />
              </FormItem>} />
          
          {/* Brand Field - Separate from Category */}
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter brand name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Condition */}
          <FormField control={form.control} name="condition" render={({
          field
        }) => <FormItem>
                <FormLabel>Condition <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
              </FormItem>} />

          {/* Tags Input */}
          <FormField control={form.control} name="tags" render={({
          field
        }) => <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tags, separated by commas" value={(field.value || []).join(', ')} onChange={e => {
              const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
              form.setValue('tags', tagsArray, {
                shouldDirty: true
              });
            }} />
                </FormControl>
                <FormDescription>
                  Add descriptive keywords to help buyers find your item
                </FormDescription>
                <FormMessage />
              </FormItem>} />
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
            <ItemSpecifics form={form} category={categoryValue} subcategory={subcategoryValue} />
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="button" onClick={() => setActiveTab('pricing')} className="flex items-center">
            Next: Pricing <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>;
};
export default TabsDetails;
