
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { placeBid, getMinimumBidAmount, fetchBidHistory } from '@/services/biddingService';
import { ProductWithImages } from '@/services/product/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';

interface BidFormProps {
  product: ProductWithImages;
  onBidPlaced?: (newBid: number) => void;
}

export const BidForm: React.FC<BidFormProps> = ({ product, onBidPlaced }) => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const currentBid = product.current_bid || product.start_price || 0;
  const [minBid, setMinBid] = useState<number>(getMinimumBidAmount(currentBid, product.start_price));
  const [bidAmount, setBidAmount] = useState<string>(minBid.toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial bid amount on mount and when product or current bid changes
  useEffect(() => {
    const loadInitialBidAmount = async () => {
      try {
        // Get the current minimum bid based on the latest bid
        const minimumBid = getMinimumBidAmount(currentBid, product.start_price);
        setMinBid(minimumBid);
        setBidAmount(minimumBid.toFixed(2));
      } catch (error) {
        console.error('Error calculating initial bid amount:', error);
      }
    };
    
    loadInitialBidAmount();
  }, [product.id, currentBid, product.start_price]);

  const incrementBid = () => {
    const current = parseFloat(bidAmount);
    setBidAmount((current + 0.5).toFixed(2));
  };

  const decrementBid = () => {
    const current = parseFloat(bidAmount);
    const newAmount = Math.max(minBid, current - 0.5);
    setBidAmount(newAmount.toFixed(2));
  };

  const validateBidAmount = (amount: number): boolean => {
    if (isNaN(amount)) {
      toast.error('Please enter a valid number');
      return false;
    }
    
    if (amount < minBid) {
      toast.error(`Bid must be at least ${minBid.toFixed(2)} ${product.currency}`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error('Please sign in to place a bid');
      navigate('/auth/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    
    if (!validateBidAmount(amount)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await placeBid(product.id, session.user.id, amount);
      
      if (result.success) {
        toast.success(result.message);
        
        // Update minimum bid after successful bid
        const newMinBid = getMinimumBidAmount(amount, null);
        setMinBid(newMinBid);
        setBidAmount(newMinBid.toFixed(2));
        
        // Invalidate cache to refresh product data and bid history
        queryClient.invalidateQueries({
          queryKey: ['product', product.id]
        });
        
        queryClient.invalidateQueries({
          queryKey: ['bids', product.id]
        });
        
        if (onBidPlaced) {
          onBidPlaced(amount);
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

  // Handle direct input change with validation feedback
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBidAmount(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="bidAmount">Your Bid ({product.currency})</Label>
        <div className="flex mt-1.5">
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={decrementBid}
            disabled={parseFloat(bidAmount) <= minBid}
            className="rounded-r-none"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="bidAmount"
            type="number"
            step="0.01"
            min={minBid}
            value={bidAmount}
            onChange={handleInputChange}
            className="flex-1 rounded-none text-center"
            disabled={isSubmitting}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={incrementBid}
            className="rounded-l-none"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-xs text-gray-500">
            Minimum bid: {minBid.toFixed(2)} {product.currency}
          </p>
          {!session?.user && (
            <p className="text-xs text-amber-600">
              Sign in required to bid
            </p>
          )}
        </div>
        <Button 
          type="submit" 
          className="w-full mt-3 bg-mzad-primary hover:bg-mzad-secondary" 
          disabled={isSubmitting || !session?.user || parseFloat(bidAmount) < minBid}
        >
          {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
        </Button>
      </div>
    </form>
  );
};
