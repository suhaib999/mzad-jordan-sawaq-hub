
// Product data types and interfaces

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
