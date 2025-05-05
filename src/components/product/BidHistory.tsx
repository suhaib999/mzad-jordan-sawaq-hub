
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHighestBid } from '@/services/biddingService';
import { Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BidHistoryProps {
  productId: string;
  currency: string;
}

export const BidHistory: React.FC<BidHistoryProps> = ({ productId, currency }) => {
  const { data: highestBid, isLoading, error } = useQuery({
    queryKey: ['highestBid', productId],
    queryFn: () => fetchHighestBid(productId),
    refetchInterval: 60000, // Refresh once per minute
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading highest bid...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading bid information</div>;
  }

  if (!highestBid) {
    return (
      <Card className="p-6 text-center py-8 text-gray-500 bg-gray-50">
        <p>No bids have been placed yet</p>
        <p className="text-sm mt-2">Be the first to bid on this item!</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-green-600" />
          <span className="text-sm font-bold text-green-700">Highest bid</span>
        </div>
        <span className="font-bold text-green-700">
          {highestBid.toFixed(2)} {currency}
        </span>
      </div>
    </Card>
  );
};
