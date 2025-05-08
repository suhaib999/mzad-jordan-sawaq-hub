
import { z } from 'zod';

// Product schema
export const productSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(30, "Description must be at least 30 characters").max(5000, "Description cannot exceed 5000 characters"),
  category: z.string().min(1, "Please select a category"),
  subcategory: z.string().optional(),
  condition: z.string().min(1, "Please select a condition"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  listing_type: z.enum(['fixed_price', 'auction', 'both']),
  price: z.number().min(0.01, "Price must be greater than 0").optional(),
  is_negotiable: z.boolean().optional(),
  start_price: z.number().min(0.01, "Starting price must be greater than 0").optional(),
  reserve_price: z.number().min(0).optional(),
  auction_duration: z.number().optional(),
  end_time: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  allow_offers: z.boolean().optional(),
  location: z.string().min(1, "Location is required"),
  shipping_options: z.array(
    z.object({
      method: z.string().min(1, "Shipping method is required"),
      price: z.number().min(0, "Shipping price must be 0 or greater"),
    })
  ).optional(),
  free_shipping: z.boolean().optional(),
  local_pickup: z.boolean().optional(),
  shipping_worldwide: z.boolean().optional(),
  shipping_exclusions: z.array(z.string()).optional(),
  handling_time: z.string().optional(),
  return_policy: z.string().optional(),
  warranty: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(
    z.object({
      id: z.string(),
      file: z.any().optional(),
      url: z.string().optional(),
      order: z.number(),
    })
  ).min(1, "At least one image is required"),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  status: z.enum(['active', 'draft']),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export interface Category {
  id: string;
  name: string;
  slug: string;
}
