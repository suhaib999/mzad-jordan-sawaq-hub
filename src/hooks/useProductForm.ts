
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { ProductFormValues, productSchema } from '@/types/product';

// Extended product form values with ID
export interface ExtendedProductFormValues extends ProductFormValues {
  id?: string;
}

export const useProductForm = (onDraftChange?: (hasDraft: boolean) => void) => {
  const [draftId, setDraftId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [completionScore, setCompletionScore] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);
  const [customAttributes, setCustomAttributes] = useState<{ name: string; value: string }[]>([]);
  
  // Load draft from local storage
  const [savedDraft, setSavedDraft] = useLocalStorage<ExtendedProductFormValues | null>('product_draft', null);
  const [hasDraft, setHasDraft] = useState(false);

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
    mode: 'onBlur',
  });

  // Get the field array for images
  const { fields: imageFields, append: appendImage, remove: removeImage, update: updateImage } = 
    useFieldArray({
      control: form.control,
      name: "images"
    });

  // Track what we're watching from the form
  const listingType = form.watch('listing_type');
  const watchedImages = form.watch('images') || [];

  // Check for existing draft on mount
  useEffect(() => {
    if (savedDraft) {
      setHasDraft(true);
      if (onDraftChange) {
        onDraftChange(true);
      }
    }
  }, [savedDraft, onDraftChange]);

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
          }))
        };
        
        setSavedDraft(draftToSave as ExtendedProductFormValues);
        setDraftSaved(true);
        setHasDraft(true);
        if (onDraftChange) {
          onDraftChange(true);
        }
        setTimeout(() => setDraftSaved(false), 3000);
      }
    }, 10000); // Save every 10 seconds if changes
    
    return () => clearTimeout(draftTimer);
  }, [form.watch(), setSavedDraft, onDraftChange]);

  // Load draft data into form
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
    }
  };

  // Discard draft
  const discardDraft = () => {
    setSavedDraft(null);
    setHasDraft(false);
    if (onDraftChange) {
      onDraftChange(false);
    }
    form.reset();
    setSelectedCategory('');
    setDraftId(null);
  };

  // Check if tab has errors
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

  return {
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
    imageFields,
    appendImage,
    removeImage,
    updateImage,
    loadDraft,
    discardDraft,
    tabHasErrors
  };
};

export default useProductForm;
