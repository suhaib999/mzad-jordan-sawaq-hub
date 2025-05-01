
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LeaveFeedbackForm } from './LeaveFeedbackForm';
import { hasBoughtFromSeller, hasLeftFeedbackForTransaction } from '@/services/feedbackService';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FeedbackButtonProps {
  sellerId: string;
  productId: string;
  transactionId: string;
  onFeedbackSubmitted?: () => void;
}

export const FeedbackButton = ({ 
  sellerId, 
  productId, 
  transactionId, 
  onFeedbackSubmitted = () => {} 
}: FeedbackButtonProps) => {
  const { user } = useAuth();
  const buyerId = user?.id || '';

  const { data: hasBought, isLoading: isLoadingPurchase } = useQuery({
    queryKey: ['has-bought', buyerId, sellerId],
    queryFn: () => hasBoughtFromSeller(buyerId, sellerId),
    enabled: !!buyerId && !!sellerId,
  });

  const { data: hasLeftFeedback, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['has-left-feedback', buyerId, transactionId],
    queryFn: () => hasLeftFeedbackForTransaction(buyerId, transactionId),
    enabled: !!buyerId && !!transactionId,
  });

  const isLoading = isLoadingPurchase || isLoadingFeedback;

  if (isLoading) {
    return <Button variant="outline" disabled>Checking...</Button>;
  }

  if (!hasBought) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button variant="outline" disabled>Leave Feedback</Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>You can only leave feedback after completing a transaction with this seller.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (hasLeftFeedback) {
    return <Button variant="outline" disabled>Feedback Submitted</Button>;
  }

  return (
    <LeaveFeedbackForm
      sellerId={sellerId}
      productId={productId}
      transactionId={transactionId}
      buyerId={buyerId}
      onFeedbackSubmitted={onFeedbackSubmitted}
    />
  );
};
