
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, Store, MessageSquare, Trash, PackageSearch, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      // Mock data for demonstration - would be replaced with actual Supabase query
      return [
        {
          id: '1',
          user_id: user?.id,
          seller_id: 'seller-1',
          seller_name: 'Tech Gadgets Store',
          created_at: new Date().toISOString(),
          profile: {
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
            location: 'Amman, Jordan',
            username: 'techgadgets'
          }
        },
        {
          id: '2',
          user_id: user?.id,
          seller_id: 'seller-2',
          seller_name: 'Vintage Collectibles',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          profile: {
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vintage',
            location: 'Irbid, Jordan',
            username: 'vintagecollectibles'
          }
        },
        {
          id: '3',
          user_id: user?.id,
          seller_id: 'ad9b2785-ee18-4c85-89e8-e4793e59c1eb',
          seller_name: 'Sarah\'s Boutique',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          profile: {
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            location: 'Aqaba, Jordan',
            full_name: 'Sarah Ahmed',
            username: 'sarahboutique'
          }
        }
      ] as SavedSeller[];
    },
    enabled: !!user?.id,
  });

  const handleRemoveSeller = async (sellerId: string, sellerName: string) => {
    try {
      // In a real app, this would delete from Supabase
      // For now, we'll just simulate it
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
