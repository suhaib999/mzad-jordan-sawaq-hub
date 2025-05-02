
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

export const getSubscriptionStatus = async (
  userId: string
): Promise<SubscriptionStatus | null> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return {
        active: false,
        plan: null,
        current_period_end: null,
        cancel_at_period_end: false,
      };
    }

    return {
      active: data.status === 'active',
      plan: data.plan,
      current_period_end: data.current_period_end,
      cancel_at_period_end: data.cancel_at_period_end,
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
  
  // For demo purposes, we'll simulate success
  return true;
};
