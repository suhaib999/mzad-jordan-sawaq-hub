
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { startSubscription, SubscriptionPlan } from '@/services/subscriptionService';

interface ConfirmSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  plan: SubscriptionPlan | null;
}

export function ConfirmSubscriptionDialog({
  isOpen,
  onClose,
  onSuccess,
  plan,
}: ConfirmSubscriptionDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (!plan) return;
    
    setIsLoading(true);
    try {
      const success = await startSubscription(plan.id);
      
      if (success) {
        toast({
          title: "Subscription started",
          description: `You have successfully subscribed to the ${plan.name} plan.`,
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast({
          title: "Subscription failed",
          description: "There was an error processing your subscription. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting subscription:", error);
      toast({
        title: "Subscription failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Subscription</DialogTitle>
          <DialogDescription>
            You are about to subscribe to the {plan.name} plan for ${plan.price}/{plan.interval}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h4 className="text-sm font-medium mb-2">Plan includes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm">
              You will be charged ${plan.price} per {plan.interval}. You can cancel anytime from your account settings.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : `Subscribe for $${plan.price}/${plan.interval}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
