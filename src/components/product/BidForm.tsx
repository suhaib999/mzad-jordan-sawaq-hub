import React, { useState, useEffect, useRef } from 'react';
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
  
  // Make sure we use the actual current_bid from the product
  const currentBid = product.current_bid || product.start_price || 0;
  const [minBid, setMinBid] = useState<number>(getMinimumBidAmount(currentBid, product.start_price));
  const [bidAmount, setBidAmount] = useState<string>(minBid.toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep track of the user's manual edits
  const [userHasEditedBid, setUserHasEditedBid] = useState(false);
  const previousBidRef = useRef<string>(bidAmount);

  // Load initial bid amount ONLY when the component mounts or when product ID changes
  // NOT when currentBid changes (prevents resetting during UI updates)
  useEffect(() => {
    const loadInitialBidAmount = async () => {
      try {
        // Get the current minimum bid based on the product's current bid
        const minimumBid = getMinimumBidAmount(currentBid, product.start_price);
        setMinBid(minimumBid);
        
        // Only update the bid amount if the user hasn't edited it
        // or if the product ID changes (meaning we're on a new product)
        if (!userHasEditedBid) {
          setBidAmount(minimumBid.toFixed(2));
          previousBidRef.current = minimumBid.toFixed(2);
        }
        
        console.log(`Setting initial bid: ${minimumBid.toFixed(2)} based on current bid: ${currentBid}`);
      } catch (error) {
        console.error('Error calculating initial bid amount:', error);
      }
    };
    
    loadInitialBidAmount();
  }, [product.id]); // Only depends on product.id, not currentBid

  // Update minimum bid when current bid changes, but don't reset input value
  useEffect(() => {
    setMinBid(getMinimumBidAmount(currentBid, product.start_price));
  }, [currentBid, product.start_price]);

  const incrementBid = () => {
    const current = parseFloat(bidAmount);
    const newAmount = (current + 0.5).toFixed(2);
    setBidAmount(newAmount);
    setUserHasEditedBid(true);
    previousBidRef.current = newAmount;
  };

  const decrementBid = () => {
    const current = parseFloat(bidAmount);
    const newAmount = Math.max(minBid, current - 0.5).toFixed(2);
    setBidAmount(newAmount);
    setUserHasEditedBid(true);
    previousBidRef.current = newAmount;
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
      console.log(`Placing bid: ${amount} on product: ${product.id}`);
      const result = await placeBid(product.id, session.user.id, amount);
      
      if (result.success) {
        toast.success(result.message);
        
        // Make sure to use the returned bid amount from the server
        const newBidAmount = result.currentBid || amount;
        
        console.log(`Bid placed successfully. New bid amount: ${newBidAmount}`);
        
        // Update minimum bid after successful bid
        const newMinBid = getMinimumBidAmount(newBidAmount, null);
        setMinBid(newMinBid);
        
        // Reset user edited flag after successful bid
        setUserHasEditedBid(false);
        setBidAmount(newMinBid.toFixed(2));
        previousBidRef.current = newMinBid.toFixed(2);
        
        // Force invalidate all related queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ['product', product.id]
        });
        
        queryClient.invalidateQueries({
          queryKey: ['bids', product.id]
        });
        
        // Force refetch instead of just invalidating
        queryClient.fetchQuery({
          queryKey: ['product', product.id]
        });
        
        // Update product bid amount in parent component with the server-returned value
        if (onBidPlaced && result.currentBid) {
          onBidPlaced(result.currentBid);
          console.log(`Notifying parent component of new bid: ${result.currentBid}`);
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
    setUserHasEditedBid(true);
    previousBidRef.current = value;
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
