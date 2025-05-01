import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { X, Plus, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategorySelectDialog from '@/components/category/CategorySelectDialog';
import CategoryDisplay from '@/components/category/CategoryDisplay';
import { Category, findCategoryById } from '@/data/categories';

const conditions = [
  "New",
  "Like New",
  "Very Good",
  "Good",
  "Acceptable",
  "For Parts or Not Working"
];

const jordanianCities = [
  "Amman",
  "Zarqa",
  "Irbid",
  "Aqaba",
  "Madaba",
  "Jerash",
  "Karak",
  "Mafraq",
  "Salt",
  "Ajloun",
  "Tafilah",
  "Ma'an"
];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description cannot exceed 2000 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  condition: z.string().min(1, "Please select a condition"),
  location: z.string().optional(),
  listingType: z.enum(["fixed", "auction"]),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  currency: z.string().default("JOD"),
  shipping: z.string().optional(),
  startPrice: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
    {
      message: "Starting price must be a positive number",
    }
  ),
  reservePrice: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
    {
      message: "Reserve price must be a positive number",
    }
  ),
  endDate: z.string().optional().refine(
    (val) => !val || new Date(val) > new Date(),
    {
      message: "End date must be in the future",
    }
  ),
  endTime: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const AddProduct = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [listingType, setListingType] = useState<"fixed" | "auction">("fixed");
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      condition: "",
      location: "",
      listingType: "fixed",
      price: "",
      currency: "JOD",
      shipping: "",
      startPrice: "",
      reservePrice: "",
      endDate: "",
      endTime: ""
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      
      if (images.length + newFiles.length > 10) {
        toast.error("Maximum 10 images allowed");
        return;
      }
      
      const newImages: File[] = [...images];
      const newImageUrls: string[] = [...imageUrls];
      
      newFiles.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`);
          return;
        }
        
        const url = URL.createObjectURL(file);
        newImages.push(file);
        newImageUrls.push(url);
      });
      
      setImages(newImages);
      setImageUrls(newImageUrls);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageUrls = [...imageUrls];
    
    URL.revokeObjectURL(newImageUrls[index]);
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  const uploadImages = async (productId: string) => {
    if (images.length === 0) return [];
    
    setIsUploading(true);
    const uploadedImages = [];
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('product_images')
        .upload(filePath, file);
        
      if (uploadError) {
        toast.error(`Error uploading ${file.name}: ${uploadError.message}`);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('product_images')
        .getPublicUrl(filePath);
        
      uploadedImages.push({
        product_id: productId,
        image_url: publicUrl,
        display_order: i
      });
      
      setUploadProgress(Math.round(((i + 1) / images.length) * 100));
    }
    
    setIsUploading(false);
    return uploadedImages;
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    form.setValue('categoryId', category.id);
    form.trigger('categoryId');
  };

  const onSubmit = async (values: FormValues) => {
    if (!session?.user) {
      toast.error("You must be logged in to create a listing");
      navigate('/auth/login');
      return;
    }
    
    if (images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }
    
    try {
      const productId = uuidv4();
      
      // Prepare end time for auctions
      let endTime = null;
      if (values.listingType === "auction" && values.endDate) {
        const endDate = new Date(values.endDate);
        if (values.endTime) {
          const [hours, minutes] = values.endTime.split(':').map(Number);
          endDate.setHours(hours, minutes);
        }
        endTime = endDate.toISOString();
      }
      
      // Get category information
      const selectedCat = selectedCategory ? findCategoryById(selectedCategory.id) : null;
      const categoryPath = selectedCat ? selectedCat.name : '';
      
      // Insert product data
      const productData = {
        id: productId,
        title: values.title,
        description: values.description,
        price: Number(values.price),
        currency: values.currency,
        condition: values.condition,
        category_id: values.categoryId,
        category: categoryPath,
        seller_id: session.user.id,
        location: values.location || null,
        shipping: values.shipping || null,
        is_auction: values.listingType === "auction",
        start_price: values.listingType === "auction" ? Number(values.startPrice) : null,
        current_bid: values.listingType === "auction" ? Number(values.startPrice) : null,
        reserve_price: values.listingType === "auction" && values.reservePrice ? Number(values.reservePrice) : null,
        end_time: endTime,
      };
      
      const { error: productError } = await supabase
        .from('products')
        .insert(productData);
        
      if (productError) {
        throw new Error(productError.message);
      }
      
      // Upload images and create image records
      const uploadedImages = await uploadImages(productId);
      
      if (uploadedImages.length > 0) {
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(uploadedImages);
          
        if (imagesError) {
          toast.error(`Error saving image details: ${imagesError.message}`);
        }
      }
      
      toast.success("Product listed successfully!");
      navigate(`/product/${productId}`);
      
    } catch (error) {
      toast.error(`Error creating listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Update listingType state when the form field changes
  const watchListingType = form.watch("listingType");
  if (watchListingType !== listingType) {
    setListingType(watchListingType as "fixed" | "auction");
  }

  // Update selected category when it changes in the form
  useEffect(() => {
    const categoryId = form.watch('categoryId');
    if (categoryId && (!selectedCategory || selectedCategory.id !== categoryId)) {
      const category = findCategoryById(categoryId);
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [form.watch('categoryId')]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Create a Listing</h1>
        
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="images">Product Images</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="details">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel>Category*</FormLabel>
                            <FormControl>
                              <div className="mb-1">
                                <CategoryDisplay 
                                  categoryId={field.value || null} 
                                  onClick={() => setCategorySelectOpen(true)}
                                  onClear={() => {
                                    field.onChange('');
                                    setSelectedCategory(null);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />

                            <CategorySelectDialog
                              open={categorySelectOpen}
                              onOpenChange={setCategorySelectOpen}
                              onCategorySelect={handleCategorySelect}
                              initialCategoryId={field.value || undefined}
                            />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title*</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Samsung Galaxy S23 Ultra 256GB - Black" {...field} />
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
                              <Textarea 
                                placeholder="Describe your product in detail..." 
                                className="min-h-32" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition*</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {conditions.map((condition) => (
                                  <SelectItem key={condition} value={condition}>
                                    {condition}
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
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {jordanianCities.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="listingType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Listing Type*</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fixed" id="fixed" />
                                <Label htmlFor="fixed">Fixed Price</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="auction" id="auction" />
                                <Label htmlFor="auction">Auction</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="mt-6 space-y-6">
                      {/* Fixed price fields */}
                      <div className={listingType === "fixed" ? "block" : "hidden"}>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price*</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="JOD">JOD - Jordanian Dinar</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* Auction fields */}
                      <div className={listingType === "auction" ? "block space-y-6" : "hidden"}>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Starting Price*</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="reservePrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reserve Price (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Minimum price you're willing to accept
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Buy Now Price (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Price to instantly buy the item
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="JOD">JOD - Jordanian Dinar</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date*</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Time*</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="shipping"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Options (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Free Shipping, +10 JOD Shipping, Local Pickup Only" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="images">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-1">Drag and drop images here or click to upload</p>
                          <p className="text-xs text-gray-500 mb-2">Upload up to 10 images (Max 5MB each)</p>
                          
                          <div className="relative">
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <div className="bg-mzad-primary text-white text-sm py-2 px-4 rounded hover:bg-mzad-primary/90">
                                Choose Images
                              </div>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {imageUrls.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Selected Images ({imageUrls.length}/10)</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {imageUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-md overflow-hidden border">
                                  <img 
                                    src={url} 
                                    alt={`Upload preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 rounded-full p-1"
                                  aria-label="Remove image"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                {index === 0 && (
                                  <span className="absolute top-1 left-1 bg-mzad-primary text-white text-xs px-2 py-0.5 rounded">
                                    Main
                                  </span>
                                )}
                              </div>
                            ))}
                            
                            {imageUrls.length < 10 && (
                              <label htmlFor="add-more-images" className="cursor-pointer">
                                <div className="aspect-square rounded-md border border-dashed flex items-center justify-center bg-gray-50 hover:bg-gray-100">
                                  <Plus className="h-6 w-6 text-gray-400" />
                                </div>
                                <input
                                  id="add-more-images"
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      )}

                      {isUploading && (
                        <div className="mt-4">
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin text-mzad-primary" />
                            <span className="text-sm">Uploading: {uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                            <div 
                              className="bg-mzad-primary h-2.5 rounded-full transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Create Listing'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AddProduct;
