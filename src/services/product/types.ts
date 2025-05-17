
// Product data types and interfaces

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  category?: string;
  category_id?: string;
  subcategory?: string;
  subcategory_id?: string;
  category_path?: string[]; // Category path array
  brand?: string; // Separate brand field
  seller_id: string;
  location?: string | {
    city: string;
    neighborhood: string;
    street?: string;
  };
  shipping?: string;
  shipping_fee?: number;
  is_auction: boolean;
  start_price?: number;
  current_bid?: number;
  reserve_price?: number;
  end_time?: string;
  status: string; // 'active', 'draft', 'sold', 'expired'
  created_at: string;
  updated_at: string;
  quantity?: number;
  accept_offers?: boolean;
  tags?: string[]; // Tags array for improved searchability
  model?: string;
  storage?: string;
  color?: string;
  size?: string;
  year?: string;
  delivery_available?: boolean;
  screen_size?: string;
  custom_attributes?: any;
  attributes?: any;
  
  // Shipping fields
  provides_shipping?: boolean;
  mzadkumsooq_delivery?: boolean;
  local_pickup?: boolean;
  free_shipping?: boolean;
  handling_time?: string;
  shipping_data?: ShippingOption[];
}

// Vehicle specific interface
export interface Vehicle {
  id: string;
  title: string;
  description: string;
  price: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  engine_size?: number;
  gear_type?: string;
  fuel_type?: string;
  body_type?: string;
  color?: string;
  features?: string[];
  condition: string;
  location?: string | {
    city: string;
    neighborhood: string;
    street?: string;
  };
  category_path?: string[];
  category_id?: string;
  subcategory_id?: string;
  seller_id: string;
  is_negotiable?: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingOption {
  method: string;
  price: number;
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

export interface VehicleWithImages extends Vehicle {
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
  quantity?: number;
  brand?: string;
  model?: string;
  shipping?: string;
  currency?: string;
  category?: string;
  tags?: string[];
}

export interface ProductFilterParams {
  category?: string;
  category_id?: string;
  subcategory_id?: string;
  category_path?: string[]; // Search in category path array
  brand?: string; // Search by brand
  condition?: string[];
  price_min?: number;
  price_max?: number;
  location?: string[];
  is_auction?: boolean;
  with_shipping?: boolean;
  query?: string;
  tags?: string[]; // Filter by tags
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  limit?: number;
  offset?: number;
  status?: string;
  seller_id?: string;
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  categoryId?: string;
  subcategoryId?: string;
  categoryPath?: string[];
  brand?: string;
  condition?: string[];
  priceMin?: number;
  priceMax?: number;
  location?: string[];
  isAuction?: boolean;
  withShipping?: boolean;
  tags?: string[];
  sortOrder?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}
