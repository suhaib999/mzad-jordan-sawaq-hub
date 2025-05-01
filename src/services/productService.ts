
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

// Simplified interface for product query response
interface ProductQueryResponse {
  data: any[] | null;
  error: any;
  count: number | null;
}

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

    // Use string literal for query to avoid type complexity
    const queryString = "*,images:product_images(*)";

    // Apply filters step by step to avoid complex type inference
    let queryBuilder = supabase.from('products').select(queryString, { count: 'exact' });
    
    // Add filters
    queryBuilder = queryBuilder.eq('status', 'active');

    // Apply filters
    if (category_id) {
      queryBuilder = queryBuilder.eq('category_id', category_id);
    }

    if (condition && condition.length > 0) {
      queryBuilder = queryBuilder.in('condition', condition);
    }

    if (price_min !== undefined) {
      queryBuilder = queryBuilder.gte('price', price_min);
    }

    if (price_max !== undefined) {
      queryBuilder = queryBuilder.lte('price', price_max);
    }

    if (location && location.length > 0) {
      queryBuilder = queryBuilder.in('location', location);
    }

    if (is_auction !== undefined) {
      queryBuilder = queryBuilder.eq('is_auction', is_auction);
    }

    if (with_shipping) {
      queryBuilder = queryBuilder.not('shipping', 'is', null);
    }

    if (query) {
      queryBuilder = queryBuilder.ilike('title', `%${query}%`);
    }

    // Apply sorting
    switch (sort_by) {
      case 'price_asc':
        queryBuilder = queryBuilder.order('price', { ascending: true });
        break;
      case 'price_desc':
        queryBuilder = queryBuilder.order('price', { ascending: false });
        break;
      case 'oldest':
        queryBuilder = queryBuilder.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (limit !== undefined) {
      if (offset !== undefined) {
        queryBuilder = queryBuilder.range(offset, offset + limit - 1);
      } else {
        queryBuilder = queryBuilder.limit(limit);
      }
    }

    // Execute query
    const response = await queryBuilder;
    
    const { data, error } = response;
    const count = response.count || 0;

    if (error) {
      console.error('Error fetching products:', error);
      return { products: [], count: 0 };
    }

    if (!data) {
      return { products: [], count: 0 };
    }

    // Process the data
    const productsWithMainImage = data.map((product) => {
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
      count 
    };
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return { products: [], count: 0 };
  }
};

export const fetchProductsBySellerId = async (sellerId: string): Promise<ProductWithImages[]> => {
  try {
    // Simplified query approach
    const queryString = `
      *,
      images:product_images(*)
    `;
    
    const { data, error } = await supabase
      .from('products')
      .select(queryString)
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
    const productsWithMainImage = data.map((product) => {
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
    // Simplified query approach
    const queryString = `
      *,
      images:product_images(*)
    `;
    
    const { data, error } = await supabase
      .from('products')
      .select(queryString)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Process with simplified typing
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
