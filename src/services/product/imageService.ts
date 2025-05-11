
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface ProductImage {
  id: string;
  file?: File | null;
  url: string;
  order: number;
}

export const uploadProductImage = async (
  productId: string,
  image: ProductImage
): Promise<string> => {
  // If the image is already a URL and not a blob, just return it
  if (image.url && !image.file && !image.url.startsWith('blob:')) {
    return image.url;
  }

  // Upload new image
  if (image.file) {
    const fileExt = image.file.name.split('.').pop();
    const filePath = `products/${productId}/${image.id}.${fileExt}`;
    
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
  images: ProductImage[]
): Promise<ProductImage[]> => {
  const uploadedImages: ProductImage[] = [];
  
  for (const image of images) {
    try {
      const imageUrl = await uploadProductImage(productId, image);
      
      // Add to uploaded images array
      uploadedImages.push({
        id: image.id,
        url: imageUrl,
        order: image.order
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Continue with other images even if one fails
    }
  }
  
  return uploadedImages;
};
