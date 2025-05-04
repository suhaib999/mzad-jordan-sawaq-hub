
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBidHistory, Bid } from '@/services/biddingService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BidHistoryProps {
  productId: string;
  currency: string;
}

export const BidHistory: React.FC<BidHistoryProps> = ({ productId, currency }) => {
  const { data: bids, isLoading, error } = useQuery({
    queryKey: ['bids', productId],
    queryFn: () => fetchBidHistory(productId),
    refetchInterval: 30000, // Refresh every 30 seconds (increased from 10s)
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading bid history...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading bid history</div>;
  }

  if (!bids || bids.length === 0) {
    return (
      <Card className="p-6 text-center py-8 text-gray-500 bg-gray-50">
        <p>No bids have been placed yet</p>
        <p className="text-sm mt-2">Be the first to bid on this item!</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[250px]">
      <div className="space-y-2">
        {bids.map((bid, index) => (
          <div 
            key={bid.id} 
            className={`border-b border-gray-100 py-3 last:border-b-0 ${index === 0 ? 'bg-green-50 rounded-md p-2' : ''}`}
          >
            <div className="flex justify-between">
              <div className="flex items-center">
                <User className={`h-4 w-4 mr-2 ${index === 0 ? 'text-green-600' : 'text-gray-500'}`} />
                <span className={`text-sm ${index === 0 ? 'font-bold text-green-700' : 'font-medium'}`}>
                  {index === 0 ? 'Highest bidder' : `Bidder ${bid.bidder_id.substring(0, 5)}...`}
                </span>
              </div>
              <span className={`text-sm ${index === 0 ? 'font-bold text-green-700' : 'font-bold'}`}>
                {bid.amount.toFixed(2)} {currency}
              </span>
            </div>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDate(bid.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
