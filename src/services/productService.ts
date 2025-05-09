
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
  location?: string | {
    city: string;
    neighborhood: string;
    street?: string;
  };
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
  location?: string | {
    city: string;
    neighborhood: string;
    street?: string;
  };
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
    console.log("Fetching products with params:", filterParams);
    
    // First execute a count query separately to avoid type issues
    const countQuery = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    if (countQuery.error) {
      console.error('Error in count query:', countQuery.error);
      throw new Error(`Count query failed: ${countQuery.error.message}`);
    }
    
    const countValue = countQuery.count || 0;
    console.log("Total count:", countValue);

    // Build and execute the data query
    const query = supabase
      .from('products')
      .select('*, images:product_images(*)');
    
    // Add filters one by one
    const filteredQuery = applyFilters(query, filterParams);
    
    // Apply pagination
    const paginatedQuery = applyPagination(filteredQuery, limit, offset);
    
    // Execute the query
    const { data, error } = await paginatedQuery;

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Data query failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('No products found');
      return { products: [], count: 0 };
    }

    console.log(`Found ${data.length} products`);
    
    // Process the data
    const productsWithMainImage = processProductData(data);

    return { 
      products: productsWithMainImage, 
      count: countValue
    };
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return { products: [], count: 0 };
  }
};

// Helper function to apply filters
function applyFilters(query: any, filterParams: ProductFilterParams) {
  let result = query.eq('status', 'active');
  
  const { 
    category_id, 
    condition, 
    price_min, 
    price_max, 
    location, 
    is_auction, 
    with_shipping,
    query: searchQuery
  } = filterParams;

  if (category_id) {
    result = result.eq('category_id', category_id);
  }

  if (condition && condition.length > 0) {
    result = result.in('condition', condition);
  }

  if (price_min !== undefined) {
    result = result.gte('price', price_min);
  }

  if (price_max !== undefined) {
    result = result.lte('price', price_max);
  }

  if (location && location.length > 0) {
    result = result.in('location', location);
  }

  if (is_auction !== undefined) {
    result = result.eq('is_auction', is_auction);
  }

  if (with_shipping) {
    result = result.not('shipping', 'is', null);
  }

  if (searchQuery) {
    result = result.ilike('title', `%${searchQuery}%`);
  }

  // Apply sorting
  return applySorting(result, filterParams.sort_by);
}

// Helper function to apply sorting
function applySorting(query: any, sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest') {
  switch (sortBy) {
    case 'price_asc':
      return query.order('price', { ascending: true });
    case 'price_desc':
      return query.order('price', { ascending: false });
    case 'oldest':
      return query.order('created_at', { ascending: true });
    case 'newest':
    default:
      return query.order('created_at', { ascending: false });
  }
}

// Helper function to apply pagination
function applyPagination(query: any, limit?: number, offset?: number) {
  if (limit !== undefined) {
    if (offset !== undefined) {
      return query.range(offset, offset + limit - 1);
    } else {
      return query.limit(limit);
    }
  }
  return query;
}

// Helper function to process product data
function processProductData(data: any[]): ProductWithImages[] {
  return data.map(product => {
    const images = product.images || [];
    const sortedImages = [...images].sort((a: ProductImage, b: ProductImage) => a.display_order - b.display_order);
    const mainImageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : '';
    
    return {
      ...product,
      main_image_url: mainImageUrl
    };
  });
}

export const fetchProductsBySellerId = async (sellerId: string): Promise<ProductWithImages[]> => {
  try {
    console.log("Fetching products for seller:", sellerId);
    
    // Execute the query
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by seller:', error);
      throw new Error(`Seller products query failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('No products found for this seller');
      return [];
    }

    console.log(`Found ${data.length} seller products`);
    
    // Process with simplified typing
    return processProductData(data);
  } catch (error) {
    console.error('Error in fetchProductsBySellerId:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<ProductWithImages | null> => {
  try {
    console.log("Fetching product by ID:", id);
    
    // Execute the query
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw new Error(`Product detail query failed: ${error.message}`);
    }

    if (!data) {
      console.log('No product found with this ID');
      return null;
    }

    console.log("Product found:", data.title);
    
    // Process the product
    const product = data;
    const images = product.images || [];
    const sortedImages = [...images].sort((a: ProductImage, b: ProductImage) => a.display_order - b.display_order);
    const mainImageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : '';
    
    return {
      ...product,
      main_image_url: mainImageUrl
    };
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    return null;
  }
};
