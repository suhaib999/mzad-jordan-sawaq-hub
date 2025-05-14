
import { z } from 'zod';

// Product schema
export const productSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(30, "Description must be at least 30 characters").max(5000, "Description cannot exceed 5000 characters"),
  category: z.string().min(1, "Please select a category"),
  category_id: z.string().optional(), // Added field for category ID
  subcategory: z.string().optional(),
  subcategory_id: z.string().optional(), // Added field for subcategory ID
  condition: z.string().min(1, "Please select a condition"),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  listing_type: z.enum(['fixed_price', 'auction', 'both']),
  price: z.number().min(0.01, "Price must be greater than 0").optional().nullable(),
  is_negotiable: z.boolean().optional(),
  start_price: z.number().min(0.01, "Starting price must be greater than 0").optional().nullable(),
  reserve_price: z.number().min(0).optional().nullable(),
  auction_duration: z.number().optional().nullable(),
  end_time: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  allow_offers: z.boolean().optional(),
  location: z.object({
    city: z.string().min(1, "City is required"),
    neighborhood: z.string().min(1, "Neighborhood is required"),
    street: z.string().optional(),
  }),
  provides_shipping: z.boolean().optional().default(false),
  mzadkumsooq_delivery: z.boolean().optional().default(false),
  local_pickup: z.boolean().optional().default(true),
  shipping_options: z.array(
    z.object({
      method: z.string().min(1, "Shipping method is required"),
      price: z.number().min(0, "Shipping price must be 0 or greater"),
    })
  ).optional(),
  free_shipping: z.boolean().optional(),
  handling_time: z.string().optional().nullable(),
  return_policy: z.string().optional().nullable(),
  warranty: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  images: z.array(
    z.object({
      id: z.string(),
      file: z.any().optional(),
      url: z.string(),
      order: z.number(),
    })
  ).min(1, "At least one image is required"),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  custom_attributes: z.any().optional(), // Changed from string to any to match Json type
  status: z.enum(['active', 'draft']),
}).superRefine((data, ctx) => {
  // Conditional validation based on listing type
  if ((data.listing_type === 'fixed_price' || data.listing_type === 'both') && !data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Price is required for fixed price listings",
      path: ["price"]
    });
  }
  
  if ((data.listing_type === 'auction' || data.listing_type === 'both') && (!data.start_price)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Starting price is required for auction listings",
      path: ["start_price"]
    });
  }
  
  if ((data.listing_type === 'auction' || data.listing_type === 'both') && (!data.auction_duration)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Auction duration is required for auction listings",
      path: ["auction_duration"]
    });
  }
});

export type ProductFormValues = z.infer<typeof productSchema>;

export interface Category {
  id: string;
  name: string;
  slug: string;
}
