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
  Package2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import PhoneSpecsSelector from '@/components/product/PhoneSpecsSelector';
import DynamicAttributesForm from '@/components/product/DynamicAttributesForm';
import CategorySelector from '@/components/category/CategorySelector';

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
  const [customAttributes, setCustomAttributes] = useState<{ name: string; value: string }[]>([]);
  
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
  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.id);
    form.setValue('category', category.id);
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
        // Convert shipping_options array to string for database storage
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
                              <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
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
                              <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
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
                              <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <CategorySelector 
                                  onCategorySelect={(category) => {
                                    handleCategorySelect(category);
                                    field.onChange(category.id);
                                  }}
                                  onCancel={() => {}}
                                  initialCategoryId={field.value}
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
                              categoryPath={selectedCategory}
                            />
                          )}
                          
                          {/* For other categories */}
                          {selectedCategory && selectedCategory !== 'mobile-phones' && (
                            <DynamicAttributesForm
                              category={{ 
                                id: selectedCategory, 
                                name: selectedCategory, 
                                slug: selectedCategory 
                              }}
                              form={form}
                              customAttributes={customAttributes}
                              setCustomAttributes={setCustomAttributes}
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
                </TabsContent>
                
                {/* ===== SHIPPING TAB ===== */}
                <TabsContent value="shipping" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Truck className="w-5 h-5 mr-2" />
                          Shipping Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Location */}
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item Location <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="City, State" {...field} />
                              </FormControl>
                              <FormDescription>
                                Where is the item located? (City, State)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Shipping Options */}
                        <div>
                          <FormLabel className="block mb-2">Shipping Options</FormLabel>
                          
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
                          
                          <div className="border rounded-md p-4">
                            <h3 className="font-medium mb-3">Shipping Methods</h3>
                            
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
                                        {index === 0 && "Price ($)"}
                                      </FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          step="0.01" 
                                          placeholder="0.00"
                                          disabled={form.watch('free_shipping')} 
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
                              onClick={() => appendShipping({ method: '', price: 0 })}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Shipping Option
                            </Button>
                          </div>
                        </div>
                        
                        {/* Handling Time */}
                        <FormField
                          control={form.control}
                          name="handling_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Handling Time</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-6">
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
                                <Select onValueChange={field.onChange} value={field.value || ""}>
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
                          
                          <FormField
                            control={form.control}
                            name="shipping_worldwide"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Ship Worldwide</FormLabel>
                                  <FormDescription>
                                    You're willing to ship this item internationally
                                  </FormDescription>
                                </div>
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
                        Upload high-quality images of your item (up to 10 images)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                        
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Drag & drop images here or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG or GIF, max 5MB each
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-4"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Images
                        </Button>
                      </div>

                      {/* Image Preview and Management */}
                      {watchedImages.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="font-medium">Uploaded Images ({watchedImages.length}/10)</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {watchedImages.map((image, index) => (
                              <div key={image.id} className="relative group border rounded-lg overflow-hidden aspect-square">
                                <img
                                  src={image.url}
                                  alt={`Product image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-2">
                                  <div className="flex space-x-1">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => moveImage(index, 'up')}
                                      disabled={index === 0}
                                    >
                                      <ArrowRight className="h-4 w-4 -rotate-90" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => moveImage(index, 'down')}
                                      disabled={index === watchedImages.length - 1}
                                    >
                                      <ArrowRight className="h-4 w-4 rotate-90" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => removeImage(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  {index === 0 && (
                                    <Badge className="bg-primary">Main Image</Badge>
                                  )}
                                </div>
                                {index === 0 && (
                                  <Badge className="absolute top-1 left-1 bg-primary">Main</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-sm text-amber-700">
                            <div className="flex">
                              <Info className="h-5 w-5 mr-2" />
                              <div>
                                <p className="font-medium">Image Tips:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                  <li>The first image will be your main listing image</li>
                                  <li>Use well-lit photos against a clean background</li>
                                  <li>Include images from multiple angles</li>
                                  <li>Show any defects or flaws for accurate representation</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('shipping')}
                        className="flex items-center"
                      >
                        Back: Shipping
                      </Button>
                      <div className="flex space-x-2">
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
                          onClick={() => {
                            setIsDraft(false);
                            form.handleSubmit(onSubmit)();
                          }}
                          disabled={isSubmitting || completionScore < 75}
                        >
                          {isSubmitting && !isDraft ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          Create Listing
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
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
