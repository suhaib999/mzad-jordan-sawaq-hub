
import { supabase } from '@/integrations/supabase/client';
import { ProductWithImages } from './productService';
import { toast } from "sonner";

export interface Bid {
  id: string;
  product_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
}

export interface BidResponse {
  success: boolean;
  message: string;
  newBid?: Bid;
  currentBid?: number;
}

/**
 * Places a bid on a product
 */
export const placeBid = async (
  productId: string,
  bidderId: string,
  amount: number
): Promise<BidResponse> => {
  try {
    // First, get the current highest bid for this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('current_bid, start_price, reserve_price, end_time, seller_id')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('Error fetching product info:', productError);
      return { 
        success: false, 
        message: 'Error fetching product information' 
      };
    }

    // Check if auction ended
    const endTime = product.end_time ? new Date(product.end_time) : null;
    if (endTime && endTime < new Date()) {
      return { 
        success: false, 
        message: 'This auction has ended' 
      };
    }

    // Check if the bidder is the seller
    if (product.seller_id === bidderId) {
      return {
        success: false,
        message: 'You cannot bid on your own auction'
      };
    }

    // Determine minimum acceptable bid
    const currentBid = product.current_bid || product.start_price || 0;
    const minimumBid = currentBid + calculateBidIncrement(currentBid);

    // Validate bid amount
    if (amount < minimumBid) {
      return { 
        success: false, 
        message: `Bid must be at least ${minimumBid}` 
      };
    }

    // Insert the new bid
    const { data: bidData, error: bidError } = await supabase
      .from('bids')
      .insert({
        product_id: productId,
        bidder_id: bidderId,
        amount: amount
      })
      .select('*')
      .single();

    if (bidError) {
      console.error('Error creating bid:', bidError);
      return { 
        success: false, 
        message: 'Error placing bid' 
      };
    }

    // Type assertion since we know the structure
    const newBid = bidData as unknown as Bid;

    // Update the product's current bid
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        current_bid: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product current bid:', updateError);
      return { 
        success: false, 
        message: 'Bid placed but product not updated' 
      };
    }

    return { 
      success: true, 
      message: 'Bid placed successfully', 
      newBid: newBid,
      currentBid: amount
    };
  } catch (error) {
    console.error('Error in placeBid:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred' 
    };
  }
};

/**
 * Fetches bid history for a product
 */
export const fetchBidHistory = async (productId: string): Promise<Bid[]> => {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bid history:', error);
      return [];
    }

    // Type assertion since we know the structure
    return (data || []) as unknown as Bid[];
  } catch (error) {
    console.error('Error in fetchBidHistory:', error);
    return [];
  }
};

/**
 * Calculates the minimum bid increment based on the current bid amount
 * Similar to eBay's incremental bidding system
 */
export const calculateBidIncrement = (currentBid: number): number => {
  if (currentBid < 1) return 0.05;
  if (currentBid < 5) return 0.25;
  if (currentBid < 25) return 0.5;
  if (currentBid < 100) return 1;
  if (currentBid < 250) return 2.5;
  if (currentBid < 500) return 5;
  if (currentBid < 1000) return 10;
  if (currentBid < 2500) return 25;
  if (currentBid < 5000) return 50;
  return 100;
};

/**
 * Gets the minimum next bid amount
 */
export const getMinimumBidAmount = (currentBid: number | null, startPrice: number | null): number => {
  const baseBid = currentBid || startPrice || 0;
  return baseBid + calculateBidIncrement(baseBid);
};

/**
 * Formats time remaining in a human-readable format
 */
export const formatTimeRemaining = (endTime: string): string => {
  const end = new Date(endTime);
  const now = new Date();
  
  // If auction has ended
  if (end <= now) {
    return "Auction ended";
  }
  
  const diffMs = end.getTime() - now.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} left`;
  } else {
    return `${diffSecs} second${diffSecs > 1 ? 's' : ''} left`;
  }
};
