
import React, { useState, useEffect } from 'react';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getCarMakes, 
  getCarModels, 
  fuelTypes, 
  transmissionTypes,
  bodyTypes, 
  colorOptions,
  driveTypes,
  wheelSides,
  licenseStatuses,
  featureOptions 
} from '@/utils/vehicleData';

const VehicleListingForm = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState<string | undefined>();
  const [carMakes, setCarMakes] = useState<string[]>([]);
  const [carModels, setCarModels] = useState<string[]>([]);
  
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
  
  // Load car makes and models on component mount
  useEffect(() => {
    setCarMakes(getCarMakes());
  }, []);
  
  // Update models when make changes
  useEffect(() => {
    if (selectedMake) {
      const models = getCarModels(selectedMake);
      setCarModels(models);
    } else {
      setCarModels([]);
    }
  }, [selectedMake]);
  
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
    
    // Set category path using category name (we don't use path property anymore)
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
                  
                  {/* Make - Searchable Dropdown */}
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Make <span className="text-red-500">*</span></FormLabel>
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
                                  ? carMakes.find((make) => make === field.value)
                                  : "Select make"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search make..." />
                              <CommandEmpty>No make found.</CommandEmpty>
                              <CommandGroup className="max-h-60 overflow-y-auto">
                                {carMakes.map((make) => (
                                  <CommandItem
                                    value={make}
                                    key={make}
                                    onSelect={() => {
                                      form.setValue("make", make, { shouldValidate: true });
                                      setSelectedMake(make);
                                      // Reset model when make changes
                                      form.setValue("model", "", { shouldValidate: true });
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        make === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {make}
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
                  
                  {/* Model - Searchable Dropdown (depends on Make) */}
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Model <span className="text-red-500">*</span></FormLabel>
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
                                disabled={!selectedMake}
                              >
                                {field.value
                                  ? carModels.find((model) => model === field.value)
                                  : selectedMake ? "Select model" : "Select make first"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search model..." />
                              <CommandEmpty>No model found.</CommandEmpty>
                              <CommandGroup className="max-h-60 overflow-y-auto">
                                {carModels.map((model) => (
                                  <CommandItem
                                    value={model}
                                    key={model}
                                    onSelect={() => {
                                      form.setValue("model", model, { shouldValidate: true });
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        model === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {model}
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
                      name="transmission"
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
                              {transmissionTypes.map(type => (
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
                    
                    {/* Doors */}
                    <FormField
                      control={form.control}
                      name="doors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doors</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 4" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Seats */}
                    <FormField
                      control={form.control}
                      name="seats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seats</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 5" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Drive Type */}
                    <FormField
                      control={form.control}
                      name="drive_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Drive Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select drive type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {driveTypes.map(type => (
                                <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Wheel Side */}
                    <FormField
                      control={form.control}
                      name="wheel_side"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wheel Side</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select wheel side" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {wheelSides.map(side => (
                                <SelectItem key={side} value={side.toLowerCase()}>{side}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Cylinders */}
                    <FormField
                      control={form.control}
                      name="cylinders"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cylinders</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 4" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Interior Color */}
                    <FormField
                      control={form.control}
                      name="interior_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interior Color</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Black" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* License Status */}
                    <FormField
                      control={form.control}
                      name="license_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select license status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {licenseStatuses.map(status => (
                                <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Chassis Number */}
                    <FormField
                      control={form.control}
                      name="chassis_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chassis Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. JH4DA9380MS016526" {...field} />
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
