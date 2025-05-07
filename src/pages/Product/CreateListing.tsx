
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// UI Components
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Icons
import {
  Check,
  X,
  Trash2,
  Plus,
  Calendar,
  Upload,
  PencilLine,
  CreditCard,
  Gavel,
  ShoppingCart,
  Save,
  Loader,
  Clock,
  Award,
  FileText,
  Tag,
  Truck,
  Image as ImageIcon,
  MoreHorizontal,
  Info,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PhoneSpecsSelector } from '@/components/product/PhoneSpecsSelector';
import { DynamicAttributesForm } from '@/components/product/DynamicAttributesForm';
import { CategorySelector } from '@/components/category/CategorySelector';

// Create schema for product form
const productSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(30, "Description must be at least 30 characters").max(5000, "Description cannot exceed 5000 characters"),
  category: z.string().min(1, "Please select a category"),
  subcategory: z.string().optional(),
  condition: z.string().min(1, "Please select a condition"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  listing_type: z.enum(['fixed_price', 'auction', 'both']),
  price: z.number().min(0.01, "Price must be greater than 0").optional(),
  is_negotiable: z.boolean().optional(),
  start_price: z.number().min(0.01, "Starting price must be greater than 0").optional(),
  reserve_price: z.number().min(0).optional(),
  auction_duration: z.number().optional(),
  end_time: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  allow_offers: z.boolean().optional(),
  location: z.string().min(1, "Location is required"),
  shipping_options: z.array(
    z.object({
      method: z.string().min(1, "Shipping method is required"),
      price: z.number().min(0, "Shipping price must be 0 or greater"),
    })
  ).optional(),
  free_shipping: z.boolean().optional(),
  local_pickup: z.boolean().optional(),
  shipping_worldwide: z.boolean().optional(),
  shipping_exclusions: z.array(z.string()).optional(),
  handling_time: z.string().optional(),
  return_policy: z.string().optional(),
  warranty: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(
    z.object({
      id: z.string(),
      file: z.any().optional(),
      url: z.string().optional(),
      order: z.number(),
    })
  ).min(1, "At least one image is required"),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  status: z.enum(['active', 'draft']),
});

type ProductFormValues = z.infer<typeof productSchema>;

const CreateListing = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load draft from local storage
  const [savedDraft, setSavedDraft] = useLocalStorage<ProductFormValues | null>('product_draft', null);

  // Define form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: savedDraft || {
      title: '',
      description: '',
      category: '',
      subcategory: '',
      condition: '',
      listing_type: 'fixed_price',
      price: 0,
      is_negotiable: false,
      start_price: 0,
      reserve_price: 0,
      auction_duration: 7,
      quantity: 1,
      allow_offers: false,
      location: '',
      free_shipping: false,
      local_pickup: true,
      shipping_worldwide: false,
      shipping_options: [{ method: 'Standard', price: 0 }],
      tags: [],
      images: [],
      attributes: {},
      status: 'active'
    },
  });

  // Get the field array for images
  const { fields: imageFields, append: appendImage, remove: removeImage, update: updateImage } = 
    useFieldArray({
      control: form.control,
      name: "images"
    });
    
  // Get the field array for shipping options
  const { fields: shippingFields, append: appendShipping, remove: removeShipping } = 
    useFieldArray({
      control: form.control,
      name: "shipping_options"
    });

  const listingType = form.watch('listing_type');
  const watchedImages = form.watch('images');
  
  // Calculate completion score
  useEffect(() => {
    const formData = form.getValues();
    let score = 0;
    const requiredFields = [
      { name: 'title', weight: 15 },
      { name: 'description', weight: 15 },
      { name: 'category', weight: 10 },
      { name: 'condition', weight: 10 },
      { name: 'location', weight: 10 }
    ];
    
    // Check if required fields are filled
    requiredFields.forEach(field => {
      if (formData[field.name as keyof typeof formData]) {
        score += field.weight;
      }
    });
    
    // Check if pricing is set correctly
    if ((listingType === 'fixed_price' || listingType === 'both') && formData.price && formData.price > 0) {
      score += 15;
    }
    
    if ((listingType === 'auction' || listingType === 'both') && formData.start_price && formData.start_price > 0) {
      score += 10;
    }
    
    // Check if images are added
    if (formData.images && formData.images.length > 0) {
      score += Math.min(15, formData.images.length * 5); // Up to 15% for 3+ images
    }
    
    // Shipping details
    if (formData.shipping_options && formData.shipping_options.length > 0) {
      score += 5;
    }
    
    // Extra points for additional details
    if (formData.brand) score += 2;
    if (formData.model) score += 2;
    if (formData.tags && formData.tags.length > 0) score += 1;
    
    setCompletionScore(score);
  }, [form.watch(), listingType]);
  
  // Auto-save as draft
  useEffect(() => {
    const draftTimer = setTimeout(() => {
      const currentValues = form.getValues();
      if (currentValues.title || currentValues.description) {
        setSavedDraft(currentValues);
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 3000);
      }
    }, 10000); // Save every 10 seconds if changes
    
    return () => clearTimeout(draftTimer);
  }, [form.watch(), setSavedDraft]);
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const currentImagesCount = watchedImages.length;
    
    newFiles.forEach((file, index) => {
      if (currentImagesCount + index < 10) { // Limit to 10 images
        const imageUrl = URL.createObjectURL(file);
        appendImage({ 
          id: uuidv4(), 
          file: file, 
          url: imageUrl,
          order: currentImagesCount + index
        });
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle image reordering
  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newImages = [...watchedImages];
      const temp = newImages[index];
      newImages[index] = newImages[index - 1];
      newImages[index - 1] = temp;
      
      // Update order property
      newImages[index].order = index;
      newImages[index - 1].order = index - 1;
      
      // Update form
      form.setValue('images', newImages);
    } 
    else if (direction === 'down' && index < watchedImages.length - 1) {
      const newImages = [...watchedImages];
      const temp = newImages[index];
      newImages[index] = newImages[index + 1];
      newImages[index + 1] = temp;
      
      // Update order property
      newImages[index].order = index;
      newImages[index + 1].order = index + 1;
      
      // Update form
      form.setValue('images', newImages);
    }
  };
  
  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    form.setValue('category', category);
  };
  
  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
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
      
      // Set status based on button clicked
      data.status = isDraft ? 'draft' : 'active';
      
      // Format the end time for auctions
      if ((data.listing_type === 'auction' || data.listing_type === 'both') && data.auction_duration) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + data.auction_duration);
        data.end_time = endDate.toISOString();
      }
      
      // Generate a product ID
      const productId = draftId || uuidv4();
      
      // Upload images first
      const imagePromises = data.images.map(async (image, index) => {
        // If the image was already uploaded (has a URL but no file), skip upload
        if (image.url && !image.url.startsWith('blob:') && !image.file) {
          return {
            id: image.id,
            product_id: productId,
            image_url: image.url,
            display_order: index
          };
        }
        
        if (image.file) {
          // Upload to Supabase storage
          const fileExt = image.file.name.split('.').pop();
          const filePath = `products/${productId}/${image.id}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, image.file);
            
          if (uploadError) {
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }
          
          // Get the public URL
          const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
            
          return {
            id: image.id,
            product_id: productId,
            image_url: publicUrlData.publicUrl,
            display_order: index
          };
        }
        
        return null;
      });
      
      // Wait for all image uploads to complete
      const uploadedImages = (await Promise.all(imagePromises)).filter(Boolean);
      
      // Prepare the product data for database
      const productData = {
        id: productId,
        title: data.title,
        description: data.description,
        price: data.listing_type === 'auction' ? data.start_price : data.price,
        currency: 'USD', // Default to USD for now
        condition: data.condition,
        category: data.category,
        category_id: data.category, // Using category as ID for now
        seller_id: session.user.id,
        location: data.location,
        shipping: JSON.stringify(data.shipping_options || []),
        shipping_fee: data.shipping_options?.[0]?.price || 0,
        is_auction: data.listing_type === 'auction' || data.listing_type === 'both',
        start_price: data.start_price,
        reserve_price: data.reserve_price,
        end_time: data.end_time,
        status: data.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        quantity: data.quantity,
        accept_offers: data.allow_offers,
        brand: data.brand,
        model: data.model,
        color: data.color,
        size: data.size,
        custom_attributes: JSON.stringify(data.attributes || {})
      };
      
      // Insert product into database
      const { error: productError } = await supabase
        .from('products')
        .upsert(productData);
        
      if (productError) {
        throw new Error(`Failed to create listing: ${productError.message}`);
      }
      
      // Insert images into database
      if (uploadedImages.length > 0) {
        const { error: imagesError } = await supabase
          .from('product_images')
          .upsert(uploadedImages);
          
        if (imagesError) {
          throw new Error(`Failed to save product images: ${imagesError.message}`);
        }
      }
      
      // Clear draft from local storage if successful
      setSavedDraft(null);
      setDraftId(productId);
      
      toast({
        title: data.status === 'draft' ? "Draft saved" : "Listing published",
        description: data.status === 'draft' 
          ? "Your listing draft has been saved" 
          : "Your listing is now live and visible to buyers",
        variant: "default",
      });
      
      // Redirect based on status
      if (data.status === 'active') {
        navigate(`/product/${productId}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to check if tab has errors
  const tabHasErrors = (tabName: string) => {
    const errors = form.formState.errors;
    
    switch(tabName) {
      case 'details':
        return !!(errors.title || errors.description || errors.category || errors.condition || 
                  errors.brand || errors.model || errors.year || errors.color || errors.size);
      case 'pricing':
        return !!(errors.listing_type || errors.price || errors.start_price || 
                  errors.reserve_price || errors.auction_duration || errors.quantity);
      case 'shipping':
        return !!(errors.shipping_options || errors.handling_time || 
                  errors.location || errors.shipping_worldwide);
      case 'images':
        return !!(errors.images);
      default:
        return false;
    }
  };
  
  // Render completion indicator
  const renderCompletionIndicator = () => {
    let statusColor = 'bg-red-500';
    let statusText = 'Incomplete';
    
    if (completionScore >= 85) {
      statusColor = 'bg-green-500';
      statusText = 'Complete';
    } else if (completionScore >= 60) {
      statusColor = 'bg-amber-500';
      statusText = 'Almost Complete';
    } else if (completionScore >= 30) {
      statusColor = 'bg-orange-500';
      statusText = 'In Progress';
    }
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Listing Completion: {completionScore}%</span>
          <Badge variant={completionScore >= 85 ? "default" : "outline"} className={`${statusColor === 'bg-green-500' ? 'bg-green-500 hover:bg-green-600' : ''}`}>
            {statusText}
          </Badge>
        </div>
        <Progress value={completionScore} className="h-2" />
      </div>
    );
  };
  
  if (!session?.user) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                You need to be logged in to create a listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please log in to your account to create a listing.</p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => navigate("/auth/login")}>
                Login Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Create Listing</h1>
            <p className="text-muted-foreground mt-1">
              Fill in the details to create your listing
            </p>
          </div>
          
          {renderCompletionIndicator()}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="space-y-6"
              >
                <TabsList className="grid grid-cols-4 md:w-[600px]">
                  <TabsTrigger 
                    value="details" 
                    className="relative"
                    data-error={tabHasErrors('details')}
                  >
                    Details
                    {tabHasErrors('details') && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pricing" 
                    className="relative"
                    data-error={tabHasErrors('pricing')}
                  >
                    Pricing
                    {tabHasErrors('pricing') && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="shipping" 
                    className="relative"
                    data-error={tabHasErrors('shipping')}
                  >
                    Shipping
                    {tabHasErrors('shipping') && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="images" 
                    className="relative"
                    data-error={tabHasErrors('images')}
                  >
                    Images
                    {tabHasErrors('images') && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </TabsTrigger>
                </TabsList>
                
                {/* ===== DETAILS TAB ===== */}
                <TabsContent value="details" className="space-y-6">
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
                              <FormLabel required>Title</FormLabel>
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
                              <FormLabel required>Description</FormLabel>
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
                        
                        {/* Category */}
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required>Category</FormLabel>
                              <FormControl>
                                <CategorySelector 
                                  onCategorySelect={(category) => {
                                    handleCategorySelect(category);
                                    field.onChange(category);
                                  }}
                                  selectedCategory={field.value}
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
                              <FormLabel required>Condition</FormLabel>
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
                                  <Input placeholder="Brand name" {...field} />
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
                                  <Input placeholder="Model number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Render category-specific form fields */}
                          {selectedCategory === 'mobile-phones' && (
                            <PhoneSpecsSelector 
                              onSpecsChange={(specs) => {
                                // Update form values with phone specifications
                                form.setValue('attributes', {
                                  ...form.getValues('attributes'),
                                  ...specs
                                });
                              }}
                              currentValues={form.getValues('attributes')}
                            />
                          )}
                          
                          {/* For other categories */}
                          {selectedCategory && selectedCategory !== 'mobile-phones' && (
                            <DynamicAttributesForm
                              category={selectedCategory}
                              onAttributesChange={(attrs) => {
                                form.setValue('attributes', {
                                  ...form.getValues('attributes'),
                                  ...attrs
                                });
                              }}
                              currentValues={form.getValues('attributes')}
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
                </TabsContent>
                
                {/* ===== PRICING TAB ===== */}
                <TabsContent value="pricing" className="space-y-6">
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
                              <FormLabel required>Listing Type</FormLabel>
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
                                  <FormLabel required>Price ($)</FormLabel>
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
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Price is negotiable
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="allow_offers"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Allow buyers to make offers
                                    </FormLabel>
                                  </div>
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
                                  <FormLabel required>Starting Price ($)</FormLabel>
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
                                    Minimum price you'll accept (optional)
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
                                  <FormLabel required>Duration (days)</FormLabel>
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
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Inventory
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Quantity */}
                          <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel required>Quantity</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    step="1"
                                    placeholder="1" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    disabled={listingType === 'auction'}
                                  />
                                </FormControl>
                                {listingType === 'auction' && (
                                  <FormDescription>
                                    Auctions are limited to quantity of 1
                                  </FormDescription>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* SKU/Item ID (if managing inventory) */}
                          <FormField
                            control={form.control}
                            name="sku"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SKU/Item ID (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your inventory reference" {...field} />
                                </FormControl>
                                <FormDescription>
                                  For your internal inventory tracking
                                </FormDescription>
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
                          onClick={() => setActiveTab('details')}
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
                </TabsContent>
                
                {/* ===== SHIPPING TAB ===== */}
                <TabsContent value="shipping" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Truck className="w-5 h-5 mr-2" />
                          Shipping Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Location */}
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required>Item Location</FormLabel>
                              <FormControl>
                                <Input placeholder="City, State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Shipping Methods */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label>Shipping Methods</Label>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => appendShipping({ method: '', price: 0 })}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add Method
                            </Button>
                          </div>
                          
                          {shippingFields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-2">
                              <FormField
                                control={form.control}
                                name={`shipping_options.${index}.method`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input placeholder="Shipping method" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`shipping_options.${index}.price`}
                                render={({ field }) => (
                                  <FormItem className="w-24">
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="Price" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeShipping(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Shipping Options */}
                        <div className="space-y-3 pt-2">
                          <FormField
                            control={form.control}
                            name="free_shipping"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Offer free shipping
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="local_pickup"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Allow local pickup
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="shipping_worldwide"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Ship worldwide
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Handling Time */}
                        <FormField
                          control={form.control}
                          name="handling_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Handling Time</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select handling time" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="same_day">Same Business Day</SelectItem>
                                  <SelectItem value="1_day">1 Business Day</SelectItem>
                                  <SelectItem value="2_days">2 Business Days</SelectItem>
                                  <SelectItem value="3_days">3 Business Days</SelectItem>
                                  <SelectItem value="5_days">5 Business Days</SelectItem>
                                  <SelectItem value="10_days">10 Business Days</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Award className="w-5 h-5 mr-2" />
                            Return Policy
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Return Policy */}
                          <FormField
                            control={form.control}
                            name="return_policy"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Return Policy</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select return policy" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="no_returns">No Returns</SelectItem>
                                    <SelectItem value="30_days">30 Days Return</SelectItem>
                                    <SelectItem value="14_days">14 Days Return</SelectItem>
                                    <SelectItem value="7_days">7 Days Return</SelectItem>
                                    <SelectItem value="custom">Custom Policy</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Warranty Information */}
                          <FormField
                            control={form.control}
                            name="warranty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Warranty</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select warranty option" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">No Warranty</SelectItem>
                                    <SelectItem value="30_days">30 Days</SelectItem>
                                    <SelectItem value="60_days">60 Days</SelectItem>
                                    <SelectItem value="90_days">90 Days</SelectItem>
                                    <SelectItem value="6_months">6 Months</SelectItem>
                                    <SelectItem value="1_year">1 Year</SelectItem>
                                    <SelectItem value="manufacturer">Manufacturer Warranty</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Tags */}
                          <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tags (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter tags separated by commas" 
                                    {...field}
                                    value={field.value?.join(', ') || ''}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      const tags = value.split(',')
                                        .map(tag => tag.trim())
                                        .filter(tag => tag.length > 0);
                                      field.onChange(tags);
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Add relevant keywords to help buyers find your item
                                </FormDescription>
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
                          onClick={() => setActiveTab('pricing')}
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
                </TabsContent>
                
                {/* ===== IMAGES TAB ===== */}
                <TabsContent value="images" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Product Images
                      </CardTitle>
                      <CardDescription>
                        Add up to 10 images. First image will be the main display image.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                              {/* Image upload button */}
                              {watchedImages.length < 10 && (
                                <div 
                                  className="border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4 h-40 cursor-pointer hover:border-primary transition-colors"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                  <p className="text-sm text-center text-muted-foreground">
                                    Click to upload
                                  </p>
                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                  />
                                </div>
                              )}
                              
                              {/* Display uploaded images */}
                              {watchedImages.map((image, index) => (
                                <div
                                  key={image.id}
                                  className="relative border rounded-md overflow-hidden group h-40"
                                >
                                  {/* Main image indicator */}
                                  {index === 0 && (
                                    <Badge className="absolute top-2 left-2 z-10">
                                      Main
                                    </Badge>
                                  )}
                                  
                                  {/* Image */}
                                  <img
                                    src={image.url}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  
                                  {/* Image controls */}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                    <div className="flex justify-end">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white"
                                        onClick={() => removeImage(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white"
                                        onClick={() => moveImage(index, 'up')}
                                        disabled={index === 0}
                                      >
                                        <ArrowRight className="h-4 w-4 rotate-180" />
                                      </Button>
                                      
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white"
                                        onClick={() => moveImage(index, 'down')}
                                        disabled={index === watchedImages.length - 1}
                                      >
                                        <ArrowRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('shipping')}
                    >
                      Back: Shipping
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDraft(true);
                          form.handleSubmit(onSubmit)();
                        }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && isDraft ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save as Draft
                      </Button>
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || completionScore < 60}
                        onClick={() => setIsDraft(false)}
                      >
                        {isSubmitting && !isDraft ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Tag className="mr-2 h-4 w-4" />
                        )}
                        Publish Listing
                      </Button>
                    </div>
                  </div>
                  
                  {draftSaved && (
                    <div className="flex items-center gap-2 text-sm text-green-600 justify-center mt-2">
                      <Check className="h-4 w-4" />
                      <span>Draft saved automatically</span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateListing;
