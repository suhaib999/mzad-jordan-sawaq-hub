import { supabase } from '@/integrations/supabase/client';
import { CardProps } from '@/components/ui/card';

export const mapProductToCardProps = (product: any): CardProps => ({
  id: product.id,
  title: product.title,
  imageUrl: product.imageUrl,
  description: product.description,
  price: product.price,
  condition: product.condition,
  location: product.location,
  isAuction: product.is_auction,
  startPrice: product.start_price,
  currentBid: product.current_bid,
  endTime: product.end_time,
  href: `/product/${product.id}`,
});

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  currency: string;
  category_id?: string;
  seller_id: string;
  created_at: string;
  is_auction: boolean;
  start_price?: number;
  current_bid?: number;
  end_time?: string;
  location?: string;
  shipping?: string;
  reserve_price?: number;
}

export interface ProductSearchParams {
  isAuction?: boolean;
  category?: string;
  condition?: string[];
  priceMin?: number;
  priceMax?: number;
  location?: string;
  seller_id?: string;
  searchQuery?: string;
  freeShippingOnly?: boolean;
  localPickupOnly?: boolean;
}

export const fetchProducts = async (
  limit: number = 20,
  offset: number = 0,
  params?: ProductSearchParams
): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (params) {
      // Filter by auction/fixed price
      if (params.isAuction !== undefined) {
        query = query.eq('is_auction', params.isAuction);
      }
      
      // Filter by category
      if (params.category && params.category !== 'all') {
        query = query.eq('category_id', params.category);
      }
      
      // Filter by condition
      if (params.condition && params.condition.length > 0) {
        query = query.in('condition', params.condition);
      }
      
      // Filter by price range
      if (params.priceMin !== undefined && params.priceMin > 0) {
        query = query.gte('price', params.priceMin);
      }
      
      if (params.priceMax !== undefined && params.priceMax > 0) {
        query = query.lte('price', params.priceMax);
      }
      
      // Filter by location
      if (params.location) {
        query = query.eq('location', params.location);
      }

      // Filter by seller
      if (params.seller_id) {
        query = query.eq('seller_id', params.seller_id);
      }

      // Filter by search query (title search)
      if (params.searchQuery) {
        query = query.ilike('title', `%${params.searchQuery}%`);
      }
      
      // Filter by shipping options
      if (params.freeShippingOnly) {
        query = query.ilike('shipping', '%Free%');
      }
      
      if (params.localPickupOnly) {
        query = query.ilike('shipping', '%Pickup%');
      }
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }

    return data as Product;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

export const fetchProductsBySellerId = async (sellerId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by seller ID:', error);
      return [];
    }

    return data as Product[];
  } catch (error) {
    console.error('Error fetching products by seller ID:', error);
    return [];
  }
};
