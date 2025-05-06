
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { Clock, Package } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mapProductToCardProps } from '@/services/product/mappers';
import ProductGrid from '@/components/product/ProductGrid';

interface BidRecord {
  id: string;
  product_id: string;
  amount: number;
  created_at: string;
  product: {
    id: string;
    title: string;
    main_image_url: string | null;
    price: number;
    current_bid: number | null;
    end_time: string | null;
    seller_id: string;
    status: string;
    currency: string;
  };
}

const BidPage = () => {
  const { user } = useAuth();

  const { data: bids, isLoading } = useQuery({
    queryKey: ['my-bids', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          id,
          product_id,
          amount,
          created_at,
          product:products(
            id,
            title,
            main_image_url,
            price,
            current_bid,
            end_time,
            seller_id,
            status,
            currency
          )
        `)
        .eq('bidder_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bids:', error);
        throw error;
      }

      return data as unknown as BidRecord[];
    },
    enabled: !!user?.id,
  });

  const { data: liveAuctions } = useQuery({
    queryKey: ['live-auctions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*)')
        .eq('is_auction', true)
        .gt('end_time', new Date().toISOString())
        .limit(8);

      if (error) {
        console.error('Error fetching live auctions:', error);
        throw error;
      }

      return data;
    },
  });

  const renderBidStatus = (bid: BidRecord) => {
    // Check if auction ended
    const endTime = bid.product.end_time ? new Date(bid.product.end_time) : null;
    const now = new Date();
    const isEnded = endTime && endTime < now;

    // Check if user is the highest bidder
    const isHighestBidder = bid.amount >= (bid.product.current_bid || 0);

    if (isEnded) {
      return isHighestBidder ? (
        <Badge className="bg-green-500">Won</Badge>
      ) : (
        <Badge variant="outline" className="text-red-500">Outbid</Badge>
      );
    } else {
      return isHighestBidder ? (
        <Badge className="bg-green-50 text-green-800 border-green-300">Highest Bid</Badge>
      ) : (
        <Badge variant="outline" className="text-amber-500">Outbid</Badge>
      );
    }
  };

  const formatTimeLeft = (endTime: string | null) => {
    if (!endTime) return 'No end time set';
    
    const end = new Date(endTime);
    const now = new Date();
    
    if (end < now) {
      return 'Auction ended';
    }
    
    return formatDistance(end, now, { addSuffix: false });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Bids & Offers</h1>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 rounded-full border-mzad-primary border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading your bids...</p>
          </div>
        ) : (
          <>
            {bids && bids.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {bids.map((bid) => (
                  <Card key={bid.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/4 w-full">
                          <Link to={`/product/${bid.product_id}`}>
                            <img 
                              src={bid.product.main_image_url || '/placeholder.svg'} 
                              alt={bid.product.title}
                              className="w-full h-48 object-cover"
                            />
                          </Link>
                        </div>
                        <div className="p-4 sm:w-3/4 flex-1">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <Link to={`/product/${bid.product_id}`}>
                              <h3 className="font-medium text-lg hover:text-mzad-primary">{bid.product.title}</h3>
                            </Link>
                            {renderBidStatus(bid)}
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-500">
                            Bid placed on {new Date(bid.created_at).toLocaleDateString()}
                          </div>
                          
                          <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
                            <div>
                              <div className="text-lg font-semibold">
                                Your bid: {bid.product.currency} {bid.amount.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Current highest: {bid.product.currency} {bid.product.current_bid?.toFixed(2) || "0.00"}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {bid.product.end_time && new Date(bid.product.end_time) > new Date() && (
                                <div className="flex items-center text-sm">
                                  <Clock className="h-4 w-4 mr-1 text-amber-500" />
                                  <span>{formatTimeLeft(bid.product.end_time)} left</span>
                                </div>
                              )}
                              <Link to={`/product/${bid.product_id}`}>
                                <Button variant="outline" size="sm">
                                  View Auction
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No bids placed yet</h3>
                  <p className="text-gray-500 mb-6">
                    Start bidding on items you're interested in to see them listed here.
                  </p>
                  <Link to="/browse">
                    <Button>Browse Auctions</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Live auctions section */}
        {liveAuctions && liveAuctions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Live Auctions You Might Like</h2>
            <ProductGrid products={liveAuctions.map(product => mapProductToCardProps(product))} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BidPage;
