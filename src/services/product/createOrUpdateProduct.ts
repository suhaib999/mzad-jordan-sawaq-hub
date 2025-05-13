
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ProductImage } from './imageService';

export const createOrUpdateProduct = async (
  productData: any,
  images: ProductImage[],
  userId: string
): Promise<{ success: boolean; productId?: string; error?: string }> => {
  try {
    console.log("Creating/updating product with data:", productData);
    
    // Format data for insertion
    const productToInsert = {
      ...productData,
      seller_id: userId,
      is_auction: productData.listing_type === 'auction' || productData.listing_type === 'both',
      updated_at: new Date().toISOString(),
    };
    
    // If updating, keep the created_at field
    if (!productToInsert.created_at) {
      productToInsert.created_at = new Date().toISOString();
    }
    
    console.log("Final product data to insert:", productToInsert);
    
    // Insert/update the product
    // The category_path field will be automatically populated by our new database trigger
    const { data: insertedProduct, error: productError } = await supabase
      .from('products')
      .upsert(productToInsert)
      .select('id')
      .maybeSingle();
      
    if (productError) {
      console.error("Error inserting product:", productError);
      return { 
        success: false, 
        error: `Failed to create product: ${productError.message}` 
      };
    }
    
    if (!insertedProduct) {
      return {
        success: false,
        error: "No product was created/updated"
      };
    }
    
    const productId = insertedProduct.id;
    console.log("Product created/updated successfully with ID:", productId);
    
    // Insert/update images if any
    if (images && images.length > 0 && productId) {
      // First delete any existing images for the product that aren't in the new list
      const imageIds = images.map(img => img.id).filter(id => id);
      
      if (imageIds.length > 0) {
        // Only do a not-in query if we have existing image IDs
        const { error: deleteImagesError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId)
          .not('id', 'in', `(${imageIds.join(',')})`);
          
        if (deleteImagesError) {
          console.error("Error deleting old images:", deleteImagesError);
        }
      } else {
        // If no existing image IDs, delete all images for the product
        const { error: deleteAllImagesError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId);
          
        if (deleteAllImagesError) {
          console.error("Error deleting all old images:", deleteAllImagesError);
        }
      }
      
      const imageInserts = images.map((img, index) => ({
        id: img.id,
        product_id: productId,
        image_url: img.url,
        display_order: img.order || index
      }));
      
      console.log("Inserting images:", imageInserts);
      
      const { error: imagesError } = await supabase
        .from('product_images')
        .upsert(imageInserts);
        
      if (imagesError) {
        console.error("Error inserting images:", imagesError);
        // We don't fail the whole operation for image errors
        // but we should log them
        console.error("Failed to insert images:", imagesError.message);
      }
    }
    
    // Also store shipping options in the separate table if we have them
    if (productData.shipping_options && productData.shipping_options.length > 0) {
      const shippingOptions = productData.shipping_options.map((option: any) => ({
        product_id: productId,
        method: option.method,
        price: option.price,
        handling_time: productData.handling_time
      }));
      
      // Delete existing shipping options first
      const { error: deleteShippingError } = await supabase
        .from('shipping_options')
        .delete()
        .eq('product_id', productId);
        
      if (deleteShippingError) {
        console.error("Error deleting shipping options:", deleteShippingError);
      }
        
      // Then insert new ones
      const { error: shippingError } = await supabase
        .from('shipping_options')
        .insert(shippingOptions);
        
      if (shippingError) {
        console.error("Error inserting shipping options:", shippingError);
      }
    }
    
    return { 
      success: true, 
      productId 
    };
  } catch (error: any) {
    console.error("Error in createOrUpdateProduct:", error);
    return { 
      success: false, 
      error: error?.message || "Unknown error occurred" 
    };
  }
};
