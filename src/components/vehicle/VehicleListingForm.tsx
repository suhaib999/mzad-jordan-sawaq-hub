import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, VehicleFormValues } from '@/types/product';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import CategorySelector from '@/components/category/CategorySelector';
import { toast } from '@/hooks/use-toast';
import { Category } from '@/data/categories';
import { ChevronRight } from 'lucide-react';

// Mock fuel types and body types data
const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'CNG'];
const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Truck', 'Van/Minivan', 'Wagon'];
const gearTypes = ['Automatic', 'Manual', 'Semi-Automatic', 'CVT'];
const colorOptions = ['Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Yellow', 'Orange', 'Purple', 'Gold', 'Other'];

// Feature options for checkboxes
const featureOptions = [
  { id: 'air_conditioning', label: 'Air Conditioning' },
  { id: 'power_steering', label: 'Power Steering' },
  { id: 'power_windows', label: 'Power Windows' },
  { id: 'abs', label: 'Anti-lock Brakes (ABS)' },
  { id: 'sunroof', label: 'Sunroof' },
  { id: 'leather_seats', label: 'Leather Seats' },
  { id: 'navigation', label: 'Navigation System' },
  { id: 'bluetooth', label: 'Bluetooth' },
  { id: 'backup_camera', label: 'Backup Camera' },
  { id: 'parking_sensors', label: 'Parking Sensors' },
  { id: 'cruise_control', label: 'Cruise Control' },
  { id: 'heated_seats', label: 'Heated Seats' }
];

const VehicleListingForm = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // Initialize the form
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      mileage: 0,
      price: 0,
      condition: '',
      location: {
        city: '',
        neighborhood: ''
      },
      images: [],
      status: 'draft'
    }
  });
  
  const onSubmit = (data: VehicleFormValues) => {
    try {
      console.log('Vehicle form submitted:', data);
      
      // Set the features field from the selectedFeatures state
      const dataWithFeatures = {
        ...data,
        features: selectedFeatures
      };
      
      toast({
        title: 'Success',
        description: 'Your vehicle listing has been created!',
      });
      
      // Would send to API or service here
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to create your vehicle listing. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const handleCategorySelect = (category: Category) => {
    setSelectedCategoryId(category.id);
    form.setValue('category_id', category.id, { shouldDirty: true, shouldValidate: true });
    
    // If we have a full path to this category, use category_path from the Category type if available
    // or just set an array with the category name
    const categoryPath = category.name ? [category.name] : [];
    form.setValue('category_path', categoryPath, { shouldDirty: true });
    
    // Close the dialog
    setIsCategoryDialogOpen(false);
  };
  
  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    if (checked) {
      setSelectedFeatures(prev => [...prev, featureId]);
    } else {
      setSelectedFeatures(prev => prev.filter(id => id !== featureId));
    }
  };
  
  // Generate years for select dropdown (last 50 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Sell Your Vehicle</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full max-w-md mb-8">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>
            
            {/* Vehicle Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div>
                            <Button 
                              variant="outline" 
                              type="button"
                              className="w-full justify-between"
                              onClick={() => setIsCategoryDialogOpen(true)}
                            >
                              {selectedCategoryId ? 'Change Category' : 'Select Category'}
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2019 Toyota Camry XSE - Low Mileage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Make */}
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Toyota" {...field} />
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
                        <FormLabel>Model <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Camry" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Year */}
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                            placeholder="Provide details about your vehicle" 
                            className="min-h-[120px]" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mileage */}
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mileage <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 45000" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
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
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Body Type */}
                    <FormField
                      control={form.control}
                      name="body_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Body Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select body type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bodyTypes.map(type => (
                                <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Fuel Type */}
                    <FormField
                      control={form.control}
                      name="fuel_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuel Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select fuel type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {fuelTypes.map(type => (
                                <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Transmission/Gear Type */}
                    <FormField
                      control={form.control}
                      name="gear_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmission</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transmission type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gearTypes.map(type => (
                                <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Color */}
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {colorOptions.map(color => (
                                <SelectItem key={color} value={color.toLowerCase()}>{color}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Engine Size */}
                    <FormField
                      control={form.control}
                      name="engine_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engine Size (L)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 2.5" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                type="button" 
                onClick={() => setActiveTab('features')}
                className="w-full md:w-auto"
              >
                Next: Features
              </Button>
            </TabsContent>
            
            {/* Vehicle Features Tab */}
            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {featureOptions.map(feature => (
                      <div key={feature.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={feature.id} 
                          checked={selectedFeatures.includes(feature.id)}
                          onCheckedChange={(checked) => 
                            handleFeatureToggle(feature.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={feature.id} 
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {feature.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab('details')}
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setActiveTab('pricing')}
                >
                  Next: Pricing
                </Button>
              </div>
            </TabsContent>
            
            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g. 15000" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Negotiable */}
                  <FormField
                    control={form.control}
                    name="is_negotiable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Price is negotiable
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Amman" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location.neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Neighborhood <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Abdoun" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab('features')}
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setActiveTab('photos')}
                >
                  Next: Photos
                </Button>
              </div>
            </TabsContent>
            
            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Drag and drop photos here, or click to select files
                    </p>
                    <Button type="button">Select Files</Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab('pricing')}
                >
                  Back
                </Button>
                <Button type="submit">
                  Create Listing
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
      
      {/* Category Selection Dialog */}
      <CategorySelectDialog 
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onCategorySelect={handleCategorySelect}
        initialCategoryId={selectedCategoryId || undefined}
      />
    </div>
  );
};

// Helper component for Category Dialog
const CategorySelectDialog = ({ 
  open, 
  onOpenChange, 
  onCategorySelect, 
  initialCategoryId 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onCategorySelect: (category: Category) => void; 
  initialCategoryId?: string 
}) => {
  return (
    <div className={`fixed inset-0 z-50 bg-black/50 ${open ? 'block' : 'hidden'}`}>
      <div className="fixed inset-10 bg-white rounded-lg overflow-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Select Category</h2>
          {/* Replace with actual CategorySelector component */}
          <div className="flex justify-center">
            <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleListingForm;
