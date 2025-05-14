import { supabase } from '@/integrations/supabase/client';
import { ProductWithImages, ProductFilterParams, ShippingOption, ProductImage } from './types';
import { processProductData, mapProductToCardProps } from './mappers';
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
