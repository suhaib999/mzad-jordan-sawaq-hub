
import { supabase } from "@/integrations/supabase/client";

export type FeedbackType = "positive" | "neutral" | "negative";

export interface Feedback {
  id: string;
  transaction_id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  rating: FeedbackType;
  comment: string;
  created_at: string;
}

export interface FeedbackStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  positivePercentage: number;
}

export async function fetchFeedbackBySellerId(sellerId: string): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching feedback:", error);
    return [];
  }
  
  return data as Feedback[];
}

export async function createFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback | null> {
  const { data, error } = await supabase
    .from('feedback')
    .insert(feedback)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating feedback:", error);
    return null;
  }
  
  return data as Feedback;
}

export async function calculateFeedbackStats(sellerId: string): Promise<FeedbackStats> {
  const { data, error } = await supabase
    .from('feedback')
    .select('rating')
    .eq('seller_id', sellerId);
  
  if (error) {
    console.error("Error calculating feedback stats:", error);
    return {
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      positivePercentage: 0
    };
  }
  
  const feedbackData = data as { rating: FeedbackType }[];
  const total = feedbackData.length;
  const positive = feedbackData.filter(f => f.rating === 'positive').length;
  const neutral = feedbackData.filter(f => f.rating === 'neutral').length;
  const negative = feedbackData.filter(f => f.rating === 'negative').length;
  
  // Calculate positive percentage (excluding neutral ratings)
  const positivePercentage = total > 0 
    ? Math.round((positive / (positive + negative || 1)) * 100) 
    : 0;
  
  return {
    total,
    positive,
    neutral,
    negative,
    positivePercentage
  };
}

export async function hasBoughtFromSeller(buyerId: string, sellerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id')
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .limit(1);
  
  if (error) {
    console.error("Error checking if buyer has bought from seller:", error);
    return false;
  }
  
  return (data?.length || 0) > 0;
}

export async function hasLeftFeedbackForTransaction(buyerId: string, transactionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('feedback')
    .select('id')
    .eq('buyer_id', buyerId)
    .eq('transaction_id', transactionId)
    .limit(1);
  
  if (error) {
    console.error("Error checking if feedback exists:", error);
    return false;
  }
  
  return (data?.length || 0) > 0;
}
