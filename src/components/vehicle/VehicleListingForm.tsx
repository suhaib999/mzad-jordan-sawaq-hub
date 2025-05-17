import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// UI Components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Custom Components
import ImageUploader from '@/components/product/listing/ImageUploader';
import LocationSelector from '@/components/product/listing/LocationSelector';
import { Category } from '@/data/categories';
import CategorySelectDialog from '@/components/category/CategorySelectDialog';
import CategoryDisplay from '@/components/category/CategoryDisplay';

// Types and Data
import { VehicleFormValues, vehicleSchema } from '@/types/product';
import { 
  getCarMakes, 
  getCarModels, 
  fuelTypes, 
  transmissionTypes, 
  bodyTypes, 
  driveTypes, 
  wheelSides, 
  licenseStatuses, 
  colorOptions, 
  featureOptions 
} from '@/utils/vehicleData';

// Services
import { createVehicleListing, updateVehicleListing, getVehicleByProductId } from '@/services/vehicle/vehicleService';
import { v4 as uuidv4 } from 'uuid';

interface VehicleListingFormProps {
  productId?: string;
  isEditing?: boolean;
  initialData?: any;
}

const VehicleListingForm: React.FC<VehicleListingFormProps> = ({ 
  productId, 
  isEditing = false,
  initialData
}) => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // Get car makes for dropdown
  const carMakes = getCarMakes();
  
  // Initialize form with vehicle schema
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '1-1', // Default to Cars category
      make: '',
      model: '',
      year: undefined,
      mileage: undefined,
      condition: '',
      price: undefined,
      is_negotiable: false,
      location: {
        city: '',
        neighborhood: '',
        street: ''
      },
      images: [],
      status: 'active'
    }
  });
  
  // Watch form values for dependencies
  const watchMake = form.watch('make');
  const watchImages = form.watch('images');
  
  // Load car models when make changes
  useEffect(() => {
    if (watchMake) {
      setSelectedMake(watchMake);
      const models = getCarModels(watchMake);
      setAvailableModels(models);
    }
  }, [watchMake]);
  
  // Load initial data for editing
  useEffect(() => {
    const loadVehicleData = async () => {
      if (isEditing && productId) {
        try {
          // If we have initialData passed in, use that
          if (initialData) {
            populateFormWithData(initialData);
            return;
          }
          
          // Otherwise fetch the vehicle data
          const vehicleData = await getVehicleByProductId(productId);
          if (vehicleData) {
            populateFormWithData(vehicleData);
          }
        } catch (error) {
          console.error("Error loading vehicle data:", error);
          toast({
            title: "Error",
            description: "Failed to load vehicle data",
            variant: "destructive"
          });
        }
      }
    };
    
    loadVehicleData();
  }, [isEditing, productId, initialData]);
  
  // Populate form with existing data
  const populateFormWithData = (data: any) => {
    // Set form values
    form.reset({
      ...data,
      // Make sure all required fields are set
      title: data.title || '',
      description: data.description || '',
      category_id: data.category_id || '1-1',
      make: data.make || '',
      model: data.model || '',
      year: data.year || undefined,
      mileage: data.mileage || undefined,
      engine_size: data.engine_size || undefined,
      fuel_type: data.fuel_type || '',
      transmission: data.transmission || '',
      body_type: data.body_type || '',
      color: data.color || '',
      doors: data.doors || undefined,
      seats: data.seats || undefined,
      drive_type: data.drive_type || '',
      cylinders: data.cylinders || undefined,
      wheel_side: data.wheel_side || '',
      interior_color: data.interior_color || '',
      license_status: data.license_status || '',
      chassis_number: data.chassis_number || '',
      condition: data.condition || '',
      price: data.price || undefined,
      is_negotiable: data.is_negotiable || false,
      location: data.location || {
        city: '',
        neighborhood: '',
        street: ''
      },
      images: data.images || [],
      status: data.status || 'active'
    });
    
    // Set selected features
    if (data.features && Array.isArray(data.features)) {
      setSelectedFeatures(data.features);
    }
    
    // Set make to update available models
    if (data.make) {
      setSelectedMake(data.make);
      const models = getCarModels(data.make);
      setAvailableModels(models);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: VehicleFormValues) => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create a listing",
        variant: "destructive"
      });
      navigate("/auth/login");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Add features to the data
      const vehicleData = {
        ...data,
        features: selectedFeatures
      };
      
      // Generate title if not provided
      if (!vehicleData.title || vehicleData.title.trim() === '') {
        vehicleData.title = `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`;
      }
      
      let result;
      
      if (isEditing && productId) {
        // Update existing vehicle
        const vehicleId = initialData?.id;
        if (!vehicleId) {
          throw new Error("Vehicle ID is required for updating");
        }
        
        result = await updateVehicleListing(
          vehicleId,
          productId,
          vehicleData,
          session.user.id
        );
      } else {
        // Create new vehicle
        result = await createVehicleListing(
          vehicleData,
          session.user.id
        );
      }
      
      if (result.success) {
        toast({
          title: isEditing ? "Vehicle updated" : "Vehicle listed",
          description: isEditing 
            ? "Your vehicle listing has been updated successfully" 
            : "Your vehicle has been listed successfully",
        });
        
        // Redirect to the product page or listings
        if (isEditing) {
          navigate(`/product/${productId}`);
        } else if (result.productId) {
          navigate(`/product/${result.productId}`);
        } else {
          navigate('/profile/listings');
        }
      } else {
        throw new Error(result.error || "Failed to save vehicle listing");
      }
    } catch (error: any) {
      console.error("Error saving vehicle:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save vehicle listing",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const currentImages = form.getValues('images') || [];
    
    // Limit to 10 images
    const remainingSlots = 10 - currentImages.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    if (filesToAdd.length === 0) {
      toast({
        title: "Maximum images reached",
        description: "You can upload a maximum of 10 images",
        variant: "destructive"
      });
      return;
    }
    
    const newImages = filesToAdd.map((file, index) => {
      const imageUrl = URL.createObjectURL(file);
      return {
        id: uuidv4(),
        file: file,
        url: imageUrl,
        order: currentImages.length + index
      };
    });
    
    form.setValue('images', [...currentImages, ...newImages]);
  };
  
  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const currentImages = [...(form.getValues('images') || [])];
    currentImages.splice(index, 1);
    
    // Update order property
    const updatedImages = currentImages.map((img, idx) => ({
      ...img,
      order: idx
    }));
    
    form.setValue('images', updatedImages);
  };
  
  // Handle image reordering
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const currentImages = [...(form.getValues('images') || [])];
    
    if (direction === 'up' && index > 0) {
      const temp = currentImages[index];
      currentImages[index] = currentImages[index - 1];
      currentImages[index - 1] = temp;
    } 
    else if (direction === 'down' && index < currentImages.length - 1) {
      const temp = currentImages[index];
      currentImages[index] = currentImages[index + 1];
      currentImages[index + 1] = temp;
    }
    
    // Update order property
    const updatedImages = currentImages.map((img, idx) => ({
      ...img,
      order: idx
    }));
    
    form.setValue('images', updatedImages);
  };
  
  // Handle feature toggle
  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };
  
  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    form.setValue('category_id', category.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <FormLabel>Category</FormLabel>
              <CategoryDisplay 
                categoryId={form.getValues('category_id')}
                onClick={() => setCategoryDialogOpen(true)}
                showClear={false}
              />
              <CategorySelectDialog
                open={categoryDialogOpen}
                onOpenChange={setCategoryDialogOpen}
                onCategorySelect={handleCategorySelect}
                initialCategoryId={form.getValues('category_id')}
              />
            </div>
            
            {/* Basic Vehicle Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {carMakes.map((make) => (
                          <SelectItem key={make} value={make}>
                            {make}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!selectedMake}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedMake ? "Select model" : "Select make first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 2020" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage* (km)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 50000" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Vehicle Specifications */}
            <div>
              <h3 className="text-lg font-medium mb-4">Vehicle Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition*</FormLabel>
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
                          <SelectItem value="salvage">Salvage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="engine_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine Size (L)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 2.0" 
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fuel_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fuelTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transmissionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="body_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select body type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bodyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exterior Color</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorOptions.map((color) => (
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
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="drive_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drive Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select drive type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {driveTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="wheel_side"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wheel Side</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select wheel side" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {wheelSides.map((side) => (
                            <SelectItem key={side} value={side}>
                              {side}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="interior_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interior Color</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interior color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorOptions.map((color) => (
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
                
                <FormField
                  control={form.control}
                  name="license_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select license status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {licenseStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="chassis_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chassis Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter chassis number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Features */}
            <div>
              <h3 className="text-lg font-medium mb-4">Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {featureOptions.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={feature.id} 
                      checked={selectedFeatures.includes(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                    />
                    <label 
                      htmlFor={feature.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {feature.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Title and Description */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 2020 Toyota Camry in Excellent Condition" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <textarea 
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Describe your vehicle in detail. Include information about its condition, history, and any special features." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            {/* Price */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Price</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter price" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Price is negotiable</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location</h3>
              <LocationSelector form={form} />
            </div>
            
            <Separator />
            
            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Images*</h3>
              <ImageUploader
                images={watchImages || []}
                onUpload={handleImageUpload}
                onRemove={handleRemoveImage}
                onMove={moveImage}
                maxImages={10}
              />
              <p className="text-sm text-muted-foreground">
                Upload up to 10 images. First image will be the cover image.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Vehicle' : 'List Vehicle'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default VehicleListingForm;
