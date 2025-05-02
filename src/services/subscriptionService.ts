
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
};

export type SubscriptionStatus = {
  active: boolean;
  plan: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    interval: 'month',
    features: [
      'List up to 10 items',
      'Basic analytics',
      '10% selling fee',
      'Standard support',
    ],
    isCurrent: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    interval: 'month',
    features: [
      'List up to 100 items',
      'Advanced analytics',
      '5% selling fee',
      'Priority support',
      'Featured listings',
    ],
    isPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 49,
    interval: 'month',
    features: [
      'Unlimited listings',
      'Enterprise analytics',
      '3% selling fee',
      '24/7 dedicated support',
      'API access',
      'Custom branding',
    ],
  },
];

// Mock user subscriptions - in a real app, this would be stored in a database
const mockUserSubscriptions: Record<string, SubscriptionStatus> = {};

export const getSubscriptionStatus = async (
  userId: string
): Promise<SubscriptionStatus | null> => {
  try {
    // Check if we have a mock subscription for this user
    if (mockUserSubscriptions[userId]) {
      return mockUserSubscriptions[userId];
    }

    // Default subscription for new users
    return {
      active: false,
      plan: null,
      current_period_end: null,
      cancel_at_period_end: false,
    };
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return null;
  }
};

// This function would typically call a server endpoint to process subscription
export const startSubscription = async (planId: string): Promise<boolean> => {
  console.log(`Starting subscription to ${planId} plan...`);
  // In a real implementation, this would redirect to a payment page
  // or call a server endpoint to handle payment processing
  
  // For demo purposes, we'll simulate success and store the subscription in the mock data
  if (planId && supabase.auth.getUser) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      
      mockUserSubscriptions[user.id] = {
        active: true,
        plan: planId,
        current_period_end: oneMonthLater.toISOString(),
        cancel_at_period_end: false,
      };
    }
  }
  
  return true;
};
