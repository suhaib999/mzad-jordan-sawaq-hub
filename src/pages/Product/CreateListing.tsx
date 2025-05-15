import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
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
import RequireAuth from '@/components/auth/RequireAuth';
import { LoadDraftDialog, DiscardDraftDialog } from '@/components/product/listing/DraftDialogs';
import DraftManager from '@/components/product/listing/DraftManager';

// Hooks and Services
import { useProductForm } from '@/hooks/useProductForm';
import { uploadProductImages, ProductImageInput } from '@/services/product/imageService';
import { createOrUpdateProduct } from '@/services/product';

// Import ProductFormValues type
import { ProductFormValues } from '@/types/product';

const CreateListing = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [loadDraftDialogOpen, setLoadDraftDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use our custom hook for form management
  const {
    form,
    listingType, 
    watchedImages,
    selectedCategory,
    setSelectedCategory,
    completionScore,
    draftSaved,
    draftId,
    hasDraft,
    customAttributes,
    setCustomAttributes,
    appendImage,
    removeImage,
    updateImage,
    loadDraft,
    discardDraft,
    tabHasErrors
  } = useProductForm();

  // Check for existing draft
  useEffect(() => {
    if (hasDraft) {
      // Prompt to load draft if we have a saved one and form is empty
      const currentTitle = form.getValues('title') || '';
      const currentDesc = form.getValues('description') || '';
      
      if (!currentTitle && !currentDesc) {
        setLoadDraftDialogOpen(true);
      }
    }
  }, [hasDraft]);

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
    
    // Store both category ID and slug
    form.setValue('category', category.slug);
    form.setValue('category_id', category.id);
    
    // If this is a subcategory, also set subcategory data
    if (category.parent_id) {
      form.setValue('subcategory', category.slug);
      form.setValue('subcategory_id', category.id);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data?: ProductFormValues) => {
    // If no data is provided (save draft case), get values from form
    const formData = data || form.getValues();
    
    console.log("Form submitted with data:", formData);
    
    if (!session?.user) {
      toast.destructive({
        title: "Authentication required",
        description: "You need to be logged in to create a listing"
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
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
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
        brand: formData.attributes?.brand?.toString() || formData.brand?.toString() || null,
        model: formData.attributes?.model?.toString() || formData.model?.toString() || null,
        year: formData.attributes?.year?.toString() || formData.year?.toString() || null,
        color: formData.attributes?.color?.toString() || formData.color?.toString() || null,
        size: formData.attributes?.size?.toString() || formData.size?.toString() || null,
        provides_shipping: formData.provides_shipping,
        mzadkumsooq_delivery: formData.mzadkumsooq_delivery,
      };
      
      // Make sure images have required properties and handle the type correctly
      const imagesToUpload: ProductImageInput[] = (formData.images || []).map(img => ({
        id: img.id,
        file: img.file,
        url: img.url,
        order: img.order
      }));
      
      // Upload images
      const uploadedImages = await uploadProductImages(productId, imagesToUpload);
      
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
      
      // Handle successful submission
      if (success) {
        // Clear draft from storage
        discardDraft();
        
        toast.success({
          title: formData.status === 'draft' ? "Draft saved" : "Listing published",
          description: formData.status === 'draft' 
            ? "Your listing draft has been saved" 
            : "Your listing is now live and visible to buyers"
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
      toast.destructive({
        title: "Error",
        description: error.message || "Failed to create listing"
      });
    } finally {
      setIsSubmitting(false);
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
              <DraftManager
                hasDraft={hasDraft}
                draftSaved={draftSaved}
                onLoadDraft={() => setLoadDraftDialogOpen(true)}
                onDiscardDraft={() => setDiscardDialogOpen(true)}
              />
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
                      handleImageUpload={(e) => {
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
                      }}
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
            <LoadDraftDialog
              open={loadDraftDialogOpen}
              onOpenChange={setLoadDraftDialogOpen}
              onLoadDraft={loadDraft}
            />
            
            {/* Discard Draft Dialog */}
            <DiscardDraftDialog
              open={discardDialogOpen}
              onOpenChange={setDiscardDialogOpen}
              onDiscardDraft={discardDraft}
            />
          </div>
        </div>
      </RequireAuth>
    </Layout>
  );
};

export default CreateListing;
