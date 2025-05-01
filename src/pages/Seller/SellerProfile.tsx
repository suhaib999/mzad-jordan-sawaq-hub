
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Package, MessageCircle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { fetchProfile } from '@/services/profileService';
import { fetchProductsBySellerId } from '@/services/product';
import { mapProductToCardProps } from '@/services/product/mappers';
import { toast } from 'sonner';

export const SellerProfile = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [isFollowing, setIsFollowing] = React.useState(false);
  
  const { data: sellerProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', sellerId],
    queryFn: () => fetchProfile(sellerId || ''),
    enabled: !!sellerId,
  });

  const { data: sellerProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['sellerProducts', sellerId],
    queryFn: () => fetchProductsBySellerId(sellerId || ''),
    enabled: !!sellerId,
  });

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      toast.success(`You are now following ${displayName}`, {
        description: "You'll receive updates when they list new items",
        duration: 3000,
      });
    } else {
      toast.info(`You've unfollowed ${displayName}`, {
        duration: 2000,
      });
    }
  };

  if (!sellerId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Seller ID Missing</h1>
            <p className="text-gray-600">The seller profile you're trying to view could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = sellerProfile?.username || sellerProfile?.full_name || `User ${sellerId.substring(0, 5)}`;
  const sellerRating = 4.8; // This would ideally come from the database
  const salesCount = 245; // This would ideally come from the database

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(sellerRating);
    const hasHalfStar = sellerRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-5 w-5 fill-amber-400 text-amber-400" />);
    }

    if (hasHalfStar && stars.length < 5) {
      stars.push(<Star key="half-star" className="h-5 w-5 text-amber-400" />);
    }

    while (stars.length < 5) {
      stars.push(<Star key={`empty-star-${stars.length}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={sellerProfile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  <div className="flex items-center mt-1">
                    {renderStars()}
                    <span className="ml-2 text-lg font-medium">{sellerRating.toFixed(1)}</span>
                    <span className="ml-2 text-gray-500">({salesCount}+ sales)</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Member since {new Date().getFullYear() - 3}
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <Button className="flex items-center">
                  <MessageCircle className="mr-2" />
                  Contact
                </Button>
                <Button 
                  variant={isFollowing ? "default" : "outline"}
                  onClick={handleFollowClick}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            </div>
            <div className="mt-6 flex items-center">
              <Badge className="bg-green-50 text-green-700 border-green-300 mr-4">
                100% positive feedback
              </Badge>
              {sellerProfile?.location && (
                <div className="text-gray-600">
                  <span className="font-medium">Location:</span> {sellerProfile.location}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="items">
          <TabsList className="mb-6">
            <TabsTrigger value="items">
              <Package className="mr-2" />
              Items for sale
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <Star className="mr-2" />
              Feedback
            </TabsTrigger>
          </TabsList>
          <TabsContent value="items">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">{displayName}'s Items</h2>
              {isLoadingProducts ? (
                <div className="flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-mzad-primary border-t-transparent rounded-full"></div>
                </div>
              ) : sellerProducts && sellerProducts.length > 0 ? (
                <ProductGrid products={sellerProducts.map(product => mapProductToCardProps(product))} />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No items found</h3>
                  <p className="mt-2 text-sm text-gray-500">This seller doesn't have any active listings.</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="feedback">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">Seller Feedback</h2>
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Star className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">100% Positive Feedback</h3>
                <p className="mt-2 text-sm text-gray-500">Based on {salesCount} total transactions</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SellerProfile;
