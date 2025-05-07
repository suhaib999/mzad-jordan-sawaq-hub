
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, CreditCard, Gavel, Info, ShoppingCart, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ProductFormValues } from '@/types/product';

interface TabsPricingProps {
  form: UseFormReturn<ProductFormValues>;
  listingType: string;
  setActiveTab: (tab: string) => void;
}

const TabsPricing: React.FC<TabsPricingProps> = ({ form, listingType, setActiveTab }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Listing Type & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Listing Type */}
          <FormField
            control={form.control}
            name="listing_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listing Type <span className="text-red-500">*</span></FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div
                    className={`border rounded-md p-3 cursor-pointer ${
                      field.value === 'fixed_price' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted'
                    }`}
                    onClick={() => field.onChange('fixed_price')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Fixed Price</span>
                      </div>
                      {field.value === 'fixed_price' && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                  
                  <div
                    className={`border rounded-md p-3 cursor-pointer ${
                      field.value === 'auction' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted'
                    }`}
                    onClick={() => field.onChange('auction')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Gavel className="h-4 w-4" />
                        <span>Auction</span>
                      </div>
                      {field.value === 'auction' && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                  
                  <div
                    className={`border rounded-md p-3 cursor-pointer ${
                      field.value === 'both' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted'
                    }`}
                    onClick={() => field.onChange('both')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Both</span>
                      </div>
                      {field.value === 'both' && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
                <FormDescription>
                  Choose how you want to sell your item
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Fixed Price Section */}
          {(listingType === 'fixed_price' || listingType === 'both') && (
            <div className="space-y-4 border rounded-md p-4">
              <h3 className="font-medium flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Fixed Price Details
              </h3>
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0.01"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_negotiable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>

                    <FormLabel>Is Negotiable</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          )}
          
          {/* Auction Section */}
          {(listingType === 'auction' || listingType === 'both') && (
            <div className="space-y-4 border rounded-md p-4">
              <h3 className="font-medium flex items-center">
                <Gavel className="h-4 w-4 mr-2" />
                Auction Details
              </h3>
              
              <FormField
                control={form.control}
                name="start_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting Price ($) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0.01"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reserve_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reserve Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00 (optional)" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum price for which you're willing to sell
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="auction_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (days) <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="10">10 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          {/* Quantity */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="1"
                    placeholder="1" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="allow_offers"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Allow Offers</FormLabel>
                  <FormDescription>
                    Allow buyers to make offers on your listing
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Pricing Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-4">
              <div className="flex items-start space-x-2">
                <CreditCard className="h-4 w-4 mt-1 text-blue-500" />
                <p><strong>Fixed Price:</strong> Set a specific price for immediate purchase.</p>
              </div>
              
              <div className="flex items-start space-x-2">
                <Gavel className="h-4 w-4 mt-1 text-amber-500" />
                <p><strong>Auction:</strong> Start with a lower price and let buyers bid up.</p>
              </div>
              
              <div className="flex items-start space-x-2">
                <ShoppingCart className="h-4 w-4 mt-1 text-green-500" />
                <p><strong>Both:</strong> Allow immediate purchase at your fixed price, while also accepting bids.</p>
              </div>
              
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 mt-1 text-red-500" />
                <p><strong>Tip:</strong> Research similar items to determine a competitive price.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveTab('details')}
            className="flex items-center"
          >
            Back: Details
          </Button>
          <Button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className="flex items-center"
          >
            Next: Shipping <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TabsPricing;
