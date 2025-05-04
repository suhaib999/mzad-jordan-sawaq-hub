
import React, { useEffect, useState } from 'react';
import { AuctionCountdown } from '@/components/product/AuctionCountdown';
import { fetchBidHistory } from '@/services/biddingService';

interface ProductPricingProps {
  isAuction: boolean;
  currentBid?: number | null;
  startPrice?: number | null;
  price?: number;
  currency: string;
  endTime?: string;
  productId: string; // Added productId to fetch bid history
}

export const ProductPricing: React.FC<ProductPricingProps> = ({
  isAuction,
  currentBid,
  startPrice,
  price,
  currency,
  endTime,
  productId
}) => {
  const [highestBid, setHighestBid] = useState<number | null>(null);
  
  // Fetch the highest bid from the database when component mounts
  useEffect(() => {
    if (isAuction && productId) {
      fetchLatestHighestBid();
    }
  }, [isAuction, productId]);
  
  // Function to fetch the latest highest bid
  const fetchLatestHighestBid = async () => {
    try {
      const bids = await fetchBidHistory(productId);
      if (bids && bids.length > 0) {
        // Bids are already sorted by created_at desc from the API
        const highestBidAmount = bids[0].amount;
        setHighestBid(highestBidAmount);
        console.log(`ProductPricing - Latest highest bid: ${highestBidAmount}`);
      }
    } catch (error) {
      console.error('Error fetching latest highest bid in ProductPricing:', error);
    }
  };
  
  // Display the highest of database highest bid, current bid, or starting price for auctions
  const displayBidAmount = highestBid || currentBid || startPrice || 0;

  if (isAuction) {
    return (
      <div className="space-y-2 mb-6">
        <div className="text-xl font-bold text-mzad-primary">
          Current bid: {displayBidAmount.toFixed(2)} {currency}
        </div>
        
        {startPrice && currentBid && currentBid > startPrice && (
          <div className="text-sm text-gray-500">
            Started at: {startPrice.toFixed(2)} {currency}
          </div>
        )}
        
        {endTime && (
          <div className="mt-2">
            <AuctionCountdown endTime={endTime} />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="text-xl font-semibold text-mzad-primary mb-4">
      {(price || 0).toFixed(2)} {currency}
    </div>
  );
};
