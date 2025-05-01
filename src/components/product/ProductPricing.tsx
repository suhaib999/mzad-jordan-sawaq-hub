
import React from 'react';
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
  if (isAuction) {
    return (
      <div className="space-y-2 mb-6">
        <div className="text-xl font-bold text-mzad-primary">
          Current bid: {(currentBid || startPrice || 0).toFixed(2)} {currency}
        </div>
        
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
