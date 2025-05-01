
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  category_id?: string;
  category?: string;
  seller_id: string;
  location?: string;
  shipping?: string;
  is_auction: boolean;
  start_price?: number;
  current_bid?: number;
  reserve_price?: number;
  end_time?: string;
  status: string;
  created_at: string;
  updated_at: string;
  brand?: string;
  model?: string;
  storage?: string;
  color?: string;
  delivery_available?: boolean;
  screen_size?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

export interface ProductWithImages extends Product {
  images: ProductImage[];
  main_image_url?: string;
}

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  condition: string;
  isAuction: boolean;
  location?: string;
  endTime?: string;
}

export interface ProductFilterParams {
  category_id?: string;
  condition?: string[];
  price_min?: number;
  price_max?: number;
  location?: string[];
  is_auction?: boolean;
  with_shipping?: boolean;
  query?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  limit?: number;
  offset?: number;
}

export interface ProductSearchParams {
  query?: string;
  categoryId?: string;
  condition?: string[];
  priceMin?: number;
  priceMax?: number;
  location?: string[];
  isAuction?: boolean;
  withShipping?: boolean;
  sortOrder?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}

// Map product to card props
export const mapProductToCardProps = (product: ProductWithImages): ProductCardProps => {
  // Find the main image (display_order 0) or the first available image
  const mainImage = product.images && product.images.length > 0
    ? product.images.sort((a, b) => a.display_order - b.display_order)[0].image_url
    : '';

  return {
    id: product.id,
    title: product.title,
    price: product.is_auction ? (product.current_bid || product.start_price || 0) : product.price,
    imageUrl: mainImage,
    condition: product.condition,
    isAuction: product.is_auction,
    location: product.location,
    endTime: product.end_time,
  };
};

export const fetchProducts = async (
  limit: number | undefined,
  offset: number | undefined,
  filterParams: ProductFilterParams = {}
): Promise<{ products: ProductWithImages[]; count: number }> => {
  try {
    const { 
      category_id, 
      condition, 
      price_min, 
      price_max, 
      location, 
      is_auction, 
      with_shipping,
      query,
      sort_by
    } = filterParams;

    // First execute a count query separately to avoid type issues
    const countQuery = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    const countValue = countQuery.count || 0;

    // Then build a separate query for fetching the data
    let dataQuery = supabase
      .from('products')
      .select('*, images:product_images(*)');
    
    // Add filters one by one
    dataQuery = dataQuery.eq('status', 'active');

    // Apply additional filters
    if (category_id) {
      dataQuery = dataQuery.eq('category_id', category_id);
    }

    if (condition && condition.length > 0) {
      dataQuery = dataQuery.in('condition', condition);
    }

    if (price_min !== undefined) {
      dataQuery = dataQuery.gte('price', price_min);
    }

    if (price_max !== undefined) {
      dataQuery = dataQuery.lte('price', price_max);
    }

    if (location && location.length > 0) {
      dataQuery = dataQuery.in('location', location);
    }

    if (is_auction !== undefined) {
      dataQuery = dataQuery.eq('is_auction', is_auction);
    }

    if (with_shipping) {
      dataQuery = dataQuery.not('shipping', 'is', null);
    }

    if (query) {
      dataQuery = dataQuery.ilike('title', `%${query}%`);
    }

    // Apply sorting
    switch (sort_by) {
      case 'price_asc':
        dataQuery = dataQuery.order('price', { ascending: true });
        break;
      case 'price_desc':
        dataQuery = dataQuery.order('price', { ascending: false });
        break;
      case 'oldest':
        dataQuery = dataQuery.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        dataQuery = dataQuery.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (limit !== undefined) {
      if (offset !== undefined) {
        dataQuery = dataQuery.range(offset, offset + limit - 1);
      } else {
        dataQuery = dataQuery.limit(limit);
      }
    }

    // Execute the data query
    const { data, error } = await dataQuery;

    if (error) {
      console.error('Error fetching products:', error);
      return { products: [], count: 0 };
    }

    if (!data) {
      return { products: [], count: 0 };
    }

    // Process the data
    const productsWithMainImage = data.map((product: any) => {
      const images = product.images || [];
      const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
      const mainImageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : '';
      
      return {
        ...product,
        main_image_url: mainImageUrl
      };
    });

    return { 
      products: productsWithMainImage as ProductWithImages[], 
      count: countValue
    };
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return { products: [], count: 0 };
  }
};

export const fetchProductsBySellerId = async (sellerId: string): Promise<ProductWithImages[]> => {
  try {
    // Execute the query
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by seller:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Process with simplified typing
    const productsWithMainImage = data.map((product: any) => {
      const images = product.images || [];
      const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
      const mainImageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : '';
      
      return {
        ...product,
        main_image_url: mainImageUrl
      };
    });

    return productsWithMainImage as ProductWithImages[];
  } catch (error) {
    console.error('Error in fetchProductsBySellerId:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<ProductWithImages | null> => {
  try {
    // Execute the query
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Process the product
    const product = data;
    const images = product.images || [];
    const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
    const mainImageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : '';
    
    return {
      ...product,
      main_image_url: mainImageUrl
    } as ProductWithImages;
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    return null;
  }
};
