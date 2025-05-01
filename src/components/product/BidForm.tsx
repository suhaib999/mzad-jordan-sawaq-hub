
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { placeBid, getMinimumBidAmount } from '@/services/biddingService';
import { ProductWithImages } from '@/services/productService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface BidFormProps {
  product: ProductWithImages;
  onBidPlaced?: (newBid: number) => void;
}

export const BidForm: React.FC<BidFormProps> = ({ product, onBidPlaced }) => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const currentBid = product.current_bid || product.start_price || 0;
  const minBid = getMinimumBidAmount(product.current_bid, product.start_price);
  
  const [bidAmount, setBidAmount] = useState<string>(minBid.toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error('Please sign in to place a bid');
      navigate('/auth/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    
    if (isNaN(amount) || amount < minBid) {
      toast.error(`Bid must be at least ${minBid.toFixed(2)} ${product.currency}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await placeBid(product.id, session.user.id, amount);
      
      if (result.success) {
        toast.success(result.message);
        setBidAmount(minBid.toFixed(2));
        
        // Invalidate cache to refresh product data
        queryClient.invalidateQueries({
          queryKey: ['product', product.id]
        });
        
        if (onBidPlaced && result.currentBid) {
          onBidPlaced(result.currentBid);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('An error occurred while placing your bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="bidAmount">Your Bid ({product.currency})</Label>
        <div className="flex mt-1.5">
          <Input
            id="bidAmount"
            type="number"
            step="0.01"
            min={minBid}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="flex-1"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            className="ml-2" 
            disabled={isSubmitting || !session?.user}
          >
            {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Minimum bid: {minBid.toFixed(2)} {product.currency}
        </p>
      </div>
    </form>
  );
};
