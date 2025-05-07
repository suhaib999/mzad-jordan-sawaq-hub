
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

// UI Components
import Layout from '@/components/layout/Layout';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Custom Components
import TabsDetails from '@/components/product/listing/TabsDetails';
import TabsPricing from '@/components/product/listing/TabsPricing';
import TabsShipping from '@/components/product/listing/TabsShipping';
import TabsImages from '@/components/product/listing/TabsImages';
import CompletionIndicator from '@/components/product/listing/CompletionIndicator';
import AuthCheck from '@/components/product/listing/AuthCheck';

// Types
import { ProductFormValues, productSchema, Category } from '@/types/product';

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
    console.log("Form submitted with data:", data);
    
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
      
      console.log("Starting image uploads...");
      
      // Wait for all image uploads to complete
      const uploadedImages = (await Promise.all(imagePromises)).filter(Boolean);
      
      console.log(`Uploaded ${uploadedImages.length} images successfully`);
      
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
      
      console.log("Inserting product data into database...", productData);
      
      // Insert product into database
      const { error: productError } = await supabase
        .from('products')
        .upsert(productData);
        
      if (productError) {
        console.error("Error inserting product:", productError);
        throw new Error(`Failed to create listing: ${productError.message}`);
      }
      
      console.log("Product created successfully");
      
      // Insert images into database
      if (uploadedImages.length > 0) {
        console.log("Saving image references to database...");
        const { error: imagesError } = await supabase
          .from('product_images')
          .upsert(uploadedImages);
          
        if (imagesError) {
          console.error("Error saving images:", imagesError);
          throw new Error(`Failed to save product images: ${imagesError.message}`);
        }
        
        console.log("Product images saved successfully");
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
      console.error("Submission error:", error);
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

  // Check if user is authenticated
  if (!session?.user) {
    return (
      <Layout>
        <AuthCheck session={session} />
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
          
          <CompletionIndicator completionScore={completionScore} />
          
          <Form {...form}>
            <form>
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
                
                {/* Details Tab */}
                <TabsContent value="details">
                  <TabsDetails 
                    form={form}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    customAttributes={customAttributes}
                    setCustomAttributes={setCustomAttributes}
                    handleCategorySelect={handleCategorySelect}
                    setActiveTab={setActiveTab}
                  />
                </TabsContent>
                
                {/* Pricing Tab */}
                <TabsContent value="pricing">
                  <TabsPricing 
                    form={form}
                    listingType={listingType}
                    setActiveTab={setActiveTab}
                  />
                </TabsContent>
                
                {/* Shipping Tab */}
                <TabsContent value="shipping">
                  <TabsShipping 
                    form={form}
                    setActiveTab={setActiveTab}
                  />
                </TabsContent>
                
                {/* Images Tab */}
                <TabsContent value="images">
                  <TabsImages 
                    form={form}
                    watchedImages={watchedImages}
                    handleImageUpload={handleImageUpload}
                    moveImage={moveImage}
                    removeImage={(index) => removeImage(index)}
                    fileInputRef={fileInputRef}
                    isSubmitting={isSubmitting}
                    isDraft={isDraft}
                    setIsDraft={setIsDraft}
                    onSubmit={onSubmit}
                    completionScore={completionScore}
                    setActiveTab={setActiveTab}
                  />
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
