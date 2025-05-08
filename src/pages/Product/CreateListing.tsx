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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

// Custom Components
import TabsDetails from '@/components/product/listing/TabsDetails';
import TabsPricing from '@/components/product/listing/TabsPricing';
import TabsShipping from '@/components/product/listing/TabsShipping';
import TabsImages from '@/components/product/listing/TabsImages';
import CompletionIndicator from '@/components/product/listing/CompletionIndicator';
import RequireAuth from '@/components/auth/RequireAuth';
import { Button } from '@/components/ui/button';

// Types and Services
import { ProductFormValues, productSchema } from '@/types/product';
import { createOrUpdateProduct } from '@/services/product/productService';

// Update the ProductFormValues type to include the id property
// We'll extend it locally since we don't want to modify the original type file
interface ExtendedProductFormValues extends ProductFormValues {
  id?: string;
}

const CreateListing = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);
  const [loadDraftDialogOpen, setLoadDraftDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [customAttributes, setCustomAttributes] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savedDraft, setSavedDraft] = useLocalStorage<ExtendedProductFormValues>('product_draft', null);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Initialize form
  const form = useForm<ExtendedProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      subcategory: '',
      condition: '',
      listing_type: 'fixed_price',
      price: undefined,
      is_negotiable: false,
      start_price: undefined,
      reserve_price: undefined,
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
    mode: 'onBlur' // Validate fields when they lose focus
  });

  // Image field array and watch
  const { fields: imageFields, append: appendImage, remove: removeImage, update: updateImage } = useFieldArray({
    control: form.control,
    name: "images"
  });
  const watchedImages = form.watch('images');

  // Calculate completion score
  useEffect(() => {
    const formData = form.getValues();
    let score = 0;
    const total = 100;

    // Required fields
    if (formData.title) score += 20;
    if (formData.description) score += 20;
    if (formData.category) score += 10;

    // Price requirements based on listing type
    if (formData.listing_type === 'auction') {
      if (formData.start_price) score += 15;
      if (formData.reserve_price) score += 15;
      if (formData.auction_duration) score += 20;
    } else {
      if (formData.price) score += 20;
    }

    // Images
    if (formData.images && formData.images.length > 0) {
      score += 20;
    }

    setCompletionScore(Math.round((score / total) * 100));
  }, [form]);

  // Load saved draft into form
  const loadDraft = () => {
    if (savedDraft) {
      console.log("Loading saved draft:", savedDraft);
      
      // Process images to ensure they have proper format
      const processedImages = savedDraft.images ? savedDraft.images.map((img, idx) => ({
        id: img.id || uuidv4(),
        url: img.url || '',
        file: null, // We can't store file objects in localStorage
        order: img.order || idx
      })) : [];
      
      form.reset({
        ...savedDraft,
        brand: savedDraft.brand || '',
        model: savedDraft.model || '',
        year: savedDraft.year || '',
        color: savedDraft.color || '',
        size: savedDraft.size || '',
        price: savedDraft.price || undefined,
        start_price: savedDraft.start_price || undefined,
        reserve_price: savedDraft.reserve_price || undefined,
        auction_duration: savedDraft.auction_duration || 7,
        handling_time: savedDraft.handling_time || '',
        return_policy: savedDraft.return_policy || '',
        images: processedImages
      });
      
      // Set selected category
      if (savedDraft.category) {
        setSelectedCategory(savedDraft.category);
      }
      
      // Set draft ID if it exists
      if (savedDraft.id) {
        setDraftId(savedDraft.id);
      }
      
      toast({
        title: "Draft loaded",
        description: "Your saved draft has been loaded successfully",
      });
      
      setLoadDraftDialogOpen(false);
    }
  };

  // Discard draft
  const discardDraft = () => {
    setSavedDraft(null);
    setHasDraft(false);
    form.reset();
    setSelectedCategory('');
    setDraftId(null);
    setDiscardDialogOpen(false);
    
    toast({
      title: "Draft discarded",
      description: "Your draft has been discarded",
    });
  };

  // Auto-save as draft
  useEffect(() => {
    const draftTimer = setTimeout(() => {
      const currentValues = form.getValues();
      if (currentValues.title || currentValues.description) {
        // Make sure images are properly serialized
        const draftToSave = {
          ...currentValues,
          images: currentValues.images?.map(img => ({
            id: img.id,
            url: img.url,
            order: img.order,
            file: img.file // Include the file property for draft
          }))
        };
        
        setSavedDraft(draftToSave as ExtendedProductFormValues);
        setDraftSaved(true);
        setHasDraft(true);
        setTimeout(() => setDraftSaved(false), 3000);
      }
    }, 10000); // Save every 10 seconds

    return () => clearTimeout(draftTimer);
  }, [form.getValues()]);

  // Handle form submission
  const onSubmit = async (data?: ProductFormValues) => {
    const formData = data || form.getValues();
    setIsSubmitting(true);

    // Validate user
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // Validate required fields
      if (!formData.title) {
        throw new Error('Title is required');
      }
      if (!formData.description) {
        throw new Error('Description is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (!formData.images || formData.images.length === 0) {
        throw new Error('At least one image is required');
      }

      // Validate pricing based on listing type
      if (formData.listing_type === 'fixed_price' || formData.listing_type === 'both') {
        if (!formData.price || formData.price <= 0) {
          throw new Error('Price is required for fixed price listings');
        }
      }
      if (formData.listing_type === 'auction' || formData.listing_type === 'both') {
        if (!formData.start_price || formData.start_price <= 0) {
          throw new Error('Starting price is required for auctions');
        }
      }

      // Prepare product data
      const productData = {
        ...formData,
        user_id: user.id,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create or update product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (productError) {
        throw new Error(productError.message || 'Failed to create product');
      }

      // Handle image uploads
      const uploadedImages: { id: string; url: string; order: number }[] = [];
      const productId = product.id;

      for (const image of formData.images || []) {
        let imageUrl = image.url;

        // Only upload images that haven't been uploaded already
        if (image.file && (imageUrl.startsWith('blob:') || !imageUrl.includes('storage'))) {
          const fileExt = image.file.name.split('.').pop();
          const filePath = `products/${productId}/${image.id}.${fileExt}`;

          try {
            // Create storage bucket if it doesn't exist
            const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('images');
            if (bucketError && bucketError.message.includes('does not exist')) {
              await supabase.storage.createBucket('images', {
                public: true
              });
            }

            // Upload the file
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('images')
              .upload(filePath, image.file, {
                cacheControl: '3600',
                upsert: true
              });

            if (uploadError) {
              throw new Error(uploadError.message || 'Failed to upload image');
            }

            // Get the public URL
            const { data: publicUrlData } = await supabase.storage
              .from('images')
              .getPublicUrl(filePath);

            imageUrl = publicUrlData.publicUrl;

            // Add to uploaded images
            uploadedImages.push({
              id: image.id,
              url: imageUrl,
              order: image.order || 0
            });
          } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
          }
        } else {
          // Add existing image to uploaded images
          uploadedImages.push({
            id: image.id,
            url: imageUrl,
            order: image.order || 0
          });
        }
      }

      // Update product with image URLs
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: uploadedImages })
        .eq('id', productId);

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update product images');
      }

      // Save draft if it exists
      if (draftId) {
        try {
          await saveDraft(formData, draftId);
        } catch (error) {
          console.error('Error saving draft:', error);
          toast({
            title: 'Warning',
            description: 'Failed to save draft, but product was created successfully',
            variant: 'warning'
          });
        }
      }

      // Navigate to product page
      navigate(`/product/${productId}`);

      toast({
        title: 'Success',
        description: 'Product created successfully',
        variant: 'default'
      });

      // Reset form and state
      form.reset();
      setIsSubmitting(false);
      setIsDraft(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create product',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    const productId = uuidv4(); // Generate a new product ID for the images

    try {
      const uploadedImages = [];
      const formData = form.getValues();

      for (const image of formData.images || []) {
        let imageUrl = image.url;

        // Only upload images that haven't been uploaded already
        if (image.file && (imageUrl.startsWith('blob:') || !imageUrl.includes('storage'))) {
          const fileExt = image.file.name.split('.').pop();
          const filePath = `products/${productId}/${image.id}.${fileExt}`;

          try {
            // Create storage bucket if it doesn't exist
            const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('images');
            if (bucketError && bucketError.message.includes('does not exist')) {
              await supabase.storage.createBucket('images', {
                public: true
              });
            }

            // Upload the file
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('images')
              .upload(filePath, image.file);

            if (uploadError) {
              console.error("Upload error:", uploadError);
              throw new Error(`Image upload failed: ${uploadError.message}`);
            }

            // Get the public URL
            const { data: publicUrlData } = await supabase.storage
              .from('images')
              .getPublicUrl(filePath);

            imageUrl = publicUrlData.publicUrl;

            // Add to uploaded images
            uploadedImages.push({
              id: image.id,
              url: imageUrl,
              order: image.order || 0
            });
          } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
          }
        } else {
          // Add existing image to uploaded images
          uploadedImages.push({
            id: image.id,
            url: imageUrl,
            order: image.order || 0
          });
        }
      }

      // Update form with uploaded images
      uploadedImages.forEach((image, index) => {
        updateImage(index, image);
      });

      toast({
        title: "Success",
        description: "Images uploaded successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive"
      });
    }
  };

  return (
    <RequireAuth message="You need to be logged in to create a listing">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-3xl font-bold">Create Listing</h1>
                <p className="text-muted-foreground mt-1">
                  Fill in the details to create your listing
                </p>
              </div>
              
              {/* Draft management */}
              <div className="mt-4 sm:mt-0 flex space-x-2">
                {hasDraft && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setLoadDraftDialogOpen(true)}
                    >
                      Load Draft
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setDiscardDialogOpen(true)}
                    >
                      Discard Draft
                    </Button>
                  </>
                )}
                
                {draftSaved && (
                  <span className="text-sm text-muted-foreground animate-fade-in-out flex items-center">
                    Draft saved
                  </span>
                )}
              </div>
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
                      watchedImages={watchedImages || []}
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
            
            {/* Load Draft Dialog */}
            <AlertDialog open={loadDraftDialogOpen} onOpenChange={setLoadDraftDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Load saved draft</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have a previously saved draft. Would you like to load it?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={loadDraft}>Load Draft</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {/* Discard Draft Dialog */}
            <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard draft</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to discard this draft? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={discardDraft}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Discard
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </RequireAuth>
    </Layout>
  );
};

export default CreateListing;
