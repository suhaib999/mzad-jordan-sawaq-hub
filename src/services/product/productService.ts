
import { supabase } from '@/integrations/supabase/client';
import { ProductWithImages, ProductFilterParams } from './types';
import { processProductData } from './mappers';
import { applyFilters, applyPagination } from './queryBuilders';

export const fetchProducts = async (
  limit: number | undefined,
  offset: number | undefined,
  filterParams: ProductFilterParams = {}
): Promise<{ products: ProductWithImages[]; count: number }> => {
  try {
    console.log("Fetching products with params:", filterParams);
    
    // First execute a count query separately to avoid type issues
    const countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    // Apply filters to the count query
    const filteredCountQuery = applyFilters(countQuery, filterParams);
    const { count: countValue, error: countError } = await filteredCountQuery;
    
    if (countError) {
      console.error('Error in count query:', countError);
      throw new Error(`Count query failed: ${countError.message}`);
    }
    
    const totalCount = countValue || 0;
    console.log("Total count:", totalCount);

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
    const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
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
    if (categorySlug && categorySlug !== 'all') {
      query.ilike('category', `%${categorySlug}%`);
    }
    
    // Get latest products
    const { data, error } = await query
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
