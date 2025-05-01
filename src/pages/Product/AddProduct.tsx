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
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { X, Plus, Upload, Loader2, Info, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategorySelectDialog from '@/components/category/CategorySelectDialog';
import CategoryDisplay from '@/components/category/CategoryDisplay';
import { Category, findCategoryById } from '@/data/categories';
import PhoneSpecsSelector from '@/components/product/PhoneSpecsSelector';
import { Progress } from '@/components/ui/progress';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  endTime: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  storage: z.string().optional(),
  color: z.string().optional(),
  screen_size: z.string().optional(),
  isDeliveryAvailable: z.enum(["yes", "no"]).optional(),
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
  const [activeTab, setActiveTab] = useState("details");
  const [completionScore, setCompletionScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      endTime: "",
      brand: "",
      model: "",
      storage: "",
      color: "",
      screen_size: "",
      isDeliveryAvailable: undefined,
    },
    mode: "onChange"
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
      updateCompletionScore();
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
    updateCompletionScore();
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
      
      try {
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
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    setIsUploading(false);
    return uploadedImages;
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    form.setValue('categoryId', category.id);
    form.trigger('categoryId');
    updateCompletionScore();
  };

  // Calculate and update the completion score
  const updateCompletionScore = () => {
    const formValues = form.getValues();
    let score = 0;
    let totalFields = 0;

    // Required fields
    const requiredFields = ['title', 'description', 'categoryId', 'condition'];
    requiredFields.forEach(field => {
      totalFields++;
      if (formValues[field as keyof FormValues]) {
        score++;
      }
    });

    // Check if images are added
    totalFields++;
    if (images.length > 0) {
      score++;
    }

    // Pricing based on listing type
    totalFields++;
    if (formValues.listingType === 'fixed' && formValues.price) {
      score++;
    } else if (formValues.listingType === 'auction' && 
              formValues.startPrice && 
              formValues.endDate && 
              formValues.endTime) {
      score++;
    }

    // Optional fields that are nice to have
    const optionalFields = ['location', 'shipping'];
    optionalFields.forEach(field => {
      totalFields += 0.5;
      if (formValues[field as keyof FormValues]) {
        score += 0.5;
      }
    });

    // Device-specific fields if category is related to phones or tablets
    const categoryPath = selectedCategory?.name.toLowerCase() || '';
    const isDeviceCategory = categoryPath.includes('phone') || 
                            categoryPath.includes('mobile') || 
                            categoryPath.includes('tablet');
    
    if (isDeviceCategory) {
      const deviceFields = ['brand', 'model', 'storage', 'color', 'screen_size'];
      deviceFields.forEach(field => {
        totalFields++;
        if (formValues[field as keyof FormValues]) {
          score++;
        }
      });
    }

    // Calculate percentage
    const percentage = Math.min(100, Math.round((score / totalFields) * 100));
    setCompletionScore(percentage);
  };

  // Update when form values change
  useEffect(() => {
    const subscription = form.watch(() => updateCompletionScore());
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) {
      return; // Prevent double submission
    }
    
    setIsSubmitting(true);
    
    try {
      if (!session?.user) {
        toast.error("You must be logged in to create a listing");
        navigate('/auth/login');
        return;
      }
      
      if (images.length === 0) {
        toast.error("Please add at least one product image");
        setActiveTab("images");
        setIsSubmitting(false);
        return;
      }

      // For auction listings, validate required fields
      if (values.listingType === "auction") {
        if (!values.startPrice) {
          toast.error("Please set a starting price for your auction");
          setActiveTab("details");
          setIsSubmitting(false);
          return;
        }
        
        if (!values.endDate || !values.endTime) {
          toast.error("Please set an end date and time for your auction");
          setActiveTab("details");
          setIsSubmitting(false);
          return;
        }
      }
      
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
      
      // Format title based on phone model if applicable
      let enhancedTitle = values.title;
      if (values.brand && values.model && values.storage) {
        // Only enhance if title doesn't already have this info
        if (!enhancedTitle.toLowerCase().includes(values.brand.toLowerCase()) && 
            !enhancedTitle.toLowerCase().includes(values.model.toLowerCase())) {
          const modelName = values.model.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          const deviceInfo = [values.brand, modelName, values.storage];
          if (values.color) deviceInfo.push(values.color);
          if (values.screen_size) deviceInfo.push(`${values.screen_size} screen`);
          
          enhancedTitle = deviceInfo.join(' ').trim();
          if (values.title) {
            enhancedTitle = `${enhancedTitle} - ${values.title}`;
          }
        }
      }
      
      // Insert product data - match the actual schema fields in Supabase
      const productData = {
        id: productId,
        title: enhancedTitle,
        description: values.description,
        price: values.listingType === "fixed" ? Number(values.price) : null,
        currency: values.currency,
        condition: values.condition,
        category: categoryPath,  // Use 'category' instead of 'category_id'
        seller_id: session.user.id,
        location: values.location || null,
        shipping: values.shipping || null,
        is_auction: values.listingType === "auction",
        start_price: values.listingType === "auction" ? Number(values.startPrice) : null,
        current_bid: values.listingType === "auction" ? Number(values.startPrice) : null,
        reserve_price: values.listingType === "auction" && values.reservePrice ? Number(values.reservePrice) : null,
        end_time: endTime,
        status: 'active'
      };
      
      console.log("Submitting product data:", productData);
      
      const { error: productError } = await supabase
        .from('products')
        .insert(productData);
        
      if (productError) {
        console.error("Product insert error:", productError);
        throw new Error(productError.message);
      }
      
      // Upload images and create image records
      const uploadedImages = await uploadImages(productId);
      
      if (uploadedImages.length > 0) {
        console.log("Uploading image data:", uploadedImages);
        
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(uploadedImages);
          
        if (imagesError) {
          console.error("Image insert error:", imagesError);
          toast.error(`Error saving image details: ${imagesError.message}`);
        }
      }
      
      toast.success("Product listed successfully!");
      navigate(`/product/${productId}`);
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(`Error creating listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update listingType state when the form field changes
  const watchListingType = form.watch("listingType");
  useEffect(() => {
    if (watchListingType !== listingType) {
      setListingType(watchListingType as "fixed" | "auction");
    }
  }, [watchListingType]);

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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-2">Create a Listing</h1>
        
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{completionScore}% Complete</span>
              <div className="text-xs text-gray-500">(higher score attracts more views)</div>
            </div>
          </div>
          <Progress value={completionScore} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">
            Complete all the details in your listing to achieve a better quality score and increase visibility.
          </p>
        </div>
        
        <Tabs defaultValue="details" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="relative">
              Product Details
              {completionScore < 70 && activeTab !== "details" && (
                <span className="absolute top-0 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="images" className="relative">
              Product Images
              {images.length === 0 && activeTab !== "images" && (
                <span className="absolute top-0 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="details">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Category Selection */}
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <div className="flex">
                          <Info className="h-5 w-5 mr-2" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium">Choose the most specific category</p>
                            <p>This helps buyers find your item more easily</p>
                          </div>
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel className="text-base font-medium">Category*</FormLabel>
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
                      
                      {/* Device-specific fields */}
                      {selectedCategory && (
                        <PhoneSpecsSelector 
                          categoryPath={selectedCategory.name}
                        />
                      )}
                      
                      {/* Listing Details */}
                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium mb-4">Listing Details</h3>
                        
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-base">Title*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Samsung Galaxy S23 Ultra 256GB - Black" {...field} />
                              </FormControl>
                              <FormDescription>
                                A clear, concise title will attract more buyers
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-base">Description*</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your product in detail..." 
                                  className="min-h-32" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Include important details like features, condition issues, and why you're selling
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="condition"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-base">Condition*</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex flex-wrap gap-2"
                                >
                                  {conditions.map((condition) => (
                                    <div key={condition} className="flex items-center border rounded-md p-2 hover:bg-gray-50">
                                      <RadioGroupItem value={condition} id={`condition-${condition}`} className="mr-2" />
                                      <Label htmlFor={`condition-${condition}`} className="cursor-pointer">{condition}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="listingType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-medium">Listing Type*</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                                  <RadioGroupItem value="fixed" id="fixed" />
                                  <Label htmlFor="fixed" className="font-medium cursor-pointer">Fixed Price</Label>
                                  <span className="text-sm text-gray-500 ml-2">Sell to the first buyer who pays your price</span>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                                  <RadioGroupItem value="auction" id="auction" />
                                  <Label htmlFor="auction" className="font-medium cursor-pointer">Auction</Label>
                                  <span className="text-sm text-gray-500 ml-2">Let buyers bid and sell to the highest bidder</span>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                      JOD
                                    </span>
                                    <Input 
                                      type="number" 
                                      step="0.01" 
                                      min="0" 
                                      placeholder="0.00" 
                                      className="rounded-l-none"
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
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
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                      JOD
                                    </span>
                                    <Input 
                                      type="number" 
                                      step="0.01" 
                                      min="0" 
                                      placeholder="0.00" 
                                      className="rounded-l-none"
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  The price bidding will start from
                                </FormDescription>
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
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                      JOD
                                    </span>
                                    <Input 
                                      type="number" 
                                      step="0.01" 
                                      min="0" 
                                      placeholder="0.00" 
                                      className="rounded-l-none"
                                      {...field} 
                                    />
                                  </div>
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
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                      JOD
                                    </span>
                                    <Input 
                                      type="number" 
                                      step="0.01" 
                                      min="0" 
                                      placeholder="0.00" 
                                      className="rounded-l-none"
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Price to instantly buy the item
                                </FormDescription>
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
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Shipping & Location</h3>
                    
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="isDeliveryAvailable"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Do you provide delivery?*</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value || ''}
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="yes" id="delivery-yes" />
                                  <Label htmlFor="delivery-yes">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="no" id="delivery-no" />
                                  <Label htmlFor="delivery-no">No</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                      <FormField
                        control={form.control}
                        name="shipping"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Options</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Free Shipping, +10 JOD Shipping, Local Pickup Only" {...field} />
                            </FormControl>
                            <FormDescription>
                              Specify shipping costs or options for buyers
                            </FormDescription>
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
                                  <SelectValue placeholder="Select your city" />
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
                            <FormDescription>
                              This is where the item is located for pickup
                            </FormDescription>
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
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <div className="flex">
                          <Info className="h-5 w-5 mr-2" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium">Clear photos sell faster</p>
                            <p>Upload at least 4 photos from different angles to increase buyer interest</p>
                          </div>
                        </div>
                      </div>

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
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">Selected Images ({imageUrls.length}/10)</h3>
                            {imageUrls.length < 4 && (
                              <span className="text-amber-600 text-sm flex items-center">
                                <Info className="h-4 w-4 mr-1" />
                                Add {4 - imageUrls.length} more photos for better results
                              </span>
                            )}
                          </div>
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
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6 flex justify-end">
                    <Button 
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="bg-mzad-primary hover:bg-mzad-primary/90"
                    >
                      {isSubmitting || isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isUploading ? 'Uploading...' : 'Processing...'}
                        </>
                      ) : (
                        'List Item'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AddProduct;
