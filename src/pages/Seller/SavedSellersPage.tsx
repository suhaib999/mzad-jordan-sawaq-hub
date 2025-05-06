
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Store, MessageSquare, Trash, PackageSearch, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { fetchProfile } from '@/services/profileService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface SavedSeller {
  id: string;
  user_id: string;
  seller_id: string;
  seller_name: string;
  created_at: string;
  profile?: {
    avatar_url?: string;
    location?: string;
    full_name?: string;
    username?: string;
  }
}

const SavedSellersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch saved sellers
  const { data: savedSellers, isLoading, refetch } = useQuery({
    queryKey: ['saved-sellers', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('saved_sellers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching saved sellers:', error);
        throw error;
      }
      
      // If no data, return empty array
      if (!data || data.length === 0) {
        return [];
      }

      // Fetch profile details for each seller
      const sellersWithProfiles = await Promise.all(
        data.map(async (seller) => {
          try {
            const profile = await fetchProfile(seller.seller_id);
            return { ...seller, profile };
          } catch (error) {
            console.error(`Error fetching profile for seller ${seller.seller_id}:`, error);
            return seller;
          }
        })
      );
      
      return sellersWithProfiles as SavedSeller[];
    },
    enabled: !!user?.id,
  });

  const handleRemoveSeller = async (sellerId: string, sellerName: string) => {
    try {
      const { error } = await supabase
        .from('saved_sellers')
        .delete()
        .eq('user_id', user?.id || '')
        .eq('seller_id', sellerId);
      
      if (error) throw error;
      
      toast.success(`${sellerName} removed from your saved sellers`);
      refetch(); // Refresh the list after removal
    } catch (error) {
      console.error("Error removing saved seller:", error);
      toast.error("Unable to remove seller");
    }
  };

  const handleContactSeller = (sellerId: string) => {
    navigate(`/messages?new=true&recipient=${sellerId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Saved Sellers</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-mzad-primary border-t-transparent rounded-full"></div>
          </div>
        ) : savedSellers && savedSellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSellers.map((seller) => (
              <Card key={seller.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={seller.profile?.avatar_url} />
                      <AvatarFallback>
                        {seller.seller_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <Link 
                        to={`/seller/profile/${seller.seller_id}`} 
                        className="text-lg font-semibold hover:text-mzad-primary"
                      >
                        {seller.seller_name}
                      </Link>
                      {seller.profile?.location && (
                        <div className="text-sm text-gray-500">
                          {seller.profile.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/seller/profile/${seller.seller_id}`)}
                    >
                      <Store className="h-4 w-4 mr-1" />
                      View Store
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleContactSeller(seller.seller_id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleRemoveSeller(seller.seller_id, seller.seller_name)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="text-center py-12">
              <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No saved sellers yet</h3>
              <p className="text-gray-500 mb-6">
                When you find sellers you like, save them to easily find them later
              </p>
              <Link to="/browse">
                <Button>
                  <PackageSearch className="mr-2 h-4 w-4" />
                  Browse Items
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SavedSellersPage;
