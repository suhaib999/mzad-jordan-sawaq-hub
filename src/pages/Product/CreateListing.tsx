
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
import { 
  X, 
  Plus, 
  Upload, 
  Loader2, 
  Info, 
  ShieldCheck, 
  Save,
  ArrowLeft,
  ArrowRight,
  Package,
  Truck,
  Tag,
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategorySelectDialog from '@/components/category/CategorySelectDialog';
import CategoryDisplay from '@/components/category/CategoryDisplay';
import { Category, findCategoryById } from '@/data/categories';
import DynamicAttributesForm from '@/components/product/DynamicAttributesForm';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from '@/components/ui/separator';

// Define conditions
const conditions = [
  "New",
  "Like New",
  "Very Good",
  "Good",
  "Acceptable",
  "For Parts or Not Working"
];

// Define locations
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

// Define the form schema using zod
const listingSchema = z.object({
  // Basic details
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description cannot exceed 2000 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  condition: z.string().min(1, "Please select a condition"),
  location: z.string().optional(),
  
  // Pricing & listing type
  listingType: z.enum(["fixed", "auction", "both"]),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }).optional(),
  currency: z.string().default("JOD"),
  
  // Auction details
  startPrice: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
    { message: "Starting price must be a positive number" }
  ),
  reservePrice: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
    { message: "Reserve price must be a positive number" }
  ),
  endDate: z.string().optional().refine(
    (val) => !val || new Date(val) > new Date(),
    { message: "End date must be in the future" }
  ),
  endTime: z.string().optional(),
  
  // Inventory & shipping
  quantity: z.number().int().positive("Quantity must be a positive number").default(1),
  isDeliveryAvailable: z.boolean().default(false),
  shippingOptions: z.string().optional(),
  shippingFee: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
    { message: "Shipping fee must be a non-negative number" }
  ),
  
  // Item specifics (will be extended dynamically)
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  
  // Additional fields
  tags: z.string().optional(),
  acceptOffers: z.boolean().default(false),
  isDraft: z.boolean().default(false),
  
  // Custom attributes (will be handled separately)
  customAttributes: z.array(
    z.object({
      name: z.string(),
      value: z.string()
    })
  ).default([]),
});

type FormValues = z.infer<typeof listingSchema>;

const CreateListing = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [listingType, setListingType] = useState<"fixed" | "auction" | "both">("fixed");
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [completionScore, setCompletionScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customAttributes, setCustomAttributes] = useState<{name: string; value: string}[]>([]);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      condition: "",
      location: "",
      listingType: "fixed",
      price: "",
      currency: "JOD",
      startPrice: "",
      reservePrice: "",
      endDate: "",
      endTime: "",
      quantity: 1,
      isDeliveryAvailable: false,
      shippingOptions: "",
      shippingFee: "",
      brand: "",
      model: "",
      color: "",
      size: "",
      tags: "",
      acceptOffers: false,
      isDraft: false,
      customAttributes: []
    },
    mode: "onChange"
  });
  
  // Handle image upload
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
  
  // Remove uploaded image
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
  
  // Reorder images
  const moveImage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === images.length - 1)) {
      return;
    }
    
    const newImages = [...images];
    const newImageUrls = [...imageUrls];
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap images
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    [newImageUrls[index], newImageUrls[targetIndex]] = [newImageUrls[targetIndex], newImageUrls[index]];
    
    setImages(newImages);
    setImageUrls(newImageUrls);
  };
  
  // Upload images to storage
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
  
  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    form.setValue('categoryId', category.id);
    form.trigger('categoryId');
    updateCompletionScore();
  };
  
  // Calculate completion score
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
    if (
      (formValues.listingType === 'fixed' && formValues.price) || 
      (formValues.listingType === 'auction' && formValues.startPrice && formValues.endDate && formValues.endTime) ||
      (formValues.listingType === 'both' && formValues.price && formValues.startPrice && formValues.endDate)
    ) {
      score++;
    }
    
    // Optional fields
    const optionalFields = ['location', 'shippingOptions', 'shippingFee'];
    optionalFields.forEach(field => {
      totalFields += 0.5;
      if (formValues[field as keyof FormValues]) {
        score += 0.5;
      }
    });
    
    // Category-specific fields
    if (selectedCategory) {
      const categorySpecificFields = ['brand', 'model', 'color', 'size'];
      const categoryName = selectedCategory.name.toLowerCase();
      
      // Electronics generally have brand and model
      if (categoryName.includes('electronics') || 
          categoryName.includes('phone') || 
          categoryName.includes('computer')) {
        
        totalFields += 1;
        if (formValues.brand && formValues.model) {
          score += 1;
        }
      }
      
      // Fashion has color and size
      if (categoryName.includes('fashion') || 
          categoryName.includes('clothing') || 
          categoryName.includes('shoes')) {
        
        totalFields += 1;
        if (formValues.color && formValues.size) {
          score += 1;
        }
      }
    }
    
    // Custom attributes
    if (customAttributes.length > 0) {
      totalFields += 0.5;
      score += 0.5;
    }
    
    // Calculate percentage
    const percentage = Math.min(100, Math.round((score / totalFields) * 100));
    setCompletionScore(percentage);
  };
  
  // Update when form values change
  useEffect(() => {
    const subscription = form.watch(() => updateCompletionScore());
    return () => subscription.unsubscribe();
  }, [form.watch, selectedCategory, customAttributes]);
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (!session?.user) {
        toast.error("You must be logged in to create a listing");
        navigate('/auth/login');
        return;
      }
      
      // For non-draft listings, validate images
      if (!saveAsDraft && images.length === 0) {
        toast.error("Please add at least one product image");
        setActiveTab("images");
        setIsSubmitting(false);
        return;
      }
      
      // For auction listings, validate required fields
      if ((values.listingType === "auction" || values.listingType === "both") && !saveAsDraft) {
        if (!values.startPrice) {
          toast.error("Please set a starting price for your auction");
          setActiveTab("pricing");
          setIsSubmitting(false);
          return;
        }
        
        if (!values.endDate || !values.endTime) {
          toast.error("Please set an end date and time for your auction");
          setActiveTab("pricing");
          setIsSubmitting(false);
          return;
        }
      }
      
      // For fixed price listings, validate price
      if ((values.listingType === "fixed" || values.listingType === "both") && !saveAsDraft && !values.price) {
        toast.error("Please set a price for your listing");
        setActiveTab("pricing");
        setIsSubmitting(false);
        return;
      }
      
      const productId = uuidv4();
      
      // Prepare end time for auctions
      let endTime = null;
      if ((values.listingType === "auction" || values.listingType === "both") && values.endDate) {
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
      
      // Enhanced title formatting
      let enhancedTitle = values.title;
      if (values.brand && values.model) {
        // Only enhance if title doesn't already mention brand/model
        if (!enhancedTitle.toLowerCase().includes(values.brand.toLowerCase()) && 
            !enhancedTitle.toLowerCase().includes(values.model.toLowerCase())) {
          const formattedTitle = [values.brand, values.model];
          
          if (values.color) formattedTitle.push(values.color);
          if (values.size) formattedTitle.push(values.size);
          
          enhancedTitle = `${formattedTitle.join(' ')} - ${enhancedTitle}`;
        }
      }
      
      // Set appropriate price values based on listing type
      const price = values.listingType === "fixed" || values.listingType === "both" 
        ? Number(values.price) 
        : values.startPrice ? Number(values.startPrice) : 0;
      
      // Create product data object
      const productData = {
        id: productId,
        title: enhancedTitle,
        description: values.description,
        price: price,
        currency: values.currency,
        condition: values.condition,
        category: categoryPath,
        category_id: values.categoryId,
        seller_id: session.user.id,
        location: values.location || null,
        shipping: values.shippingOptions || null,
        shipping_fee: values.shippingFee ? Number(values.shippingFee) : null,
        is_auction: values.listingType === "auction" || values.listingType === "both",
        start_price: (values.listingType === "auction" || values.listingType === "both") ? Number(values.startPrice) : null,
        current_bid: (values.listingType === "auction" || values.listingType === "both") ? Number(values.startPrice) : null,
        reserve_price: (values.listingType === "auction" || values.listingType === "both") && values.reservePrice ? Number(values.reservePrice) : null,
        end_time: endTime,
        status: saveAsDraft ? 'draft' : 'active',
        quantity: values.quantity,
        accept_offers: values.acceptOffers,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        brand: values.brand || null,
        model: values.model || null,
        color: values.color || null,
        size: values.size || null,
        custom_attributes: customAttributes.length > 0 ? JSON.stringify(customAttributes) : null,
      };
      
      console.log("Submitting product data:", productData);
      
      // Insert product into database
      const { error: productError } = await supabase
        .from('products')
        .insert(productData);
        
      if (productError) {
        console.error("Product insert error:", productError);
        throw new Error(productError.message);
      }
      
      // Upload images if any
      if (images.length > 0) {
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
      }
      
      toast.success(saveAsDraft ? "Draft saved successfully!" : "Listing created successfully!");
      navigate(saveAsDraft ? "/profile/drafts" : `/product/${productId}`);
      
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(`Error creating listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle draft saving
  const handleSaveAsDraft = () => {
    setSaveAsDraft(true);
    form.setValue('isDraft', true);
    
    // Run form validation but with fewer required fields
    form.trigger(['title', 'categoryId']).then(isValid => {
      if (isValid || form.getValues('title')) {
        form.handleSubmit(onSubmit)();
      } else {
        toast.error("Please add at least a title to save as draft");
        setSaveAsDraft(false);
        form.setValue('isDraft', false);
      }
    });
  };
  
  // Update listingType state when form field changes
  const watchListingType = form.watch("listingType");
  useEffect(() => {
    if (watchListingType !== listingType) {
      setListingType(watchListingType as "fixed" | "auction" | "both");
    }
  }, [watchListingType]);
  
  // Update category when categoryId changes
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Create a Listing</h1>
          <Button 
            variant="outline" 
            onClick={handleSaveAsDraft}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Save size={16} />
            Save as Draft
          </Button>
        </div>
        
        {/* Completion meter */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{completionScore}% Complete</span>
              <div className="text-xs text-gray-500">(higher score attracts more views)</div>
            </div>
            
            {completionScore >= 80 ? (
              <Badge className="bg-green-500 text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" /> Perfect Listing
              </Badge>
            ) : completionScore >= 60 ? (
              <Badge className="bg-amber-500 text-xs">Good Listing</Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-gray-100">Basic Listing</Badge>
            )}
          </div>
          <Progress value={completionScore} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">
            Complete all the details to increase visibility and sell faster.
          </p>
        </div>
        
        {/* Main form area with tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className="relative">
              Details
              {completionScore < 70 && activeTab !== "details" && (
                <span className="absolute top-0 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="images" className="relative">
              Images
              {images.length === 0 && activeTab !== "images" && (
                <span className="absolute top-0 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pricing" className="relative">
              Pricing
              {((!form.getValues('price') && listingType !== 'auction') || 
               (!form.getValues('startPrice') && listingType !== 'fixed')) && 
                activeTab !== "pricing" && (
                <span className="absolute top-0 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="shipping" className="relative">
              Shipping
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Details Tab */}
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
                      
                      {/* Basic Listing Details */}
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
                                      <label htmlFor={`condition-${condition}`} className="cursor-pointer">{condition}</label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
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
                                  Where the item is located
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Tags input */}
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-base">Tags (separated by commas)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. smartphone, electronics, samsung" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Add keywords to help buyers find your item
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Quantity/Inventory */}
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-base">Quantity Available</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  step={1}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  value={field.value}
                                />
                              </FormControl>
                              <FormDescription>
                                How many items are you selling? Will decrease with each sale
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Dynamic category-specific attributes */}
                    {selectedCategory && (
                      <div className="mt-6 pt-4 border-t">
                        <h3 className="text-lg font-medium mb-4">Item Specifics</h3>
                        <DynamicAttributesForm 
                          category={selectedCategory}
                          form={form}
                          customAttributes={customAttributes}
                          setCustomAttributes={setCustomAttributes}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Images Tab */}
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
                                <div className="absolute top-1 right-1 flex space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="bg-white/80 hover:bg-white text-red-500 rounded-full p-1"
                                    aria-label="Remove image"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="absolute bottom-1 right-1 flex space-x-1">
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => moveImage(index, 'up')}
                                      className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-1"
                                      aria-label="Move image up"
                                    >
                                      <ArrowLeft className="h-4 w-4" />
                                    </button>
                                  )}
                                  {index < imageUrls.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => moveImage(index, 'down')}
                                      className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-1"
                                      aria-label="Move image down"
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
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
                      
                      <div className="pt-4">
                        <h3 className="text-base font-medium mb-3">Image Tips:</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start">
                            <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            Use natural lighting and a clean background
                          </li>
                          <li className="flex items-start">
                            <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            Include photos from multiple angles
                          </li>
                          <li className="flex items-start">
                            <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            Show any flaws or damage for transparency
                          </li>
                          <li className="flex items-start">
                            <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            Include original packaging if available
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pricing Tab */}
              <TabsContent value="pricing">
                <Card>
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
                                className="flex flex-col space-y-3"
                              >
                                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                                  <RadioGroupItem value="fixed" id="fixed" />
                                  <div className="flex-1">
                                    <label htmlFor="fixed" className="font-medium cursor-pointer flex items-center">
                                      <Tag className="h-4 w-4 mr-2 text-mzad-primary" />
                                      Fixed Price
                                    </label>
                                    <p className="text-sm text-gray-500 ml-6">Sell to the first buyer who pays your price</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                                  <RadioGroupItem value="auction" id="auction" />
                                  <div className="flex-1">
                                    <label htmlFor="auction" className="font-medium cursor-pointer flex items-center">
                                      <Package className="h-4 w-4 mr-2 text-mzad-primary" />
                                      Auction
                                    </label>
                                    <p className="text-sm text-gray-500 ml-6">Let buyers bid and sell to the highest bidder</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                                  <RadioGroupItem value="both" id="both" />
                                  <div className="flex-1">
                                    <label htmlFor="both" className="font-medium cursor-pointer flex items-center">
                                      <Package className="h-4 w-4 mr-2 text-mzad-primary" />
                                      Auction with Buy Now
                                    </label>
                                    <p className="text-sm text-gray-500 ml-6">Buyers can bid or purchase immediately at your fixed price</p>
                                  </div>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Fixed price fields */}
                      <div className={listingType === "fixed" || listingType === "both" ? "block border-t pt-4" : "hidden"}>
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <Tag className="h-5 w-5 mr-2 text-mzad-primary" />
                          Fixed Price Details
                        </h3>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price*</FormLabel>
                                <FormControl>
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                      <DollarSign className="h-4 w-4" />
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
                        
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="acceptOffers"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1">
                                  <FormLabel>Allow buyers to make offers</FormLabel>
                                  <FormDescription>
                                    Let potential buyers suggest prices below your listing price
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* Auction fields */}
                      <div className={listingType === "auction" || listingType === "both" ? "block border-t pt-4" : "hidden"}>
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <Package className="h-5 w-5 mr-2 text-mzad-primary" />
                          Auction Details
                        </h3>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Starting Price*</FormLabel>
                                <FormControl>
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                      <DollarSign className="h-4 w-4" />
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
                                      <DollarSign className="h-4 w-4" />
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
                        
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date*</FormLabel>
                                <FormControl>
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                      <Calendar className="h-4 w-4" />
                                    </span>
                                    <Input 
                                      type="date" 
                                      className="rounded-l-none"
                                      min={new Date().toISOString().split('T')[0]}
                                      {...field} 
                                    />
                                  </div>
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
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                      <Clock className="h-4 w-4" />
                                    </span>
                                    <Input 
                                      type="time" 
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Shipping Tab */}
              <TabsContent value="shipping">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium mb-4 flex items-center">
                        <Truck className="h-5 w-5 mr-2 text-mzad-primary" />
                        Shipping & Delivery Options
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="isDeliveryAvailable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Offer delivery</FormLabel>
                              <FormDescription>
                                Enable if you can deliver or ship this item to buyers
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('isDeliveryAvailable') && (
                        <>
                          <FormField
                            control={form.control}
                            name="shippingOptions"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel className="text-base">Shipping Options</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. Standard shipping, Express delivery, Local pickup" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="shippingFee"
                            render={({ field }) => (
                              <FormItem className="mb-4">
                                <FormLabel className="text-base">Shipping Fee</FormLabel>
                                <FormControl>
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                      <DollarSign className="h-4 w-4" />
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
                                  Leave empty if shipping is free or included in the price
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      
                      {!form.watch('isDeliveryAvailable') && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-600">
                            You have indicated that delivery is not available. Buyers will need to arrange pickup from your location.
                          </p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="pt-2">
                        <h3 className="text-base font-medium mb-3">Listing Summary</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Category:</span>
                              <span className="font-medium">{selectedCategory?.name || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Listing Type:</span>
                              <span className="font-medium">
                                {listingType === 'fixed' ? 'Fixed Price' : 
                                 listingType === 'auction' ? 'Auction' : 'Auction with Buy Now'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-medium">
                                {(listingType === 'fixed' || listingType === 'both') && form.watch('price') 
                                  ? `${form.watch('price')} ${form.watch('currency')}` 
                                  : 'Not set'}
                              </span>
                            </div>
                            {(listingType === 'auction' || listingType === 'both') && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Starting Bid:</span>
                                <span className="font-medium">
                                  {form.watch('startPrice') 
                                    ? `${form.watch('startPrice')} ${form.watch('currency')}` 
                                    : 'Not set'}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quantity:</span>
                              <span className="font-medium">{form.watch('quantity')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Delivery:</span>
                              <span className="font-medium">{form.watch('isDeliveryAvailable') ? 'Available' : 'Not available'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
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
                        'Create Listing'
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

export default CreateListing;
