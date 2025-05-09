import { supabase } from '@/integrations/supabase/client';
import { ProductWithImages, ProductFilterParams } from './types';
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

// Add a function to create or update a product
export const createOrUpdateProduct = async (
  productData: any,
  images: any[],
  userId: string
): Promise<{ success: boolean; productId?: string; error?: string }> => {
  try {
    console.log("Creating/updating product with data:", productData);
    
    // Format data for insertion
    const productToInsert = {
      ...productData,
      seller_id: userId,
      is_auction: productData.listing_type === 'auction' || productData.listing_type === 'both',
      updated_at: new Date().toISOString(),
    };
    
    // If updating, keep the created_at field
    if (!productToInsert.created_at) {
      productToInsert.created_at = new Date().toISOString();
    }
    
    console.log("Final product data to insert:", productToInsert);
    
    // Insert/update the product
    const { data: insertedProduct, error: productError } = await supabase
      .from('products')
      .upsert(productToInsert)
      .select('id')
      .maybeSingle();
      
    if (productError) {
      console.error("Error inserting product:", productError);
      return { 
        success: false, 
        error: `Failed to create product: ${productError.message}` 
      };
    }
    
    if (!insertedProduct) {
      return {
        success: false,
        error: "No product was created/updated"
      };
    }
    
    const productId = insertedProduct.id;
    console.log("Product created/updated successfully with ID:", productId);
    
    // Insert/update images if any
    if (images && images.length > 0 && productId) {
      const imageInserts = images.map((img, index) => ({
        id: img.id || undefined,
        product_id: productId,
        image_url: img.url,
        display_order: img.order || index
      }));
      
      console.log("Inserting images:", imageInserts);
      
      const { error: imagesError } = await supabase
        .from('product_images')
        .upsert(imageInserts);
        
      if (imagesError) {
        console.error("Error inserting images:", imagesError);
        // We don't fail the whole operation for image errors
        // but we should log them
        console.error("Failed to insert images:", imagesError.message);
      }
    }
    
    // Also store shipping options in the separate table if we have them
    if (productData.shipping_options && productData.shipping_options.length > 0) {
      const shippingOptions = productData.shipping_options.map((option: any) => ({
        product_id: productId,
        method: option.method,
        price: option.price
      }));
      
      // Delete existing shipping options first
      await supabase
        .from('shipping_options')
        .delete()
        .eq('product_id', productId);
        
      // Then insert new ones
      const { error: shippingError } = await supabase
        .from('shipping_options')
        .insert(shippingOptions);
        
      if (shippingError) {
        console.error("Error inserting shipping options:", shippingError);
      }
    }
    
    return { 
      success: true, 
      productId 
    };
  } catch (error: any) {
    console.error("Error in createOrUpdateProduct:", error);
    return { 
      success: false, 
      error: error?.message || "Unknown error occurred" 
    };
  }
};
