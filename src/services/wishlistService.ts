
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductWithImages } from './product/types';
import { mapProductToCardProps, fetchProductById } from './product';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// Add a product to the user's wishlist
export const addToWishlist = async (productId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }
    
    const { error } = await supabase.from('wishlists').insert({
      product_id: productId,
      user_id: user.id
    });

    if (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to add to wishlist:', err);
    return false;
  }
};

// Remove a product from the user's wishlist
export const removeFromWishlist = async (productId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }
    
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .match({ product_id: productId, user_id: user.id });

    if (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Failed to remove from wishlist:', err);
    return false;
  }
};

// Check if a product is in the user's wishlist
export const isInWishlist = async (productId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error('Failed to check wishlist:', err);
    return false;
  }
};

// Get all wishlist items for the current user
export const getWishlist = async (): Promise<ProductWithImages[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching wishlist:', error);
      return [];
    }

    // Fetch the full product information for each wishlist item
    const productPromises = data.map(item => fetchProductById(item.product_id));
    const products = await Promise.all(productPromises);
    
    // Filter out any null products (in case a product was deleted)
    return products.filter(Boolean) as ProductWithImages[];
  } catch (err) {
    console.error('Failed to fetch wishlist:', err);
    return [];
  }
};
