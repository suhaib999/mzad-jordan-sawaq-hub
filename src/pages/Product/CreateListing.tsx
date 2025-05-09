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
  const { user, session } = useAuth();
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
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [loadDraftDialogOpen, setLoadDraftDialogOpen] = useState(false);
  
  // Load draft from local storage
  const [savedDraft, setSavedDraft] = useLocalStorage<ExtendedProductFormValues | null>('product_draft', null);

  // Check for existing draft
  useEffect(() => {
    if (savedDraft) {
      setHasDraft(true);
      // Prompt to load draft if we have a saved one and form is empty
      const currentTitle = form.getValues('title') || '';
      const currentDesc = form.getValues('description') || '';
      
      if (!currentTitle && !currentDesc) {
        setLoadDraftDialogOpen(true);
      }
    }
  }, []);

  // Define form
  const form = useForm<ProductFormValues>({
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
      location: {
        city: '',
        neighborhood: '',
        street: ''
      },
      free_shipping: false,
      local_pickup: true,
      shipping_options: [{ method: 'Standard', price: 0 }],
      tags: [],
      images: [],
      attributes: {},
      status: 'active'
    },
    mode: 'onBlur', // Validate fields when they lose focus
  });

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

  // Get the field array for images
  const { fields: imageFields, append: appendImage, remove: removeImage, update: updateImage } = 
    useFieldArray({
      control: form.control,
      name: "images"
    });

  const listingType = form.watch('listing_type');
  const watchedImages = form.watch('images') || [];
  
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
    
    // Check if pricing is set correctly based on the listing type
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
        // Make sure images are properly serialized
        const draftToSave = {
          ...currentValues,
          images: currentValues.images?.map(img => ({
            id: img.id,
            url: img.url,
            order: img.order
            // Don't include file objects as they can't be serialized
          }))
        };
        
        setSavedDraft(draftToSave as ExtendedProductFormValues);
        setDraftSaved(true);
        setHasDraft(true);
        setTimeout(() => setDraftSaved(false), 3000);
      }
    }, 10000); // Save every 10 seconds if changes
    
    return () => clearTimeout(draftTimer);
  }, [form.watch(), setSavedDraft]);
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const currentImagesCount = watchedImages?.length || 0;
    
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
      const newImages = [...(watchedImages || [])];
      const temp = newImages[index];
      newImages[index] = newImages[index - 1];
      newImages[index - 1] = temp;
      
      // Update order property
      newImages[index].order = index;
      newImages[index - 1].order = index - 1;
      
      // Update form
      form.setValue('images', newImages);
    } 
    else if (direction === 'down' && index < (watchedImages?.length || 0) - 1) {
      const newImages = [...(watchedImages || [])];
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
    console.log("Category selected in parent:", category);
    setSelectedCategory(category.id);
    form.setValue('category', category.id);
  };
  
  // Handle form submission
  const onSubmit = async (data?: ProductFormValues) => {
    // If no data is provided (save draft case), get values from form
    const formData = data || form.getValues();
    
    console.log("Form submitted with data:", formData);
    
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
      formData.status = isDraft ? 'draft' : 'active';
      
      // Format the end time for auctions
      if ((formData.listing_type === 'auction' || formData.listing_type === 'both') && formData.auction_duration) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (formData.auction_duration || 7));
        formData.end_time = endDate.toISOString();
      }
      
      // Generate a product ID if needed
      const productId = draftId || uuidv4();
      console.log("Product ID:", productId);
      
      // Format location to string for display
      const locationString = formData.location ? 
        `${formData.location.city}, ${formData.location.neighborhood}${formData.location.street ? `, ${formData.location.street}` : ''}` : '';
      
      // Prepare product data
      const productData = {
        id: productId,
        title: formData.title,
        description: formData.description,
        price: formData.price || 0,
        currency: 'USD', // Default to USD for now
        condition: formData.condition,
        category: formData.category,
        category_id: formData.category,
        subcategory_id: formData.subcategory,
        seller_id: session.user.id,
        location: locationString,
        shipping: JSON.stringify(formData.shipping_options || []),
        is_auction: formData.listing_type === 'auction' || formData.listing_type === 'both',
        listing_type: formData.listing_type,
        is_negotiable: formData.is_negotiable,
        allow_offers: formData.allow_offers,
        quantity: formData.quantity,
        start_price: (formData.listing_type === 'auction' || formData.listing_type === 'both') ? formData.start_price : null,
        reserve_price: (formData.listing_type === 'auction' || formData.listing_type === 'both') ? formData.reserve_price : null,
        auction_duration: (formData.listing_type === 'auction' || formData.listing_type === 'both') ? formData.auction_duration : null,
        end_time: formData.end_time,
        free_shipping: formData.free_shipping,
        local_pickup: formData.local_pickup,
        handling_time: formData.handling_time,
        return_policy: formData.return_policy,
        warranty: formData.warranty,
        tags: formData.tags,
        status: formData.status,
        attributes: formData.attributes,
        brand: formData.brand?.toString() || null,
        model: formData.model?.toString() || null,
        year: formData.year?.toString() || null,
        color: formData.color?.toString() || null,
        size: formData.size?.toString() || null,
        provides_shipping: formData.provides_shipping,
        mzadkumsooq_delivery: formData.mzadkumsooq_delivery,
      };
      
      // Handle image uploads
      const uploadedImages = [];
      
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
            const { data: publicUrlData } = supabase.storage
              .from('images')
              .getPublicUrl(filePath);
              
            imageUrl = publicUrlData.publicUrl;
          } catch (error) {
            console.error("Error uploading image:", error);
            toast({
              title: "Image upload failed",
              description: "One or more images failed to upload. Please try again.",
              variant: "destructive"
            });
          }
        }
        
        // Add to uploaded images array
        uploadedImages.push({
          id: image.id,
          url: imageUrl,
          order: image.order
        });
      }
      
      console.log("Processed images:", uploadedImages);
      
      // Create or update the product
      const { success, productId: createdProductId, error } = await createOrUpdateProduct(
        productData,
        uploadedImages,
        session.user.id
      );
      
      if (!success) {
        throw new Error(error || "Failed to create listing");
      }
      
      // Clear draft from local storage if successful
      if (success) {
        setSavedDraft(null);
        setHasDraft(false);
        
        toast({
          title: formData.status === 'draft' ? "Draft saved" : "Listing published",
          description: formData.status === 'draft' 
            ? "Your listing draft has been saved" 
            : "Your listing is now live and visible to buyers",
          variant: "default",
        });
        
        // Redirect based on status
        if (formData.status === 'active') {
          navigate(`/product/${createdProductId || productId}`);
        } else {
          navigate(`/profile/listings`);
        }
      }
    } catch (error: any) {
      console.error("Submission error:", error);
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
                  errors.location);
      case 'images':
        return !!(errors.images);
      default:
        return false;
    }
  };

  return (
    <Layout>
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
