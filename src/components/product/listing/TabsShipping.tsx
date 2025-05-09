
import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Truck, Package2, Info, Trash2, Plus, MapPin, PackageCheck } from 'lucide-react';
import { ProductFormValues } from '@/types/product';
import LocationDropdown from './LocationDropdown';

interface TabsShippingProps {
  form: UseFormReturn<ProductFormValues>;
  setActiveTab: (tab: string) => void;
}

const TabsShipping: React.FC<TabsShippingProps> = ({ form, setActiveTab }) => {
  // Get the field array for shipping options
  const { fields: shippingFields, append: appendShipping, remove: removeShipping } = 
    useFieldArray({
      control: form.control,
      name: "shipping_options"
    });

  // Get shipping-related form values
  const providesShipping = form.watch('provides_shipping') || false;
  const freeShipping = form.watch('free_shipping') || false;

  const handleShippingToggle = (checked: boolean) => {
    form.setValue('provides_shipping', checked);
    
    // Reset shipping options when turning off shipping
    if (!checked) {
      form.setValue('shipping_options', []);
      form.setValue('free_shipping', false);
    } else if (shippingFields.length === 0) {
      // Add default shipping option when turning on shipping
      appendShipping({ method: 'Standard', price: 0 });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Item Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <LocationDropdown form={form} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Shipping Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provides Shipping Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel>Do you provide shipping?</FormLabel>
              <FormDescription>
                Choose if you can ship this item to buyers
              </FormDescription>
            </div>
            <FormField
              control={form.control}
              name="provides_shipping"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={handleShippingToggle}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          {/* Shipping Options */}
          <div className="space-y-4">
            {/* If Provides Shipping = YES */}
            {providesShipping && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="free_shipping"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              // Set all shipping prices to 0
                              const currentOptions = form.getValues('shipping_options') || [];
                              const updatedOptions = currentOptions.map(option => ({
                                ...option,
                                price: 0
                              }));
                              form.setValue('shipping_options', updatedOptions);
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Offer Free Shipping</FormLabel>
                        <FormDescription>
                          Buyers often prefer listings with free shipping
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Your Shipping Method */}
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    Your Shipping Method
                  </h3>
                  
                  {shippingFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-end mb-3">
                      <FormField
                        control={form.control}
                        name={`shipping_options.${index}.method`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                              {index === 0 && "Method"}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Standard, Express" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`shipping_options.${index}.price`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                              {index === 0 && "Price (JOD)"}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00"
                                disabled={freeShipping} 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mb-2"
                          onClick={() => removeShipping(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => appendShipping({ method: '', price: freeShipping ? 0 : undefined })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Shipping Option
                  </Button>
                </div>
              </div>
            )}
            
            {/* Mzadkumsooq Delivery */}
            <FormField
              control={form.control}
              name="mzadkumsooq_delivery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mzadkumsooq Delivery (2 JOD)</FormLabel>
                    <FormDescription>
                      Mzadkumsooq will deliver the item to the buyer for a service fee
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {/* Local Pickup */}
            <FormField
              control={form.control}
              name="local_pickup"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Allow Local Pickup</FormLabel>
                    <FormDescription>
                      Buyer can pick up the item in person
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {/* Handling Time - only shown when providing shipping */}
            {providesShipping && (
              <FormField
                control={form.control}
                name="handling_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Handling Time</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={typeof field.value === 'string' ? field.value : ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select handling time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="same_day">Same Business Day</SelectItem>
                        <SelectItem value="one_day">1 Business Day</SelectItem>
                        <SelectItem value="two_days">2 Business Days</SelectItem>
                        <SelectItem value="three_days">3 Business Days</SelectItem>
                        <SelectItem value="four_days">4 Business Days</SelectItem>
                        <SelectItem value="five_days">5 Business Days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How long it takes to process and ship after receiving payment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package2 className="w-5 h-5 mr-2" />
              Return Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="return_policy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Policy</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={typeof field.value === 'string' ? field.value : ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select return policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no_returns">No Returns</SelectItem>
                      <SelectItem value="14_days">14 Day Returns</SelectItem>
                      <SelectItem value="30_days">30 Day Returns</SelectItem>
                      <SelectItem value="60_days">60 Day Returns</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Your policy for returns and refunds
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm text-blue-700 mt-4">
              <div className="flex">
                <Info className="h-5 w-5 mr-2" />
                <p>Clear shipping and return policies help set buyer expectations and reduce questions.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveTab('pricing')}
            className="flex items-center"
          >
            Back: Pricing
          </Button>
          <Button
            type="button"
            onClick={() => setActiveTab('images')}
            className="flex items-center"
          >
            Next: Images <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TabsShipping;
