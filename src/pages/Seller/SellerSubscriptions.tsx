
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { subscriptionPlans, getSubscriptionStatus, SubscriptionPlan, SubscriptionStatus } from '@/services/subscriptionService';
import { ConfirmSubscriptionDialog } from '@/components/subscription/ConfirmSubscriptionDialog';
import { format } from 'date-fns';

const SellerSubscriptions = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState(subscriptionPlans);

  useEffect(() => {
    if (user?.id) {
      loadSubscriptionStatus();
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const status = await getSubscriptionStatus(user.id);
      setSubscriptionStatus(status);
      
      // Update plans to mark the current one
      if (status && status.plan) {
        const updatedPlans = subscriptionPlans.map(plan => ({
          ...plan,
          isCurrent: plan.id === status.plan
        }));
        setPlans(updatedPlans);
      }
    } catch (error) {
      console.error("Error loading subscription status:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleSubscriptionSuccess = () => {
    loadSubscriptionStatus();
  };

  if (isLoading && !user) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-[60vh]">
            <p>Loading subscriptions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">Seller Subscriptions</h1>
              <p className="text-muted-foreground">Choose the plan that's right for your business</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={loadSubscriptionStatus}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`border-muted flex flex-col ${plan.isPopular ? 'border-primary' : ''} ${plan.isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.isPopular && <Badge className="bg-primary">Popular</Badge>}
                    {plan.isCurrent && <Badge variant="outline">Current</Badge>}
                  </div>
                  <CardDescription>
                    {plan.id === 'basic' && 'For new sellers just getting started'}
                    {plan.id === 'pro' && 'For growing businesses'}
                    {plan.id === 'business' && 'For established businesses'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4">
                    <p className="text-3xl font-bold">${plan.price}<span className="text-base font-normal text-muted-foreground">/{plan.interval}</span></p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.isCurrent ? (
                    <Button className="w-full" variant="outline" disabled>Current Plan</Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={plan.isPopular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan)}
                    >
                      {plan.price === 0 ? 'Start Free' : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>Your billing and subscription history</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionStatus && subscriptionStatus.active ? (
                <div className="space-y-4">
                  <div className="flex justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">Current Plan: {subscriptionStatus.plan}</p>
                      <p className="text-sm text-muted-foreground">
                        Renews on {subscriptionStatus.current_period_end ? 
                          format(new Date(subscriptionStatus.current_period_end), 'MMMM d, yyyy') : 
                          'N/A'}
                      </p>
                    </div>
                    <Badge variant={subscriptionStatus.cancel_at_period_end ? "outline" : "default"}>
                      {subscriptionStatus.cancel_at_period_end ? 'Cancels at period end' : 'Active'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    To cancel your subscription or change your payment method, please contact customer support.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <p className="text-muted-foreground">No subscription history available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ConfirmSubscriptionDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleSubscriptionSuccess}
        plan={selectedPlan}
      />
    </Layout>
  );
};

export default SellerSubscriptions;
