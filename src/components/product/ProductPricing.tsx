
import React, { useEffect } from 'react';
import { AuctionCountdown } from '@/components/product/AuctionCountdown';

interface ProductPricingProps {
  isAuction: boolean;
  currentBid?: number | null;
  startPrice?: number | null;
  price?: number;
  currency: string;
  endTime?: string;
}

export const ProductPricing: React.FC<ProductPricingProps> = ({
  isAuction,
  currentBid,
  startPrice,
  price,
  currency,
  endTime
}) => {
  // Display the highest of current bid or starting price for auctions
  const displayBidAmount = currentBid || startPrice || 0;
  
  // Log for debugging
  useEffect(() => {
    if (isAuction) {
      console.log(`ProductPricing - Rendering with: currentBid=${currentBid}, startPrice=${startPrice}, displaying=${displayBidAmount}`);
    }
  }, [isAuction, currentBid, startPrice, displayBidAmount]);

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
