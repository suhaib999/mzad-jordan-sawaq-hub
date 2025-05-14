import { supabase } from '@/integrations/supabase/client';
import { ProductWithImages, ProductFilterParams, ShippingOption, ProductImage } from './types';
import { processProductData } from './mappers';
import { applyFilters, applyPagination, applySorting } from './queryBuilders';

export const fetchProducts = async (
  limit: number | undefined,
  offset: number | undefined,
  filterParams: ProductFilterParams = {}
): Promise<{ products: ProductWithImages[]; count: number }> => {
  try {
    console.log("Fetching products with params:", filterParams);
    
    // First execute a count query separately to avoid type issues
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    // Apply filters to the count query
    const filteredCountQuery = await applyFilters(countQuery, filterParams);
    const { count: countValue, error: countError } = await filteredCountQuery;
    
    if (countError) {
      console.error('Error in count query:', countError);
      throw new Error(`Count query failed: ${countError.message}`);
    }
    
    const totalCount = countValue || 0;
    console.log("Total count:", totalCount);

    // Build and execute the data query
    let query = supabase
      .from('products')
      .select('*, images:product_images(*)');
    
    // Add filters one by one
    const filteredQuery = await applyFilters(query, filterParams);
    
    // Apply sorting
    const sortedQuery = applySorting(filteredQuery, filterParams.sort_by);
    
    // Apply pagination
    const paginatedQuery = applyPagination(sortedQuery, limit, offset);
    
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

    // Fetch shipping options for each product
    for (const product of productsWithMainImage) {
      const { data: shippingData, error: shippingError } = await supabase
        .from('shipping_options')
        .select('method, price')
        .eq('product_id', product.id);
        
      if (!shippingError && shippingData && shippingData.length > 0) {
        product.shipping_data = shippingData;
      }
    }

    return { 
      products: productsWithMainImage, 
      count: totalCount
    };
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return { products: [], count: 0 };
  }
};

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
      .maybeSingle();  // Using maybeSingle instead of single to prevent error

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

// New function to fetch featured products by category
export const fetchFeaturedProductsByCategory = async (
  categorySlug: string,
  limit: number = 4
): Promise<ProductWithImages[]> => {
  try {
    console.log("Fetching featured products for category:", categorySlug);
    
    const query = supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('status', 'active');
    
    // Apply category filter if provided
    const filteredQuery = await applyFilters(query, {
      category: categorySlug !== 'all' ? categorySlug : undefined
    });
    
    // Get latest products
    const { data, error } = await filteredQuery
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching category products:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }
    
    return processProductData(data);
  } catch (error) {
    console.error('Error in fetchFeaturedProductsByCategory:', error);
    return [];
  }
};

// New function to search products with advanced filtering
export const searchProducts = async (
  searchQuery: string,
  filters: ProductFilterParams = {},
  page: number = 1,
  pageSize: number = 24
): Promise<{ products: ProductWithImages[]; count: number }> => {
  try {
    const offset = (page - 1) * pageSize;
    
    // Add search query to filters
    const searchFilters: ProductFilterParams = {
      ...filters,
      query: searchQuery
    };
    
    // Use the existing fetchProducts function with pagination
    return fetchProducts(pageSize, offset, searchFilters);
  } catch (error) {
    console.error('Error in searchProducts:', error);
    return { products: [], count: 0 };
  }
};

// Add a new function to fetch categories from the database
export const fetchCategoriesFromDb = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('level', { ascending: true })
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchCategoriesFromDb:', error);
    return [];
  }
};

// Add function to fetch shipping options for a specific product
export const fetchProductShippingOptions = async (productId: string): Promise<ShippingOption[]> => {
  try {
    const { data, error } = await supabase
      .from('shipping_options')
      .select('id, method, price, handling_time')
      .eq('product_id', productId);
      
    if (error) {
      console.error('Error fetching shipping options:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchProductShippingOptions:', error);
    return [];
  }
};

// Map product to card props
export const mapProductToCardProps = (product: ProductWithImages): ProductCardProps => {
  // Find the main image (display_order 0) or the first available image
  let mainImage = '';
  
  if (product.images && product.images.length > 0) {
    // Fix - Sort images by display_order and take the first one
    const sortedImages = [...product.images].sort((a, b) => {
      return (a.display_order || 0) - (b.display_order || 0);
    });
    mainImage = sortedImages[0].image_url;
  } else if (product.main_image_url) {
    // Use the precomputed main image if available
    mainImage = product.main_image_url;
  }

  return {
    id: product.id,
    title: product.title,
    price: product.is_auction ? (product.current_bid || product.start_price || 0) : product.price,
    imageUrl: mainImage,
    condition: product.condition,
    isAuction: product.is_auction,
    location: product.location,
    endTime: product.end_time,
    quantity: product.quantity,
    brand: product.brand,
    model: product.model,
    shipping: product.shipping,
    currency: product.currency
  };
};

// Helper function to process product data
function processProductData(data: any[]): ProductWithImages[] {
  return data.map(product => {
    const images = product.images || [];
    // Fix the sorting function to handle undefined display_order values
    const sortedImages = [...images].sort((a: ProductImage, b: ProductImage) => {
      const orderA = typeof a.display_order === 'number' ? a.display_order : 0;
      const orderB = typeof b.display_order === 'number' ? b.display_order : 0;
      return orderA - orderB;
    });
    
    const mainImageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : '';
    
    return {
      ...product,
      main_image_url: mainImageUrl
    };
  });
}
