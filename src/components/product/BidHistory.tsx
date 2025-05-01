
import React, { useState, useEffect } from 'react';
import { fetchBidHistory } from '@/services/biddingService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User } from 'lucide-react';

interface BidHistoryProps {
  productId: string;
  currency: string;
}

export const BidHistory: React.FC<BidHistoryProps> = ({ productId, currency }) => {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBidHistory = async () => {
      setLoading(true);
      try {
        const history = await fetchBidHistory(productId);
        setBids(history);
      } catch (error) {
        console.error('Error loading bid history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBidHistory();
  }, [productId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-4">Loading bid history...</div>;
  }

  if (bids.length === 0) {
    return <div className="text-center py-4 text-gray-500">No bids have been placed yet</div>;
  }

  return (
    <ScrollArea className="h-[250px]">
      <div className="space-y-2">
        {bids.map((bid) => (
          <div key={bid.id} className="border-b border-gray-100 py-2">
            <div className="flex justify-between">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">
                  Bidder {bid.bidder_id.substring(0, 5)}...
                </span>
              </div>
              <span className="text-sm font-bold">
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
