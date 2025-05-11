
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Updated type definition to make id optional in input but required in output
export interface ProductImage {
  id: string;
  file?: File | null;
  url: string;
  order: number;
}

// This interface represents the image data as it exists in the form before uploading
export interface ProductImageInput {
  id?: string;
  file?: File | null;
  url: string;
  order?: number;
}

export const uploadProductImage = async (
  productId: string,
  image: ProductImageInput
): Promise<string> => {
  // If the image is already a URL and not a blob, just return it
  if (image.url && !image.file && !image.url.startsWith('blob:')) {
    return image.url;
  }

  // Upload new image
  if (image.file) {
    const fileExt = image.file.name.split('.').pop();
    const filePath = `products/${productId}/${image.id || uuidv4()}.${fileExt}`;
    
    try {
      // Check if images bucket exists
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('images');
      
      // Create bucket if it doesn't exist
      if (bucketError && bucketError.message.includes('does not exist')) {
        await supabase.storage.createBucket('images', {
          public: true
        });
      }
      
      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, image.file, {
          upsert: true,
          cacheControl: '3600'
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
        
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
  
  return image.url;
};

export const uploadProductImages = async (
  productId: string,
  images: ProductImageInput[]
): Promise<ProductImage[]> => {
  const uploadedImages: ProductImage[] = [];
  
  for (const image of images) {
    try {
      const imageUrl = await uploadProductImage(productId, image);
      
      // Add to uploaded images array
      uploadedImages.push({
        id: image.id || uuidv4(), // Ensure id is always set
        url: imageUrl,
        order: image.order || 0
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Continue with other images even if one fails
    }
  }
  
  return uploadedImages;
};
