
import { supabase } from "@/integrations/supabase/client";
import { ProductCardProps } from "@/components/product/ProductCard";
import { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];

export type ProductWithImages = Product & {
  images: ProductImage[];
  main_image_url: string;
};

export type ProductFilterParams = {
  category?: string;
  isAuction?: boolean;
  searchQuery?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: string[];
  location?: string;
  freeShippingOnly?: boolean;
  localPickupOnly?: boolean;
  sortOrder?: string;
};

export const fetchProducts = async (
  limit: number = 10,
  offset: number = 0,
  filters: ProductFilterParams = {}
): Promise<ProductWithImages[]> => {
  const { 
    category, 
    isAuction, 
    searchQuery, 
    priceMin, 
    priceMax, 
    condition, 
    location, 
    freeShippingOnly, 
    localPickupOnly,
    sortOrder
  } = filters;

  let query = supabase
    .from("products")
    .select(
      `
      *,
      images:product_images(*)
      `
    )
    .eq("status", "active");
    
  if (category) {
    query = query.eq("category", category);
  }

  if (isAuction !== undefined) {
    query = query.eq("is_auction", isAuction);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }
  
  if (priceMin !== undefined) {
    query = query.gte("price", priceMin);
  }
  
  if (priceMax !== undefined) {
    query = query.lte("price", priceMax);
  }
  
  if (condition && condition.length > 0) {
    query = query.in("condition", condition);
  }
  
  if (location) {
    query = query.ilike("location", `%${location}%`);
  }
  
  if (freeShippingOnly) {
    query = query.eq("shipping", "Free");
  }
  
  if (localPickupOnly) {
    query = query.eq("shipping", "Local pickup");
  }
  
  // Apply sorting
  switch (sortOrder) {
    case 'priceAsc':
      query = query.order("price", { ascending: true });
      break;
    case 'priceDesc':
      query = query.order("price", { ascending: false });
      break;
    case 'newlyListed':
      query = query.order("created_at", { ascending: false });
      break;
    case 'endingSoonest':
      query = query.order("end_time", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Transform the data to include the main image URL
  const productsWithImages = data.map(product => {
    const images = product.images as unknown as ProductImage[] || [];
    
    // Sort images by display_order
    const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
    
    return {
      ...product,
      images: sortedImages,
      main_image_url: sortedImages.length > 0 
        ? sortedImages[0].image_url 
        : "https://via.placeholder.com/300x200"
    };
  });

  return productsWithImages;
};

export const fetchProductById = async (id: string): Promise<ProductWithImages | null> => {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      images:product_images(*)
      `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  const images = data.images as unknown as ProductImage[] || [];
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);

  return {
    ...data,
    images: sortedImages,
    main_image_url: sortedImages.length > 0 
      ? sortedImages[0].image_url 
      : "https://via.placeholder.com/300x200"
  };
};

export const mapProductToCardProps = (product: ProductWithImages): ProductCardProps => {
  return {
    id: product.id,
    title: product.title,
    price: Number(product.price),
    currency: product.currency,
    imageUrl: product.main_image_url,
    condition: product.condition,
    isAuction: product.is_auction,
    endTime: product.end_time ? formatEndTime(product.end_time) : undefined,
    currentBid: product.current_bid ? Number(product.current_bid) : undefined,
    shipping: product.shipping || undefined,
    location: product.location || undefined
  };
};

const formatEndTime = (endTime: string): string => {
  const endDate = new Date(endTime);
  const now = new Date();
  const diffMillis = endDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMillis / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h left`;
  } else {
    return `${diffHours}h ${Math.floor((diffMillis % (1000 * 60 * 60)) / (1000 * 60))}m left`;
  }
};
